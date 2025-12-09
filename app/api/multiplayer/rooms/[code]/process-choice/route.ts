import { NextRequest, NextResponse } from "next/server"
import { getDataFromToken } from "@/helpers/getDataFromToken"
import { connectDB } from "@/db/dbconfig"
import Room from "@/models/room.model"
import Story from "@/models/story.model"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const userId = getDataFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { code } = await params
    const roomCode = code.toUpperCase()

    const body = await request.json().catch(() => ({}))
    const { selectedChoiceId } = body

    await connectDB()

    const room = await Room.findOne({ roomCode })

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    if (room.status !== "playing") {
      return NextResponse.json({ error: "Room is not in playing phase" }, { status: 400 })
    }

    if (room.hostId.toString() !== userId) {
      return NextResponse.json({ error: "Only the host can process choices" }, { status: 403 })
    }

    if (!room.storyId) {
      return NextResponse.json({ error: "No story associated with room" }, { status: 400 })
    }

    const story = await Story.findById(room.storyId)
    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 })
    }

    if (!room.choiceVotes || room.choiceVotes.size === 0) {
      return NextResponse.json({ error: "No votes recorded" }, { status: 400 })
    }

    const isTieBreakerMode = room.tiedChoicesForVoting && room.tiedChoicesForVoting.length > 0

    const hostIdString = room.hostId.toString()
    const hostInParticipants = room.participants.some((p: any) => {
      const pId = typeof p === "object" && p._id ? p._id.toString() : p.toString()
      return pId === hostIdString
    })
    const totalParticipants =
      room.participants.length + (room.hostActive !== false && !hostInParticipants ? 1 : 0)
    const uniqueVoters = new Set<string>()

    const choicesToCount = isTieBreakerMode ? room.tiedChoicesForVoting : Array.from(room.choiceVotes.keys())

    choicesToCount.forEach((choiceId: string) => {
      const userIds = room.choiceVotes.get(choiceId) || []
      userIds.forEach((id: any) => uniqueVoters.add(id.toString()))
    })

    if (!selectedChoiceId && uniqueVoters.size < totalParticipants) {
      return NextResponse.json(
        {
          error: "All participants must vote before processing",
          participants: totalParticipants,
          voters: uniqueVoters.size,
          isTieBreakerMode,
        },
        { status: 400 },
      )
    }

    let maxVotes = 0
    let winningChoiceId: string | null = null
    const choiceVoteCounts: Array<{ choiceId: string; votes: number }> = []

    choicesToCount.forEach((choiceId: string) => {
      const userIds = room.choiceVotes.get(choiceId) || []
      const voteCount = userIds.length
      if (voteCount > 0) {
        choiceVoteCounts.push({ choiceId, votes: voteCount })
        if (voteCount > maxVotes) {
          maxVotes = voteCount
          winningChoiceId = choiceId
        }
      }
    })

    const tiedChoices = choiceVoteCounts.filter((c) => c.votes === maxVotes && c.votes > 0)
    const tiedChoiceIds = tiedChoices.map((c) => c.choiceId)

    if (tiedChoices.length > 1 && !isTieBreakerMode && !selectedChoiceId) {
      room.tiedChoicesForVoting = tiedChoiceIds
      const allChoiceIds = Array.from(room.choiceVotes.keys())
      allChoiceIds.forEach((choiceId: string) => {
        if (!tiedChoiceIds.includes(choiceId)) {
          room.choiceVotes.delete(choiceId)
        }
      })
      tiedChoiceIds.forEach((choiceId: string) => {
        room.choiceVotes.delete(choiceId)
      })
      await room.save()

      return NextResponse.json({
        hasTie: true,
        tiedChoices: tiedChoiceIds,
        isTieBreakerVoting: true,
        message: "Tie detected. All players will vote again on the tied choices.",
      })
    }

    if (tiedChoices.length > 1 && isTieBreakerMode && !selectedChoiceId) {
      return NextResponse.json({
        hasTie: true,
        tiedChoices: tiedChoiceIds,
        isTieBreakerVoting: true,
        requiresHostSelection: true,
        message: "Tie persists after re-voting. Host must select the final choice.",
      })
    }

    if (selectedChoiceId) {
      const validChoices = isTieBreakerMode ? room.tiedChoicesForVoting : tiedChoiceIds
      if (!validChoices.includes(selectedChoiceId)) {
        return NextResponse.json({ error: "Selected choice is not one of the tied choices" }, { status: 400 })
      }
      winningChoiceId = selectedChoiceId
    } else if (tiedChoices.length === 1) {
      winningChoiceId = tiedChoices[0].choiceId
    }

    if (!winningChoiceId) {
      return NextResponse.json({ error: "Could not determine winning choice" }, { status: 400 })
    }

    const winningChoice = story.choices.find((c: any) => c.id === winningChoiceId)
    if (!winningChoice) {
      return NextResponse.json({ error: "Winning choice not found in story" }, { status: 400 })
    }

    room.isProcessing = true
    room.lastChoiceEvaluation = { quality: null, message: null }
    await room.save()

    const host = request.headers.get("host") || "localhost:3000"
    const protocol = request.headers.get("x-forwarded-proto") || "http"
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`

    const generateResponse = await fetch(`${baseUrl}/api/stories/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        genreId: story.genre,
        personalityTraits: Object.fromEntries(story.personalityTraits || new Map()),
        previousContent: story.content,
        lastChoice: {
          id: winningChoice.id,
          text: winningChoice.text,
        },
        choiceHistory: story.choiceHistory || [],
        isMultiplayer: true,
      }),
    })

    if (!generateResponse.ok) {
      room.isProcessing = false
      await room.save()
      throw new Error("Failed to generate next part")
    }

    const storyData = await generateResponse.json()

    story.content = storyData.content
    story.choices = storyData.choices
    story.currentChoiceIndex = story.currentChoiceIndex + 1
    story.isStoryComplete = storyData.isStoryComplete ?? story.isStoryComplete
    story.choiceHistory = [
      ...(story.choiceHistory || []),
      {
        segmentIndex: story.currentChoiceIndex - 1,
        choiceId: winningChoice.id,
        quality: storyData.lastChoiceEvaluation?.quality,
      },
    ]

    await story.save()

    room.choiceVotes = new Map()
    room.tiedChoicesForVoting = []
    room.currentChoiceIndex = story.currentChoiceIndex
    room.isProcessing = false
    if (storyData.lastChoiceEvaluation) {
      room.lastChoiceEvaluation = {
        quality: storyData.lastChoiceEvaluation.quality,
        message: storyData.lastChoiceEvaluation.message,
      }
    } else {
      room.lastChoiceEvaluation = { quality: null, message: null }
    }
    if (story.isStoryComplete) {
      room.status = "completed"

      const allUsers = [room.hostId.toString(), ...room.participants.map((p: any) => p.toString())]
      const uniqueUsers = [...new Set(allUsers)]

      const storyPayload = {
        title: story.title,
        genre: story.genre,
        content: story.content,
        choices: story.choices,
        currentChoiceIndex: story.currentChoiceIndex,
        personalityTraits: story.personalityTraits || new Map(),
        character: story.character,
        isStoryComplete: story.isStoryComplete,
        choiceHistory: story.choiceHistory || [],
        isMultiplayer: true,
        roomCode: room.roomCode,
      }

      Promise.all(
        uniqueUsers.map(async (targetUserId: string) => {
          try {
            const existing = await Story.findOne({
              userId: targetUserId,
              roomCode: room.roomCode,
              isMultiplayer: true,
            })

            if (existing) {
              await Story.findOneAndUpdate(
                { _id: existing._id, userId: targetUserId },
                { ...storyPayload, userId: targetUserId, savedAt: new Date() },
              )
            } else {
              await Story.create({
                userId: targetUserId,
                ...storyPayload,
                savedAt: new Date(),
              })
            }
          } catch (error) {
            console.error(`Error saving story for user ${targetUserId}:`, error)
          }
        }),
      ).catch((error) => {
        console.error("Error saving stories for users:", error)
      })
    }
    await room.save()

    return NextResponse.json({
      message: "Choice processed",
      story: {
        content: story.content,
        choices: story.choices,
        currentChoiceIndex: story.currentChoiceIndex,
        isStoryComplete: story.isStoryComplete,
      },
      lastChoiceEvaluation: storyData.lastChoiceEvaluation,
      hasTie: false,
    })
  } catch (error) {
    console.error("Process choice error:", error)
    try {
      const room = await Room.findOne({ roomCode: (await params).code.toUpperCase() })
      if (room) {
        room.isProcessing = false
        await room.save()
      }
    } catch (saveError) {
      console.error("Error resetting processing flag:", saveError)
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


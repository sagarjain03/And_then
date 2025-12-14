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

    // Handle empty request body gracefully
    let body = {}
    try {
      body = await request.json()
    } catch (error) {
      console.log("No JSON body provided or invalid JSON")
    }
    
    const { selectedChoiceId } = body as { selectedChoiceId?: string }

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

    // Check if room is already processing
    if (room.isProcessing) {
      return NextResponse.json({ 
        error: "Room is already processing choices",
        isProcessing: true 
      }, { status: 400 })
    }

    // Check if we have any choiceVotes at all
    if (!room.choiceVotes || room.choiceVotes.size === 0) {
      return NextResponse.json({ 
        error: "No votes recorded",
        hasVotes: false 
      }, { status: 400 })
    }

    const isTieBreakerMode = room.tiedChoicesForVoting && room.tiedChoicesForVoting.length > 0

    // Calculate total participants properly
    const hostIdString = room.hostId.toString()
    const hostInParticipants = room.participants.some((p: any) => {
      const pId = typeof p === "object" && p._id ? p._id.toString() : p.toString()
      return pId === hostIdString
    })
    
    // IMPORTANT FIX: Only count active participants
    const activeParticipants = room.participants.filter((p: any) => {
      if (typeof p === 'object') {
        return p.isActive !== false && p.leftAt === undefined
      }
      return true // If it's just an ID, assume active
    }).length
    
    // Count host only if they are active and not already in participants
    const totalActivePlayers = activeParticipants + 
      (room.hostActive !== false && !hostInParticipants ? 1 : 0)

    // Count unique voters from choiceVotes
    const uniqueVoters = new Set<string>()
    const choicesToCount = isTieBreakerMode 
      ? (room.tiedChoicesForVoting || [])
      : Array.from(room.choiceVotes.keys())

    // If no choices to count (edge case)
    if (choicesToCount.length === 0) {
      room.choiceVotes = new Map()
      room.tiedChoicesForVoting = []
      await room.save()
      return NextResponse.json({ 
        error: "No valid choices to process",
        resetVotes: true 
      }, { status: 400 })
    }

    choicesToCount.forEach((choiceId: string) => {
      const userIds = room.choiceVotes.get(choiceId) || []
      userIds.forEach((id: any) => uniqueVoters.add(id.toString()))
    })

    // FIX: Don't require all participants to vote if host is selecting in tie-breaker
    const isHostSelectingInTieBreaker = selectedChoiceId && isTieBreakerMode
    
    if (!isHostSelectingInTieBreaker && uniqueVoters.size < totalActivePlayers) {
      return NextResponse.json(
        {
          error: "Waiting for all players to vote",
          participants: totalActivePlayers,
          voters: uniqueVoters.size,
          isTieBreakerMode,
          ready: false,
          missingVotes: totalActivePlayers - uniqueVoters.size
        },
        { status: 400 },
      )
    }

    let maxVotes = 0
    let winningChoiceId: string | null = null
    const choiceVoteCounts: Array<{ choiceId: string; votes: number }> = []

    // Count votes for each choice
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

    // Handle case where no one voted (shouldn't happen but for safety)
    if (choiceVoteCounts.length === 0) {
      room.choiceVotes = new Map()
      room.tiedChoicesForVoting = []
      await room.save()
      return NextResponse.json({ 
        error: "No votes found for any choice",
        resetVotes: true 
      }, { status: 400 })
    }

    const tiedChoices = choiceVoteCounts.filter((c) => c.votes === maxVotes && c.votes > 0)
    const tiedChoiceIds = tiedChoices.map((c) => c.choiceId)

    // Handle tie (first occurrence)
    if (tiedChoices.length > 1 && !isTieBreakerMode && !selectedChoiceId) {
      room.tiedChoicesForVoting = tiedChoiceIds
      
      // Clear votes for non-tied choices
      const allChoiceIds = Array.from(room.choiceVotes.keys())
      allChoiceIds.forEach((choiceId: string) => {
        if (!tiedChoiceIds.includes(choiceId)) {
          room.choiceVotes.delete(choiceId)
        }
      })
      
      // Also clear votes for tied choices to start fresh
      tiedChoiceIds.forEach((choiceId: string) => {
        room.choiceVotes.delete(choiceId)
      })
      
      await room.save()

      return NextResponse.json({
        hasTie: true,
        tiedChoices: tiedChoiceIds,
        isTieBreakerVoting: true,
        message: "Tie detected. All players will vote again on the tied choices.",
        requireNewVotes: true
      })
    }

    // Handle persistent tie after re-voting
    if (tiedChoices.length > 1 && isTieBreakerMode && !selectedChoiceId) {
      return NextResponse.json({
        hasTie: true,
        tiedChoices: tiedChoiceIds,
        isTieBreakerVoting: true,
        requiresHostSelection: true,
        message: "Tie persists after re-voting. Host must select the final choice.",
      })
    }

    // Handle host selection for tie-breaker
    if (selectedChoiceId) {
      const validChoices = isTieBreakerMode 
        ? (room.tiedChoicesForVoting || [])
        : tiedChoiceIds
      
      if (!validChoices.includes(selectedChoiceId)) {
        return NextResponse.json({ 
          error: "Selected choice is not one of the tied choices",
          validChoices,
          selectedChoiceId 
        }, { status: 400 })
      }
      winningChoiceId = selectedChoiceId
    } else if (tiedChoices.length === 1) {
      winningChoiceId = tiedChoices[0].choiceId
    }

    if (!winningChoiceId) {
      return NextResponse.json({ 
        error: "Could not determine winning choice",
        choiceVoteCounts,
        maxVotes,
        tiedChoices 
      }, { status: 400 })
    }

    // Find the winning choice in the story
    const winningChoice = story.choices.find((c: any) => c.id === winningChoiceId)
    if (!winningChoice) {
      console.error(`Winning choice ${winningChoiceId} not found in story choices:`, story.choices.map((c: any) => c.id))
      return NextResponse.json({ 
        error: "Winning choice not found in story",
        choiceId: winningChoiceId,
        availableChoices: story.choices.map((c: any) => ({ id: c.id, text: c.text }))
      }, { status: 400 })
    }

    // Set processing flag
    room.isProcessing = true
    room.lastChoiceEvaluation = { quality: null, message: null }
    await room.save()

    // Generate next story part
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
      
      const errorText = await generateResponse.text()
      console.error("Generate API error:", errorText)
      
      throw new Error(`Failed to generate next part: ${generateResponse.status} ${errorText}`)
    }

    const storyData = await generateResponse.json()

    // Accumulate full story content
    const currentChapter = {
      chapterIndex: story.currentChoiceIndex || 0,
      content: story.content,
      choices: story.choices || [],
      selectedChoice: {
        id: winningChoice.id,
        text: winningChoice.text,
      },
    }

    // Update story
    story.content = storyData.content
    story.choices = storyData.choices
    story.currentChoiceIndex = (story.currentChoiceIndex || 0) + 1
    story.isStoryComplete = storyData.isStoryComplete ?? story.isStoryComplete
    story.choiceHistory = [
      ...(story.choiceHistory || []),
      {
        segmentIndex: story.currentChoiceIndex - 1,
        choiceId: winningChoice.id,
        quality: storyData.lastChoiceEvaluation?.quality,
      },
    ]
    story.fullStoryContent = [
      ...(story.fullStoryContent || []),
      currentChapter,
    ]

    await story.save()

    // Reset room for next round
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
    
    // Handle story completion
    if (story.isStoryComplete) {
      room.status = "completed"

      // Add final chapter to full story content
      const finalChapter = {
        chapterIndex: story.currentChoiceIndex,
        content: storyData.content,
        choices: storyData.choices || [],
      }
      story.fullStoryContent = [
        ...(story.fullStoryContent || []),
        finalChapter,
      ]
      await story.save()

      // Save story for all participants
      const allUsers = [room.hostId.toString(), ...room.participants.map((p: any) => {
        if (typeof p === 'object') return p._id?.toString() || p.toString()
        return p.toString()
      })]
      const uniqueUsers = [...new Set(allUsers.filter(Boolean))]

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
        fullStoryContent: story.fullStoryContent || [],
        isMultiplayer: true,
        roomCode: room.roomCode,
      }

      // Use Promise.allSettled to prevent blocking on individual errors
      await Promise.allSettled(
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
        })
      )
    }
    
    await room.save()

    return NextResponse.json({
      message: "Choice processed successfully",
      story: {
        content: story.content,
        choices: story.choices,
        currentChoiceIndex: story.currentChoiceIndex,
        isStoryComplete: story.isStoryComplete,
      },
      lastChoiceEvaluation: storyData.lastChoiceEvaluation,
      hasTie: false,
      winningChoice: {
        id: winningChoice.id,
        text: winningChoice.text,
      }
    })
  } catch (error) {
    console.error("Process choice error:", error)
    
    // Attempt to reset processing flag
    try {
      const { code } = await params
      const roomCode = code.toUpperCase()
      const room = await Room.findOne({ roomCode })
      if (room) {
        room.isProcessing = false
        await room.save()
      }
    } catch (saveError) {
      console.error("Error resetting processing flag:", saveError)
    }
    
    return NextResponse.json({ 
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
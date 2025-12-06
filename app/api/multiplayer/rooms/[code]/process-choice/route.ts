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

    // Check if user is host
    if (room.hostId.toString() !== userId) {
      return NextResponse.json({ error: "Only the host can process choices" }, { status: 403 })
    }

    if (!room.storyId) {
      return NextResponse.json({ error: "No story associated with room" }, { status: 400 })
    }

    // Get current story
    const story = await Story.findById(room.storyId)
    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 })
    }

    // Determine winning choice from votes
    if (!room.choiceVotes || room.choiceVotes.size === 0) {
      return NextResponse.json({ error: "No votes recorded" }, { status: 400 })
    }

    let maxVotes = 0
    let winningChoiceId: string | null = null
    const choiceVoteCounts: Array<{ choiceId: string; votes: number }> = []

    room.choiceVotes.forEach((userIds: any[], choiceId: string) => {
      const voteCount = userIds.length
      choiceVoteCounts.push({ choiceId, votes: voteCount })
      if (voteCount > maxVotes) {
        maxVotes = voteCount
        winningChoiceId = choiceId
      }
    })

    // Check for ties
    const tiedChoices = choiceVoteCounts.filter((c) => c.votes === maxVotes && c.votes > 0)
    const tiedChoiceIds = tiedChoices.map((c) => c.choiceId)

    // If there's a tie and no selectedChoiceId provided, return tie information
    if (tiedChoices.length > 1 && !selectedChoiceId) {
      return NextResponse.json({
        hasTie: true,
        tiedChoices: tiedChoiceIds,
        message: "Tie detected. Host must select the final choice.",
      })
    }

    // If selectedChoiceId is provided (tie-breaker), use it
    if (selectedChoiceId) {
      // Validate that the selected choice is one of the tied choices
      if (!tiedChoiceIds.includes(selectedChoiceId)) {
        return NextResponse.json({ error: "Selected choice is not one of the tied choices" }, { status: 400 })
      }
      winningChoiceId = selectedChoiceId
    } else if (tiedChoices.length === 1) {
      // No tie, use the winning choice
      winningChoiceId = tiedChoices[0].choiceId
    }

    if (!winningChoiceId) {
      return NextResponse.json({ error: "Could not determine winning choice" }, { status: 400 })
    }

    // Find the winning choice in the story
    const winningChoice = story.choices.find((c: any) => c.id === winningChoiceId)
    if (!winningChoice) {
      return NextResponse.json({ error: "Winning choice not found in story" }, { status: 400 })
    }

    // Generate next part of story
    // For server-side API routes, we need to use the full URL
    const host = request.headers.get('host') || 'localhost:3000'
    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`
    
    const generateResponse = await fetch(`${baseUrl}/api/stories/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        genreId: story.genre,
        personalityTraits: Object.fromEntries(story.personalityTraits || new Map()),
        // No character for multiplayer - use second person "you"
        previousContent: story.content,
        lastChoice: {
          id: winningChoice.id,
          text: winningChoice.text,
        },
        choiceHistory: story.choiceHistory || [],
        isMultiplayer: true, // Flag for second-person narrative
      }),
    })

    if (!generateResponse.ok) {
      throw new Error("Failed to generate next part")
    }

    const storyData = await generateResponse.json()

    // Update story
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

    // Clear choice votes and update room
    room.choiceVotes = new Map()
    room.currentChoiceIndex = story.currentChoiceIndex
    if (story.isStoryComplete) {
      room.status = "completed"
      
      // Save story for all participants with multiplayer tag
      // Do this asynchronously so it doesn't block the response
      const participants = room.participants.map((p: any) => p.toString())
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
      }

      // Save for each participant (fire and forget)
      Promise.all(
        participants.map(async (participantId: string) => {
          try {
            await Story.create({
              userId: participantId,
              ...storyPayload,
              savedAt: new Date(),
            })
          } catch (error) {
            console.error(`Error saving story for participant ${participantId}:`, error)
          }
        })
      ).catch((error) => {
        console.error("Error saving stories for participants:", error)
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
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


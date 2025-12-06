import { NextRequest, NextResponse } from "next/server"
import { getDataFromToken } from "@/helpers/getDataFromToken"
import { connectDB } from "@/db/dbconfig"
import Room from "@/models/room.model"
import Story from "@/models/story.model"
import { STORY_GENRES } from "@/lib/story-data"

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

    await connectDB()

    const room = await Room.findOne({ roomCode })

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    if (room.status !== "voting-genre") {
      return NextResponse.json({ error: "Room is not ready to start story" }, { status: 400 })
    }

    // Check if user is host
    if (room.hostId.toString() !== userId) {
      return NextResponse.json({ error: "Only the host can start the story" }, { status: 403 })
    }

    // Determine selected genre from votes
    if (!room.genreVotes || room.genreVotes.size === 0) {
      return NextResponse.json({ error: "No genre votes recorded" }, { status: 400 })
    }

    let maxVotes = 0
    let selectedGenre: string | null = null
    const genreVoteCounts: Array<{ genreId: string; votes: number }> = []

    room.genreVotes.forEach((userIds: any[], genreId: string) => {
      const voteCount = userIds.length
      genreVoteCounts.push({ genreId, votes: voteCount })
      if (voteCount > maxVotes) {
        maxVotes = voteCount
        selectedGenre = genreId
      }
    })

    // Check for ties - if there's a tie, use host's vote as tiebreaker
    const tiedGenres = genreVoteCounts.filter((g) => g.votes === maxVotes)
    if (tiedGenres.length > 1) {
      // Find host's vote
      const hostVote = Array.from(room.genreVotes.entries()).find(([genreId, userIds]) => {
        return userIds.some((id: any) => id.toString() === room.hostId.toString())
      })
      if (hostVote) {
        selectedGenre = hostVote[0]
      }
    }

    if (!selectedGenre) {
      return NextResponse.json({ error: "Could not determine selected genre" }, { status: 400 })
    }

    // Use default/neutral personality traits for multiplayer (no user-specific character)
    const personalityTraits: Record<string, number> = {
      conscientiousness: 50,
      neuroticism: 50,
      extraversion: 50,
      agreeableness: 50,
      openness: 50,
      honestyHumility: 50,
    }

    // Generate initial story
    const genre = STORY_GENRES.find((g) => g.id === selectedGenre)
    if (!genre) {
      return NextResponse.json({ error: "Invalid genre selected" }, { status: 400 })
    }

    // Call story generation API
    // For server-side API routes, we need to use the full URL
    const host = request.headers.get('host') || 'localhost:3000'
    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`
    
    const generateResponse = await fetch(`${baseUrl}/api/stories/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        genreId: selectedGenre,
        personalityTraits,
        isMultiplayer: true, // Flag for second-person narrative
        // No character for multiplayer - use generic story
      }),
    })

    if (!generateResponse.ok) {
      throw new Error("Failed to generate story")
    }

    const storyData = await generateResponse.json()

    // Create story document - use host as story owner
    const story = await Story.create({
      userId: room.hostId, // Use host as story owner
      title: `${genre.name} Adventure`,
      genre: selectedGenre,
      content: storyData.content,
      choices: storyData.choices,
      currentChoiceIndex: 0,
      personalityTraits,
      // No character - multiplayer uses generic story
      isStoryComplete: storyData.isStoryComplete ?? false,
      choiceHistory: [],
    })

    // Update room
    room.selectedGenre = selectedGenre
    room.storyId = story._id
    room.status = "playing"
    room.currentChoiceIndex = 0
    await room.save()

    return NextResponse.json({
      message: "Story started",
      room: {
        roomCode: room.roomCode,
        status: room.status,
        selectedGenre: room.selectedGenre,
        storyId: room.storyId,
      },
    })
  } catch (error) {
    console.error("Start story error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


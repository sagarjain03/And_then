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

    const body = (await request.json().catch(() => ({}))) as { selectedGenre?: string | null }
    const selectedGenreFromHost = body?.selectedGenre

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

    if (room.hostId.toString() !== userId) {
      return NextResponse.json({ error: "Only the host can start the story" }, { status: 403 })
    }

    if (!room.genreVotes || room.genreVotes.size === 0) {
      return NextResponse.json({ error: "No genre votes recorded" }, { status: 400 })
    }

    const uniqueVoters = new Set<string>()
    room.genreVotes.forEach((userIds: any[]) => {
      userIds.forEach((id: any) => uniqueVoters.add(id.toString()))
    })
    const totalParticipants = room.participants.length
    if (uniqueVoters.size < totalParticipants) {
      return NextResponse.json(
        {
          error: "All participants must vote before starting the story",
          participants: totalParticipants,
          voters: uniqueVoters.size,
        },
        { status: 400 },
      )
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

    const tiedGenres = genreVoteCounts.filter((g) => g.votes === maxVotes)
    if (tiedGenres.length > 1) {
      if (selectedGenreFromHost) {
        const isValidChoice = tiedGenres.some((g) => g.genreId === selectedGenreFromHost)
        if (!isValidChoice) {
          return NextResponse.json(
            {
              error: "Selected genre is not part of the tie",
              tiedGenres,
            },
            { status: 400 },
          )
        }
        selectedGenre = selectedGenreFromHost
      } else {
        return NextResponse.json(
          {
            error: "Tie detected. Host must select a genre to proceed.",
            tiedGenres,
          },
          { status: 400 },
        )
      }
    }

    if (!selectedGenre) {
      return NextResponse.json({ error: "Could not determine selected genre" }, { status: 400 })
    }

    const personalityTraits: Record<string, number> = {
      conscientiousness: 50,
      neuroticism: 50,
      extraversion: 50,
      agreeableness: 50,
      openness: 50,
      honestyHumility: 50,
    }

    const genre = STORY_GENRES.find((g) => g.id === selectedGenre)
    if (!genre) {
      return NextResponse.json({ error: "Invalid genre selected" }, { status: 400 })
    }

    const host = request.headers.get("host") || "localhost:3000"
    const protocol = request.headers.get("x-forwarded-proto") || "http"
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`

    const generateResponse = await fetch(`${baseUrl}/api/stories/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        genreId: selectedGenre,
        personalityTraits,
        isMultiplayer: true,
      }),
    })

    if (!generateResponse.ok) {
      throw new Error("Failed to generate story")
    }

    const storyData = await generateResponse.json()

    const story = await Story.create({
      userId: room.hostId,
      title: `${genre.name} Adventure`,
      genre: selectedGenre,
      content: storyData.content,
      choices: storyData.choices,
      currentChoiceIndex: 0,
      personalityTraits,
      isStoryComplete: storyData.isStoryComplete ?? false,
      choiceHistory: [],
      fullStoryContent: [
        {
          chapterIndex: 0,
          content: storyData.content,
          choices: storyData.choices,
        },
      ],
      isMultiplayer: true,
      roomCode: room.roomCode,
    })

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


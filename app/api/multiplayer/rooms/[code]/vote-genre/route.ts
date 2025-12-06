import { NextRequest, NextResponse } from "next/server"
import { getDataFromToken } from "@/helpers/getDataFromToken"
import { connectDB } from "@/db/dbconfig"
import Room from "@/models/room.model"
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

    const { genreId } = await request.json()

    if (!genreId || typeof genreId !== "string") {
      return NextResponse.json({ error: "Genre ID is required" }, { status: 400 })
    }

    // Validate genre exists
    const genre = STORY_GENRES.find((g) => g.id === genreId)
    if (!genre) {
      return NextResponse.json({ error: "Invalid genre" }, { status: 400 })
    }

    const { code } = await params
    const roomCode = code.toUpperCase()

    await connectDB()

    const room = await Room.findOne({ roomCode })

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    if (room.status !== "waiting" && room.status !== "voting-genre") {
      return NextResponse.json({ error: "Room is not in voting phase" }, { status: 400 })
    }

    // Check if user is a participant
    const isParticipant = room.participants.some(
      (p: any) => p.toString() === userId || (p._id && p._id.toString() === userId),
    )

    if (!isParticipant) {
      return NextResponse.json({ error: "You are not a participant in this room" }, { status: 403 })
    }

    // Remove user's previous vote if any
    if (room.genreVotes) {
      room.genreVotes.forEach((userIds: any[], gId: string) => {
        const filtered = userIds.filter((id: any) => id.toString() !== userId)
        if (filtered.length === 0) {
          room.genreVotes.delete(gId)
        } else {
          room.genreVotes.set(gId, filtered)
        }
      })
    }

    // Add new vote
    if (!room.genreVotes) {
      room.genreVotes = new Map()
    }
    const currentVotes = room.genreVotes.get(genreId) || []
    if (!currentVotes.some((id: any) => id.toString() === userId)) {
      currentVotes.push(userId)
      room.genreVotes.set(genreId, currentVotes)
    }

    // Update status to voting-genre if it was waiting
    if (room.status === "waiting") {
      room.status = "voting-genre"
    }

    await room.save()

    // Convert genreVotes Map to object for response
    const genreVotesObj: Record<string, string[]> = {}
    room.genreVotes.forEach((userIds: any[], gId: string) => {
      genreVotesObj[gId] = userIds.map((id: any) => id.toString())
    })

    return NextResponse.json({
      message: "Vote recorded",
      genreVotes: genreVotesObj,
    })
  } catch (error) {
    console.error("Vote genre error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


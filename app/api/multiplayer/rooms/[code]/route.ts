import { NextRequest, NextResponse } from "next/server"
import { getDataFromToken } from "@/helpers/getDataFromToken"
import { connectDB } from "@/db/dbconfig"
import Room from "@/models/room.model"

export async function GET(
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
      .populate("participants", "username email")
      .populate("hostId", "username email")

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    // Convert genreVotes Map to object for JSON serialization
    const genreVotesObj: Record<string, string[]> = {}
    if (room.genreVotes) {
      room.genreVotes.forEach((userIds: any[], genreId: string) => {
        genreVotesObj[genreId] = userIds.map((id: any) => id.toString())
      })
    }

    // Convert choiceVotes Map to object for JSON serialization
    const choiceVotesObj: Record<string, string[]> = {}
    if (room.choiceVotes) {
      room.choiceVotes.forEach((userIds: any[], choiceId: string) => {
        choiceVotesObj[choiceId] = userIds.map((id: any) => id.toString())
      })
    }

    return NextResponse.json({
      room: {
        roomCode: room.roomCode,
        status: room.status,
        hostId: typeof room.hostId === "object" && room.hostId?._id ? room.hostId._id.toString() : room.hostId.toString(),
        participants: room.participants,
        genreVotes: genreVotesObj,
        selectedGenre: room.selectedGenre,
        storyId: room.storyId ? room.storyId.toString() : null,
        choiceVotes: choiceVotesObj,
        currentChoiceIndex: room.currentChoiceIndex,
      },
    })
  } catch (error) {
    console.error("Get room error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


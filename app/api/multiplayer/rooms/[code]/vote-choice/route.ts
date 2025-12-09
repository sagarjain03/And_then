import { NextRequest, NextResponse } from "next/server"
import { getDataFromToken } from "@/helpers/getDataFromToken"
import { connectDB } from "@/db/dbconfig"
import Room from "@/models/room.model"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const userId = getDataFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { choiceId } = await request.json()

    if (!choiceId || typeof choiceId !== "string") {
      return NextResponse.json({ error: "Choice ID is required" }, { status: 400 })
    }

    const { code } = await params
    const roomCode = code.toUpperCase()

    await connectDB()

    const room = await Room.findOne({ roomCode })

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    if (room.status !== "playing") {
      return NextResponse.json({ error: "Room is not in playing phase" }, { status: 400 })
    }

    const isParticipant = room.participants.some(
      (p: any) => p.toString() === userId || (p._id && p._id.toString() === userId),
    )
    const isHost = room.hostId.toString() === userId

    if (!isParticipant && !isHost) {
      return NextResponse.json({ error: "You are not a participant in this room" }, { status: 403 })
    }

    if (room.tiedChoicesForVoting && room.tiedChoicesForVoting.length > 0) {
      if (!room.tiedChoicesForVoting.includes(choiceId)) {
        return NextResponse.json(
          {
            error: "You can only vote on the tied choices during tie-breaker voting",
          },
          { status: 400 },
        )
      }
    }

    if (room.choiceVotes) {
      room.choiceVotes.forEach((userIds: any[], cId: string) => {
        const filtered = userIds.filter((id: any) => id.toString() !== userId)
        if (filtered.length === 0) {
          room.choiceVotes.delete(cId)
        } else {
          room.choiceVotes.set(cId, filtered)
        }
      })
    }

    if (!room.choiceVotes) {
      room.choiceVotes = new Map()
    }
    const currentVotes = room.choiceVotes.get(choiceId) || []
    if (!currentVotes.some((id: any) => id.toString() === userId)) {
      currentVotes.push(userId)
      room.choiceVotes.set(choiceId, currentVotes)
    }

    await room.save()

    const choiceVotesObj: Record<string, string[]> = {}
    room.choiceVotes.forEach((userIds: any[], cId: string) => {
      choiceVotesObj[cId] = userIds.map((id: any) => id.toString())
    })

    return NextResponse.json({
      message: "Vote recorded",
      choiceVotes: choiceVotesObj,
    })
  } catch (error) {
    console.error("Vote choice error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


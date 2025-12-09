import { NextRequest, NextResponse } from "next/server"
import { getDataFromToken } from "@/helpers/getDataFromToken"
import { connectDB } from "@/db/dbconfig"
import Room from "@/models/room.model"

export async function POST(request: NextRequest) {
  try {
    const userId = getDataFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { roomCode } = await request.json()

    if (!roomCode || typeof roomCode !== "string") {
      return NextResponse.json({ error: "Room code is required" }, { status: 400 })
    }

    await connectDB()

    const room = await Room.findOne({ roomCode: roomCode.toUpperCase() })

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    const blocked = (room.blockedRejoinUsers || []).some((id: any) => id.toString() === userId)
    if (blocked) {
      return NextResponse.json(
        { error: "You chose to exit this room and cannot re-join." },
        { status: 403 },
      )
    }

    if (room.status === "completed") {
      return NextResponse.json({ error: "Room is no longer active" }, { status: 400 })
    }

    const hostIdString = room.hostId.toString()
    const userIsCurrentHost = hostIdString === userId

    if (room.hostActive === false) {
      room.hostId = userId
      room.hostActive = true
      room.participants = room.participants.filter(
        (p: any) => p.toString() !== userId && (p._id ? p._id.toString() !== userId : true),
      )
      await room.save()
    } else {
      const isParticipant = room.participants.some(
        (p: any) => p.toString() === userId || (p._id && p._id.toString() === userId),
      )

      if (userIsCurrentHost && !isParticipant) {
        room.participants.push(userId)
        await room.save()
      } else if (!isParticipant && !userIsCurrentHost) {
        room.participants.push(userId)
        await room.save()
      }
    }

    return NextResponse.json({
      message: "Joined room",
      room: {
        roomCode: room.roomCode,
        status: room.status,
        participants: room.participants,
        selectedGenre: room.selectedGenre,
        storyId: room.storyId,
        hostId: room.hostId,
        hostActive: room.hostActive,
      },
    })
  } catch (error) {
    console.error("Join room error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


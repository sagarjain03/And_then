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

    // Check if user is already a participant
    const isParticipant = room.participants.some(
      (p: any) => p.toString() === userId || (p._id && p._id.toString() === userId),
    )

    // Calculate current room size (host + participants)
    const hostInParticipants = room.participants.some((p: any) => {
      const pId = typeof p === "object" && p._id ? p._id.toString() : p.toString()
      return pId === hostIdString
    })
    const currentRoomSize = room.participants.length + (room.hostActive !== false && !hostInParticipants ? 1 : 0)

    // Check room limit (5 users max)
    const MAX_ROOM_SIZE = 5
    if (room.hostActive === false) {
      // If host is inactive, user becomes new host (this is allowed even if room was "full")
      room.hostId = userId
      room.hostActive = true
      room.participants = room.participants.filter(
        (p: any) => p.toString() !== userId && (p._id ? p._id.toString() !== userId : true),
      )
      await room.save()
    } else {
      // If user is already in the room, allow rejoin
      if (userIsCurrentHost && !isParticipant) {
        room.participants.push(userId)
        await room.save()
      } else if (!isParticipant && !userIsCurrentHost) {
        // Check if room is full before adding new participant
        if (currentRoomSize >= MAX_ROOM_SIZE) {
          return NextResponse.json(
            { error: `Room is full. Maximum ${MAX_ROOM_SIZE} users allowed per room.` },
            { status: 400 },
          )
        }
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


import { NextRequest, NextResponse } from "next/server"
import { getDataFromToken } from "@/helpers/getDataFromToken"
import { connectDB } from "@/db/dbconfig"
import Room from "@/models/room.model"
import User from "@/models/user.model"

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

    const { message } = await request.json()

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    if (message.length > 500) {
      return NextResponse.json({ error: "Message is too long (max 500 characters)" }, { status: 400 })
    }

    await connectDB()

    const room = await Room.findOne({ roomCode })

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    const isHost = room.hostId.toString() === userId
    const isParticipant = room.participants.some(
      (p: any) => p.toString() === userId || (p._id && p._id.toString() === userId),
    )

    if (!isHost && !isParticipant) {
      return NextResponse.json({ error: "You are not a member of this room" }, { status: 403 })
    }

    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    room.messages = room.messages || []
    room.messages.push({
      userId: userId,
      username: user.username,
      message: message.trim(),
      timestamp: new Date(),
    })

    if (room.messages.length > 100) {
      room.messages = room.messages.slice(-100)
    }

    await room.save()

    return NextResponse.json({
      message: "Message sent",
      chatMessage: {
        userId: userId,
        username: user.username,
        message: message.trim(),
        timestamp: new Date(),
      },
    })
  } catch (error) {
    console.error("Send chat message error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}



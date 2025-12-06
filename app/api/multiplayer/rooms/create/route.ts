import { NextRequest, NextResponse } from "next/server"
import { getDataFromToken } from "@/helpers/getDataFromToken"
import { connectDB } from "@/db/dbconfig"
import Room from "@/models/room.model"

function generateRoomCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function POST(request: NextRequest) {
  try {
    const userId = getDataFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Generate unique room code
    let roomCode: string
    let attempts = 0
    do {
      roomCode = generateRoomCode()
      const existing = await Room.findOne({ roomCode })
      if (!existing) break
      attempts++
      if (attempts > 10) {
        return NextResponse.json({ error: "Failed to generate unique room code" }, { status: 500 })
      }
    } while (true)

    // Create room
    const room = await Room.create({
      roomCode,
      hostId: userId,
      participants: [userId],
      status: "waiting",
    })

    return NextResponse.json(
      {
        message: "Room created",
        room: {
          roomCode: room.roomCode,
          status: room.status,
          participants: room.participants,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Create room error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


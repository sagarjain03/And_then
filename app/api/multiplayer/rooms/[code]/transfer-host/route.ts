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
    const { newHostId } = body as { newHostId?: string }

    if (!newHostId || typeof newHostId !== "string") {
      return NextResponse.json({ error: "Select a participant to transfer host" }, { status: 400 })
    }

    await connectDB()

    const room = await Room.findOne({ roomCode })

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    const isHost = room.hostId.toString() === userId
    if (!isHost) {
      return NextResponse.json({ error: "Only the current host can transfer host powers" }, { status: 403 })
    }

    if (room.hostId.toString() === newHostId) {
      return NextResponse.json({ error: "Select a different participant to become host" }, { status: 400 })
    }

    const targetIndex = room.participants.findIndex(
      (p: any) => p.toString() === newHostId || (p._id && p._id.toString() === newHostId),
    )

    if (targetIndex === -1) {
      return NextResponse.json({ error: "Selected user is not an active participant" }, { status: 400 })
    }

    const preservedStoryId = room.storyId
    const preservedStatus = room.status
    const originalHostId = room.hostId

    const newHost = room.participants[targetIndex]
    room.hostId = typeof newHost === "object" && newHost._id ? newHost._id : newHost
    room.hostActive = true
    room.newHostNotification = room.hostId

    room.participants = room.participants.filter((_p: any, idx: number) => idx !== targetIndex)

    const newHostIdString = room.hostId.toString()
    const originalHostIdString = originalHostId.toString()
    if (originalHostIdString !== newHostIdString) {
      const alreadyParticipant = room.participants.some(
        (p: any) =>
          p.toString() === originalHostIdString || (p._id && p._id.toString() === originalHostIdString),
      )
      if (!alreadyParticipant) {
        room.participants.push(originalHostId)
      }
    }

    room.storyId = preservedStoryId
    room.status = preservedStatus

    if (room.storyId) {
      try {
        await Story.findOneAndUpdate({ _id: room.storyId }, { userId: room.hostId })
      } catch (err) {
        console.error("Error transferring story ownership to new host:", err)
      }
    }

    await room.save()

    return NextResponse.json({
      message: "Host transferred successfully",
      hostId: room.hostId.toString(),
    })
  } catch (error) {
    console.error("Transfer host error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}



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
      .populate("newHostNotification", "username email")

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

    // Format chat messages
    const messages = (room.messages || []).map((msg: any) => ({
      userId: msg.userId.toString(),
      username: msg.username,
      message: msg.message,
      timestamp: msg.timestamp,
    }))

    // Format new host notification if present
    let newHostNotification = null
    if (room.newHostNotification) {
      if (typeof room.newHostNotification === "object" && room.newHostNotification?._id) {
        const newHost = room.newHostNotification
        newHostNotification = {
          userId: newHost._id.toString(),
          username: newHost.username || newHost.email || "Unknown",
        }
      } else {
        const newHostId = room.newHostNotification.toString()
        const currentHostId =
          typeof room.hostId === "object" && room.hostId?._id
            ? room.hostId._id.toString()
            : room.hostId.toString()

        if (newHostId === currentHostId && typeof room.hostId === "object" && room.hostId?.username) {
          newHostNotification = {
            userId: currentHostId,
            username: room.hostId.username || room.hostId.email || "Unknown",
          }
        } else {
          const newHostInParticipants = room.participants.find((p: any) => {
            const pId = typeof p === "object" && p._id ? p._id.toString() : p.toString()
            return pId === newHostId
          })
          if (newHostInParticipants && typeof newHostInParticipants === "object") {
            newHostNotification = {
              userId: newHostInParticipants._id
                ? newHostInParticipants._id.toString()
                : newHostInParticipants.toString(),
              username: newHostInParticipants.username || newHostInParticipants.email || "Unknown",
            }
          } else {
            newHostNotification = {
              userId: newHostId,
              username: "Unknown",
            }
          }
        }
      }
    }

    const hostInfo =
      typeof room.hostId === "object" && room.hostId?._id
        ? {
            _id: room.hostId._id.toString(),
            username: room.hostId.username || room.hostId.email || "Unknown",
            email: room.hostId.email || "",
          }
        : {
            _id: room.hostId.toString(),
            username: "Unknown",
            email: "",
          }

    return NextResponse.json({
      room: {
        roomCode: room.roomCode,
        status: room.status,
        hostId: hostInfo._id,
        host: hostInfo,
        hostActive: room.hostActive,
        participants: room.participants,
        genreVotes: genreVotesObj,
        selectedGenre: room.selectedGenre,
        storyId: room.storyId ? room.storyId.toString() : null,
        choiceVotes: choiceVotesObj,
        currentChoiceIndex: room.currentChoiceIndex,
        isProcessing: room.isProcessing || false,
        lastChoiceEvaluation: room.lastChoiceEvaluation || null,
        tiedChoicesForVoting: room.tiedChoicesForVoting || [],
        messages: messages,
        newHostNotification: newHostNotification,
      },
    })
  } catch (error) {
    console.error("Get room error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


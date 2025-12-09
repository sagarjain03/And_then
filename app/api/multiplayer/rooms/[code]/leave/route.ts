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
    const { saveAndExit } = body

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

    const otherParticipants = room.participants.filter(
      (p: any) => p.toString() !== userId && (p._id ? p._id.toString() !== userId : true),
    )
    const hasOtherParticipants = otherParticipants.length > 0

    if (isHost && room.hostActive !== false && hasOtherParticipants) {
      return NextResponse.json(
        { error: "Transfer host to a participant before exiting the room" },
        { status: 400 },
      )
    }

    if (saveAndExit && room.storyId && room.status === "playing") {
      const story = await Story.findById(room.storyId)
      if (story) {
        const storyPayload = {
          title: story.title,
          genre: story.genre,
          content: story.content,
          choices: story.choices,
          currentChoiceIndex: story.currentChoiceIndex,
          personalityTraits: story.personalityTraits || new Map(),
          character: story.character,
          isStoryComplete: story.isStoryComplete,
          choiceHistory: story.choiceHistory || [],
          isMultiplayer: true,
          roomCode: room.roomCode,
        }

        try {
          const existing = await Story.findOne({
            userId,
            roomCode: room.roomCode,
            isMultiplayer: true,
          })

          if (existing) {
            await Story.findOneAndUpdate(
              { _id: existing._id, userId },
              { ...storyPayload, userId, savedAt: new Date() },
            )
          } else {
            const singlePlayerVersion = await Story.findOne({
              userId,
              $or: [
                { roomCode: { $exists: false } },
                { roomCode: null },
                { isMultiplayer: false },
              ],
              title: story.title,
              genre: story.genre,
            })

            if (singlePlayerVersion) {
              await Story.deleteOne({ _id: singlePlayerVersion._id })
            }

            await Story.create({
              userId,
              ...storyPayload,
              isMultiplayer: true,
              roomCode: room.roomCode,
              savedAt: new Date(),
            })
          }
        } catch (error) {
          console.error(`Error saving story for user ${userId}:`, error)
        }
      }
    }

    if (!saveAndExit) {
      const alreadyBlocked = (room.blockedRejoinUsers || []).some((id: any) => id.toString() === userId)
      if (!alreadyBlocked) {
        room.blockedRejoinUsers.push(userId)
      }
    }

    if (room.choiceVotes) {
      room.choiceVotes.forEach((userIds: any[], choiceId: string) => {
        const filtered = userIds.filter((id: any) => id.toString() !== userId)
        if (filtered.length === 0) {
          room.choiceVotes.delete(choiceId)
        } else {
          room.choiceVotes.set(choiceId, filtered)
        }
      })
    }

    if (room.genreVotes) {
      room.genreVotes.forEach((userIds: any[], genreId: string) => {
        const filtered = userIds.filter((id: any) => id.toString() !== userId)
        if (filtered.length === 0) {
          room.genreVotes.delete(genreId)
        } else {
          room.genreVotes.set(genreId, filtered)
        }
      })
    }

    const preservedStoryId = room.storyId
    const preservedStatus = room.status

    if (isHost) {
      room.participants = room.participants.filter(
        (p: any) => p.toString() !== userId && (p._id ? p._id.toString() !== userId : true),
      )

      room.hostActive = false
      room.newHostNotification = null
    } else {
      room.participants = room.participants.filter(
        (p: any) => p.toString() !== userId && (p._id ? p._id.toString() !== userId : true),
      )
    }

    room.storyId = preservedStoryId
    room.status = preservedStatus

    await room.save()

    return NextResponse.json({
      message: "Left room successfully",
    })
  } catch (error) {
    console.error("Leave room error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}



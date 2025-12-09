import { type NextRequest, NextResponse } from "next/server"
import { getDataFromToken } from "@/helpers/getDataFromToken"
import { connectDB } from "@/db/dbconfig"
import Story from "@/models/story.model"
import Room from "@/models/room.model"

export async function POST(request: NextRequest) {
  try {
    const userId = getDataFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { story } = await request.json()

    if (!story) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await connectDB()

    const isMultiplayer = story.isMultiplayer || !!story.roomCode
    let roomCode: string | null = story.roomCode || null

    if (isMultiplayer && !roomCode) {
      const storyId = story.id || story._id
      if (storyId) {
        const room = await Room.findOne({ storyId })
        if (room) {
          roomCode = room.roomCode
        }
      }
    }

    const basePayload = {
      title: story.title,
      genre: story.genre,
      content: story.content,
      choices: story.choices,
      currentChoiceIndex: story.currentChoiceIndex,
      personalityTraits: story.personalityTraits,
      character: story.character,
      isStoryComplete: story.isStoryComplete ?? false,
      choiceHistory: story.choiceHistory ?? [],
      isMultiplayer: isMultiplayer || false,
      roomCode: roomCode,
      savedAt: new Date(),
    }

    const storyId: string | undefined = story.id || story._id

    if (isMultiplayer) {
      const userPayload = { ...basePayload, userId, isMultiplayer: true }

      let doc
      if (roomCode) {
        const existing = await Story.findOne({
          userId: userId,
          roomCode: roomCode,
        })

        if (existing) {
          doc = await Story.findOneAndUpdate(
            { _id: existing._id, userId: userId },
            userPayload,
            { new: true },
          )
        } else {
          doc = await Story.create(userPayload)
        }
      } else {
        doc = await Story.create(userPayload)
      }

      return NextResponse.json(
        {
          message: "Story saved to your multiplayer library",
          story: doc,
        },
        { status: 200 },
      )
    }

    const singlePlayerPayload = { ...basePayload, isMultiplayer: false, roomCode: null, userId }
    let doc
    if (storyId) {
      doc = await Story.findOneAndUpdate(
        { _id: storyId, userId, isMultiplayer: { $ne: true } },
        singlePlayerPayload,
        { new: true },
      )

      if (!doc) {
        doc = await Story.create(singlePlayerPayload)
      }
    } else {
      doc = await Story.create(singlePlayerPayload)
    }

    return NextResponse.json(
      {
        message: "Story saved",
        story: doc,
      },
      { status: storyId ? 200 : 201 },
    )
  } catch (error) {
    console.error("Save story error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

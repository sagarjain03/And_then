import { NextRequest, NextResponse } from "next/server"
import { getDataFromToken } from "@/helpers/getDataFromToken"
import { connectDB } from "@/db/dbconfig"
import Story from "@/models/story.model"
import Room from "@/models/room.model"

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const userId = getDataFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params

    await connectDB()

    // First, try to find story owned by user
    let story = await Story.findOne({ _id: id, userId }).lean()
    
    // If not found, check if user is a participant in a multiplayer room with this story
    if (!story) {
      // Check if user is host or participant in a room with this story
      const room = await Room.findOne({ 
        storyId: id,
        $or: [
          { hostId: userId },
          { participants: userId }
        ]
      }).lean()
      
      if (room) {
        // User is part of a room with this story, allow access
        story = await Story.findOne({ _id: id }).lean()
      } else {
        // Also check if there's a room with this storyId (even if empty)
        // This handles the case where everyone left and someone is rejoining
        const roomWithStory = await Room.findOne({ storyId: id }).lean()
        if (roomWithStory) {
          // Check if user is the current host (they might have just rejoined)
          const isCurrentHost = roomWithStory.hostId && roomWithStory.hostId.toString() === userId
          if (isCurrentHost) {
            // User is the current host, allow access to the original story
            story = await Story.findOne({ _id: id }).lean()
          }
        }
      }
    }
    
    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 })
    }

    return NextResponse.json({ story }, { status: 200 })
  } catch (error: any) {
    console.error("Get story error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const userId = getDataFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params

    await connectDB()

    const result = await Story.deleteOne({ _id: id, userId })
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Story deleted" }, { status: 200 })
  } catch (error: any) {
    console.error("Delete story error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

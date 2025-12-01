import { type NextRequest, NextResponse } from "next/server"
import { getDataFromToken } from "@/helpers/getDataFromToken"
import { connectDB } from "@/db/dbconfig"
import Story from "@/models/story.model"

export async function GET(request: NextRequest) {
  try {
    const userId = getDataFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const userStories = await Story.find({ userId }).sort({ updatedAt: -1 }).lean()

    return NextResponse.json(
      {
        stories: userStories,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("List stories error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

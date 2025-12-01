import { type NextRequest, NextResponse } from "next/server"
import { getDataFromToken } from "@/helpers/getDataFromToken"
import { connectDB } from "@/db/dbconfig"
import Story from "@/models/story.model"

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

    const doc = await Story.create({
      userId,
      title: story.title,
      genre: story.genre,
      content: story.content,
      choices: story.choices,
      currentChoiceIndex: story.currentChoiceIndex,
      personalityTraits: story.personalityTraits,
      character: story.character,
      isStoryComplete: story.isStoryComplete ?? false,
      choiceHistory: story.choiceHistory ?? [],
      savedAt: new Date(),
    })

    return NextResponse.json(
      {
        message: "Story saved",
        story: doc,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Save story error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

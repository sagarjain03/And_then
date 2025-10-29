import { type NextRequest, NextResponse } from "next/server"

// TODO: Replace with actual database integration
const savedStories: Map<string, object[]> = new Map()

export async function POST(request: NextRequest) {
  try {
    const { userId, story } = await request.json()

    if (!userId || !story) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const userStories = savedStories.get(userId) || []
    const storyWithMetadata = {
      ...story,
      savedAt: new Date(),
    }

    userStories.push(storyWithMetadata)
    savedStories.set(userId, userStories)

    return NextResponse.json(
      {
        message: "Story saved",
        story: storyWithMetadata,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Save story error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

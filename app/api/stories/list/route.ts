import { type NextRequest, NextResponse } from "next/server"

// TODO: Replace with actual database integration
const savedStories: Map<string, object[]> = new Map()

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const userStories = savedStories.get(userId) || []

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

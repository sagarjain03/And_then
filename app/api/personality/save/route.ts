import { type NextRequest, NextResponse } from "next/server"

// TODO: Replace with actual database integration
const personalityResults: Map<string, object> = new Map()

export async function POST(request: NextRequest) {
  try {
    const { userId, scores, topTraits, summary } = await request.json()

    if (!userId || !scores) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = {
      userId,
      scores,
      topTraits,
      summary,
      createdAt: new Date(),
    }

    personalityResults.set(userId, result)

    return NextResponse.json(
      {
        message: "Personality result saved",
        result,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Save personality error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

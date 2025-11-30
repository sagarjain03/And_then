import { type NextRequest, NextResponse } from "next/server"
import { getDataFromToken } from "@/helpers/getDataFromToken"

// TODO: Replace with actual database integration
// For now, we accept the personality data and store it in memory or just acknowledge it.
const personalityResults: Map<string, object> = new Map()

export async function POST(request: NextRequest) {
  try {
    const userId = getDataFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { scores, topTraits, summary } = await request.json()

    if (!scores) {
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

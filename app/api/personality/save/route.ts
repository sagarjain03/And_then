import { type NextRequest, NextResponse } from "next/server"
import { getDataFromToken } from "@/helpers/getDataFromToken"
import { connectDB } from "@/db/dbconfig"
import PersonalityProfile from "@/models/personalityProfile.model"

export async function POST(request: NextRequest) {
  try {
    const userId = getDataFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { scores, topTraits, summary, character } = await request.json()

    if (!scores) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await connectDB()

    const doc = await PersonalityProfile.findOneAndUpdate(
      { userId },
      {
        userId,
        scores,
        topTraits,
        summary,
        character: character || undefined,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    )

    return NextResponse.json(
      {
        message: "Personality result saved",
        result: doc,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Save personality error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

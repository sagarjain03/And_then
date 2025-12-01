import { NextRequest, NextResponse } from "next/server"
import { getDataFromToken } from "@/helpers/getDataFromToken"
import { connectDB } from "@/db/dbconfig"
import PersonalityProfile from "@/models/personalityProfile.model"

export async function GET(request: NextRequest) {
  try {
    const userId = getDataFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const doc = await PersonalityProfile.findOne({ userId }).lean()

    if (!doc) {
      return NextResponse.json({ result: null }, { status: 200 })
    }

    const normalizeScores = (s: any) => {
      if (!s) return {}
      if (Array.isArray(s)) return Object.fromEntries(s)
      if (s instanceof Map) return Object.fromEntries(s.entries())
      if (typeof s === "object") return s
      return {}
    }

    const result = {
      scores: normalizeScores(doc.scores),
      topTraits: doc.topTraits || [],
      summary: doc.summary || "",
      character: doc.character || null,
    }

    return NextResponse.json({ result }, { status: 200 })
  } catch (error: any) {
    console.error("Get personality error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/db/dbconfig"
import { getDataFromToken } from "@/helpers/getDataFromToken"
import User from "@/models/user.model"
import Story from "@/models/story.model"
import PersonalityProfile from "@/models/personalityProfile.model"

export async function GET(request: NextRequest) {
  try {
    const userId = getDataFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const user = await User.findById(userId).select("_id username email")
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const [stories, personality] = await Promise.all([
      Story.find({ userId }).sort({ updatedAt: -1 }).lean(),
      PersonalityProfile.findOne({ userId }).lean(),
    ])

    const normalizeScores = (s: any) => {
      if (!s) return {}
      if (Array.isArray(s)) return Object.fromEntries(s)
      if (s instanceof Map) return Object.fromEntries(s.entries())
      if (typeof s === "object") return s
      return {}
    }

    const personalityResult = personality
      ? {
          scores: normalizeScores(personality.scores),
          topTraits: personality.topTraits || [],
          summary: personality.summary || "",
          character: personality.character || null,
        }
      : null

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
      },
      stories,
      personality: personalityResult,
    })
  } catch (error: any) {
    console.error("Dashboard error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

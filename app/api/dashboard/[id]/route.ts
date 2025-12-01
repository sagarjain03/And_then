import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/db/dbconfig"
import { getDataFromToken } from "@/helpers/getDataFromToken"
import User from "@/models/user.model"
import Story from "@/models/story.model"
import PersonalityProfile from "@/models/personalityProfile.model"

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id: pathUserId } = await context.params
    const tokenUserId = getDataFromToken(request)

    if (!tokenUserId || tokenUserId !== pathUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const user = await User.findById(tokenUserId).select("_id username email")
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const [stories, personality] = await Promise.all([
      Story.find({ userId: tokenUserId }).sort({ updatedAt: -1 }).lean(),
      PersonalityProfile.findOne({ userId: tokenUserId }).lean(),
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

    const characterName =
      personalityResult?.character?.name?.trim() || user.username || "Explorer"
    const preferredGenres = personalityResult?.character?.preferredGenres || []
    const topGenre = preferredGenres[0] || null
    const topTrait = personalityResult?.topTraits?.[0] || null

    const userProfile = {
      character_name: characterName,
      preferred_language: "en",
      preferences: {
        top_genre: topGenre,
        top_trait: topTrait,
      },
    }

    let dashboardSnippet: string
    if (topGenre) {
      dashboardSnippet = `${characterName}—welcome back! Since you're into ${topGenre} vibes, today's hooks lean in that direction. Ready to continue?`
    } else if (topTrait) {
      dashboardSnippet = `${characterName}, your ${topTrait.toLowerCase()} side is calling—let's see how it shapes today's choices.`
    } else {
      dashboardSnippet = `${characterName}, your dashboard is tuned for fresh adventure today. Pick a story and see where it goes.`
    }

    const responseBody = {
      meta: {
        routes_protected: true,
        schema_version: "1.0.0",
      },
      player_context: {
        userId: user._id.toString(),
        userProfile,
        dashboard_snippet: dashboardSnippet,
      },
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
      },
      stories,
      personality: personalityResult,
    }

    return NextResponse.json(responseBody)
  } catch (error: any) {
    console.error("Dashboard (by id) error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

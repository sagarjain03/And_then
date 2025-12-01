import { NextRequest, NextResponse } from "next/server"
import { getDataFromToken } from "@/helpers/getDataFromToken"
import { connectDB } from "@/db/dbconfig"
import UserProgress from "@/models/userProgress.model"
import type { UserStats, Badge } from "@/lib/gamification"

function calculateLevel(xp: number): number {
  return Math.floor(xp / 100) + 1
}

function getXPForNextLevel(level: number): number {
  return level * 100
}

function toUserStats(doc: any): UserStats {
  const xp = doc.xp ?? 0
  const level = calculateLevel(xp)
  return {
    level,
    xp,
    xpToNextLevel: getXPForNextLevel(level),
    storiesCompleted: doc.storiesCompleted ?? 0,
    choicesMade: doc.choicesMade ?? 0,
    badges: (doc.badges ?? []) as Badge[],
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = getDataFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    let doc = await UserProgress.findOne({ userId })
    if (!doc) {
      doc = await UserProgress.create({ userId })
    }

    const stats = toUserStats(doc)
    return NextResponse.json({ stats }, { status: 200 })
  } catch (error: any) {
    console.error("Get gamification stats error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getDataFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { updates } = (await request.json()) as { updates: Partial<UserStats> }

    await connectDB()

    let doc = await UserProgress.findOne({ userId })
    if (!doc) {
      doc = await UserProgress.create({ userId })
    }

    if (updates.xp !== undefined) {
      doc.xp = updates.xp
    }
    if (updates.storiesCompleted !== undefined) {
      doc.storiesCompleted = updates.storiesCompleted
    }
    if (updates.choicesMade !== undefined) {
      doc.choicesMade = updates.choicesMade
    }
    if (updates.badges !== undefined) {
      doc.badges = updates.badges as any
    }

    // Recalculate level based on XP
    doc.level = calculateLevel(doc.xp ?? 0)
    doc.lastActivityAt = new Date()

    await doc.save()

    const stats = toUserStats(doc)
    return NextResponse.json({ stats }, { status: 200 })
  } catch (error: any) {
    console.error("Update gamification stats error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

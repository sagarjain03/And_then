export interface UserStats {
  level: number
  xp: number
  xpToNextLevel: number
  storiesCompleted: number
  choicesMade: number
  badges: Badge[]
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt?: Date
}

export const BADGES: Badge[] = [
  {
    id: "first-test",
    name: "Self Discovery",
    description: "Completed your first personality test",
    icon: "🎯",
  },
  {
    id: "first-story",
    name: "Story Weaver",
    description: "Created your first story",
    icon: "📖",
  },
  {
    id: "choice-maker",
    name: "Decision Maker",
    description: "Made 10 story choices",
    icon: "🎭",
  },
  {
    id: "story-master",
    name: "Story Master",
    description: "Completed 5 stories",
    icon: "👑",
  },
  {
    id: "explorer",
    name: "Genre Explorer",
    description: "Tried all 5 story genres",
    icon: "🌟",
  },
]

export function calculateLevel(xp: number): number {
  return Math.floor(xp / 100) + 1
}

export function getXPForNextLevel(level: number): number {
  return level * 100
}

export function getDefaultUserStats(): UserStats {
  return {
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    storiesCompleted: 0,
    choicesMade: 0,
    badges: [],
  }
}

export async function fetchUserStats(): Promise<UserStats> {
  try {
    const res = await fetch("/api/gamification", { cache: "no-store" })
    if (!res.ok) {
      return getDefaultUserStats()
    }
    const data = (await res.json()) as { stats: UserStats }
    return data.stats
  } catch (err) {
    console.error("Failed to fetch user stats", err)
    return getDefaultUserStats()
  }
}

export async function updateUserStats(updates: Partial<UserStats>): Promise<UserStats> {
  try {
    const res = await fetch("/api/gamification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates }),
    })
    if (!res.ok) {
      throw new Error("Failed to update user stats")
    }
    const data = (await res.json()) as { stats: UserStats }
    return data.stats
  } catch (err) {
    console.error("Failed to update user stats", err)
    return getDefaultUserStats()
  }
}

export async function awardXP(amount: number, _reason: string): Promise<void> {
  const current = await fetchUserStats()
  const newXP = current.xp + amount
  await updateUserStats({ xp: newXP })
}

export async function unlockBadge(badgeId: string): Promise<boolean> {
  const current = await fetchUserStats()
  const badge = BADGES.find((b) => b.id === badgeId)

  if (!badge || current.badges.some((b) => b.id === badgeId)) {
    return false
  }

  const unlockedBadge = { ...badge, unlockedAt: new Date() }
  const updatedBadges = [...current.badges, unlockedBadge]
  await updateUserStats({ badges: updatedBadges })
  return true
}

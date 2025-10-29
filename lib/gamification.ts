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

export function getUserStats(): UserStats {
  const stored = localStorage.getItem("userStats")
  if (stored) {
    return JSON.parse(stored)
  }
  return {
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    storiesCompleted: 0,
    choicesMade: 0,
    badges: [],
  }
}

export function updateUserStats(updates: Partial<UserStats>): UserStats {
  const current = getUserStats()
  const updated = { ...current, ...updates }

  if (updates.xp !== undefined) {
    updated.level = calculateLevel(updated.xp)
    updated.xpToNextLevel = getXPForNextLevel(updated.level)
  }

  localStorage.setItem("userStats", JSON.stringify(updated))
  return updated
}

export function awardXP(amount: number, reason: string): { newXP: number; leveledUp: boolean } {
  const stats = getUserStats()
  const oldLevel = stats.level
  const newXP = stats.xp + amount
  const newLevel = calculateLevel(newXP)

  updateUserStats({ xp: newXP })

  return {
    newXP,
    leveledUp: newLevel > oldLevel,
  }
}

export function unlockBadge(badgeId: string): boolean {
  const stats = getUserStats()
  const badge = BADGES.find((b) => b.id === badgeId)

  if (!badge || stats.badges.some((b) => b.id === badgeId)) {
    return false
  }

  const unlockedBadge = { ...badge, unlockedAt: new Date() }
  updateUserStats({ badges: [...stats.badges, unlockedBadge] })
  return true
}

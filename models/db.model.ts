// Database collection names
export const COLLECTIONS = {
  USERS: "users",
  PERSONALITIES: "personalities",
  STORIES: "stories",
  USER_PROGRESS: "user_progress",
}

// User document interface
export interface User {
  _id?: string
  email: string
  passwordHash: string
  username: string
  createdAt: Date
  updatedAt: Date
}

// Personality profile interface
export interface PersonalityProfile {
  _id?: string
  userId: string
  traits: {
    conscientiousness: number
    neuroticism: number
    extraversion: number
    agreeableness: number
    openness: number
    honestyHumility: number
  }
  summary: string
  completedAt: Date
}

// Story document interface
export interface Story {
  _id?: string
  userId: string
  title: string
  genre: string
  content: string
  choices: Array<{
    text: string
    nextSegmentId?: string
  }>
  currentSegmentId: string
  status: "in-progress" | "completed" | "abandoned"
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
}

// User progress interface
export interface UserProgress {
  _id?: string
  userId: string
  xp: number
  level: number
  badges: string[]
  storiesCompleted: number
  choicesMade: number
  lastActivityAt: Date
}

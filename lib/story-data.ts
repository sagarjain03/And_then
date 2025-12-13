import type { CharacterProfile } from "./personality-data"

export interface StoryGenre {
  id: string
  name: string
  description: string
  icon: string
  prompt: string
}

export type ChoiceQuality = "excellent" | "good" | "average" | "bad"

export interface StoryChoice {
  id: string
  text: string
  consequence?: string
  nextContent?: string
}

export interface StoryChoiceHistoryEntry {
  segmentIndex: number
  choiceId: string
  quality?: ChoiceQuality
}

export interface FullStoryChapter {
  chapterIndex: number
  content: string
  choices: StoryChoice[]
  selectedChoice?: {
    id: string
    text: string
  }
}

export interface Story {
  id: string
  title: string
  genre: string
  content: string
  choices: StoryChoice[]
  currentChoiceIndex: number
  personalityTraits: Record<string, number>
  character?: CharacterProfile
  createdAt: Date
  isStoryComplete?: boolean
  choiceHistory?: StoryChoiceHistoryEntry[]
  fullStoryContent?: FullStoryChapter[]
  // Multiplayer extras
  isMultiplayer?: boolean
  roomCode?: string | null
  savedAt?: Date
}

export const STORY_GENRES: StoryGenre[] = [
  {
    id: "fantasy",
    name: "Fantasy",
    description: "Epic quests, magic, and mythical worlds",
    icon: "🐉",
    prompt:
      "Create an immersive fantasy story opening that draws the reader into a magical world. Include vivid descriptions of the setting and introduce an intriguing conflict or mystery.",
  },
  {
    id: "scifi",
    name: "Science Fiction",
    description: "Future worlds, technology, and space exploration",
    icon: "🚀",
    prompt:
      "Create a compelling sci-fi story opening set in a futuristic world. Include advanced technology, interesting world-building, and an engaging premise that hooks the reader.",
  },
  {
    id: "mystery",
    name: "Mystery",
    description: "Puzzles, secrets, and detective work",
    icon: "🔍",
    prompt:
      "Create an intriguing mystery story opening with a compelling puzzle or crime. Include atmospheric details and clues that make the reader want to solve the mystery.",
  },
  {
    id: "romance",
    name: "Romance",
    description: "Love, relationships, and emotional journeys",
    icon: "💕",
    prompt:
      "Create a romantic story opening that introduces compelling characters and emotional tension. Include vivid descriptions of feelings and an engaging relationship dynamic.",
  },
  {
    id: "adventure",
    name: "Adventure",
    description: "Thrilling journeys and daring exploits",
    icon: "⛰️",
    prompt:
      "Create an action-packed adventure story opening with high stakes and exciting possibilities. Include dynamic action and a sense of urgency that propels the narrative forward.",
  },
]

export function getGenreById(id: string): StoryGenre | undefined {
  return STORY_GENRES.find((g) => g.id === id)
}

export function generateStoryPrompt(
  genre: StoryGenre,
  personalityTraits: Record<string, number>,
  previousContent?: string,
): string {
  const traitDescriptions = Object.entries(personalityTraits)
    .filter(([, score]) => score > 60)
    .map(([trait]) => trait)
    .join(", ")

  const basePrompt = `You are a creative storyteller crafting a personalized ${genre.name.toLowerCase()} story.

The reader has these personality traits: ${traitDescriptions || "balanced and adaptable"}.

${genre.prompt}

${previousContent ? `Previous story content:\n${previousContent}\n\nContinue the story naturally from where it left off.` : ""}

Write the story content in 2-3 paragraphs. Make it engaging, immersive, and tailored to the reader's personality. End with a natural pause point where the reader can make a meaningful choice.

After the story content, provide exactly 3 story choices in this format:
CHOICE 1: [choice text]
CHOICE 2: [choice text]
CHOICE 3: [choice text]`

  return basePrompt
}

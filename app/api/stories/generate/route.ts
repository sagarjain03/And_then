import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { generateObject } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { getGenreById, type StoryChoice, type ChoiceQuality } from "@/lib/story-data"
import type { CharacterProfile } from "@/lib/personality-data"

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
})

const StoryTurnSchema = z.object({
  content: z.string(),
  isStoryComplete: z.boolean().default(false),
  choices: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
      }),
    )
    .min(1)
    .max(4),
  lastChoiceEvaluation: z
    .object({
      quality: z.enum(["excellent", "good", "average", "bad"] as const),
      message: z.string(),
    })
    .optional(),
})

interface GenerateBody {
  genreId: string
  personalityTraits: Record<string, number>
  character?: CharacterProfile
  previousContent?: string
  lastChoice?: {
    id: string
    text: string
  }
  choiceHistory?: Array<{
    segmentIndex: number
    choiceId: string
    quality?: ChoiceQuality
  }>
  isMultiplayer?: boolean
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json({ error: "GOOGLE_GENERATIVE_AI_API_KEY is not configured" }, { status: 500 })
    }

    const body = (await request.json()) as GenerateBody
    const { genreId, personalityTraits, character, previousContent, lastChoice, choiceHistory = [], isMultiplayer = false } = body

    const genre = getGenreById(genreId)
    if (!genre) {
      return NextResponse.json({ error: "Invalid genre" }, { status: 400 })
    }

    const traitDescriptions = Object.entries(personalityTraits || {})
      .map(([trait, value]) => `${trait}: ${value}`)
      .join(", ")

    const historyDescription = choiceHistory
      .map((entry) => `Step ${entry.segmentIndex + 1}: choice ${entry.choiceId}${entry.quality ? ` (${entry.quality})` : ""}`)
      .join("; ")

    const maxChapters = 100
    const chaptersSoFar = choiceHistory.length
    const chaptersRemaining = Math.max(0, maxChapters - chaptersSoFar)

    const qualityCounts = {
      excellent: 0,
      good: 0,
      average: 0,
      bad: 0,
    } as Record<ChoiceQuality, number>

    for (const entry of choiceHistory) {
      if (entry.quality && qualityCounts[entry.quality] !== undefined) {
        qualityCounts[entry.quality] += 1
      }
    }

    const qualitySummary = `excellent=${qualityCounts.excellent}, good=${qualityCounts.good}, average=${qualityCounts.average}, bad=${qualityCounts.bad}`

    const characterSnippet = character
      ? `The reader's story avatar is:\nName: ${character.name}\nAnime: ${character.anime}\nArchetype: ${character.archetype}\nRole: ${character.role}\nDescription: ${character.description}\nStrengths: ${character.strengths.join(", ")}\nWeaknesses: ${character.weaknesses.join(", ")}\nPreferred genres: ${character.preferredGenres.join(", ")}`
      : "No explicit avatar was provided; infer from traits."

    const previousContentSnippet = previousContent
      ? `Previous story content (what has already happened):\n${previousContent}`
      : "This is the beginning of the story."

    const lastChoiceSnippet = lastChoice
      ? `The reader just chose option '${lastChoice.text}' (id: ${lastChoice.id}). Evaluate how strong or risky this decision was and adjust the narrative accordingly.`
      : "The reader has not made any choices yet (this is the opening)."

    const { object } = await generateObject({
      // model: google("gemini-pro"),
      model: google("gemini-2.5-pro"),
      schema: StoryTurnSchema,
      prompt: `You are an interactive story engine for a ${genre.name.toLowerCase()} narrative.

Personality traits (0-100): ${traitDescriptions || "balanced and adaptable"}
${characterSnippet}

Choice history so far: ${historyDescription || "no previous choices yet"}

${previousContentSnippet}

${lastChoiceSnippet}

${isMultiplayer 
  ? `IMPORTANT: Write the story in SECOND PERSON (using "you", "your", "you're", etc.). The reader is the main character. Examples: "You find yourself in a dark forest...", "You notice something strange...", "Your heart races as you...". Never use first person (I, me, my) or third person (he, she, they) - always use second person.`
  : `Continue the story using the avatar as the main character.`}

Language and style:
- Use only simple, clear English that anyone can understand.
- Avoid fancy, rare, or poetic words. Prefer everyday vocabulary.
- Use short, direct sentences (around 10–15 words each).
- Keep the tone engaging and easy to follow.

Story length and pacing rules:
- The entire story must finish in at most 20 chapters/turns.
- You are now writing chapter number ${chaptersSoFar + 1}.
- There are ${chaptersRemaining} chapters left before the hard limit of ${maxChapters}.
- If there are no chapters left, or the story is near a natural ending, you MUST set isStoryComplete = true and write a clear ending.

Moral tone and endings:
- Choice quality summary so far: ${qualitySummary}.
- If the reader has made many "bad" choices compared to "good" or "excellent" ones, you should lean toward a darker or negative outcome when the story ends.
- Do NOT magically turn a long sequence of bad choices into a sweet or perfect ending; consequences should feel real and fair.
- Good or excellent choices over time can still lead to hopeful or heroic endings.

About this step's content:
- Use 2-4 short paragraphs for this step.
- Early chapters should open the world and set up tension.
- Later risky or climactic choices should push toward a satisfying conclusion that respects the rules above.

About choices:
- After the new story content, imagine 2-4 meaningful next decisions the avatar could take.
- Write each choice in simple English, with one clear action.
- These choices must significantly shape the future tone, risk, or direction of the story.
- Do NOT include the choices in the story text itself; only list them in the JSON "choices" field.

About evaluating the last choice (if there was one):
- If lastChoice is provided, classify it as one of: excellent, good, average, bad.
- excellent: especially aligned with the avatar's strengths and leads to very positive or heroic outcomes.
- good: generally wise or kind, aligning with their better traits.
- average: neutral, safe, or mixed consequences.
- bad: reckless, unethical, or clearly harmful for the character or others.
- Provide a short message explaining why in "lastChoiceEvaluation.message".
- If there was no previous choice, you may omit lastChoiceEvaluation.

Return ONLY a JSON object matching the provided schema (no extra commentary, no markdown).`,
    })

    const turn = StoryTurnSchema.parse(object)

    const choices: StoryChoice[] = turn.choices.map((c) => ({
      id: c.id,
      text: c.text,
    }))

    return NextResponse.json({
      content: turn.content,
      choices,
      isStoryComplete: turn.isStoryComplete,
      lastChoiceEvaluation: turn.lastChoiceEvaluation,
    })
  } catch (error) {
    console.error("Story generation error:", error)
    return NextResponse.json({ error: "Failed to generate story" }, { status: 500 })
  }
}

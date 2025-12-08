import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { generateObject } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
})

const CharacterSchema = z.object({
  // Full character name, e.g. "Naruto Uzumaki"
  name: z.string(),
  // Anime series title, e.g. "Naruto", "Attack on Titan"
  anime: z.string(),
  archetype: z.string(),
  role: z.string(),
  description: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  preferredGenres: z.array(z.string()),
})

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json(
        { error: "GOOGLE_GENERATIVE_AI_API_KEY is not configured" },
        { status: 500 },
      )
    }

    const { scores, topTraits, summary } = await request.json()

    const traitsDescription = Object.entries(scores || {})
      .map(([trait, value]) => `${trait}: ${value}`)
      .join(", ")

    const { object } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: CharacterSchema,
      prompt: `You are an expert character designer for interactive fiction.

The user has completed a personality assessment with the following information:
- Trait scores (0-100): ${traitsDescription}
- Top traits: ${(topTraits || []).join(", ")}
- Personality summary: ${summary}

Your task:
- Choose ONE existing character from the anime world whose personality, strengths, and weaknesses best match this user.
- This must be a real character from a published anime series only (for example: "Naruto Uzumaki" from "Naruto", "Levi Ackerman" from "Attack on Titan", "Luffy" from "One Piece", "Light Yagami" from "Death Note", etc.).
- The character can be a hero, villain, or morally grey, but must be clearly grounded in the user's traits.
- Do NOT invent a new character or anime. Always pick a real anime character.

Return a concise JSON object describing ONLY these fields:
- name: the character's full name only (no anime name in this field).
- anime: the anime series title this character is from.
- archetype: a short phrase like "Thoughtful Strategist" or "Chaotic Explorer" that fits this anime character as matched to the user's traits.
- role: how they typically appear in stories (e.g. "reluctant hero", "cunning mentor").
- description: 3-5 sentences summarizing why this specific anime character is a good match for the user's personality, style, and vibe.
- strengths: 3-6 short bullet-style strengths drawn from that character's canonical behavior.
- weaknesses: 3-6 short bullet-style flaws or vulnerabilities drawn from that character's canonical behavior.
- preferredGenres: 3-5 genres from ["fantasy","scifi","mystery","romance","adventure"] that best fit this character's typical stories.

Be vivid and specific, and strictly limit yourself to real anime characters and series only. Do not include any extra fields beyond the schema.`,
    })

    return NextResponse.json({ character: object })
  } catch (error) {
    console.error("Character generation error:", error)
    return NextResponse.json({ error: "Failed to generate character" }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { generateObject } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
})

const CharacterSchema = z.object({
  name: z.string(),
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
      model: google("gemini-2.5-pro"),
      schema: CharacterSchema,
      prompt: `You are an expert character designer for interactive fiction.

The user has completed a personality assessment with the following information:
- Trait scores (0-100): ${traitsDescription}
- Top traits: ${(topTraits || []).join(", ")}
- Personality summary: ${summary}

Based on this, design a single original fictional character that would strongly resonate with this user as their in-story avatar.

Return a concise JSON object describing:
- name: a distinctive but readable character name
- archetype: a short phrase like "Thoughtful Strategist" or "Chaotic Explorer"
- role: how they typically appear in stories (e.g. "reluctant hero", "cunning mentor")
- description: 3-5 sentences summarizing their personality, style, and vibe
- strengths: 3-6 short bullet-style strengths
- weaknesses: 3-6 short bullet-style flaws or vulnerabilities
- preferredGenres: 3-5 genres from ["fantasy","scifi","mystery","romance","adventure"] that best fit this character

Be vivid and specific but do not include any extra fields beyond the schema.`,
    })

    return NextResponse.json({ character: object })
  } catch (error) {
    console.error("Character generation error:", error)
    return NextResponse.json({ error: "Failed to generate character" }, { status: 500 })
  }
}

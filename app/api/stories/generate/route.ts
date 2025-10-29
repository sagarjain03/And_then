import { generateDemoStory } from "@/lib/story-templates"
import { getGenreById } from "@/lib/story-data"

export async function POST(request: Request) {
  try {
    const { genreId, personalityTraits, previousContent } = await request.json()

    const genre = getGenreById(genreId)
    if (!genre) {
      return Response.json({ error: "Invalid genre" }, { status: 400 })
    }

    const result = generateDemoStory(genreId, personalityTraits, previousContent)

    return Response.json(result)
  } catch (error) {
    console.error("Story generation error:", error)
    return Response.json({ error: "Failed to generate story" }, { status: 500 })
  }
}

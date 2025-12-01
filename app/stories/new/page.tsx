"use client"

import React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { STORY_GENRES } from "@/lib/story-data"
import type { PersonalityResult } from "@/lib/personality-data"
import { BookOpen, Loader2 } from "lucide-react"

export default function NewStoryPage() {
  const router = useRouter()
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [personalityResult, setPersonalityResult] = useState<PersonalityResult | null>(null)

  // Load personality result from MongoDB
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/personality")
        if (!res.ok) return
        const data = (await res.json()) as { result: PersonalityResult | null }
        if (data.result) {
          setPersonalityResult(data.result)
        }
      } catch (err) {
        console.error("Failed to load personality for story generation", err)
      }
    }

    void load()
  }, [])

  const handleGenerateStory = async () => {
    if (!selectedGenre || !personalityResult) return

    setIsGenerating(true)
    try {
      const response = await fetch("/api/stories/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          genreId: selectedGenre,
          personalityTraits: personalityResult.scores,
          character: personalityResult.character,
        }),
      })

      if (!response.ok) throw new Error("Failed to generate story")

      const data = await response.json()

      const storyPayload = {
        title: `${STORY_GENRES.find((g) => g.id === selectedGenre)?.name} Adventure`,
        genre: selectedGenre,
        content: data.content,
        choices: data.choices,
        currentChoiceIndex: 0,
        personalityTraits: personalityResult.scores,
        character: personalityResult.character,
        isStoryComplete: data.isStoryComplete ?? false,
        choiceHistory: [],
      }

      // Persist initial story state to MongoDB and redirect to play view for that story
      const saveRes = await fetch("/api/stories/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ story: storyPayload }),
      })

      if (!saveRes.ok) throw new Error("Failed to save story")

      const saved = await saveRes.json()
      const storyId = saved.story?._id || saved.story?.id
      if (!storyId) throw new Error("Story ID missing from save response")

      router.push(`/stories/play/${storyId}`)
    } catch (error) {
      console.error("Error generating story:", error)
      alert("Failed to generate story. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  if (!personalityResult) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md border-border">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <p className="text-muted-foreground">Please complete your personality test first.</p>
            <Link href="/test">
              <Button className="w-full">Take Personality Test</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Choose Your Story Genre</h1>
          <p className="text-lg text-muted-foreground">
            Select a genre and we'll generate a personalized story tailored to your personality
          </p>
        </div>

        {/* Genre Selection */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {STORY_GENRES.map((genre) => (
            <button
              key={genre.id}
              onClick={() => setSelectedGenre(genre.id)}
              className={`text-left transition-all ${
                selectedGenre === genre.id ? "ring-2 ring-primary scale-105" : "hover:border-primary/50"
              }`}
            >
              <Card className="border-border h-full cursor-pointer">
                <CardContent className="pt-6">
                  <div className="text-4xl mb-4">{genre.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{genre.name}</h3>
                  <p className="text-sm text-muted-foreground">{genre.description}</p>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Link href="/dashboard">
            <Button variant="outline" className="bg-transparent">
              Back to Dashboard
            </Button>
          </Link>
          <Button onClick={handleGenerateStory} disabled={!selectedGenre || isGenerating} size="lg">
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Story...
              </>
            ) : (
              "Generate Story"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { type Story, STORY_GENRES } from "@/lib/story-data"
import { BookOpen, ChevronLeft, Loader2, Volume2 } from "lucide-react"

export default function StoryPlayPage() {
  const router = useRouter()
  const [story, setStory] = useState<Story | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGeneratingNext, setIsGeneratingNext] = useState(false)
  const [displayedContent, setDisplayedContent] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [choiceFeedback, setChoiceFeedback] = useState<
    | {
        quality: "excellent" | "good" | "average" | "bad"
        message: string
      }
    | null
  >(null)

  useEffect(() => {
    const stored = localStorage.getItem("currentStory")
    if (stored) {
      const loadedStory = JSON.parse(stored)
      setStory(loadedStory)
      setDisplayedContent(loadedStory.content)
    }
    setIsLoading(false)
  }, [])

  // Typewriter effect
  useEffect(() => {
    if (!story || displayedContent === story.content) return

    setIsTyping(true)
    let index = 0
    const interval = setInterval(() => {
      index++
      setDisplayedContent(story.content.substring(0, index))
      if (index >= story.content.length) {
        clearInterval(interval)
        setIsTyping(false)
      }
    }, 20)

    return () => clearInterval(interval)
  }, [story]) // Updated dependency to story

  // Auto-hide choice feedback after a short delay
  useEffect(() => {
    if (!choiceFeedback) return
    const timeout = setTimeout(() => setChoiceFeedback(null), 3000)
    return () => clearTimeout(timeout)
  }, [choiceFeedback])

  const handleChoice = async (choiceIndex: number) => {
    if (!story) return

    const selectedChoice = story.choices[choiceIndex]

    setIsGeneratingNext(true)
    try {
      const response = await fetch("/api/stories/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          genreId: story.genre,
          personalityTraits: story.personalityTraits,
          character: story.character,
          previousContent: story.content,
          lastChoice: {
            id: selectedChoice.id,
            text: selectedChoice.text,
          },
          choiceHistory: story.choiceHistory ?? [],
        }),
      })

      if (!response.ok) throw new Error("Failed to generate next part")

      const data = await response.json()

      const updatedStory: Story = {
        ...story,
        content: data.content,
        choices: data.choices,
        currentChoiceIndex: story.currentChoiceIndex + 1,
        isStoryComplete: data.isStoryComplete ?? story.isStoryComplete,
        choiceHistory: [
          ...(story.choiceHistory ?? []),
          {
            segmentIndex: story.currentChoiceIndex,
            choiceId: selectedChoice.id,
            quality: data.lastChoiceEvaluation?.quality,
          },
        ],
      }

      setStory(updatedStory)
      setDisplayedContent("")
      localStorage.setItem("currentStory", JSON.stringify(updatedStory))

      if (data.lastChoiceEvaluation) {
        setChoiceFeedback(data.lastChoiceEvaluation)
      }
    } catch (error) {
      console.error("Error generating next part:", error)
      alert("Failed to continue story. Please try again.")
    } finally {
      setIsGeneratingNext(false)
    }
  }

  const handleSaveStory = async () => {
    if (!story) return

    try {
      const res = await fetch("/api/stories/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ story }),
      })

      if (!res.ok) {
        alert("Failed to save story")
        return
      }

      alert("Story saved!")
    } catch (err) {
      console.error("Save story error", err)
      alert("Failed to save story")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading your story...</p>
        </div>
      </div>
    )
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md border-border">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <p className="text-muted-foreground">No story found. Generate a new story to begin.</p>
            <Link href="/stories/new">
              <Button className="w-full">Create New Story</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const genre = STORY_GENRES.find((g) => g.id === story.genre)

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="text-center flex-1">
            <div className="text-2xl mb-2">{genre?.icon}</div>
            <h1 className="text-2xl font-bold">{story.title}</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSaveStory}>
            Save Story
          </Button>
        </div>

        {/* Story Content */}
        <Card className="border-border mb-8 bg-card/50">
          <CardContent className="pt-8 pb-8">
            <div className="prose prose-invert max-w-none">
              <p className="text-lg leading-relaxed text-foreground whitespace-pre-wrap mb-4">{displayedContent}</p>
              {isTyping && <span className="animate-pulse">▌</span>}
            </div>
          </CardContent>
        </Card>

        {/* Choices */}
        {!isTyping && (
          <div className="space-y-4 mb-8">
            <p className="text-sm text-muted-foreground font-medium">What do you do?</p>
            {story.choices.map((choice, index) => (
              <button
                key={choice.id}
                onClick={() => handleChoice(index)}
                disabled={isGeneratingNext}
                className="w-full text-left transition-all hover:scale-102"
              >
                <Card className="border-border hover:border-primary/50 cursor-pointer">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-sm font-bold text-primary">
                        {index + 1}
                      </div>
                      <p className="text-foreground">{choice.text}</p>
                    </div>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        )}

        {/* Loading State */}
        {isGeneratingNext && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-primary mx-auto mb-4 animate-spin" />
              <p className="text-muted-foreground">Continuing your story...</p>
            </div>
          </div>
        )}

        {/* Story Stats */}
        <Card className="border-border bg-card/50 mb-4">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Chapter {story.currentChoiceIndex + 1}</span>
              <span>Genre: {genre?.name}</span>
              <span className="flex items-center gap-1">
                <Volume2 className="w-4 h-4" />
                Interactive Story
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Choice Feedback Popup */}
        {choiceFeedback && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <div
              className={`px-6 py-3 rounded-full shadow-lg border text-sm font-medium bg-card/95 backdrop-blur-xl ${
                choiceFeedback.quality === "excellent"
                  ? "border-emerald-400 text-emerald-200"
                  : choiceFeedback.quality === "good"
                  ? "border-sky-400 text-sky-200"
                  : choiceFeedback.quality === "average"
                  ? "border-zinc-500 text-zinc-200"
                  : "border-red-500 text-red-200"
              }`}
            >
              {choiceFeedback.message}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

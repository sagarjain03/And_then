"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { type Story, STORY_GENRES } from "@/lib/story-data"
import { BookOpen, CheckCircle2, ArrowRight } from "lucide-react"

interface ProfileResponse {
  id?: string
}

export default function StoryCompletePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const storyId = params?.id

  const [story, setStory] = useState<Story | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (!storyId) {
        setIsLoading(false)
        return
      }

      try {
        const [storyRes, profileRes] = await Promise.all([
          fetch(`/api/stories/${storyId}`),
          fetch("/api/auth/profile"),
        ])

        if (storyRes.ok) {
          const data = await storyRes.json()
          setStory(data.story as Story)
        }

        if (profileRes.ok) {
          const profile = (await profileRes.json()) as ProfileResponse
          if (profile.id) setUserId(profile.id)
        }
      } catch (err) {
        console.error("Failed to load completion data", err)
      } finally {
        setIsLoading(false)
      }
    }

    void load()
  }, [storyId])

  const handleGoToDashboard = () => {
    if (userId) {
      router.push(`/dashboard/${userId}`)
    } else {
      router.push("/dashboard")
    }
  }

  const handleDownloadPdf = () => {
    // Use the browser's print dialog so the user can "Save as PDF".
    if (typeof window !== "undefined") {
      window.print()
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Wrapping up your adventure...</p>
        </div>
      </div>
    )
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md border-border">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <p className="text-muted-foreground">We could not find this story. Try creating a new one.</p>
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
    <div className="min-h-screen bg-background py-10 px-4 print:bg-white">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Thank you card */}
        <Card className="border-border bg-card/60 shadow-lg print:shadow-none">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
            <h1 className="text-3xl font-bold">Story complete!</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Thanks for playing. Your choices shaped this ending. You can start a fresh
              adventure or go back to your dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
              <Button onClick={handleGoToDashboard} className="gap-2">
                Go to dashboard
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Link href="/stories/new">
                <Button variant="outline" className="w-full sm:w-auto">
                  Create another story
                </Button>
              </Link>
              <Button variant="secondary" className="w-full sm:w-auto" onClick={handleDownloadPdf}>
                Download story as PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Printable story content */}
        <Card className="border-border bg-card/70 print:bg-white print:text-black">
          <CardContent className="pt-8 pb-8 space-y-4">
            <div className="text-center mb-4">
              <p className="text-sm text-muted-foreground mb-1 print:text-gray-500">
                {genre ? `${genre.name} story` : "Interactive story"}
              </p>
              <h2 className="text-2xl font-bold mb-1">{story.title}</h2>
            </div>
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {story.content}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

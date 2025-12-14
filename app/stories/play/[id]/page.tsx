"use client"

import { useEffect, useState, useRef, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { type Story, STORY_GENRES } from "@/lib/story-data"
import { BookLayout } from "@/components/book-layout"
import { BOOK_THEMES, DEFAULT_THEME } from "@/lib/book-themes"
import { ChevronLeft, Loader2, Volume2, Save, X } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// Map each story genre to audio track.
// Background images are now handled by the BookLayout themes.
const GENRE_AUDIO: Record<string, string> = {
  fantasy: "/audio/fantasy.mpeg",
  scifi: "/audio/scifi.mpeg",
  mystery: "/audio/mystery.mpeg",
  romance: "/audio/romantic.mpeg",
  adventure: "/audio/adventure.mpeg",
}

export default function StoryPlayPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const storyId = params?.id

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
  const [isMusicEnabled, setIsMusicEnabled] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isSpeaking, setIsSpeaking] = useState(false)

  // Get current theme based on story genre
  const theme = useMemo(() => {
    if (!story) return DEFAULT_THEME
    return BOOK_THEMES[story.genre] || DEFAULT_THEME
  }, [story])

  useEffect(() => {
    const loadStory = async () => {
      if (!storyId) {
        setIsLoading(false)
        return
      }

      try {
        const res = await fetch(`/api/stories/${storyId}`)
        if (!res.ok) {
          console.error("Failed to load story", await res.text())
          setIsLoading(false)
          return
        }
        const data = await res.json()
        const loadedStory = data.story as Story
        // Initialize fullStoryContent if it doesn't exist (for older stories)
        if (!loadedStory.fullStoryContent && loadedStory.content) {
          loadedStory.fullStoryContent = [
            {
              chapterIndex: 0,
              content: loadedStory.content,
              choices: loadedStory.choices || [],
            },
          ]
        }
        setStory(loadedStory as any)
        setDisplayedContent(loadedStory.content)
      } catch (err) {
        console.error("Error loading story:", err)
      } finally {
        setIsLoading(false)
      }
    }

    void loadStory()
  }, [storyId])

  // Background music effect
  useEffect(() => {
    if (!story) return

    const audioSrc = GENRE_AUDIO[story.genre]
    if (!audioSrc) return

    // Clean up any previous audio instance
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    const audio = new Audio(audioSrc)
    audio.loop = true
    audio.volume = 0.35
    audioRef.current = audio

    if (isMusicEnabled) {
      void audio.play().catch((err) => {
        console.warn("Autoplay music blocked or failed", err)
      })
    }

    return () => {
      audio.pause()
      audioRef.current = null
    }
  }, [story, isMusicEnabled])

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
  }, [story])

  // Auto-hide choice feedback after a short delay
  useEffect(() => {
    if (!choiceFeedback) return
    const timeout = setTimeout(() => setChoiceFeedback(null), 3000)
    return () => clearTimeout(timeout)
  }, [choiceFeedback])

  const handleStopSpeaking = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }

  const handleStartSpeaking = () => {
    if (!story) return
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.error("Text-to-speech is not supported in this browser.")
      return
    }

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(story.content)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    setIsSpeaking(true)
    window.speechSynthesis.speak(utterance)
  }

  const handleChoice = async (choiceIndex: number) => {
    if (!story || !storyId) return
    
    // Prevent making choices if story is already complete
    if (story.isStoryComplete) {
      router.push(`/stories/complete/${storyId}`)
      return
    }

    const selectedChoice = story.choices[choiceIndex]
    
    // Check if we've reached the chapter limit for single player stories
    const chaptersSoFar = (story.choiceHistory ?? []).length
    if (!story.isMultiplayer && chaptersSoFar >= 9) {
      // We're at chapter 10, force completion on next generation
      toast.info("This is the final chapter of your story!")
    }

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

      if (!response.ok) {
        const errorText = await response.text()
        console.error("API Error:", response.status, errorText)
        throw new Error(`Failed to generate next part: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      
      // Check if story should be forced to complete (reached 10 chapters)
      const chaptersSoFar = (story.choiceHistory ?? []).length
      if (!story.isMultiplayer && chaptersSoFar >= 9) {
        // Force completion at chapter 10
        data.isStoryComplete = true
      }

      // Accumulate full story content
      const currentChapter = {
        chapterIndex: story.currentChoiceIndex,
        content: story.content,
        choices: story.choices,
        selectedChoice: {
          id: selectedChoice.id,
          text: selectedChoice.text,
        },
      }

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
        fullStoryContent: [
          ...(story.fullStoryContent ?? []),
          currentChapter,
        ],
      }

      setStory(updatedStory)
      setDisplayedContent("")

      // Persist updated story state to MongoDB
      try {
        await fetch("/api/stories/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ story: { ...updatedStory, id: storyId } }),
        })
      } catch (err) {
        console.error("Failed to persist updated story", err)
      }

      if (data.lastChoiceEvaluation) {
        setChoiceFeedback(data.lastChoiceEvaluation)
      }

      if (updatedStory.isStoryComplete) {
        // Add final chapter to full story content
        const finalChapter = {
          chapterIndex: updatedStory.currentChoiceIndex,
          content: data.content,
          choices: data.choices,
        }
        updatedStory.fullStoryContent = [
          ...(updatedStory.fullStoryContent ?? []),
          finalChapter,
        ]

        // Save final story state
        try {
          await fetch("/api/stories/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ story: { ...updatedStory, id: storyId } }),
          })
        } catch (err) {
          console.error("Failed to save final story", err)
        }

        setTimeout(() => {
          router.push(`/stories/complete/${storyId}`)
        }, 1500)
      }
    } catch (error) {
      console.error("Error generating next part:", error)
      toast.error("Failed to continue story. Please try again.")
    } finally {
      setIsGeneratingNext(false)
    }
  }

  const handleSaveStory = async () => {
    if (!story || !storyId) return

    try {
      const res = await fetch("/api/stories/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ story: { ...story, id: storyId } }),
      })

      if (!res.ok) {
        toast.error("Failed to save story")
        return
      }

      toast.success("Story saved!")
    } catch (err) {
      console.error("Save story error", err)
      toast.error("Failed to save story")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#2a1a10] bg-[url('/themes/fantasy/background.png')] bg-cover bg-center bg-no-repeat bg-blend-multiply flex items-center justify-center relative overflow-hidden">
        {/* Background Texture */}
        <div
          className="fixed inset-0 pointer-events-none opacity-20 z-0 bg-repeat"
          style={{
            backgroundImage: `url("https://www.transparenttextures.com/patterns/leather.png")`
          }}
        ></div>
        
        {/* Spotlights */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-[#d4af37]/10 to-transparent pointer-events-none z-0 blur-3xl"></div>
        
        <div className="text-center relative z-10">
          <Loader2 className="w-12 h-12 text-[#d4af37] mx-auto mb-4 animate-spin" />
          <p className="text-[#d4af37] font-serif italic text-lg">Opening your story...</p>
        </div>
      </div>
    )
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No story found.</p>
          <Link href="/stories/new">
            <Button>Create New Story</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <BookLayout
      genre={story.genre}
      currentPage={story.currentChoiceIndex}
      onPageTurn={() => { }} // Animation handled internally
      leftContent={
        <div className="flex flex-col h-full">
          {/* Header Controls */}
          <div className="flex items-center justify-between mb-6 border-b pb-4 border-black/10">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className={cn("hover:bg-black/5", theme.styles.text)}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            </Link>

            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const next = !isMusicEnabled
                  setIsMusicEnabled(next)
                  if (!next && audioRef.current) audioRef.current.pause()
                  else if (next && audioRef.current) void audioRef.current.play()
                }}
                className={cn("hover:bg-black/5", theme.styles.text)}
              >
                <Volume2 className={cn("w-4 h-4", !isMusicEnabled && "opacity-50")} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSaveStory}
                className={cn("hover:bg-black/5", theme.styles.text)}
              >
                <Save className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Story Title */}
          <h1 className={cn("text-2xl mb-6 text-center font-bold", theme.styles.heading)}>
            {story.title}
          </h1>

          {/* Story Content */}
          <div className="flex-1">
            <p className={cn("text-lg leading-relaxed whitespace-pre-wrap", theme.styles.text)}>
              {displayedContent}
              {isTyping && <span className="animate-pulse ml-1">|</span>}
            </p>
          </div>

          {/* Audio Controls */}
          <div className="flex justify-end mt-4 pt-4 border-t border-black/5">
            <Button
              variant="ghost"
              size="sm"
              disabled={isTyping}
              onClick={isSpeaking ? handleStopSpeaking : handleStartSpeaking}
              className={cn("text-xs opacity-70 hover:opacity-100 hover:bg-black/5", theme.styles.text)}
            >
              {isSpeaking ? "Stop reading" : "Listen to story"}
            </Button>
          </div>
        </div>
      }
      rightContent={
        <div className="flex flex-col h-full justify-center">
          {story.isStoryComplete ? (
            <div className="text-center space-y-4">
              <p className={cn("text-2xl font-bold mb-4", theme.styles.heading)}>
                Story Complete!
              </p>
              <p className={cn("text-sm opacity-70 mb-6", theme.styles.text)}>
                Your journey has reached its conclusion.
              </p>
              <Button
                onClick={() => router.push(`/stories/complete/${storyId}`)}
                className={cn("mt-4", theme.styles.choice)}
              >
                View Complete Story & Download PDF
              </Button>
            </div>
          ) : !isTyping && (
            <div className="space-y-6">
              <p className={cn("text-sm font-bold opacity-70 mb-4 uppercase tracking-widest text-center", theme.styles.text)}>
                What happens next?
              </p>

              {story.choices && story.choices.length > 0 ? (
                story.choices.map((choice, index) => (
                  <button
                    key={choice.id}
                    onClick={() => handleChoice(index)}
                    disabled={isGeneratingNext}
                    className={cn(
                      "w-full text-left p-6 rounded-lg border-2 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-md active:translate-y-0 group",
                      theme.styles.choice,
                      theme.styles.text
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <span className="font-bold opacity-50 text-xl group-hover:opacity-100 transition-opacity">{index + 1}.</span>
                      <span className="text-lg">{choice.text}</span>
                    </div>
                  </button>
                ))
              ) : (
                <p className={cn("text-sm opacity-70 text-center", theme.styles.text)}>
                  Loading choices...
                </p>
              )}
            </div>
          )}

          {/* Loading State Overlay (Right Page Only) */}
          {isGeneratingNext && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-r-lg">
              <div className="text-center">
                <Loader2 className={cn("w-8 h-8 animate-spin mx-auto mb-2", theme.styles.text)} />
                <p className={cn("text-sm font-medium", theme.styles.text)}>Writing next chapter...</p>
              </div>
            </div>
          )}

          {/* Feedback Toast (Centered on screen or right page) */}
          {choiceFeedback && (
            <div className="absolute bottom-8 left-0 right-0 flex justify-center z-20">
              <div className={cn(
                "px-4 py-2 pr-8 rounded-full text-sm font-bold shadow-lg animate-in fade-in slide-in-from-bottom-4 relative",
                choiceFeedback.quality === "excellent" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" :
                  choiceFeedback.quality === "good" ? "bg-sky-100 text-sky-800 border border-sky-200" :
                    choiceFeedback.quality === "average" ? "bg-amber-100 text-amber-800 border border-amber-200" :
                      "bg-red-100 text-red-800 border border-red-200"
              )}>
                {choiceFeedback.message}
                <button
                  onClick={() => setChoiceFeedback(null)}
                  className="absolute top-1/2 right-2 -translate-y-1/2 p-1 rounded-full hover:bg-black/10 transition-colors"
                  aria-label="Dismiss feedback"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      }
    />
  )
}

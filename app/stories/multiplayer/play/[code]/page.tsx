"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { BookLayout } from "@/components/book-layout"
import { BOOK_THEMES, DEFAULT_THEME } from "@/lib/book-themes"
import { type Story, STORY_GENRES } from "@/lib/story-data"
import { NeonButton } from "@/components/ui/neon-button"
import { ChevronLeft, Loader2, Volume2, Users, Play, Save } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const GENRE_AUDIO: Record<string, string> = {
  fantasy: "/audio/fantasy.mpeg",
  scifi: "/audio/scifi.mpeg",
  mystery: "/audio/mystery.mpeg",
  romance: "/audio/romantic.mpeg",
  adventure: "/audio/adventure.mpeg",
}

interface RoomData {
  roomCode: string
  status: "waiting" | "voting-genre" | "playing" | "completed"
  hostId: string
  participants: Array<{ _id: string; username: string; email: string }>
  choiceVotes: Record<string, string[]>
  currentChoiceIndex: number
  storyId: string | null
}

export default function MultiplayerStoryPlayPage() {
  const router = useRouter()
  const params = useParams<{ code: string }>()
  const roomCode = params?.code as string

  const [story, setStory] = useState<Story | null>(null)
  const [room, setRoom] = useState<RoomData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isVoting, setIsVoting] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [displayedContent, setDisplayedContent] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isHost, setIsHost] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isMusicEnabled, setIsMusicEnabled] = useState(true)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [choiceFeedback, setChoiceFeedback] = useState<{
    quality: "excellent" | "good" | "average" | "bad"
    message: string
  } | null>(null)
  const [tiedChoices, setTiedChoices] = useState<string[]>([])
  const autoProcessRef = useRef(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const previousChoiceIndexRef = useRef<number>(-1)

  const theme = story ? (BOOK_THEMES[story.genre] || DEFAULT_THEME) : DEFAULT_THEME

  useEffect(() => {
    const getUserId = async () => {
      try {
        const res = await fetch("/api/auth/profile")
        if (res.ok) {
          const data = await res.json()
          setCurrentUserId(data.id || null)
        }
      } catch (error) {
        console.error("Failed to get user ID:", error)
      }
    }
    void getUserId()
  }, [])

  const fetchRoom = async () => {
    try {
      const res = await fetch(`/api/multiplayer/rooms/${roomCode}`)
      if (!res.ok) {
        setIsLoading(false)
        return
      }

      const data = await res.json()
      const roomData = data.room as RoomData
      setRoom(roomData)

      if (roomData.hostId && currentUserId) {
        const hostIdString = typeof roomData.hostId === "string" ? roomData.hostId : roomData.hostId._id?.toString() || roomData.hostId.toString()
        setIsHost(hostIdString === currentUserId)
      }

      // If story is complete, redirect
      if (roomData.status === "completed") {
        router.push(`/stories/complete/${roomData.storyId}`)
        return
      }

      // If story ID exists and status is playing, fetch/update story
      if (roomData.storyId && roomData.status === "playing") {
        try {
          const storyRes = await fetch(`/api/stories/${roomData.storyId}`)
          if (storyRes.ok) {
            const storyData = await storyRes.json()
            const loadedStory = storyData.story as Story
            
            if (loadedStory) {
              // Only reset displayed content when we move to a new page (currentChoiceIndex changes)
              // This keeps the content visible during voting until the story progresses
              const hasPageChanged = previousChoiceIndexRef.current !== -1 && 
                                     previousChoiceIndexRef.current !== loadedStory.currentChoiceIndex
              
              if (hasPageChanged) {
                // New page - reset for typewriter effect
                setDisplayedContent("")
              } else if (previousChoiceIndexRef.current === -1) {
                // Initial load - reset for typewriter effect
                setDisplayedContent("")
              }
              // If same page, keep displayedContent as is (don't reset)
              
              previousChoiceIndexRef.current = loadedStory.currentChoiceIndex
              setStory(loadedStory)
              setIsLoading(false)
            } else {
              setIsLoading(false)
            }
          } else {
            // If story fetch fails, log error and set loading to false
            const errorData = await storyRes.json().catch(() => ({}))
            console.error("Failed to fetch story:", errorData)
            setIsLoading(false)
          }
        } catch (error) {
          console.error("Error fetching story:", error)
          setIsLoading(false)
        }
      } else if (roomData.status !== "playing") {
        // If room is not in playing state, stop loading
        setIsLoading(false)
      } else {
        // Room is in playing state but no storyId yet, keep loading
        // This shouldn't happen, but handle it gracefully
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Error fetching room:", error)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!roomCode) return

    void fetchRoom()

    // Poll for updates every 2 seconds
    pollIntervalRef.current = setInterval(() => {
      void fetchRoom()
    }, 2000)

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [roomCode, router, currentUserId])

  // Typewriter effect - matches single player behavior
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
  }, [story?.content]) // Only depend on story content, not the whole story object

  // Background music
  useEffect(() => {
    if (!story) return

    const audioSrc = GENRE_AUDIO[story.genre]
    if (!audioSrc) return

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    const audio = new Audio(audioSrc)
    audio.loop = true
    audio.volume = 0.35
    audioRef.current = audio

    if (isMusicEnabled) {
      void audio.play().catch(() => {})
    }

    return () => {
      audio.pause()
      audioRef.current = null
    }
  }, [story, isMusicEnabled])

  const handleVoteChoice = async (choiceId: string) => {
    if (!roomCode || isVoting) return

    setIsVoting(true)
    try {
      const res = await fetch(`/api/multiplayer/rooms/${roomCode}/vote-choice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choiceId }),
      })

      if (!res.ok) {
        const error = await res.json()
        toast.error(error.error || "Failed to vote")
        return
      }

      toast.success("Vote recorded!")
      void fetchRoom()
    } catch (error) {
      console.error("Error voting:", error)
      toast.error("Failed to vote")
    } finally {
      setIsVoting(false)
    }
  }

  const handleProcessChoice = useCallback(async (selectedChoiceId?: string) => {
    if (!roomCode || isProcessing || !isHost || !room?.storyId) return

    setIsProcessing(true)
    try {
      const res = await fetch(`/api/multiplayer/rooms/${roomCode}/process-choice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedChoiceId ? { selectedChoiceId } : {}),
      })

      if (!res.ok) {
        const error = await res.json()
        toast.error(error.error || "Failed to process choice")
        autoProcessRef.current = false
        setIsProcessing(false)
        return
      }

      const data = await res.json()
      
      // Show AI review feedback if available
      if (data.lastChoiceEvaluation) {
        setChoiceFeedback(data.lastChoiceEvaluation)
      }

      // Check if there's a tie that needs host decision
      if (data.hasTie && data.tiedChoices) {
        setTiedChoices(data.tiedChoices)
        autoProcessRef.current = false
        setIsProcessing(false)
        return // Don't continue processing if there's a tie
      }
      
      // Clear tied choices if processing succeeded
      setTiedChoices([])
      
      // Fetch the updated story from the database to ensure consistency
      // This ensures all participants see the same story
      const storyRes = await fetch(`/api/stories/${room.storyId}`)
      if (storyRes.ok) {
        const storyData = await storyRes.json()
        const updatedStory = storyData.story as Story
        
        if (updatedStory) {
          // Update ref to track the new page
          previousChoiceIndexRef.current = updatedStory.currentChoiceIndex
          setStory(updatedStory)
          // Reset displayed content for typewriter effect (new page)
          setDisplayedContent("")
        }
      } else {
        // Fallback to response data if fetch fails
        if (story) {
          const updatedStory: Story = {
            ...story,
            content: data.story.content,
            choices: data.story.choices,
            currentChoiceIndex: data.story.currentChoiceIndex,
            isStoryComplete: data.story.isStoryComplete,
          }
          // Update ref to track the new page
          previousChoiceIndexRef.current = updatedStory.currentChoiceIndex
          setStory(updatedStory)
          // Reset displayed content for typewriter effect (new page)
          setDisplayedContent("")
        }
      }

      // Update room state
      void fetchRoom()
      autoProcessRef.current = false

      if (data.story.isStoryComplete) {
        setTimeout(() => {
          router.push(`/stories/complete/${room.storyId}`)
        }, 1500)
      }
    } catch (error) {
      console.error("Error processing choice:", error)
      toast.error("Failed to process choice")
      autoProcessRef.current = false
    } finally {
      setIsProcessing(false)
    }
  }, [roomCode, isProcessing, isHost, room?.storyId, story, router])

  // Calculate derived values (these are safe to compute even if room/story are null)
  const userVote = room?.choiceVotes
    ? Object.entries(room.choiceVotes).find(([, userIds]) =>
        userIds.includes(currentUserId || ""),
      )?.[0]
    : null

  // Check if all participants have voted
  const totalVotes = room?.choiceVotes
    ? Object.values(room.choiceVotes).reduce((sum, votes) => sum + votes.length, 0)
    : 0
  const allVoted = room && room.participants.length > 0 && totalVotes >= room.participants.length

  // Calculate vote counts and check for ties
  const voteCounts = story?.choices.map((choice) => {
    const votes = room?.choiceVotes[choice.id] || []
    return { choiceId: choice.id, votes: votes.length }
  }) || []
  const maxVotes = voteCounts.length > 0 ? Math.max(...voteCounts.map((v) => v.votes), 0) : 0
  const tiedChoicesList = voteCounts
    .filter((v) => v.votes === maxVotes && v.votes > 0)
    .map((v) => v.choiceId)
  const hasTie = tiedChoicesList.length > 1 && allVoted

  // Update tiedChoices state when room data changes
  useEffect(() => {
    if (hasTie && tiedChoicesList.length > 0) {
      setTiedChoices(tiedChoicesList)
    } else if (!hasTie) {
      setTiedChoices([])
    }
  }, [hasTie, tiedChoicesList.join(",")])

  // Auto-proceed when all voted and no tie (only once)
  useEffect(() => {
    if (allVoted && !hasTie && !isProcessing && !autoProcessRef.current && isHost && tiedChoices.length === 0 && room && story) {
      autoProcessRef.current = true
      // Small delay to ensure UI updates
      const timer = setTimeout(() => {
        void handleProcessChoice()
      }, 500)
      return () => clearTimeout(timer)
    } else if (!allVoted) {
      autoProcessRef.current = false
    }
  }, [allVoted, hasTie, isProcessing, isHost, tiedChoices.length, handleProcessChoice, room, story])

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

  const handleSaveStory = async () => {
    if (!story || !room?.storyId) return

    try {
      const res = await fetch("/api/stories/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ story: { ...story, id: room.storyId } }),
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

  if (isLoading || !story || !room) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading story...</p>
        </div>
      </div>
    )
  }

  return (
    <BookLayout
      genre={story.genre}
      currentPage={story.currentChoiceIndex}
      onPageTurn={() => {}}
      leftContent={
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-6 border-b pb-4 border-black/10">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className={cn("hover:bg-black/5", theme.styles.text)}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            </Link>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-primary/10 border border-primary/30">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-xs font-display text-primary">
                  {room.participants.length} players
                </span>
              </div>
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

          <h1 className={cn("text-2xl mb-6 text-center font-bold", theme.styles.heading)}>
            {story.title}
          </h1>

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
          {!isTyping && (
            <div className="space-y-6">
              {!hasTie && (
                <p className={cn("text-sm font-bold opacity-70 mb-4 uppercase tracking-widest text-center", theme.styles.text)}>
                  Vote for what happens next
                </p>
              )}

              {!hasTie && story.choices.map((choice) => {
                const votes = room.choiceVotes[choice.id] || []
                const voteCount = votes.length
                const isUserVote = userVote === choice.id

                return (
                  <button
                    key={choice.id}
                    onClick={() => handleVoteChoice(choice.id)}
                    disabled={isVoting || isProcessing}
                    className={cn(
                      "w-full text-left p-6 rounded-lg border-2 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-md active:translate-y-0 group relative",
                      theme.styles.choice,
                      theme.styles.text,
                      isUserVote && "ring-2 ring-primary",
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <span className="font-bold opacity-50 text-xl group-hover:opacity-100 transition-opacity">
                        {story.choices.indexOf(choice) + 1}.
                      </span>
                      <span className="text-lg flex-1">{choice.text}</span>
                    </div>
                    {voteCount > 0 && (
                      <div className="mt-3 pt-3 border-t border-primary/20">
                        <div className="text-sm font-display text-primary">
                          {voteCount} {voteCount === 1 ? "vote" : "votes"}
                        </div>
                      </div>
                    )}
                    {isUserVote && (
                      <div className="absolute top-2 right-2 text-xs text-primary uppercase tracking-wider">
                        Your Vote
                      </div>
                    )}
                  </button>
                )
              })}

              {/* Tie-breaker UI (Host only, when there's a tie) */}
              {isHost && hasTie && tiedChoices.length > 0 && !isProcessing && (
                <div className="mt-8 space-y-4">
                  <p className={cn("text-sm font-bold opacity-70 mb-4 uppercase tracking-widest text-center", theme.styles.text)}>
                    Tie! Select the final choice
                  </p>
                  {tiedChoices.map((choiceId) => {
                    const choice = story.choices.find((c) => c.id === choiceId)
                    if (!choice) return null
                    const votes = room.choiceVotes[choice.id] || []
                    return (
                      <button
                        key={choiceId}
                        onClick={() => handleProcessChoice(choiceId)}
                        className={cn(
                          "w-full text-left p-6 rounded-lg border-2 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-md active:translate-y-0",
                          theme.styles.choice,
                          theme.styles.text,
                          "ring-2 ring-primary",
                        )}
                      >
                        <div className="flex items-start gap-4">
                          <span className="font-bold opacity-50 text-xl">
                            {story.choices.indexOf(choice) + 1}.
                          </span>
                          <span className="text-lg flex-1">{choice.text}</span>
                        </div>
                        <div className="mt-3 pt-3 border-t border-primary/20">
                          <div className="text-sm font-display text-primary">
                            {votes.length} {votes.length === 1 ? "vote" : "votes"}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Process Choice Button (Host only, when all voted and no tie) */}
              {isHost && allVoted && !hasTie && !isProcessing && tiedChoices.length === 0 && (
                <div className="mt-8">
                  <NeonButton
                    glowColor="violet"
                    onClick={() => handleProcessChoice()}
                    className="w-full"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Continue Story
                  </NeonButton>
                </div>
              )}

              {isHost && !allVoted && (
                <div className="mt-4 text-center">
                  <p className={cn("text-sm opacity-60", theme.styles.text)}>
                    Waiting for all players to vote...
                  </p>
                </div>
              )}
            </div>
          )}

          {isProcessing && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-r-lg">
              <div className="text-center">
                <Loader2 className={cn("w-8 h-8 animate-spin mx-auto mb-2", theme.styles.text)} />
                <p className={cn("text-sm font-medium", theme.styles.text)}>Processing choice...</p>
              </div>
            </div>
          )}

          {/* Feedback Toast (Centered on screen or right page) */}
          {choiceFeedback && (
            <div className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-none z-20">
              <div className={cn(
                "px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-in fade-in slide-in-from-bottom-4",
                choiceFeedback.quality === "excellent" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" :
                  choiceFeedback.quality === "good" ? "bg-sky-100 text-sky-800 border border-sky-200" :
                    choiceFeedback.quality === "average" ? "bg-amber-100 text-amber-800 border border-amber-200" :
                      "bg-red-100 text-red-800 border border-red-200"
              )}>
                {choiceFeedback.message}
              </div>
            </div>
          )}
        </div>
      }
    />
  )
}


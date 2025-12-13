"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { BookLayout } from "@/components/book-layout"
import { BOOK_THEMES, DEFAULT_THEME } from "@/lib/book-themes"
import { type Story } from "@/lib/story-data"
import { ChevronLeft, Loader2, Volume2, Users, Save, LogOut, X } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MultiplayerChat } from "@/components/multiplayer-chat"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const GENRE_AUDIO: Record<string, string> = {
  fantasy: "/audio/fantasy.mpeg",
  scifi: "/audio/scifi.mpeg",
  mystery: "/audio/mystery.mpeg",
  romance: "/audio/romantic.mpeg",
  adventure: "/audio/adventure.mpeg",
}

interface ChatMessage {
  userId: string
  username: string
  message: string
  timestamp: string | Date
}

interface RoomData {
  roomCode: string
  status: "waiting" | "voting-genre" | "playing" | "completed"
  hostId: string
  host?: {
    _id: string
    username: string
    email: string
  }
  hostActive?: boolean
  participants: Array<{ _id: string; username: string; email: string }>
  choiceVotes: Record<string, string[]>
  currentChoiceIndex: number
  storyId: string | null
  isProcessing?: boolean
  tiedChoicesForVoting?: string[]
  lastChoiceEvaluation?: {
    quality: "excellent" | "good" | "average" | "bad" | null
    message: string | null
  } | null
  messages?: ChatMessage[]
  newHostNotification?: {
    userId: string
    username: string
  } | null
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
  const [isTieBreakerVoting, setIsTieBreakerVoting] = useState(false)
  const [requiresHostSelection, setRequiresHostSelection] = useState(false)
  const [showHostTieModal, setShowHostTieModal] = useState(false)
  const autoProcessRef = useRef(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [isLeavingRoom, setIsLeavingRoom] = useState(false)
  const [isSavingAndExiting, setIsSavingAndExiting] = useState(false)
  const [showNewHostModal, setShowNewHostModal] = useState(false)
  const [newHostInfo, setNewHostInfo] = useState<{ userId: string; username: string } | null>(null)
  const [showHostTransferDialog, setShowHostTransferDialog] = useState(false)
  const [selectedNewHost, setSelectedNewHost] = useState<string>("")
  const [isTransferringHost, setIsTransferringHost] = useState(false)
  const previousChoiceIndexRef = useRef<number>(-1)
  const previousProcessingStateRef = useRef<boolean>(false)
  const lastSeenHostNotificationRef = useRef<string | null>(null)
  const dismissedFeedbackRef = useRef<string | null>(null)

  const theme = story ? BOOK_THEMES[story.genre] || DEFAULT_THEME : DEFAULT_THEME

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

  const fetchRoom = useCallback(async () => {
    try {
      const res = await fetch(`/api/multiplayer/rooms/${roomCode}`)
      if (!res.ok) {
        setIsLoading(false)
        return
      }

      const data = await res.json()
      const roomData = data.room as RoomData
      setRoom(roomData)

      const roomIsProcessing = roomData.isProcessing || false
      const wasProcessing = previousProcessingStateRef.current
      const processingJustCompleted = wasProcessing && !roomIsProcessing

      if (roomIsProcessing !== isProcessing) {
        setIsProcessing(roomIsProcessing)
      }

      previousProcessingStateRef.current = roomIsProcessing

      if (processingJustCompleted && roomData.storyId) {
        setIsProcessing(false)
      }

      if (
        roomData.lastChoiceEvaluation &&
        roomData.lastChoiceEvaluation.quality &&
        roomData.lastChoiceEvaluation.message
      ) {
        // Create a unique identifier for this feedback
        const feedbackId = `${roomData.lastChoiceEvaluation.quality}-${roomData.lastChoiceEvaluation.message}`
        
        // Only set feedback if it hasn't been manually dismissed
        if (dismissedFeedbackRef.current !== feedbackId) {
          setChoiceFeedback({
            quality: roomData.lastChoiceEvaluation.quality as "excellent" | "good" | "average" | "bad",
            message: roomData.lastChoiceEvaluation.message,
          })
        }
      } else if (
        !roomData.lastChoiceEvaluation ||
        (roomData.lastChoiceEvaluation.quality === null && roomData.lastChoiceEvaluation.message === null)
      ) {
        // Clear dismissed feedback ref when evaluation is cleared
        dismissedFeedbackRef.current = null
        setChoiceFeedback(null)
      }

      if (roomData.tiedChoicesForVoting && roomData.tiedChoicesForVoting.length > 0) {
        setIsTieBreakerVoting(true)
        setTiedChoices(roomData.tiedChoicesForVoting)
      } else {
        setIsTieBreakerVoting(false)
        setTiedChoices([])
        setRequiresHostSelection(false)
      }

      if (roomData.hostId && currentUserId) {
        const hostIdString =
          typeof roomData.hostId === "string"
            ? roomData.hostId
            : roomData.hostId._id?.toString() || roomData.hostId.toString()
        setIsHost(hostIdString === currentUserId)
      }

      if (roomData.newHostNotification && roomData.newHostNotification.userId) {
        const notificationId = roomData.newHostNotification.userId
        if (lastSeenHostNotificationRef.current !== notificationId) {
          setNewHostInfo(roomData.newHostNotification)
          setShowNewHostModal(true)
          lastSeenHostNotificationRef.current = notificationId
          void fetch(`/api/multiplayer/rooms/${roomCode}/clear-host-notification`, { method: "POST" }).catch(() => { })
        }
      }

      if (roomData.status === "completed") {
        router.push(`/stories/complete/${roomData.storyId}`)
        return
      }

      if (roomData.storyId && roomData.status === "playing") {
        let retryCount = 0
        const maxRetries = 2
        let loadedStory: Story | null = null

        while (retryCount <= maxRetries && !loadedStory) {
          try {
            const storyRes = await fetch(`/api/stories/${roomData.storyId}`)
            if (storyRes.ok) {
              const storyData = await storyRes.json()
              loadedStory = storyData.story as Story

              if (loadedStory) {
                const previousIndex = previousChoiceIndexRef.current
                const hasPageChanged =
                  previousIndex !== -1 && previousIndex !== loadedStory.currentChoiceIndex
                const isInitialLoad = previousIndex === -1

                previousChoiceIndexRef.current = loadedStory.currentChoiceIndex
                setStory(loadedStory)

                if (processingJustCompleted || hasPageChanged || isInitialLoad) {
                  setDisplayedContent("")
                  autoProcessRef.current = false
                  // Reset dismissed feedback when page changes so new feedback can be shown
                  dismissedFeedbackRef.current = null
                }

                setIsLoading(false)
                break
              } else {
                if (retryCount < maxRetries) {
                  retryCount++
                  await new Promise((resolve) => setTimeout(resolve, 500))
                  continue
                }
                setIsLoading(false)
                break
              }
            } else {
              const errorData = await storyRes.json().catch(() => ({}))

              if (storyRes.status === 404 && retryCount < maxRetries) {
                retryCount++
                await new Promise((resolve) => setTimeout(resolve, 1000))
                continue
              }

              console.error("Failed to fetch story:", errorData)

              if (storyRes.status === 404 && story) {
                setIsLoading(false)
                break
              } else if (storyRes.status === 404 && !story) {
                toast.error("Story not found. Please refresh the page.")
                setIsLoading(false)
                break
              } else {
                setIsLoading(false)
                break
              }
            }
          } catch (error) {
            console.error("Error fetching story:", error)
            if (retryCount < maxRetries) {
              retryCount++
              await new Promise((resolve) => setTimeout(resolve, 1000))
              continue
            }
            if (story) {
              setIsLoading(false)
              break
            } else {
              toast.error("Failed to load story. Please refresh the page.")
              setIsLoading(false)
              break
            }
          }
        }
      } else if (roomData.status !== "playing") {
        setIsLoading(false)
      } else {
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Error fetching room:", error)
      setIsLoading(false)
    }
  }, [roomCode, currentUserId, router, isProcessing, story])

  useEffect(() => {
    if (!roomCode) return

    void fetchRoom()

    pollIntervalRef.current = setInterval(() => {
      void fetchRoom()
    }, 2000)

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [roomCode, router, currentUserId, fetchRoom])

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
  }, [story?.content])

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
      void audio.play().catch(() => { })
    }

    return () => {
      audio.pause()
      audioRef.current = null
    }
  }, [story, isMusicEnabled])

  const handleVoteChoice = async (choiceId: string) => {
    if (!roomCode || isVoting || !room) return
    
    // Prevent voting when all have voted and we're waiting for processing
    const roomIsProcessingCheck = room.isProcessing || false
    if (isProcessing || roomIsProcessingCheck) {
      return
    }
    
    // Quick check: if room is processing, don't allow voting
    // The UI buttons are also disabled via waitingForProcessing, but this is a safeguard

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

  const storyId = room?.storyId
  const handleProcessChoice = useCallback(
    async (selectedChoiceId?: string) => {
      if (!roomCode || !isHost || !storyId) {
        autoProcessRef.current = false
        return
      }
      if (isProcessing) {
        autoProcessRef.current = false
        return
      }
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

        if (data.hasTie && data.tiedChoices) {
          if (data.isTieBreakerVoting) {
            setIsTieBreakerVoting(true)
            setTiedChoices(data.tiedChoices)
            setRequiresHostSelection(false)
          } else if (data.requiresHostSelection) {
            setIsTieBreakerVoting(true)
            setTiedChoices(data.tiedChoices)
            setRequiresHostSelection(true)
          } else {
            setIsTieBreakerVoting(true)
            setTiedChoices(data.tiedChoices)
            setRequiresHostSelection(false)
          }
          autoProcessRef.current = false
          setIsProcessing(false)
          void fetchRoom()
          return
        }

        setTiedChoices([])
        setIsTieBreakerVoting(false)
        setRequiresHostSelection(false)

        void fetchRoom()
        const storyRes = await fetch(`/api/stories/${storyId}`)
        if (storyRes.ok) {
          const storyData = await storyRes.json()
          const updatedStory = storyData.story as Story

          if (updatedStory) {
            previousChoiceIndexRef.current = updatedStory.currentChoiceIndex
            setStory(updatedStory)
            setDisplayedContent("")
          }
        } else {
          const currentStory = story
          if (currentStory) {
            const updatedStory: Story = {
              ...currentStory,
              content: data.story.content,
              choices: data.story.choices,
              currentChoiceIndex: data.story.currentChoiceIndex,
              isStoryComplete: data.story.isStoryComplete,
            }
            previousChoiceIndexRef.current = updatedStory.currentChoiceIndex
            setStory(updatedStory)
            setDisplayedContent("")
          }
        }

        autoProcessRef.current = false
        setIsProcessing(false)

        if (data.story.isStoryComplete) {
          setTimeout(() => {
            router.push(`/stories/complete/${storyId}`)
          }, 1500)
        }
      } catch (error) {
        console.error("Error processing choice:", error)
        toast.error("Failed to process choice")
        autoProcessRef.current = false
        setIsProcessing(false)
        void fetchRoom()
      }
    },
    [roomCode, isProcessing, isHost, storyId, router, fetchRoom, story],
  )

  const getUsernamesForVotes = useCallback(
    (userIds: string[]): string[] => {
      if (!room) return []

      const hostIdString = room.hostId || null

      return userIds
        .map((userId) => {
          if (hostIdString && userId === hostIdString) {
            if (room.host) {
              return room.host.username || room.host.email || "Unknown"
            }
            return "Unknown"
          }

          if (room.participants) {
            const participant = room.participants.find((p) => {
              const pId = typeof p === "object" && p._id ? p._id.toString() : p.toString()
              return pId === userId
            })
            if (participant) {
              return participant.username || participant.email || "Unknown"
            }
          }

          return "Unknown"
        })
        .filter(Boolean)
    },
    [room],
  )

  const userVote = room?.choiceVotes
    ? Object.entries(room.choiceVotes).find(([, userIds]) => userIds.includes(currentUserId || ""))?.[0]
    : null

  const uniqueVoters = new Set<string>()
  if (room?.choiceVotes) {
    if (isTieBreakerVoting && tiedChoices.length > 0) {
      tiedChoices.forEach((choiceId) => {
        const votes = room.choiceVotes[choiceId] || []
        votes.forEach((userId: string) => uniqueVoters.add(userId))
      })
    } else {
      Object.values(room.choiceVotes).forEach((votes: string[]) => {
        votes.forEach((userId: string) => uniqueVoters.add(userId))
      })
    }
  }
  const totalVotes = uniqueVoters.size
  const hostIdString = room?.hostId
    ? typeof room.hostId === "string"
      ? room.hostId
      : room.hostId.toString()
    : null
  const hostInParticipants =
    hostIdString &&
    room?.participants.some((p: any) => {
      const pId = typeof p === "string" ? p : p._id ? p._id.toString() : p.toString()
      return pId === hostIdString
    })
  const hostTransferCandidates =
    room?.participants.filter((p) => {
      const pId = typeof p === "object" && p._id ? p._id.toString() : p.toString()
      return !hostIdString || pId !== hostIdString
    }) || []
  const totalPlayers = room
    ? room.participants.length + (room.hostActive !== false && !hostInParticipants ? 1 : 0)
    : 0
  const allVoted = room && totalPlayers > 0 && totalVotes >= totalPlayers
  const roomIsProcessing = room?.isProcessing || false
  // Check if all have voted but processing hasn't started yet
  const waitingForProcessing = allVoted && !isProcessing && !roomIsProcessing && !requiresHostSelection

  const choicesToShow =
    isTieBreakerVoting && tiedChoices.length > 0
      ? story?.choices.filter((c) => tiedChoices.includes(c.id)) || []
      : story?.choices || []

  const voteCounts = choicesToShow.map((choice) => {
    const votes = room?.choiceVotes[choice.id] || []
    return { choiceId: choice.id, votes: votes.length }
  })
  const maxVotes = voteCounts.length > 0 ? Math.max(...voteCounts.map((v) => v.votes), 0) : 0
  const tiedChoicesList = voteCounts
    .filter((v) => v.votes === maxVotes && v.votes > 0)
    .map((v) => v.choiceId)
  const hasTie = tiedChoicesList.length > 1 && allVoted && !isTieBreakerVoting
  const hasTieAfterBreaker = tiedChoicesList.length > 1 && allVoted && isTieBreakerVoting

  useEffect(() => {
    if (hasTieAfterBreaker && isTieBreakerVoting) {
      setRequiresHostSelection(true)
    } else if (!hasTieAfterBreaker && isTieBreakerVoting) {
      setRequiresHostSelection(false)
    }
  }, [hasTieAfterBreaker, isTieBreakerVoting])

  useEffect(() => {
    if (requiresHostSelection && isHost) {
      setShowHostTieModal(true)
    } else {
      setShowHostTieModal(false)
    }
  }, [requiresHostSelection, isHost])

  useEffect(() => {
    if (!isHost || !room || !story || !storyId) {
      autoProcessRef.current = false
      return
    }

    if (allVoted && isProcessing && room.isProcessing === false) {
      setIsProcessing(false)
      autoProcessRef.current = false
      return
    }

    const roomIsProcessing = room.isProcessing || false

    if (
      allVoted &&
      !isProcessing &&
      !roomIsProcessing &&
      autoProcessRef.current &&
      !requiresHostSelection
    ) {
      autoProcessRef.current = false
    }

    const shouldAutoProcess =
      allVoted && !isProcessing && !roomIsProcessing && !autoProcessRef.current && !requiresHostSelection

    if (shouldAutoProcess) {
      autoProcessRef.current = true
      const timer = setTimeout(() => {
        const currentRoom = room
        const currentStory = story
        const currentIsProcessing = isProcessing
        if (!currentIsProcessing && isHost && storyId && currentRoom && currentStory) {
          void handleProcessChoice()
        } else {
          autoProcessRef.current = false
        }
      }, 100)
      return () => {
        clearTimeout(timer)
        if (autoProcessRef.current) {
          autoProcessRef.current = false
        }
      }
    } else if (!allVoted) {
      autoProcessRef.current = false
    }
  }, [
    allVoted,
    hasTie,
    hasTieAfterBreaker,
    isProcessing,
    isHost,
    requiresHostSelection,
    isTieBreakerVoting,
    handleProcessChoice,
    room,
    story,
    storyId,
  ])

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

  const handleSaveStory = async (options?: { suppressSuccessToast?: boolean }) => {
    if (!story || !room?.storyId) return false

    try {
      const res = await fetch("/api/stories/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          story: {
            ...story,
            id: room.storyId,
            isMultiplayer: true,
            roomCode: roomCode,
          },
        }),
      })

      if (!res.ok) {
        toast.error("Failed to save story")
        return false
      }

      if (!options?.suppressSuccessToast) {
        toast.success("Story saved to your multiplayer library")
      }
      return true
    } catch (err) {
      console.error("Save story error", err)
      toast.error("Failed to save story")
      return false
    }
  }

  const leaveRoom = async (saveAndExit: boolean = false) => {
    if (!roomCode) return false
    try {
      const res = await fetch(`/api/multiplayer/rooms/${roomCode}/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ saveAndExit }),
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        toast.error(error.error || "Failed to leave room")
        return false
      }

      return true
    } catch (error) {
      console.error("Error leaving room:", error)
      toast.error("Failed to leave room")
      return false
    }
  }

  const handleExitClick = () => {
    if (isHost && hostTransferCandidates.length > 0) {
      const firstCandidate = hostTransferCandidates[0]
      const firstId =
        typeof firstCandidate === "object" && (firstCandidate as any)._id
          ? (firstCandidate as any)._id.toString()
          : (firstCandidate as any).toString()
      setSelectedNewHost(firstId)
      setShowHostTransferDialog(true)
      return
    }
    setShowExitDialog(true)
  }

  const handleConfirmHostTransfer = async () => {
    if (!roomCode) return
    if (!selectedNewHost) {
      toast.error("Choose who should become the new host")
      return
    }
    setIsTransferringHost(true)
    try {
      const res = await fetch(`/api/multiplayer/rooms/${roomCode}/transfer-host`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newHostId: selectedNewHost }),
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        toast.error(error.error || "Failed to transfer host powers")
        return
      }

      toast.success("Host powers transferred")
      await fetchRoom()
      setIsHost(false)
      setShowHostTransferDialog(false)
      setShowExitDialog(true)
    } finally {
      setIsTransferringHost(false)
    }
  }

  const handleExit = async (mode: "exit" | "save-exit") => {
    if (!roomCode) return
    setShowExitDialog(false)
    setIsLeavingRoom(true)
    if (mode === "save-exit") {
      setIsSavingAndExiting(true)
    }

    try {
      const left = await leaveRoom(mode === "save-exit")
      if (!left) return

      toast.success(
        mode === "save-exit"
          ? "Story saved to your multiplayer library. You left the room and can rejoin later."
          : "Exited the room. You will not be able to rejoin this session.",
      )
      router.push("/dashboard")
    } finally {
      setIsLeavingRoom(false)
      setIsSavingAndExiting(false)
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
    <>
      <BookLayout
        genre={story.genre}
        currentPage={story.currentChoiceIndex}
        onPageTurn={() => { }}
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
                  <span className="text-xs font-display text-primary">{totalPlayers} players</span>
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
                  onClick={() => void handleSaveStory()}
                  className={cn("hover:bg-black/5", theme.styles.text)}
                >
                  <Save className="w-4 h-4" />
                </Button>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleExitClick()}
                      className={cn("hover:bg-black/5", theme.styles.text)}
                      disabled={isLeavingRoom || isSavingAndExiting}
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[300px]">
                    <p className="text-xs">
                      If you exit by mistake or due to internet issues, you can rejoin the room using the room code from your dashboard.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            <h1 className={cn("text-2xl mb-6 text-center font-bold", theme.styles.heading)}>{story.title}</h1>

            <div className="flex-1">
              <p className={cn("text-lg leading-relaxed whitespace-pre-wrap", theme.styles.text)}>
                {displayedContent}
                {isTyping && <span className="animate-pulse ml-1">|</span>}
              </p>
            </div>

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
                {!isTieBreakerVoting && (
                  <p
                    className={cn(
                      "text-sm font-bold opacity-70 mb-4 uppercase tracking-widest text-center",
                      theme.styles.text,
                    )}
                  >
                    Vote for what happens next
                  </p>
                )}

                {isTieBreakerVoting && !requiresHostSelection && (
                  <p
                    className={cn(
                      "text-sm font-bold opacity-70 mb-4 uppercase tracking-widest text-center",
                      theme.styles.text,
                    )}
                  >
                    There was a tie—vote again between the tied choices
                  </p>
                )}

                {isTieBreakerVoting && requiresHostSelection && isHost && (
                  <p
                    className={cn(
                      "text-sm font-bold opacity-70 mb-4 uppercase tracking-widest text-center",
                      theme.styles.text,
                    )}
                  >
                    Still tied! Select the final choice
                  </p>
                )}

                {isTieBreakerVoting && requiresHostSelection && !isHost && (
                  <p
                    className={cn(
                      "text-sm font-bold opacity-70 mb-4 uppercase tracking-widest text-center",
                      theme.styles.text,
                    )}
                  >
                    Still tied! Waiting for host to select...
                  </p>
                )}

                {!isTieBreakerVoting &&
                  story.choices.map((choice) => {
                    const votes = room.choiceVotes[choice.id] || []
                    const voteCount = votes.length
                    const isUserVote = userVote === choice.id
                    const voterUsernames = getUsernamesForVotes(votes)

                    return (
                      <button
                        key={choice.id}
                        onClick={() => handleVoteChoice(choice.id)}
                        disabled={isVoting || isProcessing || waitingForProcessing}
                        className={cn(
                          "w-full text-left p-6 rounded-lg border-2 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-md active:translate-y-0 group relative",
                          theme.styles.choice,
                          theme.styles.text,
                          isUserVote && "ring-2 ring-primary",
                          (isVoting || isProcessing || waitingForProcessing) && "opacity-60 cursor-not-allowed",
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
                            <div className="text-xs font-medium text-primary/70 mb-1">Voted by:</div>
                            <div className="flex flex-wrap gap-1.5">
                              {voterUsernames.map((username, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary/10 text-xs font-display text-primary border border-primary/20"
                                >
                                  {username}
                                </span>
                              ))}
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

                {isTieBreakerVoting && !requiresHostSelection && tiedChoices.length > 0 && (
                  <div className="space-y-4">
                    {choicesToShow.map((choice) => {
                      const votes = room.choiceVotes[choice.id] || []
                      const voteCount = votes.length
                      const isUserVote = userVote === choice.id
                      const voterUsernames = getUsernamesForVotes(votes)

                      return (
                        <button
                          key={choice.id}
                          onClick={() => handleVoteChoice(choice.id)}
                          disabled={isVoting || isProcessing || waitingForProcessing}
                          className={cn(
                            "w-full text-left p-6 rounded-lg border-2 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-md active:translate-y-0 group relative",
                            theme.styles.choice,
                            theme.styles.text,
                            isUserVote && "ring-2 ring-primary",
                            (isVoting || isProcessing || waitingForProcessing) && "opacity-60 cursor-not-allowed",
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
                              <div className="text-xs font-medium text-primary/70 mb-1">Voted by:</div>
                              <div className="flex flex-wrap gap-1.5">
                                {voterUsernames.map((username, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary/10 text-xs font-display text-primary border border-primary/20"
                                  >
                                    {username}
                                  </span>
                                ))}
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
                  </div>
                )}

                {isTieBreakerVoting && requiresHostSelection && isHost && tiedChoices.length > 0 && !isProcessing && (
                  <div className="space-y-4">
                    {tiedChoices.map((choiceId) => {
                      const choice = story.choices.find((c) => c.id === choiceId)
                      if (!choice) return null
                      const votes = room.choiceVotes[choice.id] || []
                      const voterUsernames = getUsernamesForVotes(votes)
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
                            <span className="font-bold opacity-50 text-xl">{story.choices.indexOf(choice) + 1}.</span>
                            <span className="text-lg flex-1">{choice.text}</span>
                          </div>
                          {votes.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-primary/20">
                              <div className="text-xs font-medium text-primary/70 mb-1">Voted by:</div>
                              <div className="flex flex-wrap gap-1.5">
                                {voterUsernames.map((username, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary/10 text-xs font-display text-primary border border-primary/20"
                                  >
                                    {username}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}

                {!isTieBreakerVoting && !allVoted && (
                  <div className="mt-4 text-center">
                    <p className={cn("text-sm opacity-60", theme.styles.text)}>
                      Waiting for all players to vote... ({totalVotes}/{totalPlayers})
                    </p>
                  </div>
                )}

                {!isTieBreakerVoting && waitingForProcessing && (
                  <div className="mt-4 text-center">
                    <Loader2 className={cn("w-5 h-5 animate-spin mx-auto mb-2", theme.styles.text)} />
                    <p className={cn("text-sm font-medium", theme.styles.text)}>
                      All votes received! Calculating results...
                    </p>
                  </div>
                )}

                {isTieBreakerVoting && !requiresHostSelection && !allVoted && (
                  <div className="mt-4 text-center">
                    <p className={cn("text-sm opacity-60", theme.styles.text)}>
                      Waiting for all players to vote on tied choices... ({totalVotes}/{totalPlayers})
                    </p>
                  </div>
                )}

                {isTieBreakerVoting && !requiresHostSelection && waitingForProcessing && (
                  <div className="mt-4 text-center">
                    <Loader2 className={cn("w-5 h-5 animate-spin mx-auto mb-2", theme.styles.text)} />
                    <p className={cn("text-sm font-medium", theme.styles.text)}>
                      All votes received! Calculating results...
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

            {choiceFeedback && (
              <div className="absolute bottom-8 left-0 right-0 flex justify-center z-20">
                <div
                  className={cn(
                    "px-4 py-2 pr-8 rounded-full text-sm font-bold shadow-lg animate-in fade-in slide-in-from-bottom-4 relative",
                    choiceFeedback.quality === "excellent"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : choiceFeedback.quality === "good"
                        ? "bg-sky-100 text-sky-800 border border-sky-200"
                        : choiceFeedback.quality === "average"
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : "bg-red-100 text-red-800 border border-red-200",
                  )}
                >
                  {choiceFeedback.message}
                  <button
                    onClick={() => {
                      // Mark this feedback as dismissed
                      const feedbackId = `${choiceFeedback.quality}-${choiceFeedback.message}`
                      dismissedFeedbackRef.current = feedbackId
                      setChoiceFeedback(null)
                    }}
                    className="absolute top-1/2 right-2 -translate-y-1/2 p-1 rounded-full hover:bg-black/10 transition-colors"
                    aria-label="Dismiss feedback"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            <AlertDialog open={showHostTieModal} onOpenChange={setShowHostTieModal}>
              <AlertDialogContent className="bg-[#1a0b05] border border-[#d4af37] text-[#d4af37] max-w-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-serif font-bold text-[#d4af37] text-2xl uppercase tracking-widest">
                    Tie Detected Again
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-[#d4af37]/70 font-sans italic">
                    The choices are still tied after the second vote. As the host, select the final choice to continue the story.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                  {tiedChoices.map((choiceId) => {
                    const choice = story.choices.find((c) => c.id === choiceId)
                    if (!choice) return null
                    const votes = room.choiceVotes[choice.id] || []
                    const voterUsernames = getUsernamesForVotes(votes)
                    return (
                      <button
                        key={choiceId}
                        onClick={() => {
                          setShowHostTieModal(false)
                          void handleProcessChoice(choiceId)
                        }}
                        className={cn(
                          "w-full text-left p-4 rounded-lg border transition-colors font-sans",
                          "border-[#d4af37]/30 hover:bg-[#d4af37]/10 text-[#d4af37]/80 hover:text-[#d4af37] hover:border-[#d4af37]/60",
                        )}
                      >
                        <div className="flex items-start gap-3 mb-2">
                          <span className="font-bold text-lg opacity-70">{story.choices.indexOf(choice) + 1}.</span>
                          <span className="text-base flex-1 font-medium leading-relaxed">{choice.text}</span>
                        </div>
                        {votes.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-[#d4af37]/20">
                            <div className="text-xs font-semibold text-[#d4af37]/80 mb-2 uppercase tracking-wider">
                              Voted by ({votes.length}):
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {voterUsernames.map((username, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-2 py-1 rounded-md bg-[#d4af37]/15 text-xs font-display text-[#d4af37] border border-[#d4af37]/30"
                                >
                                  {username}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
                <AlertDialogFooter className="gap-3 sm:gap-4 mt-4">
                  <AlertDialogCancel
                    onClick={() => setShowHostTieModal(false)}
                    className="bg-transparent border border-[#d4af37]/30 text-[#d4af37] hover:bg-[#d4af37]/10 hover:text-[#d4af37] uppercase tracking-widest text-xs font-bold rounded-lg h-auto py-3"
                  >
                    Cancel
                  </AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        }
      />
      <AlertDialog open={showHostTransferDialog} onOpenChange={setShowHostTransferDialog}>
        <AlertDialogContent className="bg-[#1a0b05] border border-[#d4af37] text-[#d4af37]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif font-bold text-[#d4af37] text-2xl uppercase tracking-widest">Choose a new host</AlertDialogTitle>
            <AlertDialogDescription className="text-[#d4af37]/70 font-sans italic">
              Select which participant should take over host controls before you exit. You will continue as a regular player afterward.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {hostTransferCandidates.length === 0 ? (
            <p className="text-sm text-[#d4af37]/50 font-serif italic">No other participants are available to take host duties right now.</p>
          ) : (
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
              {hostTransferCandidates.map((candidate) => {
                const candidateId =
                  typeof candidate === "object" && (candidate as any)._id
                    ? (candidate as any)._id.toString()
                    : (candidate as any).toString()
                const label =
                  typeof candidate === "object" && "username" in candidate
                    ? (candidate as any).username || (candidate as any).email || "Unknown"
                    : "Unknown"
                const isSelected = selectedNewHost === candidateId
                return (
                  <button
                    key={candidateId}
                    onClick={() => setSelectedNewHost(candidateId)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border transition-colors font-sans",
                      isSelected
                        ? "border-[#d4af37] bg-[#d4af37]/20 text-[#d4af37]"
                        : "border-[#d4af37]/30 hover:bg-[#d4af37]/10 text-[#d4af37]/80 hover:text-[#d4af37] hover:border-[#d4af37]/60",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium tracking-wide uppercase text-xs">{label}</span>
                      {isSelected && <span className="text-[10px] text-[#d4af37] font-bold uppercase tracking-widest">Selected</span>}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
          <AlertDialogFooter className="gap-3 sm:gap-4 mt-4">
            <AlertDialogCancel disabled={isTransferringHost} className="bg-transparent border border-[#d4af37]/30 text-[#d4af37] hover:bg-[#d4af37]/10 hover:text-[#d4af37] uppercase tracking-widest text-xs font-bold rounded-lg h-auto py-3">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isTransferringHost || !selectedNewHost || hostTransferCandidates.length === 0}
              onClick={() => void handleConfirmHostTransfer()}
              className="min-w-[150px] bg-[#d4af37] text-[#1a0b05] hover:bg-[#f4e4bc] uppercase tracking-widest text-xs font-bold rounded-lg h-auto py-3"
            >
              {isTransferringHost ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Transferring...
                </>
              ) : (
                "Transfer host"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent className="bg-[#1a0b05] border border-[#d4af37] text-[#d4af37]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif font-bold text-[#d4af37] text-2xl uppercase tracking-widest">Exit Room</AlertDialogTitle>
            <AlertDialogDescription className="text-[#d4af37]/70 font-sans italic">
              Exit without saving to leave permanently, or save and exit to keep your copy and rejoin later. Remaining players continue from the current page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 sm:gap-4">
            <AlertDialogCancel disabled={isLeavingRoom || isSavingAndExiting} className="bg-transparent border border-[#d4af37]/30 text-[#d4af37] hover:bg-[#d4af37]/10 hover:text-[#d4af37] uppercase tracking-widest text-xs font-bold rounded-lg h-auto py-3">
              Cancel
            </AlertDialogCancel>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex">
                  <AlertDialogAction
                    disabled={isLeavingRoom || isSavingAndExiting}
                    onClick={() => void handleExit("exit")}
                    className="min-w-[120px] bg-transparent border border-red-500/30 text-red-500 hover:bg-red-950/30 hover:text-red-400 uppercase tracking-widest text-xs font-bold rounded-lg h-auto py-3"
                  >
                    {isLeavingRoom ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Exiting...
                      </>
                    ) : (
                      "Exit"
                    )}
                  </AlertDialogAction>
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[250px] bg-[#2a1a10] border-[#d4af37]/30 text-[#d4af37]">
                <p className="text-xs">
                  Leave immediately. The story will not be saved for you and you will not be able to rejoin this room.
                </p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex">
                  <AlertDialogAction
                    disabled={isLeavingRoom || isSavingAndExiting}
                    onClick={() => void handleExit("save-exit")}
                    className="min-w-[150px] bg-[#d4af37] text-[#1a0b05] hover:bg-[#f4e4bc] uppercase tracking-widest text-xs font-bold rounded-lg h-auto py-3"
                  >
                    {isSavingAndExiting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save and Exit"
                    )}
                  </AlertDialogAction>
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[250px] bg-[#2a1a10] border-[#d4af37]/30 text-[#d4af37]">
                <p className="text-xs">
                  Save to your multiplayer library, exit the room, and rejoin later with voting rights restored.
                </p>
              </TooltipContent>
            </Tooltip>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {showNewHostModal && newHostInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-primary/20"
          >
            <div className="p-6 border-b border-primary/10 bg-gradient-to-r from-primary/5 to-primary/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold text-foreground">New Host Selected</h3>
                  <p className="text-sm text-foreground/70 mt-0.5">The previous host has left the room</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-center text-lg mb-4">
                <span className="font-display font-bold text-primary">{newHostInfo.username}</span> is now the host
              </p>
              <p className="text-sm text-foreground/60 text-center">They will manage voting and story progression</p>
            </div>
            <div className="p-4 border-t border-primary/10 bg-neutral-50/50 dark:bg-neutral-800/50 flex justify-end">
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowNewHostModal(false)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Got it
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {room && (
        <MultiplayerChat
          roomCode={roomCode}
          currentUserId={currentUserId}
          messages={room.messages || []}
          onMessageSent={() => {
            void fetchRoom()
          }}
        />
      )}
    </>
  )
}


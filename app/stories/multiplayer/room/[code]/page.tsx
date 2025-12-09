"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { NeonCard } from "@/components/ui/neon-card"
import { NeonButton } from "@/components/ui/neon-button"
import { AnimatedGrid } from "@/components/ui/animated-grid"
import { STORY_GENRES } from "@/lib/story-data"
import { Users, Loader2, Play } from "lucide-react"
import { toast } from "sonner"

interface RoomData {
  roomCode: string
  status: "waiting" | "voting-genre" | "playing" | "completed"
  hostId: string | { _id: string; username?: string; email?: string }
  participants: Array<{ _id: string; username: string; email: string }>
  genreVotes: Record<string, string[]>
  selectedGenre: string | null
  storyId: string | null
  choiceVotes: Record<string, string[]>
  currentChoiceIndex: number
  newHostNotification?: {
    userId: string
    username: string
  } | null
}

export default function RoomLobbyPage() {
  const params = useParams<{ code: string }>()
  const router = useRouter()
  const roomCode = params?.code as string
  const [room, setRoom] = useState<RoomData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isVoting, setIsVoting] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [selectedGenreOverride, setSelectedGenreOverride] = useState<string | null>(null)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

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
        if (res.status === 404) {
          toast.error("Room not found")
          router.push("/stories/multiplayer")
          return
        }
        return
      }

      const data = await res.json()
      const roomData = data.room as RoomData
      setRoom(roomData)
      setIsLoading(false)

      if (roomData.status === "playing" && roomData.storyId) {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current)
          pollIntervalRef.current = null
        }
        router.push(`/stories/multiplayer/play/${roomCode}`)
        return
      }
    } catch (error) {
      console.error("Error fetching room:", error)
    }
  }

  useEffect(() => {
    if (!roomCode) return

    const joinRoom = async () => {
      try {
        const res = await fetch("/api/multiplayer/rooms/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomCode }),
        })

        if (!res.ok) {
          const error = await res.json()
          if (res.status === 404 || res.status === 400 || res.status === 403) {
            toast.error(error.error || "Cannot join room")
            router.push("/stories/multiplayer")
            return
          }
        }
      } catch (error) {
        console.error("Error joining room:", error)
      }
    }

    void joinRoom()
    void fetchRoom()

    pollIntervalRef.current = setInterval(() => {
      void fetchRoom()
    }, 2000)

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [roomCode, router])

  const handleVoteGenre = async (genreId: string) => {
    if (!roomCode || isVoting) return

    setIsVoting(true)
    try {
      const res = await fetch(`/api/multiplayer/rooms/${roomCode}/vote-genre`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ genreId }),
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

  const handleStartStory = async () => {
    if (!roomCode || isStarting) return
    if (!allHaveVoted) {
      toast.error("Wait for everyone to vote first")
      return
    }

    const payload: Record<string, string> = {}
    if (tiedGenreIds.length > 1) {
      if (!selectedGenreOverride) {
        toast.error("Select a genre to break the tie")
        return
      }
      payload.selectedGenre = selectedGenreOverride
    }

    setIsStarting(true)
    try {
      const res = await fetch(`/api/multiplayer/rooms/${roomCode}/start-story`, {
        method: "POST",
        headers: Object.keys(payload).length ? { "Content-Type": "application/json" } : undefined,
        body: Object.keys(payload).length ? JSON.stringify(payload) : undefined,
      })

      if (!res.ok) {
        const error = await res.json()
        toast.error(error.error || "Failed to start story")
        return
      }

      toast.success("Story starting!")
      setTimeout(() => {
        router.push(`/stories/multiplayer/play/${roomCode}`)
      }, 500)
    } catch (error) {
      console.error("Error starting story:", error)
      toast.error("Failed to start story")
    } finally {
      setIsStarting(false)
    }
  }

  const hostIdString =
    typeof room?.hostId === "string"
      ? room.hostId
      : room?.hostId?._id?.toString() || room?.hostId?.toString() || ""
  const isHost = currentUserId && hostIdString === currentUserId
  const userVote = room?.genreVotes
    ? Object.entries(room.genreVotes).find(([, userIds]) => userIds.includes(currentUserId || ""))?.[0]
    : null

  const totalVotes = room?.genreVotes
    ? Object.values(room.genreVotes).reduce((sum, votes) => sum + votes.length, 0)
    : 0
  const totalParticipants = room?.participants.length || 0

  const uniqueVoters = new Set<string>()
  if (room?.genreVotes) {
    Object.values(room.genreVotes).forEach((ids) => ids.forEach((id) => uniqueVoters.add(id)))
  }
  const allHaveVoted = uniqueVoters.size >= totalParticipants && totalParticipants > 0

  const voteCounts = STORY_GENRES.map((genre) => ({
    id: genre.id,
    votes: room?.genreVotes?.[genre.id]?.length || 0,
  }))
  const maxVotes = voteCounts.reduce((max, g) => Math.max(max, g.votes), 0)
  const tiedGenreIds = voteCounts.filter((g) => g.votes === maxVotes && maxVotes > 0).map((g) => g.id)

  useEffect(() => {
    if (tiedGenreIds.length > 1) {
      setSelectedGenreOverride((prev) => (prev && tiedGenreIds.includes(prev) ? prev : tiedGenreIds[0]))
    } else {
      setSelectedGenreOverride(null)
    }
  }, [tiedGenreIds.join(",")])

  return (
    <>
      {(isLoading || !room) && (
        <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
          <AnimatedGrid />
          <div className="text-center relative z-10">
            <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
            <p className="text-foreground/60">Loading room...</p>
          </div>
        </div>
      )}
      {!isLoading && room && (
        <div className="min-h-screen bg-background relative overflow-hidden">
          <div className="fixed inset-0 z-0">
            <motion.div
              style={{
                backgroundImage: "url('/cyberpunk-neon-city-skyline-night.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              className="absolute inset-0 opacity-15"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/80 to-background/95" />
          </div>

          <AnimatedGrid />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-32 relative z-10">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
              <h1 className="text-4xl sm:text-5xl font-display font-bold mb-4 text-glow-violet">
                ROOM: {room.roomCode}
              </h1>
              <p className="text-lg text-foreground/60">
                {room.status === "waiting" && "Waiting for players..."}
                {room.status === "voting-genre" && "Vote for your preferred genre"}
                {room.status === "playing" && "Story in progress"}
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
              <NeonCard glowColor="blue" className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-display font-bold uppercase">Participants ({room.participants.length})</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {room.participants.map((participant) => (
                    <div key={participant._id} className="px-4 py-2 rounded-lg bg-primary/10 border border-primary/30">
                      <span className="text-sm font-display">
                        {participant.username || participant.email}
                        {participant._id === hostIdString && <span className="ml-2 text-xs text-primary">(Host)</span>}
                      </span>
                    </div>
                  ))}
                </div>
              </NeonCard>
            </motion.div>

            {(room.status === "waiting" || room.status === "voting-genre") && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <h2 className="text-2xl font-display font-bold mb-6 text-center uppercase">Choose Your Genre</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {STORY_GENRES.map((genre) => {
                    const votes = room.genreVotes?.[genre.id] || []
                    const voteCount = votes.length
                    const isSelected = userVote === genre.id

                    return (
                      <motion.button key={genre.id} onClick={() => handleVoteGenre(genre.id)} disabled={isVoting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <NeonCard
                          glowColor={isSelected ? "violet" : "cyan"}
                          className={`text-center h-full cursor-pointer transition-all ${isSelected ? "ring-2 ring-primary" : ""}`}
                        >
                          <div className="text-4xl mb-4">{genre.icon}</div>
                          <h3 className="text-xl font-display font-bold mb-2 uppercase">{genre.name}</h3>
                          <p className="text-sm text-foreground/60 mb-4">{genre.description}</p>
                          {voteCount > 0 && (
                            <div className="mt-4 pt-4 border-t border-primary/20">
                              <div className="text-2xl font-display font-bold text-primary">
                                {voteCount} {voteCount === 1 ? "vote" : "votes"}
                              </div>
                            </div>
                          )}
                          {isSelected && <div className="mt-2 text-xs text-primary uppercase tracking-wider">Your Vote</div>}
                        </NeonCard>
                      </motion.button>
                    )
                  })}
                </div>

                {isHost && (
                  <div className="text-center space-y-4">
                    {!allHaveVoted && (
                      <p className="text-sm text-foreground/60">
                        Waiting for everyone to vote... ({uniqueVoters.size}/{totalParticipants})
                      </p>
                    )}

                    {allHaveVoted && tiedGenreIds.length > 1 && (
                      <div className="space-y-2">
                        <p className="text-sm text-foreground/80 font-display uppercase">Tie detected. Choose a genre:</p>
                        <div className="flex flex-wrap justify-center gap-2">
                          {tiedGenreIds.map((id) => {
                            const genre = STORY_GENRES.find((g) => g.id === id)
                            if (!genre) return null
                            const isActive = selectedGenreOverride === id
                            return (
                              <NeonButton
                                key={id}
                                glowColor={isActive ? "violet" : "cyan"}
                                variant={isActive ? "default" : "ghost"}
                                onClick={() => setSelectedGenreOverride(id)}
                                className="px-4 py-2"
                              >
                                {genre.name}
                              </NeonButton>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {allHaveVoted && (
                      <NeonButton glowColor="violet" onClick={handleStartStory} disabled={isStarting} className="px-8 py-4">
                        {isStarting ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Starting...
                          </>
                        ) : (
                          <>
                            <Play className="w-5 h-5 mr-2" />
                            Start Story
                          </>
                        )}
                      </NeonButton>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      )}
    </>
  )
}


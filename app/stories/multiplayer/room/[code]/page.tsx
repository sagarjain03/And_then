"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import { STORY_GENRES } from "@/lib/story-data"
import { Users, Loader2, Play, BookOpen, ArrowLeft, Mic } from "lucide-react"
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

  const handleLeaveRoom = async () => {
    if (!roomCode) return
    try {
      const res = await fetch(`/api/multiplayer/rooms/${roomCode}/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ saveAndExit: false }),
      })

      if (!res.ok) {
        // Even if it fails, we should probably redirect the user away
        // But let's show an error just in case
        console.error("Failed to leave room cleanly")
      }
      router.push("/stories/multiplayer")
      toast.success("Left the room")
    } catch (error) {
      console.error("Error leaving room:", error)
      router.push("/stories/multiplayer")
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

  // Helper functions for 3D Books
  // Helper functions for 3D Books - Styles ported from stories/new/page.tsx
  const getGenreInterior = (id: string) => {
    switch (id) {
      case 'fantasy':
        return (
          <>
            <div className="absolute top-4 left-4 text-xs opacity-60 font-serif text-[#8b4513] -rotate-12 border border-[#8b4513] px-2 py-1 rounded">✨ Ancient Prophecy</div>
            <div className="absolute bottom-8 right-2 text-4xl opacity-10 select-none grayscale">🐉</div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <div className="w-32 h-32 border-2 border-dashed border-[#8b4513]/10 rounded-full animate-[spin_10s_linear_infinite]"></div>
            </div>
          </>
        )
      case 'scifi':
        return (
          <>
            <div className="absolute top-2 right-2 text-[10px] font-mono text-[#8b4513] bg-green-900/10 px-1 border border-green-500/30">SYS_ONLINE</div>
            <div className="absolute bottom-4 left-4 text-4xl opacity-10 select-none grayscale">🛸</div>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,100,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,100,0,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
          </>
        )
      case 'mystery':
        return (
          <>
            <div className="absolute top-6 right-6 text-sm font-bold text-red-900/40 -rotate-[25deg] border-4 border-red-900/40 px-2 py-1 uppercase tracking-widest mask-stamp">Confidential</div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-3xl opacity-10 select-none grayscale">👣</div>
            <div className="absolute top-10 left-4 w-12 h-16 border border-[#8b4513]/20 bg-[#8b4513]/5 rotate-3"></div>
          </>
        )
      case 'romance':
        return (
          <>
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-4xl opacity-10 text-pink-700 select-none">♥</div>
            <div className="absolute bottom-6 right-6 text-xs font-cursive text-pink-800/60 rotate-6">"Forever yours..."</div>
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-pink-500/5 to-transparent rounded-bl-full"></div>
          </>
        )
      case 'adventure':
        return (
          <>
            <div className="absolute top-4 right-4 text-2xl opacity-20 select-none rotate-45 grayscale">🧭</div>
            <div className="absolute bottom-4 left-4 text-[10px] font-serif tracking-widest text-[#8b4513]/60 border-b border-[#8b4513]/40">N 45° 12' 33"</div>
            <div className="absolute inset-4 border border-dashed border-[#8b4513]/20 rounded"></div>
          </>
        )
      default:
        return (
          <div className="absolute top-2 right-2 text-2xl opacity-10 text-[#8b4513]">✦</div>
        )
    }
  }

  const getGenreCover = (id: string) => {
    switch (id) {
      case 'fantasy':
        return (
          <>
            <div className="absolute inset-0 bg-[#2d1b36]/60 mix-blend-multiply"></div>
            <div className="absolute inset-0 border-[6px] border-[#d4af37]/40 rounded-r-lg m-2"></div>
            <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
              <div className="w-48 h-48 rounded-full border border-[#d4af37] border-dashed animate-spin-slow"></div>
              <div className="absolute w-40 h-40 rounded-full border border-[#d4af37] rotate-45"></div>
            </div>
            <div className="absolute top-2 right-2 text-[#d4af37]/60 text-xs">I.IV.VII</div>
          </>
        )
      case 'scifi':
        return (
          <>
            <div className="absolute inset-0 bg-[#0f2a36]/70 mix-blend-multiply"></div>
            <div className="absolute inset-0 opacity-40 bg-[linear-gradient(0deg,transparent_24%,rgba(0,255,255,.1)_25%,rgba(0,255,255,.1)_26%,transparent_27%,transparent_74%,rgba(0,255,255,.1)_75%,rgba(0,255,255,.1)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(0,255,255,.1)_25%,rgba(0,255,255,.1)_26%,transparent_27%,transparent_74%,rgba(0,255,255,.1)_75%,rgba(0,255,255,.1)_76%,transparent_77%,transparent)] bg-[size:30px_30px]"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/50 shadow-[0_0_10px_cyan]"></div>
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-cyan-500/50 rounded-br-xl"></div>
          </>
        )
      case 'mystery':
        return (
          <>
            <div className="absolute inset-0 bg-[#1a0505]/80 mix-blend-multiply"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#000000_100%)] opacity-80"></div>
            <div className="absolute w-full h-full border-y-[1px] border-[#5c1c1c]/40 top-0 left-0"></div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.5em] text-[#8b0000]/60 uppercase">Unsolved</div>
          </>
        )
      case 'romance':
        return (
          <>
            <div className="absolute inset-0 bg-[#361b22]/60 mix-blend-multiply"></div>
            <div className="absolute inset-4 border border-[#e35d6a]/30 rounded-r-sm"></div>
            <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[radial-gradient(#e35d6a_1px,transparent_1px)] bg-[size:12px_12px]"></div>
            <div className="absolute top-2 left-2 text-[#e35d6a]/40 text-2xl">❦</div>
            <div className="absolute bottom-2 right-2 text-[#e35d6a]/40 text-2xl rotate-180">❦</div>
          </>
        )
      case 'adventure':
        return (
          <>
            <div className="absolute inset-0 bg-[#2b2b1e]/60 mix-blend-multiply"></div>
            <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,#d4af37_0,#d4af37_1px,transparent_0,transparent_50%)] bg-[size:20px_20px]"></div>
            <div className="absolute inset-2 border-2 border-dashed border-[#d4af37]/30 rounded-r"></div>
            <div className="absolute top-1/2 right-2 text-[#d4af37]/20 text-4xl font-bold opacity-30">N</div>
          </>
        )
      default:
        return (
          <div className="absolute inset-0 bg-black/20 mix-blend-multiply"></div>
        )
    }
  }

  return (
    <>
      <div className="min-h-screen bg-[#1a0b05] text-[#d4af37] py-6 px-4 relative overflow-hidden font-serif selection:bg-[#d4af37] selection:text-[#1a0b05]">
        {/* Background Texture */}
        <div
          className="fixed inset-0 pointer-events-none opacity-20 z-0 bg-repeat"
          style={{
            backgroundImage: `url("https://www.transparenttextures.com/patterns/leather.png")`
          }}
        ></div>

        {/* Spotlights */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-[#d4af37]/10 to-transparent pointer-events-none z-0 blur-3xl"></div>

        {(isLoading || !room) ? (
          <div className="flex flex-col items-center justify-center min-h-screen relative z-10">
            <Loader2 className="w-12 h-12 text-[#d4af37] animate-spin mb-4" />
            <p className="text-[#d4af37]/60 font-serif italic">Accessing the archives...</p>
          </div>
        ) : (
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12 relative">
              <button
                onClick={handleLeaveRoom}
                className="absolute left-0 top-0 sm:left-4 sm:top-4 text-[10px] uppercase tracking-[0.2em] border border-[#d4af37]/30 bg-[#1a0b05] text-[#d4af37] px-4 py-2 rounded hover:bg-[#d4af37] hover:text-[#1a0b05] transition-all font-sans font-bold flex items-center gap-2 z-20 group"
              >
                <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                <span className="hidden sm:inline">Leave Room</span>
              </button>

              <div className="inline-block p-4 border border-[#d4af37]/30 rounded-full mb-6 bg-[#2a1a10]">
                <Users className="w-8 h-8 text-[#d4af37]" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-serif font-bold mb-4 text-[#d4af37] tracking-tight drop-shadow-md">
                ROOM: {room.roomCode}
              </h1>
              <p className="text-lg text-[#d4af37]/60 italic font-serif">
                {room.status === "waiting" && "Waiting for players..."}
                {room.status === "voting-genre" && "Vote for your preferred genre"}
                {room.status === "playing" && "Story in progress"}
              </p>
            </motion.div>

            {/* Participants Block */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-12 max-w-4xl mx-auto">
              <div className="bg-[#2a1a10] border border-[#d4af37]/30 rounded-xl p-6 relative overflow-hidden">
                <div className="flex items-center gap-3 mb-6 border-b border-[#d4af37]/10 pb-4">
                  <h2 className="text-lg font-serif font-bold uppercase tracking-widest text-[#d4af37]">Participants ({room.participants.length})</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  {room.participants.map((participant) => (
                    <div key={participant._id} className="px-4 py-2 rounded border border-[#d4af37]/20 bg-[#1a0b05] text-[#d4af37]/80 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#d4af37]"></div>
                      <span className="text-sm font-sans font-bold uppercase tracking-wider">
                        {participant.username || participant.email}
                        {participant._id === hostIdString && <span className="ml-2 text-[10px] text-[#d4af37]/50">(Host)</span>}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Genre Voting Section */}
            {(room.status === "waiting" || room.status === "voting-genre") && (
              <div className="flex-1 flex flex-col items-center justify-center py-4">
                <h2 className="text-2xl font-serif font-bold mb-8 text-[#d4af37] uppercase tracking-widest text-center">Choose Your Genre</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 perspective-[2000px] mb-12">
                  {STORY_GENRES.map((genre, index) => {
                    const votes = room.genreVotes?.[genre.id] || []
                    const voteCount = votes.length
                    const isSelected = userVote === genre.id

                    return (
                      <motion.div
                        key={genre.id}
                        initial={{ opacity: 0, y: 50, rotateX: 10 }}
                        animate={{ opacity: 1, y: 0, rotateX: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.6, type: "spring" }}
                        onClick={() => handleVoteGenre(genre.id)}
                        className="group relative cursor-pointer w-[220px] h-[320px] mx-auto preserve-3d"
                      >
                        {/* Selection Glow */}
                        <div className={`absolute -inset-4 rounded-[20px] bg-[#d4af37]/20 blur-2xl transition-opacity duration-500 ${isSelected ? 'opacity-100' : 'opacity-0'}`}></div>

                        {/* The Book Structure */}
                        <div className={`relative w-full h-full transition-transform duration-700 ease-in-out transform-style-3d group-hover:translate-x-4 ${isSelected ? 'translate-y-[-20px]' : ''}`}>

                          {/* Back Cover */}
                          <div className="absolute inset-0 bg-[#2a1a10] rounded-r-lg shadow-2xl border-l-[10px] border-[#1a0b05]"></div>

                          {/* Pages Block */}
                          <div className="absolute top-[4px] bottom-[4px] left-[12px] right-[4px] bg-[#f4e4bc] rounded-r shadow-inner bg-[linear-gradient(90deg,#e3d3b0_1px,transparent_1px)] bg-[size:3px_100%] flex flex-col items-center justify-center p-4 text-center overflow-hidden">
                            {getGenreInterior(genre.id)}

                            {/* Vote Count Indicator inside when open (conceptually) or just visible elements */}
                            <div className="relative z-10 mt-auto bg-[#1a0b05]/10 px-4 py-2 rounded-full border border-[#8b4513]/20">
                              <span className="text-[#8b4513] font-bold font-serif">{voteCount} Votes</span>
                            </div>
                          </div>

                          {/* Rotatable Cover Leaf */}
                          <div className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] origin-left group-hover:-rotate-y-[135deg] preserve-3d">
                            {/* Front Cover */}
                            <div
                              className="absolute inset-0 bg-[#3a2012] rounded-r-lg border-l-[12px] border-[#25140a] shadow-2xl flex flex-col items-center justify-center p-4 text-center border-y-4 border-r-4 border-[#5c3a21] backface-hidden overflow-hidden"
                              style={{
                                backgroundImage: `url("/book-cover-leather.jpg")`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                              }}
                            >
                              {getGenreCover(genre.id)}

                              <div className="absolute left-[-12px] top-0 bottom-0 w-[12px] bg-[#4a2b18] rounded-l-sm border-r border-[#1a0b05] z-10"></div>
                              <div className="absolute top-2 left-2 w-full h-full border-2 border-[#d4af37]/30 rounded-r opacity-50 pointer-events-none z-10"></div>

                              <div className="relative z-20 w-16 h-16 mb-6 rounded-full bg-[#1a0b05] border-2 border-[#d4af37] flex items-center justify-center shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-500">
                                <span className="text-3xl filter drop-shadow-[0_0_5px_rgba(212,175,55,0.5)]">{genre.icon}</span>
                              </div>

                              <h3 className="relative z-20 text-xl font-bold font-display text-[#d4af37] mb-2 uppercase tracking-wide px-2 drop-shadow-md">{genre.name}</h3>

                              {isSelected && (
                                <div className="absolute top-4 right-4 text-[#d4af37] animate-pulse z-20">
                                  <div className="w-3 h-3 bg-[#d4af37] rounded-full shadow-[0_0_10px_#d4af37]"></div>
                                </div>
                              )}

                              {/* Vote Count Badge on Cover */}

                            </div>

                            {/* Inside Left Cover */}
                            <div
                              className="absolute inset-0 bg-[#2a1a10] rounded-r-lg flex flex-col p-6 items-center justify-center backface-hidden border-l-[10px] border-[#1a0b05]"
                              style={{
                                transform: 'rotateY(180deg)',
                              }}
                            >
                              <div className="w-full h-full border border-[#d4af37]/10 p-4 flex items-center justify-center text-center">
                                <div className="opacity-20">
                                  <BookOpen className="w-12 h-12 text-[#d4af37]" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Floating Label Below */}
                        <div className="text-center mt-6">
                          {isSelected ? (
                            <span className="text-[#1a0b05] text-[10px] uppercase tracking-widest font-bold bg-[#d4af37] px-4 py-2 rounded-full shadow-lg">Your Choice</span>
                          ) : (
                            <span className="text-[#d4af37]/60 text-[10px] uppercase tracking-widest font-bold border border-[#d4af37]/20 px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">Cast Vote</span>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Host Controls */}
                {isHost && (
                  <div className="text-center space-y-6 max-w-md mx-auto bg-[#2a1a10]/80 p-8 rounded-xl border border-[#d4af37]/20 backdrop-blur-sm">
                    {!allHaveVoted && (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-5 h-5 text-[#d4af37] animate-spin" />
                        <p className="text-sm text-[#d4af37]/60 font-serif italic">
                          Waiting for the fellowship... ({uniqueVoters.size}/{totalParticipants})
                        </p>
                      </div>
                    )}

                    {allHaveVoted && tiedGenreIds.length > 1 && (
                      <div className="space-y-4">
                        <p className="text-sm text-[#d4af37] font-bold uppercase tracking-widest">Tie detected. The Host must decide:</p>
                        <div className="flex flex-wrap justify-center gap-2">
                          {tiedGenreIds.map((id) => {
                            const genre = STORY_GENRES.find((g) => g.id === id)
                            if (!genre) return null
                            const isActive = selectedGenreOverride === id
                            return (
                              <button
                                key={id}
                                onClick={() => setSelectedGenreOverride(id)}
                                className={`px-4 py-2 rounded text-xs uppercase tracking-widest font-bold border transition-all ${isActive ? 'bg-[#d4af37] text-[#1a0b05] border-[#d4af37]' : 'bg-transparent text-[#d4af37] border-[#d4af37]/30 hover:border-[#d4af37]'}`}
                              >
                                {genre.name}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {allHaveVoted && (
                      <button
                        onClick={handleStartStory}
                        disabled={isStarting}
                        className="w-full text-[12px] uppercase tracking-[0.2em] border border-[#d4af37] bg-[#d4af37]/10 px-8 py-4 rounded hover:bg-[#d4af37] hover:text-[#1a0b05] transition-all font-sans font-bold flex items-center justify-center gap-3"
                      >
                        {isStarting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Starting...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 ml-1 fill-current" />
                            <span>Begin the Adventure</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx global>{`
        .perspective-[2000px] {
          perspective: 2000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .group:hover .group-hover\\:-rotate-y-\\[135deg\\] {
           transform: rotateY(-135deg);
        }
      `}</style>
    </>
  )
}

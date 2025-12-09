"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { NeonButton } from "@/components/ui/neon-button"
import { StorytellerCard } from "@/components/ui/storyteller-card"
import { Progress } from "@/components/ui/progress"
import { type Story, STORY_GENRES } from "@/lib/story-data"
import { type PersonalityResult } from "@/lib/personality-data"
import { getDefaultUserStats, fetchUserStats, type UserStats } from "@/lib/gamification"
import { BookOpen, Plus, Trash2, Play, BarChart3, LogOut, Award, Zap, Trophy, Users, Feather, DoorOpen } from "lucide-react"
import { toast } from "sonner"
import { ThemeToggle } from "@/components/theme-toggle"

interface CurrentUser {
  id: string
  username: string
  email: string
}

interface DashboardApiResponse {
  user: CurrentUser
  stories: Story[]
  singlePlayerStories?: SavedStory[]
  multiplayerStories?: SavedStory[]
  personality: PersonalityResult | null
  player_context?: {
    dashboard_snippet: string
  }
  meta?: {
    routes_protected: boolean
    schema_version?: string
  }
}

type SavedStory = Story & {
  _id?: string
  isMultiplayer?: boolean
  roomCode?: string | null
}

export default function DashboardPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const userIdFromRoute = params?.id

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [singlePlayerStories, setSinglePlayerStories] = useState<SavedStory[]>([])
  const [multiplayerStories, setMultiplayerStories] = useState<SavedStory[]>([])
  const [personalityResult, setPersonalityResult] = useState<PersonalityResult | null>(null)
  const [stats, setStats] = useState<UserStats>(getDefaultUserStats())
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardSnippet, setDashboardSnippet] = useState<string | null>(null)

  const [quote, setQuote] = useState("")

  useEffect(() => {
    const quotes = [
      "There is no greater agony than bearing an untold story inside you. - Maya Angelou",
      "We are all stories in the end. Just make it a good one, eh? - Doctor Who",
      "The universe is made of stories, not of atoms. - Muriel Rukeyser",
      "To survive, you must tell stories. - Umberto Eco",
      "A reader lives a thousand lives before he dies. - George R.R. Martin",
      "After the nourishment, shelter and companionship, stories are the thing we need most. - Philip Pullman"
    ]
    setQuote(quotes[Math.floor(Math.random() * quotes.length)])
  }, [])

  useEffect(() => {
    const init = async () => {
      try {
        if (!userIdFromRoute) {
          window.location.href = "/auth/login"
          return
        }

        const res = await fetch("/api/dashboard")
        if (!res.ok) {
          window.location.href = "/auth/login"
          return
        }

        const data: DashboardApiResponse = await res.json()

        setCurrentUser(data.user)

        const singleStories =
          (data.singlePlayerStories as SavedStory[] | undefined) ??
          (data.stories || []).filter(
            (story: any) => !(story.isMultiplayer || story.roomCode),
          )
        const multiStories =
          (data.multiplayerStories as SavedStory[] | undefined) ??
          (data.stories || []).filter((story: any) => story.isMultiplayer || story.roomCode)

        setSinglePlayerStories(singleStories || [])
        setMultiplayerStories(multiStories || [])
        setPersonalityResult(data.personality || null)
        setDashboardSnippet(data.player_context?.dashboard_snippet || null)

        if (data.user?.id && userIdFromRoute && data.user.id !== userIdFromRoute) {
          router.replace(`/dashboard/${data.user.id}`)
          return
        }

        const loadedStats = await fetchUserStats()
        setStats(loadedStats)
      } catch (err) {
        console.error("Failed to load dashboard:", err)
        window.location.href = "/auth/login"
      } finally {
        setIsLoading(false)
      }
    }

    void init()
  }, [userIdFromRoute, router])

  const handleDeleteStory = async (id: string, options?: { isMultiplayer?: boolean }) => {
    if (!currentUser) return
    if (!confirm("Are you sure you want to delete this story?")) return

    try {
      const res = await fetch(`/api/stories/${id}`, { method: "DELETE" })
      if (!res.ok) {
        toast.error("Failed to delete story")
        return
      }

      if (options?.isMultiplayer) {
        setMultiplayerStories((prev) => prev.filter((s) => (s as any)._id !== id && s.id !== id))
      } else {
        setSinglePlayerStories((prev) => prev.filter((s) => (s as any)._id !== id && s.id !== id))
      }

      toast.success("Story deleted")
    } catch (err) {
      console.error("Delete story error", err)
      toast.error("Failed to delete story")
    }
  }

  const handlePlayStory = (_story: Story) => {
    // Story playback handled by route
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch (err) {
      console.error("Logout error", err)
    } finally {
      localStorage.clear()
      window.location.href = "/"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f4e4bc] dark:bg-[#1a0b05] flex items-center justify-center transition-colors">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          >
            <Feather className="w-12 h-12 text-[#8b4513] dark:text-[#d4af37]" />
          </motion.div>
          <p className="text-[#8b4513] dark:text-[#d4af37] mt-4 font-serif italic">Opening your library...</p>
        </div>
      </div>
    )
  }

  const levelProgress = ((stats.xp % 100) / 100) * 100
  return (
    <div className="min-h-screen bg-parchment dark:bg-[#1a0b05] relative overflow-x-hidden text-[#2a1a10] dark:text-[#d4af37] transition-colors duration-300">
      {/* Background Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-50 z-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] dark:bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] dark:opacity-30 mix-blend-multiply dark:mix-blend-soft-light transition-all"></div>

      {/* Header */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#f4e4bc]/95 dark:bg-[#1a0b05]/95 backdrop-blur-md border-b-4 border-double border-[#d4af37]/30 shadow-sm transition-colors"
      >
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-[#8b4513] dark:text-[#d4af37]" />
          <span className="text-xl font-serif font-bold text-[#2a1a10] dark:text-[#d4af37] tracking-tight">And Then?</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:block text-sm text-[#5c4033] dark:text-[#d4af37]/70 font-serif italic max-w-md text-center">
            "{quote}"
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-serif text-[#8b4513] dark:text-[#d4af37] hover:text-[#d4af37] transition-colors flex items-center gap-2 border border-[#d4af37]/20 rounded-md bg-[#f4e4bc]/50 dark:bg-[#2a1a10]/50"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Close Book</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 relative z-10">

        {/* Book Binding Visual Effect */}
        <div className="hidden lg:block fixed left-0 top-32 bottom-0 w-12 bg-gradient-to-r from-[#2a1a10]/10 to-transparent pointer-events-none fade-out-mask"></div>

        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-start justify-between mb-12 gap-6 border-b border-[#d4af37]/20 pb-8"
          >
            <div>
              <h1 className="text-5xl font-serif font-bold mb-4 text-[#2a1a10] dark:text-[#d4af37] drop-shadow-sm">Welcome, Storyteller</h1>
              <p className="text-xl text-[#5c4033] dark:text-[#d4af37]/80 font-serif italic leading-relaxed max-w-2xl border-l-4 border-[#d4af37]/40 pl-4 py-1">
                {dashboardSnippet || "The pen is in your hand. What tale will you weave today?"}
              </p>
            </div>

            <StorytellerCard className="min-w-[200px] text-center bg-[#fff8e7] dark:bg-[#2a1a10]">
              <Trophy className="w-8 h-8 text-[#d4af37] mx-auto mb-2 drop-shadow-sm" />
              <div className="text-3xl font-serif font-bold text-[#2a1a10] dark:text-[#d4af37]">Level {stats.level}</div>
              <div className="text-xs text-[#8b4513] dark:text-[#d4af37]/70 font-serif uppercase tracking-widest mt-1">Mastery</div>
            </StorytellerCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }} className="mb-12 max-w-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-serif italic text-[#5c4033] dark:text-[#d4af37]/70">
                Journey to Chapter {stats.level + 1}
              </span>
              <span className="text-sm font-serif font-bold text-[#8b4513] dark:text-[#d4af37]">{stats.xp % 100} / 100 XP</span>
            </div>
            <div className="relative h-3 bg-[#e6d2a0]/30 dark:bg-[#d4af37]/10 rounded-full overflow-hidden border border-[#d4af37]/30">
              <div
                className="absolute top-0 left-0 h-full bg-[#d4af37] transition-all duration-1000 ease-out"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: BookOpen, value: stats.storiesCompleted, label: "Tales Finished" },
              { icon: Feather, value: stats.choicesMade, label: "Words Written" },
              { icon: Award, value: stats.badges.length, label: "Honors" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
              >
                <StorytellerCard className="text-center py-8 hover:-translate-y-1 transition-transform cursor-default bg-white/60 dark:bg-[#2a1a10]/60">
                  <stat.icon className="w-8 h-8 text-[#8b4513] dark:text-[#d4af37] mx-auto mb-3" />
                  <div className="text-3xl font-serif font-bold text-[#2a1a10] dark:text-[#d4af37] mb-1">{stat.value}</div>
                  <div className="text-xs font-serif uppercase tracking-widest text-[#5c4033] dark:text-[#d4af37]/60">{stat.label}</div>
                </StorytellerCard>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            { href: "/stories/new", icon: Plus, title: "Draft New Story", description: "Begin a new adventure" },
            { href: "/stories/multiplayer", icon: Users, title: "Collaborate", description: "Write with friends" },
            {
              href: currentUser ? `/test/results/${currentUser.id}` : "/test/results",
              icon: BarChart3,
              title: "Your Archetype",
              description: "View your character traits",
            },
            { href: "/test", icon: BookOpen, title: "Retake Analysis", description: "Discover yourself anew" },
          ].map((action, index) => (
            <Link key={index} href={action.href}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="h-full"
              >
                <StorytellerCard className="text-center h-full group hover:bg-[#fffcf5] dark:hover:bg-[#2a1a10]/80 transition-colors border-light">
                  <div className="w-12 h-12 rounded-full bg-[#f4e4bc] dark:bg-[#1a0b05] flex items-center justify-center mx-auto mb-4 border border-[#d4af37]/30 group-hover:scale-110 transition-transform">
                    <action.icon className="w-6 h-6 text-[#8b4513] dark:text-[#d4af37]" />
                  </div>
                  <h3 className="text-lg font-serif font-bold mb-2 text-[#2a1a10] dark:text-[#d4af37]">{action.title}</h3>
                  <p className="text-sm text-[#5c4033] dark:text-[#d4af37]/70 font-serif italic">{action.description}</p>
                </StorytellerCard>
              </motion.div>
            </Link>
          ))}
        </div>

        <div className="border-t border-[#d4af37]/20 pt-12">
          <h2 className="text-3xl font-serif font-bold mb-8 text-[#2a1a10] dark:text-[#d4af37] flex items-center gap-3">
            <Feather className="w-6 h-6 text-[#d4af37]" />
            Your Library
          </h2>

          {singlePlayerStories.length === 0 ? (
            <StorytellerCard className="py-12 px-6">
              <div className="text-center">
                <p className="text-[#5c4033] dark:text-[#d4af37] mb-8 font-serif italic text-lg">
                  Every great library starts with a single book. Yours is waiting to be written.
                </p>
                <Link href="/stories/new">
                  <NeonButton glowColor="gold">Start Writing</NeonButton>
                </Link>
              </div>
            </StorytellerCard>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {singlePlayerStories.map((story, i) => {
                const genre = STORY_GENRES.find((g) => g.id === story.genre)
                return (
                  <motion.div
                    key={(story as any)._id || story.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <StorytellerCard className={`flex flex-col h-full hover:shadow-book transition-all hover:-translate-y-1 bg-white/80 dark:bg-[#2a1a10]/80 ${genre?.id === 'fantasy' ? 'border-[#8b4513] border-2 border-double' :
                      genre?.id === 'scifi' ? 'border-cyan-500/50 border-2' :
                        genre?.id === 'mystery' ? 'border-slate-600/50 border-2 border-dashed' :
                          genre?.id === 'romance' ? 'border-pink-400/50 border-2' :
                            genre?.id === 'adventure' ? 'border-emerald-600/50 border-2 border-dotted' :
                              'border-light'
                      }`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className={`text-3xl opacity-80 filter drop-shadow-sm ${genre?.id === 'fantasy' ? 'text-[#8b4513]' :
                          genre?.id === 'scifi' ? 'text-cyan-600' :
                            genre?.id === 'mystery' ? 'text-slate-700' :
                              genre?.id === 'romance' ? 'text-pink-600' :
                                genre?.id === 'adventure' ? 'text-emerald-700' :
                                  'text-[#8b4513]'
                          }`}>{genre?.icon}</div>
                        <motion.button
                          whileHover={{ scale: 1.1, rotate: 10 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteStory(((story as any)._id || story.id) as string)}
                          className="text-[#8b4513]/50 hover:text-red-500/70 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>

                      <h3 className="text-xl font-serif font-bold mb-2 text-[#2a1a10] dark:text-[#d4af37] line-clamp-2 leading-tight">
                        {story.title}
                      </h3>
                      <div className="inline-block px-2 py-0.5 rounded-sm bg-[#e6d2a0]/30 border border-[#d4af37]/20 text-xs font-serif uppercase tracking-wider text-[#8b4513] dark:text-[#d4af37] mb-4 self-start">
                        {genre?.name}
                      </div>

                      <div className="mt-auto pt-4 flex flex-col gap-4">
                        <div className="flex items-center justify-between text-xs text-[#5c4033] dark:text-[#d4af37]/70 font-serif border-t border-[#d4af37]/20 pt-3">
                          <span>Chapter {story.currentChoiceIndex + 1}</span>
                          <span>{new Date(story.createdAt).toLocaleDateString()}</span>
                        </div>

                        <Link href={`/stories/play/${(story as any)._id || story.id}`} onClick={() => handlePlayStory(story)}>
                          <NeonButton glowColor="gold" className="w-full text-sm py-2">
                            Continue Tale
                          </NeonButton>
                        </Link>
                      </div>
                    </StorytellerCard>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

        {/* Multiplayer library */}
        <div className="mt-16 border-t border-[#d4af37]/20 pt-12">
          <h2 className="text-3xl font-serif font-bold mb-8 text-[#2a1a10] dark:text-[#d4af37] flex items-center gap-3">
            <Users className="w-6 h-6 text-[#d4af37]" />
            Fellowship Library
          </h2>

          {multiplayerStories.length === 0 ? (
            <StorytellerCard className="py-10 px-6 bg-white/70 dark:bg-[#1a0b05]/70">
              <div className="text-center space-y-4">
                <p className="text-[#5c4033] dark:text-[#d4af37] font-serif italic text-lg">
                  No shared tales yet. Gather your guild and begin a room.
                </p>
                <Link href="/stories/multiplayer">
                  <NeonButton glowColor="gold">Join or Host a Room</NeonButton>
                </Link>
              </div>
            </StorytellerCard>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {multiplayerStories.map((story, i) => {
                const genre = STORY_GENRES.find((g) => g.id === story.genre)
                const roomCode = (story as any).roomCode
                return (
                  <motion.div
                    key={(story as any)._id || story.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <StorytellerCard className={`flex flex-col h-full bg-white/75 dark:bg-[#2a1a10]/75 hover:shadow-book transition-all hover:-translate-y-1 ${
                      genre?.id === "fantasy"
                        ? "border-[#8b4513] border-2 border-double"
                        : genre?.id === "scifi"
                          ? "border-cyan-500/50 border-2"
                          : genre?.id === "mystery"
                            ? "border-slate-600/50 border-2 border-dashed"
                            : genre?.id === "romance"
                              ? "border-pink-400/50 border-2"
                              : genre?.id === "adventure"
                                ? "border-emerald-600/50 border-2 border-dotted"
                                : "border-light"
                    }`}>
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={`text-3xl opacity-80 filter drop-shadow-sm ${
                            genre?.id === "fantasy"
                              ? "text-[#8b4513]"
                              : genre?.id === "scifi"
                                ? "text-cyan-600"
                                : genre?.id === "mystery"
                                  ? "text-slate-700"
                                  : genre?.id === "romance"
                                    ? "text-pink-600"
                                    : genre?.id === "adventure"
                                      ? "text-emerald-700"
                                      : "text-[#8b4513]"
                          }`}
                        >
                          {genre?.icon}
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1, rotate: 10 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() =>
                            handleDeleteStory(((story as any)._id || story.id) as string, {
                              isMultiplayer: true,
                            })
                          }
                          className="text-[#8b4513]/50 hover:text-red-500/70 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>

                      <h3 className="text-xl font-serif font-bold mb-2 text-[#2a1a10] dark:text-[#d4af37] line-clamp-2 leading-tight">
                        {story.title}
                      </h3>
                      <div className="inline-block px-2 py-0.5 rounded-sm bg-[#e6d2a0]/30 border border-[#d4af37]/20 text-xs font-serif uppercase tracking-wider text-[#8b4513] dark:text-[#d4af37] mb-2 self-start">
                        {genre?.name}
                      </div>
                      {roomCode && (
                        <div className="px-2 py-1 rounded-sm bg-[#d4af37]/10 border border-[#d4af37]/30 text-[11px] font-serif uppercase tracking-wider text-[#8b4513] dark:text-[#d4af37] mb-3">
                          Room: {roomCode}
                        </div>
                      )}

                      <div className="mt-auto pt-4 flex flex-col gap-4">
                        <div className="flex items-center justify-between text-xs text-[#5c4033] dark:text-[#d4af37]/70 font-serif border-t border-[#d4af37]/20 pt-3">
                          <span>Chapter {story.currentChoiceIndex + 1}</span>
                          <span>{new Date((story as any).createdAt || story.createdAt).toLocaleDateString()}</span>
                        </div>

                        <Link href={`/stories/multiplayer/room/${(roomCode || "").toUpperCase()}`}>
                          <NeonButton glowColor="gold" className="w-full text-sm py-2">
                            <DoorOpen className="w-4 h-4 mr-2" />
                            Rejoin Room
                          </NeonButton>
                        </Link>
                      </div>
                    </StorytellerCard>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

        {personalityResult && (
          <div className="mt-24 pt-12 border-t-2 border-[#d4af37]/20">
            <div className="flex items-center gap-3 mb-8">
              <Award className="w-6 h-6 text-[#d4af37]" />
              <h2 className="text-3xl font-serif font-bold text-[#2a1a10] dark:text-[#d4af37]">Your Archetype</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <StorytellerCard className="h-full bg-white/60 dark:bg-[#2a1a10]/60">
                <h3 className="text-sm font-serif uppercase tracking-widest text-[#8b4513] dark:text-[#d4af37]/80 mb-4 border-b border-[#d4af37]/20 pb-2">Profile Summary</h3>
                <p className="text-[#2a1a10] dark:text-[#d4af37] font-serif leading-relaxed italic">"{personalityResult.summary}"</p>
                <div className="mt-6">
                  <Link href={currentUser ? `/test/results/${currentUser.id}` : "/test/results"}>
                    <NeonButton glowColor="gold" className="w-full">
                      Full Analysis
                    </NeonButton>
                  </Link>
                </div>
              </StorytellerCard>

              {stats.badges.length > 0 && (
                <StorytellerCard className="h-full bg-white/60 dark:bg-[#2a1a10]/60">
                  <h3 className="text-sm font-serif uppercase tracking-widest text-[#8b4513] dark:text-[#d4af37] mb-4 border-b border-[#d4af37]/20 pb-2">Recent Honors</h3>
                  <div className="grid grid-cols-4 gap-4">
                    {stats.badges.map((badge) => (
                      <div key={badge.id} className="text-center group">
                        <div className="w-12 h-12 rounded-full bg-[#f4e4bc] dark:bg-[#1a0b05] border border-[#d4af37]/40 flex items-center justify-center mx-auto mb-2 text-xl shadow-sm group-hover:scale-110 transition-transform">
                          {badge.icon}
                        </div>
                        <div className="text-[10px] text-[#5c4033] dark:text-[#d4af37]/70 font-serif leading-tight">{badge.name}</div>
                      </div>
                    ))}
                  </div>
                </StorytellerCard>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { NeonButton } from "@/components/ui/neon-button"
import { NeonCard } from "@/components/ui/neon-card"
import { HUDPanel } from "@/components/ui/hud-panel"
import { AnimatedGrid } from "@/components/ui/animated-grid"
import { Progress } from "@/components/ui/progress"
import { type Story, STORY_GENRES, type PersonalityResult } from "@/lib/story-data"
import { getDefaultUserStats, fetchUserStats, type UserStats } from "@/lib/gamification"
import { BookOpen, Plus, Trash2, Play, BarChart3, LogOut, Award, Zap, Trophy } from "lucide-react"

interface CurrentUser {
  id: string
  username: string
  email: string
}

interface DashboardApiResponse {
  meta?: {
    routes_protected: boolean
    schema_version?: string
  }
  player_context?: {
    userId: string
    userProfile: {
      character_name: string
      preferred_language: string
      preferences: {
        top_genre?: string | null
        top_trait?: string | null
      }
    }
    dashboard_snippet: string
  }
  user: CurrentUser
  stories: Story[]
  personality: PersonalityResult | null
}

export default function DashboardPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const userIdFromRoute = params?.id

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [savedStories, setSavedStories] = useState<Story[]>([])
  const [personalityResult, setPersonalityResult] = useState<PersonalityResult | null>(null)
  const [stats, setStats] = useState<UserStats>(getDefaultUserStats())
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardSnippet, setDashboardSnippet] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      try {
        if (!userIdFromRoute) {
          window.location.href = "/auth/login"
          return
        }

        // Fetch dashboard data for the authenticated user; server determines the user from the JWT cookie.
        const res = await fetch("/api/dashboard")
        if (!res.ok) {
          window.location.href = "/auth/login"
          return
        }

        const data: DashboardApiResponse = await res.json()

        setCurrentUser(data.user)
        setSavedStories(data.stories || [])
        setPersonalityResult(data.personality || null)
        setDashboardSnippet(data.player_context?.dashboard_snippet || null)

        // If the URL id does not match the authenticated user's id, canonicalize the route.
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

  const handleDeleteStory = async (id: string) => {
    if (!currentUser) return
    if (!confirm("Are you sure you want to delete this story?")) return

    try {
      const res = await fetch(`/api/stories/${id}`, { method: "DELETE" })
      if (!res.ok) {
        alert("Failed to delete story")
        return
      }
      const updated = savedStories.filter((s) => (s as any)._id !== id && s.id !== id)
      setSavedStories(updated)
    } catch (err) {
      console.error("Delete story error", err)
      alert("Failed to delete story")
    }
  }

  const handlePlayStory = (_story: Story) => {
    // Story playback is now fully Mongo-backed via /stories/play/[id]. No local storage needed.
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          >
            {/* spinner placeholder */}
          </motion.div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const levelProgress = ((stats.xp % 100) / 100) * 100

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="fixed inset-0 z-0">
        <motion.div
          style={{
            backgroundImage: "url('/cyberpunk-neon-city-skyline-night.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="absolute inset-0 opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/80 to-background/95" />
      </div>

      <AnimatedGrid />

      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6 px-8 py-4 bg-card/20 backdrop-blur-2xl border border-primary/30 rounded-full glow-violet"
      >
        <div className="flex items-center gap-2">
          {/* <BookOpen className="w-5 h-5 text-primary" /> */}
          <span className="text-lg font-display font-bold text-glow-violet">AND-THEN?</span>
        </div>
        <div className="w-px h-6 bg-primary/30" />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="px-4 py-2 text-sm font-display uppercase tracking-wider text-foreground/80 hover:text-primary transition-colors flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </motion.button>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-32 relative z-10">
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start justify-between mb-8"
          >
            <div>
              <h1 className="text-5xl font-display font-bold mb-3 text-glow-violet">WELCOME BACK</h1>
              <p className="text-lg text-foreground/60">
                {dashboardSnippet || "Continue your adventures or start a new story"}
              </p>
            </div>

            <HUDPanel className="min-w-[140px]">
              <div className="text-center">
                <Trophy className="w-10 h-10 text-primary mx-auto mb-3 drop-shadow-[0_0_10px_rgba(147,51,234,0.8)]" />
                <div className="text-3xl font-display font-bold text-primary text-glow-violet">LVL {stats.level}</div>
                <div className="text-xs text-foreground/60 font-display uppercase tracking-wider">{stats.xp} XP</div>
              </div>
            </HUDPanel>
          </motion.div>

          <motion.div initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }} className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-display uppercase tracking-wider text-foreground/60">
                Progress to Level {stats.level + 1}
              </span>
              <span className="text-sm font-display font-bold text-primary">{stats.xp % 100} / 100 XP</span>
            </div>
            <div className="relative">
              <Progress value={levelProgress} className="h-4 border border-primary/30" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-pulse pointer-events-none" />
            </div>
          </motion.div>

          <div className="grid grid-cols-3 gap-6">
            {[
              { icon: BookOpen, value: stats.storiesCompleted, label: "Stories", color: "violet" as const },
              { icon: Zap, value: stats.choicesMade, label: "Choices", color: "cyan" as const },
              { icon: Award, value: stats.badges.length, label: "Badges", color: "blue" as const },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
              >
                <NeonCard glowColor={stat.color} className="text-center">
                  <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                  <div className="text-3xl font-display font-bold text-primary mb-1">{stat.value}</div>
                  <div className="text-xs font-display uppercase tracking-wider text-foreground/60">{stat.label}</div>
                </NeonCard>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            { href: "/stories/new", icon: Plus, title: "NEW STORY", description: "Generate a personalized story" },
            {
              href: currentUser ? `/test/results/${currentUser.id}` : "/test/results",
              icon: BarChart3,
              title: "YOUR PROFILE",
              description: "View your personality traits",
            },
            { href: "/test", icon: BookOpen, title: "RETAKE TEST", description: "Update your personality profile" },
          ].map((action, index) => (
            <Link key={index} href={action.href}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <NeonCard glowColor="violet" className="text-center h-full cursor-pointer">
                  <action.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-display font-bold mb-2 uppercase tracking-wide">{action.title}</h3>
                  <p className="text-sm text-foreground/60">{action.description}</p>
                </NeonCard>
              </motion.div>
            </Link>
          ))}
        </div>

        <div>
          <h2 className="text-3xl font-display font-bold mb-8 text-glow-violet uppercase">YOUR STORIES</h2>

          {savedStories.length === 0 ? (
            <HUDPanel>
              <div className="text-center py-8">
                {/* <BookOpen className="w-16 h-16 text-foreground/30 mx-auto mb-6" /> */}
                <p className="text-foreground/60 mb-8 font-display uppercase tracking-wide">
                  No stories yet. Create your first story to begin!
                </p>
                <Link href="/stories/new">
                  <NeonButton glowColor="violet">Create Your First Story</NeonButton>
                </Link>
              </div>
            </HUDPanel>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedStories.map((story) => {
                const genre = STORY_GENRES.find((g) => g.id === story.genre)
                return (
                    <NeonCard key={(story as any)._id || story.id} glowColor="violet">
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-4xl">{genre?.icon}</div>
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteStory(((story as any)._id || story.id) as string)}
                        className="text-foreground/50 hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </motion.button>
                    </div>

                    <h3 className="text-lg font-display font-bold mb-2 line-clamp-2 uppercase">{story.title}</h3>
                    <p className="text-sm text-foreground/60 mb-4 font-display uppercase tracking-wide">
                      {genre?.name}
                    </p>

                    <div className="flex items-center justify-between text-xs text-foreground/50 mb-6 font-display uppercase">
                      <span>Chapter {story.currentChoiceIndex + 1}</span>
                      <span>{new Date(story.createdAt).toLocaleDateString()}</span>
                    </div>

                    <Link href={`/stories/play/${(story as any)._id || story.id}`} onClick={() => handlePlayStory(story)}>
                      <NeonButton glowColor="cyan" className="w-full text-sm">
                        <Play className="w-4 h-4 mr-2" />
                        Continue
                      </NeonButton>
                    </Link>
                  </NeonCard>
                )
              })}
            </div>
          )}
        </div>

        {personalityResult && (
          <div className="mt-16 pt-16 border-t border-primary/20">
            <h2 className="text-3xl font-display font-bold mb-8 text-glow-violet uppercase">YOUR PERSONALITY</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <HUDPanel title="PROFILE SUMMARY">
                <p className="text-foreground/70 mb-6 leading-relaxed">{personalityResult.summary}</p>
                <Link href={currentUser ? `/test/results/${currentUser.id}` : "/test/results"}>
                  <NeonButton glowColor="violet" className="w-full">
                    View Full Profile
                  </NeonButton>
                </Link>
              </HUDPanel>

              <HUDPanel title="TOP TRAITS">
                <div className="space-y-4">
                  {personalityResult.topTraits.map((trait) => (
                    <div key={trait} className="flex items-center justify-between">
                      <span className="text-sm font-display uppercase tracking-wider capitalize">{trait}</span>
                      <div className="text-lg font-display font-bold text-primary text-glow-violet">
                        {Math.round(personalityResult.scores[trait] || 0)}%
                      </div>
                    </div>
                  ))}
                </div>
              </HUDPanel>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

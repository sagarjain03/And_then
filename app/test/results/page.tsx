"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { NeonButton } from "@/components/ui/neon-button"
import { HUDPanel } from "@/components/ui/hud-panel"
import { AnimatedGrid } from "@/components/ui/animated-grid"
import { PERSONALITY_TRAITS, type PersonalityResult } from "@/lib/personality-data"
import { getUserStats } from "@/lib/gamification"
import { BookOpen, Sparkles, Award, ChevronRight } from "lucide-react"

export default function PersonalityResultsPage() {
  const router = useRouter()
  const [result, setResult] = useState<PersonalityResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState(getUserStats())

  useEffect(() => {
    const stored = localStorage.getItem("personalityResult")
    if (stored) {
      setResult(JSON.parse(stored))
    }
    setStats(getUserStats())
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
        <div className="fixed inset-0 z-0">
          <motion.div
            style={{
              backgroundImage: "url('/mystical-cosmic-energy-aura.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 2, 0],
            }}
            transition={{
              duration: 20,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className="absolute inset-0 opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/80 to-background/95" />
        </div>
        <AnimatedGrid />
        <div className="text-center relative z-10">
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.2, 1],
            }}
            transition={{
              rotate: { duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
              scale: { duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
            }}
          >
            <Sparkles className="w-16 h-16 text-primary mx-auto mb-6 drop-shadow-[0_0_20px_rgba(147,51,234,0.8)]" />
          </motion.div>
          <p className="text-foreground/60 font-display uppercase tracking-wider">Analyzing your personality...</p>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
        <div className="fixed inset-0 z-0">
          <div
            style={{
              backgroundImage: "url('/mystical-cosmic-energy-aura.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            className="absolute inset-0 opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/85 to-background/95" />
        </div>
        <AnimatedGrid />
        <HUDPanel className="w-full max-w-md relative z-10">
          <div className="text-center space-y-6 py-4">
            <p className="text-foreground/60 font-display uppercase tracking-wide">
              No results found. Please take the test first.
            </p>
            <Link href="/test">
              <NeonButton glowColor="violet" className="w-full">
                Take Personality Test
              </NeonButton>
            </Link>
          </div>
        </HUDPanel>
      </div>
    )
  }

  const topTraitObjects = result.topTraits.map((id) => PERSONALITY_TRAITS.find((t) => t.id === id)).filter(Boolean)

  return (
    <div className="min-h-screen bg-background py-12 px-4 relative overflow-hidden">
      <div className="fixed inset-0 z-0">
        <motion.div
          style={{
            backgroundImage: "url('/mystical-cosmic-energy-aura.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 2, 0],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="absolute inset-0 opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/80 to-background/95" />
      </div>
      <AnimatedGrid />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="flex justify-center mb-6"
          >
            <div className="w-20 h-20 rounded-lg bg-primary/10 flex items-center justify-center border-2 border-primary/30 glow-violet">
              <BookOpen className="w-10 h-10 text-primary" />
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-5xl font-display font-bold mb-6 text-glow-violet uppercase"
          >
            Your Personality Profile
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-foreground/60 max-w-3xl mx-auto leading-relaxed"
          >
            {result.summary}
          </motion.p>

          {/* Level Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 inline-flex items-center gap-3 px-6 py-3 bg-card/50 backdrop-blur-xl rounded-full border border-primary/30 glow-violet"
          >
            <Award className="w-5 h-5 text-primary" />
            <span className="text-sm font-display font-bold text-primary uppercase tracking-wider">
              Level {stats.level}
            </span>
            <span className="text-xs text-foreground/50 font-display">• {stats.xp} XP</span>
          </motion.div>
        </motion.div>

        {/* Top Traits */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {topTraitObjects.map((trait, index) => (
            <motion.div
              key={trait?.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.15 }}
            >
              <HUDPanel className="h-full">
                <div className="text-center">
                  <h3 className="text-xl font-display font-bold mb-3 uppercase tracking-wide">{trait?.name}</h3>
                  <p className="text-sm text-foreground/60 mb-6 leading-relaxed">{trait?.description}</p>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8 + index * 0.15, type: "spring" }}
                    className="text-5xl font-display font-bold text-primary text-glow-violet"
                  >
                    {Math.round(result.scores[trait?.id || ""] || 0)}%
                  </motion.div>
                </div>
              </HUDPanel>
            </motion.div>
          ))}
        </div>

        {/* All Traits */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}>
          <HUDPanel title="ALL PERSONALITY TRAITS" className="mb-16">
            <div className="space-y-6">
              {PERSONALITY_TRAITS.map((trait, index) => (
                <motion.div
                  key={trait.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 + index * 0.08 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-display font-bold uppercase tracking-wide">{trait.name}</span>
                    <span className="text-sm font-display text-primary text-glow-violet">
                      {Math.round(result.scores[trait.id] || 0)}%
                    </span>
                  </div>
                  <div className="relative w-full bg-card/50 rounded-full h-3 overflow-hidden border border-primary/30">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${result.scores[trait.id] || 0}%` }}
                      transition={{ delay: 1.2 + index * 0.08, duration: 1, ease: "easeOut" }}
                      className="bg-gradient-to-r from-primary via-secondary to-accent h-full rounded-full relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </HUDPanel>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="text-center space-y-6"
        >
          <p className="text-foreground/60 font-display uppercase tracking-wider">
            Ready to discover your personalized story?
          </p>
          <Link href="/dashboard">
            <NeonButton glowColor="violet" className="text-lg px-10 py-5">
              Start Your Story
              <ChevronRight className="w-6 h-6 ml-2 inline" />
            </NeonButton>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

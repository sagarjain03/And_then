"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { NeonButton } from "@/components/ui/neon-button"
import { StorytellerCard } from "@/components/ui/storyteller-card"
import { PERSONALITY_TRAITS, type PersonalityResult, type CharacterProfile } from "@/lib/personality-data"
import { getDefaultUserStats, fetchUserStats } from "@/lib/gamification"
import { BookOpen, Sparkles, Award, ChevronRight, Feather, Shield, Zap, Crown, Eye, Heart, Anchor } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

// Simple mapping for archetype icons
const ARCHETYPE_ICONS: Record<string, any> = {
  "The Hero": Shield,
  "The Creator": Zap,
  "The Ruler": Crown,
  "The Sage": Eye,
  "The Lover": Heart,
  "The Caregiver": Anchor,
  // Fallbacks
}

function CharacterSigil({ archetype, trait }: { archetype?: string, trait?: string }) {
  const Icon = (archetype && ARCHETYPE_ICONS[archetype]) || Sparkles

  return (
    <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
      {/* Outer Runic Circle */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        className="absolute inset-0 rounded-full border-[2px] border-dashed border-[#d4af37]/40 dark:border-[#d4af37]/20"
      />

      {/* Inner Decorative Circle */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        className="absolute inset-4 rounded-full border border-[#d4af37]/60 dark:border-[#d4af37]/30 border-dotted"
      />

      {/* The Sigil Container */}
      <div className="relative w-32 h-32 rounded-full bg-[#f4e4bc] dark:bg-[#2a1a10] border-4 border-[#8b4513] dark:border-[#d4af37] shadow-book flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/20 to-transparent" />

        {/* Main Icon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5, delay: 0.5 }}
        >
          <Icon className="w-16 h-16 text-[#8b4513] dark:text-[#d4af37] drop-shadow-md" />
        </motion.div>
      </div>

      {/* Floating Orb */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-[#d4af37] flex items-center justify-center border-2 border-[#fff8e7] dark:border-[#2a1a10] shadow-lg z-10"
      >
        <div className="text-white text-xs font-bold font-serif uppercase tracking-widest leading-none text-center">
          {trait?.slice(0, 3) || "ARC"}
        </div>
      </motion.div>
    </div>
  )
}

export default function PersonalityResultsByIdPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const userIdFromRoute = params?.id

  const [result, setResult] = useState<PersonalityResult | null>(null)
  const [character, setCharacter] = useState<CharacterProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState(getDefaultUserStats())

  useEffect(() => {
    const load = async () => {
      try {
        if (!userIdFromRoute) {
          router.replace("/auth/login")
          return
        }

        const profileRes = await fetch("/api/auth/profile")
        if (!profileRes.ok) {
          router.replace("/auth/login")
          return
        }
        const profile = (await profileRes.json()) as { id: string }
        if (!profile.id) {
          router.replace("/auth/login")
          return
        }
        if (profile.id !== userIdFromRoute) {
          router.replace(`/test/results/${profile.id}`)
          return
        }

        const res = await fetch("/api/personality", { cache: "no-store" })
        if (res.ok) {
          const data = (await res.json()) as { result: PersonalityResult | null }
          if (data.result) {
            setResult(data.result)
            if (data.result.character) {
              setCharacter(data.result.character)
            }
          }
        }
      } catch (err) {
        console.error("Failed to load personality result", err)
      } finally {
        const loadedStats = await fetchUserStats()
        setStats(loadedStats)
        setIsLoading(false)
      }
    }

    void load()
  }, [userIdFromRoute, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f4e4bc] dark:bg-[#1a0b05] flex items-center justify-center relative overflow-hidden transition-colors">
        <div className="text-center relative z-10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          >
            <Feather className="w-12 h-12 text-[#8b4513] dark:text-[#d4af37] mx-auto mb-6" />
          </motion.div>
          <p className="text-[#8b4513] dark:text-[#d4af37] font-serif italic tracking-wider">Consulting the archives...</p>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-parchment dark:bg-[#1a0b05] flex items-center justify-center px-4 relative overflow-hidden transition-colors">
        <div className="fixed inset-0 pointer-events-none opacity-50 z-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] dark:bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] dark:opacity-30 mix-blend-multiply dark:mix-blend-soft-light transition-all"></div>

        <StorytellerCard className="w-full max-w-md relative z-10 bg-white/80 dark:bg-[#2a1a10]/80">
          <div className="text-center space-y-6 py-4">
            <p className="text-[#5c4033] dark:text-[#d4af37] font-serif uppercase tracking-wide">
              No results found. The pages are blank.
            </p>
            <Link href="/test">
              <NeonButton glowColor="gold" className="w-full">
                Take Personality Test
              </NeonButton>
            </Link>
          </div>
        </StorytellerCard>
      </div>
    )
  }

  const topTraitObjects = result.topTraits.map((id) => PERSONALITY_TRAITS.find((t) => t.id === id)).filter(Boolean)
  const primaryTrait = topTraitObjects[0]?.name

  return (
    <div className="min-h-screen bg-parchment dark:bg-[#1a0b05] py-12 px-4 relative overflow-x-hidden text-[#2a1a10] dark:text-[#d4af37] transition-colors duration-300">
      {/* Background Texture */}
      <div className="fixed inset-0 pointer-events-none opacity-50 z-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] dark:bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] dark:opacity-30 mix-blend-multiply dark:mix-blend-soft-light transition-all"></div>

      {/* Persistent Header with Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header Section */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="flex justify-center mb-8"
          >
            <CharacterSigil archetype={character?.archetype} trait={primaryTrait} />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-5xl font-serif font-bold mb-6 text-[#2a1a10] dark:text-[#d4af37] uppercase tracking-wider drop-shadow-sm"
          >
            Your Character Profile
          </motion.h1>

          <div className="max-w-3xl mx-auto relative px-8 py-6">
            {/* Quote decoration */}
            <div className="absolute top-0 left-0 text-6xl text-[#d4af37]/20 font-serif leading-none">“</div>
            <div className="absolute bottom-0 right-0 text-6xl text-[#d4af37]/20 font-serif leading-none rotate-180">“</div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-2xl text-[#5c4033] dark:text-[#d4af37]/80 font-serif italic leading-relaxed"
            >
              {result.summary}
            </motion.p>
          </div>

          {/* Level Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 inline-flex items-center gap-3 px-6 py-3 bg-[#fff8e7] dark:bg-[#2a1a10] rounded-full border border-[#d4af37]/30 shadow-sm"
          >
            <Award className="w-5 h-5 text-[#d4af37]" />
            <span className="text-sm font-serif font-bold text-[#2a1a10] dark:text-[#d4af37] uppercase tracking-wider">
              Level {stats.level}
            </span>
            <span className="text-xs text-[#8b4513] dark:text-[#d4af37]/60 font-serif">• {stats.xp} XP</span>
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
              <StorytellerCard className="h-full bg-white/60 dark:bg-[#2a1a10]/60 hover:-translate-y-1 transition-transform border-light">
                <div className="text-center">
                  <h3 className="text-xl font-serif font-bold mb-3 uppercase tracking-wide text-[#2a1a10] dark:text-[#d4af37]">{trait?.name}</h3>
                  <p className="text-sm text-[#5c4033] dark:text-[#d4af37]/70 mb-6 leading-relaxed font-serif italic">{trait?.description}</p>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8 + index * 0.15, type: "spring" }}
                    className="text-5xl font-serif font-bold text-[#d4af37]"
                  >
                    {Math.round(result.scores[trait?.id || ""] || 0)}%
                  </motion.div>
                </div>
              </StorytellerCard>
            </motion.div>
          ))}
        </div>

        {/* Gemini Character */}
        {character && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mb-16"
          >
            <StorytellerCard className="bg-[#fff8e7] dark:bg-[#2a1a10] border-light">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-[#d4af37]" />
                <h3 className="text-lg font-serif uppercase tracking-widest text-[#8b4513] dark:text-[#d4af37]">Your Story Persona</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-3xl font-serif font-bold mb-2 text-[#2a1a10] dark:text-[#d4af37]">{character.name}</h3>
                  <p className="text-xs text-[#8b4513]/70 dark:text-[#d4af37]/60 uppercase tracking-wider mb-1 font-serif">
                    Origin: {character.anime || "Unknown Myth"}
                  </p>
                  <p className="text-sm text-[#5c4033] dark:text-[#d4af37]/80 uppercase tracking-wider font-serif font-bold">
                    {character.archetype} • {character.role}
                  </p>
                </div>
                <p className="text-[#2a1a10] dark:text-[#d4af37] leading-relaxed font-serif text-lg">{character.description}</p>
                <div className="grid md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-[#d4af37]/20">
                  <div>
                    <h4 className="text-sm font-serif uppercase tracking-wider text-[#8b4513] dark:text-[#d4af37] mb-2 font-bold">
                      Strengths
                    </h4>
                    <ul className="list-disc list-inside text-sm text-[#2a1a10] dark:text-[#d4af37]/80 space-y-1 font-serif">
                      {character.strengths.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-serif uppercase tracking-wider text-[#8b4513] dark:text-[#d4af37] mb-2 font-bold">
                      Weaknesses
                    </h4>
                    <ul className="list-disc list-inside text-sm text-[#2a1a10] dark:text-[#d4af37]/80 space-y-1 font-serif">
                      {character.weaknesses.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                {character.preferredGenres.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[#d4af37]/20">
                    <h4 className="text-sm font-serif uppercase tracking-wider text-[#8b4513] dark:text-[#d4af37] mb-2 font-bold">
                      Ideally Suited For
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {character.preferredGenres.map((g) => (
                        <span
                          key={g}
                          className="px-3 py-1 rounded-full text-xs font-serif uppercase tracking-wider bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#8b4513] dark:text-[#d4af37]"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </StorytellerCard>
          </motion.div>
        )}

        {/* All Traits */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}>
          <div className="mb-4 flex items-center gap-2">
            <Feather className="w-5 h-5 text-[#d4af37]" />
            <h3 className="text-xl font-serif font-bold text-[#2a1a10] dark:text-[#d4af37] uppercase tracking-wide">Full Analysis</h3>
          </div>
          <StorytellerCard className="mb-16 bg-white/60 dark:bg-[#2a1a10]/60 border-light">
            <div className="space-y-6">
              {PERSONALITY_TRAITS.map((trait, index) => (
                <motion.div
                  key={trait.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 + index * 0.08 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-serif font-bold uppercase tracking-wide text-[#2a1a10] dark:text-[#d4af37]">{trait.name}</span>
                    <span className="text-sm font-serif text-[#d4af37] font-bold">
                      {Math.round(result.scores[trait.id] || 0)}%
                    </span>
                  </div>
                  <div className="relative w-full bg-[#2a1a10]/5 dark:bg-[#d4af37]/10 rounded-full h-3 overflow-hidden border border-[#d4af37]/20">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${result.scores[trait.id] || 0}%` }}
                      transition={{ delay: 1.2 + index * 0.08, duration: 1, ease: "easeOut" }}
                      className="bg-[#d4af37] h-full rounded-full relative"
                    >
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </StorytellerCard>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="text-center space-y-6 pb-12"
        >
          <p className="text-[#5c4033] dark:text-[#d4af37] font-serif uppercase tracking-wider italic">
            Ready to discover your personalized story?
          </p>
          <Link href="/dashboard">
            <NeonButton glowColor="gold" className="text-lg px-10 py-5">
              Start Your Story
              <ChevronRight className="w-6 h-6 ml-2 inline" />
            </NeonButton>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

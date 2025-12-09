"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { NeonButton } from "@/components/ui/neon-button"
import { StorytellerCard } from "@/components/ui/storyteller-card"
import { Progress } from "@/components/ui/progress"
// import { XPNotification } from "@/components/ui/xp-notification" // Disabled for theme consistency or needs restyling
// import { BadgeUnlock } from "@/components/ui/badge-unlock" // Disabled for theme consistency
import { PERSONALITY_QUESTIONS, calculatePersonalityScores, type CharacterProfile } from "@/lib/personality-data"
import { awardXP, unlockBadge, BADGES } from "@/lib/gamification"
import { BookOpen, Sparkles, Feather, ArrowRight, ArrowLeft } from "lucide-react"

export default function PersonalityTestPage() {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [responses, setResponses] = useState<Record<number, string>>({})
  const [isComplete, setIsComplete] = useState(false)
  // const [showXP, setShowXP] = useState(false)
  // const [xpAmount, setXpAmount] = useState(0)
  // const [showBadge, setShowBadge] = useState(false)
  // const [unlockedBadge, setUnlockedBadge] = useState<any>(null)
  const [isSavingResult, setIsSavingResult] = useState(false)

  const question = PERSONALITY_QUESTIONS[currentQuestion]
  const progress = ((currentQuestion + 1) / PERSONALITY_QUESTIONS.length) * 100

  const handleResponse = (optionLabel: string) => {
    const newResponses = { ...responses, [question.id]: optionLabel }
    setResponses(newResponses)

    // Award XP for answering (persisted per user in MongoDB)
    void awardXP(5, "Answered question")
    // setXpAmount(5)
    // setShowXP(true)

    if (currentQuestion < PERSONALITY_QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1)
      }, 300)
    } else {
      setIsComplete(true)
    }
  }

  const handleComplete = async () => {
    setIsSavingResult(true)

    const result = calculatePersonalityScores(responses)

    let character: CharacterProfile | null = null
    try {
      const res = await fetch("/api/character/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scores: result.scores,
          topTraits: result.topTraits,
          summary: result.summary,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        character = data.character as CharacterProfile
      }
    } catch (err) {
      console.error("Character generation failed", err)
    }

    const resultToStore = character ? { ...result, character } : result

    // Persist personality to MongoDB
    try {
      await fetch("/api/personality/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resultToStore),
      })
    } catch (err) {
      console.error("Failed to save personality to DB", err)
    }

    // Award completion XP and badge (persisted per user in MongoDB)
    void awardXP(50, "Completed personality test")
    const badgeUnlocked = await unlockBadge("first-test")

    // Resolve the authenticated user's id so we can navigate to /test/results/[id]
    let target = "/test/results"
    try {
      const profileRes = await fetch("/api/auth/profile")
      if (profileRes.ok) {
        const profile = (await profileRes.json()) as { id?: string }
        if (profile.id) {
          target = `/test/results/${profile.id}`
        }
      }
    } catch (err) {
      console.error("Failed to resolve profile for results redirect", err)
    }

    // if (badgeUnlocked) {
    //   const badge = BADGES.find((b) => b.id === "first-test")
    //   setUnlockedBadge(badge)
    //   setShowBadge(true)
    //   setTimeout(() => {
    //     router.push(target)
    //   }, 3500)
    // } else {
    router.push(target)
    // }

    setIsSavingResult(false)
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center px-4 relative overflow-hidden font-serif">
        {/* Background Texture */}
        <div className="fixed inset-0 pointer-events-none opacity-50 z-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')]"></div>
        {/* <BadgeUnlock show={showBadge} badge={unlockedBadge} /> */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 w-full max-w-md">
          <StorytellerCard className="w-full">
            <div className="text-center space-y-8 py-8">
              <motion.div
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 10,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear"
                }}
                className="w-24 h-24 rounded-full bg-[#f4e4bc] flex items-center justify-center mx-auto border-2 border-[#d4af37] shadow-book"
              >
                <Feather className="w-12 h-12 text-[#8b4513]" />
              </motion.div>
              <div>
                <h2 className="text-3xl font-bold mb-3 text-[#2a1a10] uppercase tracking-wide">The Ink is Dry</h2>
                <p className="text-[#5c4033] leading-relaxed italic">
                  We are interpreting your soul's resonance...
                </p>
              </div>
              <NeonButton onClick={handleComplete} glowColor="gold" className="w-full text-lg" disabled={isSavingResult}>
                {isSavingResult ? (
                  <span className="flex items-center gap-2">
                    <Feather className="w-4 h-4 animate-spin" />
                    Scrying...
                  </span>
                ) : "Reveal Your Archetype"}
              </NeonButton>
            </div>
          </StorytellerCard>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-parchment py-12 px-4 relative overflow-hidden font-serif text-[#2a1a10]">
      {/* Background Texture */}
      <div className="fixed inset-0 pointer-events-none opacity-50 z-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')]"></div>

      {/* <XPNotification show={showXP} amount={xpAmount} reason="Answered question" onComplete={() => setShowXP(false)} /> */}

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-[#8b4513]" />
              <span className="text-sm font-bold uppercase tracking-wider text-[#5c4033]">
                Query {currentQuestion + 1} of {PERSONALITY_QUESTIONS.length}
              </span>
            </div>
            <Link href="/dashboard" className="text-[#8b4513] hover:text-[#2a1a10] text-sm font-bold uppercase tracking-wider flex items-center gap-1 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Exit
            </Link>
          </div>
          <div className="relative">
            <Progress value={progress} className="h-2 bg-[#d4af37]/20 border border-[#d4af37]/30 [&>div]:bg-[#d4af37]" />
          </div>
        </motion.div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
          >
            <StorytellerCard className="mb-8 py-10 px-8 bg-white/90">
              <h2 className="text-3xl font-bold mb-10 text-balance leading-tight text-center text-[#fff8e7]">{question.text}</h2>

              <div className="space-y-4">
                {question.options.map((option, index) => (
                  <motion.button
                    key={option.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.01, x: 5 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleResponse(option.label)}
                    className={`w-full text-left p-6 rounded-lg border-2 transition-all relative group overflow-hidden ${responses[question.id] === option.label
                      ? "border-[#d4af37] bg-[#f4e4bc]/50"
                      : "border-[#d4af37]/20 hover:border-[#d4af37]/60 hover:bg-[#fff8e7]"
                      }`}
                  >
                    <div className={`absolute left-0 top-0 bottom-0 w-1 bg-[#d4af37] transition-transform duration-300 ${responses[question.id] === option.label ? 'scale-y-100' : 'scale-y-0 group-hover:scale-y-100'}`}></div>
                    <div className="flex gap-4 items-baseline">
                      <span className="font-bold text-[#8b4513] text-xl shrink-0 font-serif">{option.label}.</span>
                      <span className="text-[#5c4033] leading-relaxed text-lg italic">{option.text}</span>
                    </div>
                  </motion.button>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-8 pt-6 border-t border-[#d4af37]/20 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#d4af37]" />
                <p className="text-sm text-[#5c4033] italic font-bold uppercase tracking-wider">
                  Uncovers: {question.insight}
                </p>
                <Sparkles className="w-4 h-4 text-[#d4af37]" />
              </motion.div>
            </StorytellerCard>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4">
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="flex-1 py-4 border border-[#d4af37]/30 rounded-lg text-[#8b4513] font-bold uppercase tracking-wider hover:bg-[#fff8e7] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-serif"
          >
            Previous Scroll
          </button>
          <NeonButton
            glowColor="gold"
            onClick={() => {
              if (responses[question.id]) {
                if (currentQuestion < PERSONALITY_QUESTIONS.length - 1) {
                  setCurrentQuestion(currentQuestion + 1)
                } else {
                  setIsComplete(true)
                }
              }
            }}
            disabled={!responses[question.id]}
            className="flex-1"
          >
            {currentQuestion < PERSONALITY_QUESTIONS.length - 1 ? (
              <span className="flex items-center gap-2 justify-center">
                Next Page <ArrowRight className="w-4 h-4" />
              </span>
            ) : "Seal Your Fate"}
          </NeonButton>
        </motion.div>
      </div>
    </div>
  )
}

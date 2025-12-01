"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { NeonButton } from "@/components/ui/neon-button"
import { HUDPanel } from "@/components/ui/hud-panel"
import { AnimatedGrid } from "@/components/ui/animated-grid"
import { Progress } from "@/components/ui/progress"
import { XPNotification } from "@/components/ui/xp-notification"
import { BadgeUnlock } from "@/components/ui/badge-unlock"
import { PERSONALITY_QUESTIONS, calculatePersonalityScores, type CharacterProfile } from "@/lib/personality-data"
import { awardXP, unlockBadge, BADGES } from "@/lib/gamification"
import { BookOpen, Sparkles } from "lucide-react"

export default function PersonalityTestPage() {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [responses, setResponses] = useState<Record<number, string>>({})
  const [isComplete, setIsComplete] = useState(false)
  const [showXP, setShowXP] = useState(false)
  const [xpAmount, setXpAmount] = useState(0)
  const [showBadge, setShowBadge] = useState(false)
  const [unlockedBadge, setUnlockedBadge] = useState<any>(null)
  const [isSavingResult, setIsSavingResult] = useState(false)

  const question = PERSONALITY_QUESTIONS[currentQuestion]
  const progress = ((currentQuestion + 1) / PERSONALITY_QUESTIONS.length) * 100

  const handleResponse = (optionLabel: string) => {
    const newResponses = { ...responses, [question.id]: optionLabel }
    setResponses(newResponses)

    // Award XP for answering (persisted per user in MongoDB)
    void awardXP(5, "Answered question")
    setXpAmount(5)
    setShowXP(true)

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

    if (badgeUnlocked) {
      const badge = BADGES.find((b) => b.id === "first-test")
      setUnlockedBadge(badge)
      setShowBadge(true)
      setTimeout(() => {
        router.push(target)
      }, 3500)
    } else {
      router.push(target)
    }

    setIsSavingResult(false)
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
        <div className="fixed inset-0 z-0">
          <motion.div
            style={{
              backgroundImage: "url('/abstract-neural-network-brain-connections.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 15,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className="absolute inset-0 opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/85 to-background/95" />
        </div>
        <AnimatedGrid />
        <BadgeUnlock show={showBadge} badge={unlockedBadge} />
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10">
          <HUDPanel className="w-full max-w-md">
            <div className="text-center space-y-8 py-8">
              <motion.div
                animate={{
                  rotate: 360,
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  rotate: { duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
                  scale: { duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
                }}
                className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto border-2 border-primary/30 glow-violet"
              >
                <Sparkles className="w-10 h-10 text-primary" />
              </motion.div>
              <div>
                <h2 className="text-3xl font-display font-bold mb-3 text-glow-violet uppercase">Test Complete!</h2>
                <p className="text-foreground/60 leading-relaxed">
                  We're analyzing your personality to create your perfect story...
                </p>
              </div>
              <NeonButton onClick={handleComplete} glowColor="violet" className="w-full" disabled={isSavingResult}>
                {isSavingResult ? "Preparing your character..." : "View Your Results"}
              </NeonButton>
            </div>
          </HUDPanel>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4 relative overflow-hidden">
      <div className="fixed inset-0 z-0">
        <motion.div
          style={{
            backgroundImage: "url('/abstract-neural-network-brain-connections.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 15,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="absolute inset-0 opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/85 to-background/95" />
      </div>
      <AnimatedGrid />
      <XPNotification show={showXP} amount={xpAmount} reason="Answered question" onComplete={() => setShowXP(false)} />

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-6 h-6 text-primary" />
            <span className="text-sm font-display uppercase tracking-wider text-foreground/60">
              Question {currentQuestion + 1} / {PERSONALITY_QUESTIONS.length}
            </span>
          </div>
          <div className="relative">
            <Progress value={progress} className="h-3 border border-primary/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-pulse pointer-events-none" />
          </div>
        </motion.div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.4 }}
          >
            <HUDPanel className="mb-8">
              <h2 className="text-2xl font-display font-bold mb-8 text-balance leading-tight">{question.text}</h2>

              <div className="space-y-4">
                {question.options.map((option, index) => (
                  <motion.button
                    key={option.label}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 8 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleResponse(option.label)}
                    className={`w-full text-left p-5 rounded-lg border-2 transition-all ${
                      responses[question.id] === option.label
                        ? "border-primary bg-primary/10 glow-violet"
                        : "border-border hover:border-primary/50 hover:bg-card/50"
                    }`}
                  >
                    <div className="flex gap-4">
                      <span className="font-display font-bold text-primary text-xl shrink-0">{option.label})</span>
                      <span className="text-foreground leading-relaxed">{option.text}</span>
                    </div>
                  </motion.button>
                ))}
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-xs text-foreground/50 mt-8 italic font-display uppercase tracking-wider"
              >
                Insight: {question.insight}
              </motion.p>
            </HUDPanel>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4">
          <NeonButton
            glowColor="cyan"
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="flex-1"
          >
            Previous
          </NeonButton>
          <NeonButton
            glowColor="violet"
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
            {currentQuestion < PERSONALITY_QUESTIONS.length - 1 ? "Next" : "Complete"}
          </NeonButton>
        </motion.div>
      </div>
    </div>
  )
}

"use client"

import React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { NeonButton } from "@/components/ui/neon-button"
import { StorytellerCard } from "@/components/ui/storyteller-card"
import { STORY_GENRES } from "@/lib/story-data"
import type { PersonalityResult } from "@/lib/personality-data"
import { BookOpen, Loader2, ArrowLeft, Feather } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"

export default function NewStoryPage() {
  const router = useRouter()
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [personalityResult, setPersonalityResult] = useState<PersonalityResult | null>(null)

  // Load personality result from MongoDB
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/personality")
        if (!res.ok) return
        const data = (await res.json()) as { result: PersonalityResult | null }
        if (data.result) {
          setPersonalityResult(data.result)
        }
      } catch (err) {
        console.error("Failed to load personality for story generation", err)
      }
    }

    void load()
  }, [])

  const handleGenerateStory = async () => {
    if (!selectedGenre || !personalityResult) return

    setIsGenerating(true)
    try {
      const response = await fetch("/api/stories/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          genreId: selectedGenre,
          personalityTraits: personalityResult.scores,
          character: personalityResult.character,
        }),
      })

      if (!response.ok) throw new Error("Failed to generate story")

      const data = await response.json()

      const storyPayload = {
        title: `${STORY_GENRES.find((g) => g.id === selectedGenre)?.name} Adventure`,
        genre: selectedGenre,
        content: data.content,
        choices: data.choices,
        currentChoiceIndex: 0,
        personalityTraits: personalityResult.scores,
        character: personalityResult.character,
        isStoryComplete: data.isStoryComplete ?? false,
        choiceHistory: [],
      }

      // Persist initial story state to MongoDB and redirect to play view for that story
      const saveRes = await fetch("/api/stories/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ story: storyPayload }),
      })

      if (!saveRes.ok) throw new Error("Failed to save story")

      const saved = await saveRes.json()
      const storyId = saved.story?._id || saved.story?.id
      if (!storyId) throw new Error("Story ID missing from save response")

      router.push(`/stories/play/${storyId}`)
    } catch (error) {
      console.error("Error generating story:", error)
      toast.error("Failed to generate story. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  if (!personalityResult) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center px-4">
        <div className="fixed inset-0 pointer-events-none opacity-50 z-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')]"></div>
        <StorytellerCard className="w-full max-w-md relative z-10 bg-white/80">
          <div className="text-center space-y-6 py-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#f4e4bc] flex items-center justify-center border-2 border-[#d4af37]/30">
              <BookOpen className="w-8 h-8 text-[#8b4513]" />
            </div>
            <p className="text-[#5c4033] font-serif">Please complete your personality test first to unlock your story.</p>
            <Link href="/test">
              <NeonButton glowColor="gold" className="w-full">Take Personality Test</NeonButton>
            </Link>
          </div>
        </StorytellerCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-parchment py-12 px-4 relative overflow-x-hidden text-[#2a1a10]">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none opacity-50 z-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')]"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex justify-center mb-6"
          >
            <div className="w-20 h-20 rounded-full bg-[#f4e4bc] flex items-center justify-center border-2 border-[#d4af37]/30 shadow-book">
              <BookOpen className="w-10 h-10 text-[#8b4513]" />
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif font-bold mb-4 text-[#2a1a10]"
          >
            Choose Your Tale
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-[#5c4033] font-serif italic max-w-2xl mx-auto"
          >
            Select a genre, and the ink will begin to flow, weaving a story unique to your soul.
          </motion.p>
        </div>

        {/* Genre Selection */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {STORY_GENRES.map((genre, index) => (
            <motion.button
              key={genre.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              onClick={() => setSelectedGenre(genre.id)}
              className={`text-left group transition-all duration-300 transform perspective-1000`}
            >
              <StorytellerCard
                className={`h-full transition-all duration-300 ${selectedGenre === genre.id
                    ? "border-[#d4af37] ring-4 ring-[#d4af37]/20 scale-105 bg-white shadow-xl"
                    : "bg-white/60 hover:bg-white hover:-translate-y-2 hover:shadow-lg"
                  }`}
              >
                <div className="p-2">
                  <div className="text-4xl mb-4 transform transition-transform group-hover:scale-110 duration-300">{genre.icon}</div>
                  <h3 className="text-2xl font-serif font-bold mb-3 text-[#2a1a10] group-hover:text-[#8b4513] transition-colors">{genre.name}</h3>
                  <p className="text-sm text-[#5c4033] font-serif leading-relaxed line-clamp-3">{genre.description}</p>
                </div>
              </StorytellerCard>
            </motion.button>
          ))}
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          <Link href="/dashboard">
            <button className="flex items-center gap-2 text-[#5c4033] hover:text-[#2a1a10] font-serif font-bold uppercase tracking-wider transition-colors px-6 py-3 rounded-full hover:bg-[#2a1a10]/5">
              <ArrowLeft className="w-4 h-4" />
              Return to Archive
            </button>
          </Link>
          <NeonButton
            onClick={handleGenerateStory}
            disabled={!selectedGenre || isGenerating}
            glowColor="gold"
            className="text-lg px-12 py-4"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                Weaving Story...
              </>
            ) : (
              <>
                <Feather className="w-5 h-5 mr-3" />
                Begin Narrative
              </>
            )}
          </NeonButton>
        </motion.div>
      </div>
    </div>
  )
}

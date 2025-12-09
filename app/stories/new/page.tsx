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

  // New function for custom cover designs
  const getGenreCover = (id: string) => {
    switch (id) {
      case 'fantasy':
        return (
          <>
            {/* Fantasy: Mystical, Purple/Gold, Runes */}
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
            {/* Sci-Fi: High-tech, Blue/Cyan, Circuitry */}
            <div className="absolute inset-0 bg-[#0f2a36]/70 mix-blend-multiply"></div>
            <div className="absolute inset-0 opacity-40 bg-[linear-gradient(0deg,transparent_24%,rgba(0,255,255,.1)_25%,rgba(0,255,255,.1)_26%,transparent_27%,transparent_74%,rgba(0,255,255,.1)_75%,rgba(0,255,255,.1)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(0,255,255,.1)_25%,rgba(0,255,255,.1)_26%,transparent_27%,transparent_74%,rgba(0,255,255,.1)_75%,rgba(0,255,255,.1)_76%,transparent_77%,transparent)] bg-[size:30px_30px]"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/50 shadow-[0_0_10px_cyan]"></div>
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-cyan-500/50 rounded-br-xl"></div>
          </>
        )
      case 'mystery':
        return (
          <>
            {/* Mystery: Dark, Noir, Red/Black, Vignette */}
            <div className="absolute inset-0 bg-[#1a0505]/80 mix-blend-multiply"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#000000_100%)] opacity-80"></div>
            <div className="absolute w-full h-full border-y-[1px] border-[#5c1c1c]/40 top-0 left-0"></div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.5em] text-[#8b0000]/60 uppercase">Unsolved</div>
          </>
        )
      case 'romance':
        return (
          <>
            {/* Romance: Elegant, Red/Pink, Floral hints */}
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
            {/* Adventure: Rugged, Earth/Green, Map lines */}
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

      <div className="max-w-[1400px] mx-auto relative z-10 h-full flex flex-col">
        {/* Top Control Bar */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4 border-b border-[#d4af37]/20 pb-6 backdrop-blur-sm">
          <Link href="/dashboard">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3 px-6 py-3 bg-[#3a2012] hover:bg-[#4a2b18] text-[#d4af37] hover:text-[#f4e4bc] rounded-lg border border-[#d4af37] hover:border-[#d4af37] transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] font-serif uppercase tracking-widest text-sm"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Return to Archive</span>
            </motion.button>
          </Link>

          <div className="text-center relative z-10 max-w-lg mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-[#2a1a10] border-2 border-[#d4af37] rounded-2xl p-8 shadow-[0_10px_40px_rgba(0,0,0,0.5)] relative overflow-hidden group"
            >
              {/* Decorative inner border/inset look */}
              <div className="absolute inset-1 border border-[#d4af37]/20 rounded-xl pointer-events-none"></div>

              <div className="relative z-10 flex flex-col items-center">
                <BookOpen className="w-10 h-10 text-[#d4af37] mb-4 drop-shadow-md" strokeWidth={1.5} />

                <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#d4af37] mb-2 tracking-tight drop-shadow-md">
                  Choose Your Tale
                </h1>

                <div className="text-[#d4af37]/70 text-xs md:text-sm font-sans uppercase tracking-[0.3em] font-medium mb-4">
                  The Library of Fate
                </div>

                <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent mb-4"></div>

                <p className="text-[#8b4513] italic text-sm font-serif opacity-80">
                  Select a tome to begin your journey
                </p>
              </div>
            </motion.div>
          </div>

          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#2a1a10] border-2 border-[#d4af37] rounded-xl p-2 pl-6 pr-2 shadow-lg flex items-center gap-6"
            >
              <div className="hidden md:block text-right pr-2 border-r border-[#d4af37]/20">
                <p className="text-[10px] text-[#d4af37]/60 uppercase tracking-widest mb-1 font-sans">Grimoire Status</p>
                <div className="flex items-center justify-end gap-2">
                  <div className={`w-2 h-2 rounded-full transition-all duration-500 ${selectedGenre ? 'bg-[#d4af37] shadow-[0_0_8px_#d4af37] scale-125' : 'bg-[#d4af37]/20'}`}></div>
                  <span className={`text-xs font-serif tracking-wide transition-colors duration-300 ${selectedGenre ? 'text-[#f4e4bc]' : 'text-[#d4af37]/40'}`}>
                    {selectedGenre ? 'Ready to Weave' : 'Awaiting Selection'}
                  </span>
                </div>
              </div>

              <NeonButton
                onClick={handleGenerateStory}
                disabled={!selectedGenre || isGenerating}
                glowColor="gold"
                className="px-6 py-2 text-sm min-w-[140px] flex justify-center"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                    <span className="tracking-widest uppercase text-xs">Weaving...</span>
                  </>
                ) : (
                  <>
                    <Feather className="w-3 h-3 mr-2" />
                    <span className="tracking-widest uppercase text-xs">Begin Tale</span>
                  </>
                )}
              </NeonButton>
            </motion.div>
          </div>
        </header>

        {/* Books Grid */}
        <div className="flex-1 flex items-center justify-center py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 perspective-[2000px]">
            {STORY_GENRES.map((genre, index) => (
              <motion.div
                key={genre.id}
                initial={{ opacity: 0, y: 50, rotateX: 10 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6, type: "spring" }}
                onClick={() => setSelectedGenre(genre.id)}
                className="group relative cursor-pointer w-[220px] h-[320px] mx-auto preserve-3d"
              >
                {/* Selection Glow */}
                <div className={`absolute -inset-4 rounded-[20px] bg-[#d4af37]/20 blur-2xl transition-opacity duration-500 ${selectedGenre === genre.id ? 'opacity-100' : 'opacity-0'}`}></div>

                {/* The Book Structure */}
                <div className={`relative w-full h-full transition-transform duration-700 ease-in-out transform-style-3d group-hover:translate-x-4 ${selectedGenre === genre.id ? 'translate-y-[-20px]' : ''}`}>

                  {/* Back Cover (Bottom part when closed, Back when open) */}
                  <div className="absolute inset-0 bg-[#2a1a10] rounded-r-lg shadow-2xl border-l-[10px] border-[#1a0b05]"></div>

                  {/* Pages Block (The Right Page) */}
                  <div className="absolute top-[4px] bottom-[4px] left-[12px] right-[4px] bg-[#f4e4bc] rounded-r shadow-inner bg-[linear-gradient(90deg,#e3d3b0_1px,transparent_1px)] bg-[size:3px_100%] flex flex-col items-center justify-center p-4 text-center overflow-hidden">
                    {/* Interior Details on Paper */}
                    {getGenreInterior(genre.id)}

                    <div className="relative z-10 p-4 border border-[#8b4513]/10 h-full w-full flex flex-col items-center justify-center">
                      <h3 className="text-xl font-bold font-display text-[#8b4513] mb-3 uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-300">{genre.name}</h3>
                      <div className="w-full h-px bg-gradient-to-r from-transparent via-[#8b4513]/40 to-transparent mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-300"></div>
                      <p className="text-[#5c4033] text-sm font-serif italic leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-300">
                        "{genre.description}"
                      </p>
                    </div>
                  </div>

                  {/* Rotatable Cover Leaf (Contains Front and Inside Left) */}
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
                      {/* Overlay Custom Styles per Genre */}
                      {getGenreCover(genre.id)}

                      {/* Standard Spine Details (z-index adjusted) */}
                      <div className="absolute left-[-12px] top-0 bottom-0 w-[12px] bg-[#4a2b18] rounded-l-sm border-r border-[#1a0b05] z-10"></div>

                      {/* Standard Borders (z-index adjusted to stay on top of overlays if needed, or blending) */}
                      <div className="absolute top-2 left-2 w-full h-full border-2 border-[#d4af37]/30 rounded-r opacity-50 pointer-events-none z-10"></div>

                      {/* Icon/Symbol Container */}
                      <div className="relative z-20 w-16 h-16 mb-6 rounded-full bg-[#1a0b05] border-2 border-[#d4af37] flex items-center justify-center shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-500">
                        <span className="text-3xl filter drop-shadow-[0_0_5px_rgba(212,175,55,0.5)]">{genre.icon}</span>
                      </div>

                      {/* Title */}
                      <h3 className="relative z-20 text-xl font-bold font-display text-[#d4af37] mb-2 uppercase tracking-wide px-2 drop-shadow-md">{genre.name}</h3>

                      {/* Selected Indicator */}
                      {selectedGenre === genre.id && (
                        <div className="absolute top-4 right-4 text-[#d4af37] animate-pulse z-20">
                          <div className="w-3 h-3 bg-[#d4af37] rounded-full shadow-[0_0_10px_#d4af37]"></div>
                        </div>
                      )}
                    </div>

                    {/* Inside Left Cover (Back of the Leaf) */}
                    <div
                      className="absolute inset-0 bg-[#2a1a10] rounded-r-lg flex flex-col p-6 items-center justify-center backface-hidden border-l-[10px] border-[#1a0b05]"
                      style={{
                        transform: 'rotateY(180deg)',
                      }}
                    >
                      <div className="w-full h-full border border-[#d4af37]/10 p-4 flex items-center justify-center text-center">
                        {/* Optional: Add Ex Libris or generic pattern here if desired */}
                        <div className="opacity-20">
                          <BookOpen className="w-12 h-12 text-[#d4af37]" />
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Floating Label Below */}
                <div className="text-center mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
                  <span className="text-[#8b4513] text-xs uppercase tracking-widest font-bold bg-[#f4e4bc] px-3 py-1 rounded-full shadow-lg">Read to open</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
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
        /* Handle the rotation for inside cover - we need manual control if Tailwind rotate classes conflict */
        .group:hover .group-hover\\:-rotate-y-\\[135deg\\] {
           transform: rotateY(-135deg);
        }
      `}</style>
    </div>
  )
}

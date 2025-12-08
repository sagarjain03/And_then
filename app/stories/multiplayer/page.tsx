"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { StorytellerCard } from "@/components/ui/storyteller-card"
import { NeonButton } from "@/components/ui/neon-button"
import { Users, Lock, Globe, Feather, ArrowLeft } from "lucide-react"

export default function MultiplayerPage() {
  return (
    <div className="min-h-screen bg-parchment text-[#2a1a10] relative overflow-hidden font-serif">
      {/* Background Texture */}
      <div className="fixed inset-0 pointer-events-none opacity-50 z-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')]"></div>

      {/* Decorative Book Binding Effect */}
      <div className="hidden lg:block fixed left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#2a1a10]/10 to-transparent pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-32 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center mb-6"
          >
            <div className="w-20 h-20 rounded-full bg-[#f4e4bc] flex items-center justify-center border-2 border-[#d4af37]/30 shadow-book">
              <Users className="w-10 h-10 text-[#8b4513]" />
            </div>
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-[#2a1a10]">The Fellowship</h1>
          <p className="text-xl text-[#5c4033] italic font-serif">
            Weave tales together with friends or join public chroniclers.
          </p>
        </motion.div>

        {/* Options Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link href="/stories/multiplayer/create" className="block h-full">
              <StorytellerCard className="text-center h-full hover:shadow-book transition-all hover:scale-[1.02] border-light bg-white/80 cursor-pointer group">
                <div className="w-16 h-16 rounded-full bg-[#f4e4bc] flex items-center justify-center mx-auto mb-6 border border-[#d4af37]/30 group-hover:bg-[#d4af37]/10 transition-colors">
                  <Lock className="w-8 h-8 text-[#8b4513]" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-[#2a1a10] uppercase tracking-wide">Form a Coterie</h3>
                <p className="text-sm text-[#5c4033] italic mb-6">
                  Create a private room and invite friends to write together.
                </p>
                <NeonButton glowColor="gold" className="w-full pointer-events-none">
                  Create Room
                </NeonButton>
              </StorytellerCard>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link href="/stories/multiplayer/join" className="block h-full">
              <StorytellerCard className="text-center h-full hover:shadow-book transition-all hover:scale-[1.02] border-light bg-white/80 cursor-pointer group">
                <div className="w-16 h-16 rounded-full bg-[#f4e4bc] flex items-center justify-center mx-auto mb-6 border border-[#d4af37]/30 group-hover:bg-[#d4af37]/10 transition-colors">
                  <Globe className="w-8 h-8 text-[#8b4513]" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-[#2a1a10] uppercase tracking-wide">Join a Guild</h3>
                <p className="text-sm text-[#5c4033] italic mb-6">
                  Join an existing room and weave your threads into the story.
                </p>
                <NeonButton glowColor="gold" className="w-full bg-transparent border-[#d4af37]/50 text-[#8b4513] hover:bg-[#d4af37]/10 pointer-events-none">
                  Join Room
                </NeonButton>
              </StorytellerCard>
            </Link>
          </motion.div>
        </div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center"
        >
          <Link href="/dashboard">
            <button className="flex items-center gap-2 text-[#8b4513] hover:text-[#2a1a10] transition-colors font-serif font-bold uppercase tracking-wider text-sm px-6 py-3 border border-[#d4af37]/30 rounded-full hover:bg-[#d4af37]/10">
              <ArrowLeft className="w-4 h-4" />
              Return to Library
            </button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}


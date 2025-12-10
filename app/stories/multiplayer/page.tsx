"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Users, Lock, Globe, ArrowLeft, Trophy, BookOpen, PenTool } from "lucide-react"

export default function MultiplayerPage() {
  return (
    <div className="min-h-screen bg-[#1a0b05] text-[#d4af37] relative overflow-hidden font-serif selection:bg-[#d4af37] selection:text-[#1a0b05]">
      {/* Background Texture - Dark leather/grain style */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20 z-0 bg-repeat"
        style={{
          backgroundImage: `url("https://www.transparenttextures.com/patterns/leather.png")`
        }}
      ></div>

      {/* Spotlights */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-[#d4af37]/5 to-transparent pointer-events-none z-0 blur-3xl"></div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">

        {/* Top Navigation */}
        <header className="flex justify-between items-center mb-16">
          <Link href="/dashboard" className="group">
            <div className="flex items-center gap-2 text-[#d4af37]/80 group-hover:text-[#d4af37] transition-colors font-sans uppercase tracking-widest text-xs font-bold">
              <div className="p-2 border border-[#d4af37]/30 rounded group-hover:bg-[#d4af37]/10 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span>Close Book</span>
            </div>
          </Link>
          
        </header>

        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start gap-8 mb-24"
        >
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-[#d4af37] font-serif tracking-tight drop-shadow-md">
              The Fellowship
            </h1>
            <div className="border-l-2 border-[#d4af37]/40 pl-6 py-2">
              <p className="text-lg text-[#d4af37]/80 italic font-serif leading-relaxed">
                Weave tales together with friends or join public chroniclers.
              </p>
            </div>
          </div>

          {/* Level Block */}
          
        </motion.div>

        

        

        {/* Action Buttons (Redesigned as Blocky Cards) */}
        <div className="grid md:grid-cols-2 gap-8">
          <Link href="/stories/multiplayer/create" className="block h-full">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-[#2a1a10] border border-[#d4af37]/30 rounded-xl p-8 hover:bg-[#3a2012] transition-all duration-300 group h-full relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full border border-[#d4af37]/30 flex items-center justify-center mb-6 bg-[#1a0b05] group-hover:border-[#d4af37]/60 transition-colors">
                  <Lock className="w-8 h-8 text-[#d4af37]" strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-bold text-[#d4af37] mb-2 font-serif">Form a Coterie</h3>
                <p className="text-[#d4af37]/60 text-sm mb-6 max-w-xs font-serif italic">create a private sanctuary for your writing circle</p>
                <span className="inline-block mt-auto text-[10px] uppercase tracking-[0.2em] border border-[#d4af37]/30 px-6 py-3 rounded hover:bg-[#d4af37] hover:text-[#1a0b05] transition-all font-sans font-bold">
                  Create Room
                </span>
              </div>
            </motion.div>
          </Link>

          <Link href="/stories/multiplayer/join" className="block h-full">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-[#2a1a10] border border-[#d4af37]/30 rounded-xl p-8 hover:bg-[#3a2012] transition-all duration-300 group h-full relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full border border-[#d4af37]/30 flex items-center justify-center mb-6 bg-[#1a0b05] group-hover:border-[#d4af37]/60 transition-colors">
                  <Globe className="w-8 h-8 text-[#d4af37]" strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-bold text-[#d4af37] mb-2 font-serif">Join a Guild</h3>
                <p className="text-[#d4af37]/60 text-sm mb-6 max-w-xs font-serif italic">find your fellowship in the public archives</p>
                <span className="inline-block mt-auto text-[10px] uppercase tracking-[0.2em] border border-[#d4af37]/30 px-6 py-3 rounded hover:bg-[#d4af37] hover:text-[#1a0b05] transition-all font-sans font-bold">
                  Join Room
                </span>
              </div>
            </motion.div>
          </Link>
        </div>

      </div>
    </div>
  )
}

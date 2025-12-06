"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { NeonCard } from "@/components/ui/neon-card"
import { NeonButton } from "@/components/ui/neon-button"
import { Users, Lock, Globe } from "lucide-react"
import { AnimatedGrid } from "@/components/ui/animated-grid"

export default function MultiplayerPage() {
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
            className="flex justify-center mb-4"
          >
            <div className="w-16 h-16 rounded-lg bg-primary flex items-center justify-center">
              <Users className="w-8 h-8 text-primary-foreground" />
            </div>
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-display font-bold mb-4 text-glow-violet">MULTIPLAYER</h1>
          <p className="text-lg text-foreground/60">
            Play stories together with friends or join public rooms
          </p>
        </motion.div>

        {/* Options Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <NeonCard glowColor="violet" className="text-center h-full cursor-pointer">
              <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-6 border border-primary/30">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-display font-bold mb-4 uppercase tracking-wide">CREATE ROOM</h3>
              <p className="text-sm text-foreground/60 mb-6">
                Create a room and invite friends to play together
              </p>
              <Link href="/stories/multiplayer/create" className="w-full">
                <NeonButton glowColor="violet" className="w-full">
                  Create Room
                </NeonButton>
              </Link>
            </NeonCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <NeonCard glowColor="cyan" className="text-center h-full cursor-pointer">
              <div className="w-16 h-16 rounded-lg bg-secondary/10 flex items-center justify-center mx-auto mb-6 border border-secondary/30">
                <Globe className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-2xl font-display font-bold mb-4 uppercase tracking-wide">JOIN ROOM</h3>
              <p className="text-sm text-foreground/60 mb-6">
                Join an existing room and play with friends
              </p>
              <Link href="/stories/multiplayer/join" className="w-full">
                <NeonButton glowColor="cyan" className="w-full">
                  Join Room
                </NeonButton>
              </Link>
            </NeonCard>
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
            <NeonButton glowColor="blue" className="bg-transparent border border-primary/30 hover:bg-primary/10">
              Back to Dashboard
            </NeonButton>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}


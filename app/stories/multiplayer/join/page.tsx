"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { NeonCard } from "@/components/ui/neon-card"
import { NeonButton } from "@/components/ui/neon-button"
import { AnimatedGrid } from "@/components/ui/animated-grid"
import { Input } from "@/components/ui/input"
import { Globe, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function JoinRoomPage() {
  const router = useRouter()
  const [roomCode, setRoomCode] = useState("")
  const [isJoining, setIsJoining] = useState(false)

  const handleJoin = async () => {
    if (!roomCode.trim()) {
      toast.error("Please enter a room code")
      return
    }

    setIsJoining(true)
    try {
      const res = await fetch("/api/multiplayer/rooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomCode: roomCode.toUpperCase().trim() }),
      })

      if (!res.ok) {
        const error = await res.json()
        toast.error(error.error || "Failed to join room")
        return
      }

      toast.success("Joined room!")
      router.push(`/stories/multiplayer/room/${roomCode.toUpperCase().trim()}`)
    } catch (error) {
      console.error("Error joining room:", error)
      toast.error("Failed to join room")
    } finally {
      setIsJoining(false)
    }
  }

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

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-32 relative z-10">
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
            <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center">
              <Globe className="w-8 h-8 text-secondary-foreground" />
            </div>
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-display font-bold mb-4 text-glow-cyan">
            JOIN ROOM
          </h1>
          <p className="text-lg text-foreground/60">
            Enter the room code to join
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <NeonCard glowColor="cyan" className="text-center">
            <div className="mb-6">
              <Input
                type="text"
                placeholder="Enter 6-digit room code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase().slice(0, 6))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    void handleJoin()
                  }
                }}
                className="text-center text-3xl font-display font-bold tracking-widest uppercase"
                maxLength={6}
                disabled={isJoining}
              />
            </div>

            <div className="flex gap-4 justify-center">
              <NeonButton
                glowColor="cyan"
                onClick={handleJoin}
                disabled={isJoining || !roomCode.trim()}
              >
                {isJoining ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Joining...
                  </>
                ) : (
                  "Join Room"
                )}
              </NeonButton>
            </div>
          </NeonCard>
        </motion.div>
      </div>
    </div>
  )
}


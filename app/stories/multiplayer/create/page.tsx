"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { NeonCard } from "@/components/ui/neon-card"
import { NeonButton } from "@/components/ui/neon-button"
import { AnimatedGrid } from "@/components/ui/animated-grid"
import { Users, Copy, Check, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function CreateRoomPage() {
  const router = useRouter()
  const [roomCode, setRoomCode] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const createRoom = async () => {
      setIsCreating(true)
      try {
        const res = await fetch("/api/multiplayer/rooms/create", {
          method: "POST",
        })

        if (!res.ok) {
          const error = await res.json()
          toast.error(error.error || "Failed to create room")
          router.push("/stories/multiplayer")
          return
        }

        const data = await res.json()
        setRoomCode(data.room.roomCode)
        toast.success("Room created!")
      } catch (error) {
        console.error("Error creating room:", error)
        toast.error("Failed to create room")
        router.push("/stories/multiplayer")
      } finally {
        setIsCreating(false)
      }
    }

    void createRoom()
  }, [router])

  const handleCopy = () => {
    if (!roomCode) return
    navigator.clipboard.writeText(roomCode)
    setCopied(true)
    toast.success("Room code copied!")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleContinue = () => {
    if (roomCode) {
      router.push(`/stories/multiplayer/room/${roomCode}`)
    }
  }

  if (isCreating) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
        <AnimatedGrid />
        <div className="text-center relative z-10">
          <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-foreground/60">Creating room...</p>
        </div>
      </div>
    )
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
            <div className="w-16 h-16 rounded-lg bg-primary flex items-center justify-center">
              <Users className="w-8 h-8 text-primary-foreground" />
            </div>
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-display font-bold mb-4 text-glow-violet">
            ROOM CREATED
          </h1>
          <p className="text-lg text-foreground/60">
            Share this code with your friends to join
          </p>
        </motion.div>

        {roomCode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <NeonCard glowColor="violet" className="text-center">
              <div className="mb-6">
                <p className="text-sm text-foreground/60 mb-4 uppercase tracking-wider">
                  Room Code
                </p>
                <div className="flex items-center justify-center gap-4">
                  <div className="text-6xl font-display font-bold text-primary text-glow-violet tracking-wider">
                    {roomCode}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleCopy}
                    className="p-3 rounded-lg bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-colors"
                  >
                    {copied ? (
                      <Check className="w-6 h-6 text-primary" />
                    ) : (
                      <Copy className="w-6 h-6 text-primary" />
                    )}
                  </motion.button>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <NeonButton glowColor="cyan" onClick={handleContinue}>
                  Continue to Room
                </NeonButton>
              </div>
            </NeonCard>
          </motion.div>
        )}
      </div>
    </div>
  )
}


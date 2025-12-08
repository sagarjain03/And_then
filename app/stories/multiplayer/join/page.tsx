"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { StorytellerCard } from "@/components/ui/storyteller-card"
import { NeonButton } from "@/components/ui/neon-button"
import { Input } from "@/components/ui/input"
import { Scroll, Loader2, Search } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

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
    <div className="min-h-screen bg-parchment dark:bg-[#1a0b05] relative overflow-hidden transition-colors duration-300">
      {/* Background Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-50 z-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] dark:bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] dark:opacity-30 mix-blend-multiply dark:mix-blend-soft-light transition-all"></div>

      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-32 relative z-10 flex flex-col items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 w-full"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center mb-6"
          >
            <div className="w-20 h-20 rounded-full bg-[#f4e4bc] dark:bg-[#2a1a10] border-4 border-double border-[#d4af37]/60 flex items-center justify-center shadow-lg">
              <Scroll className="w-10 h-10 text-[#8b4513] dark:text-[#d4af37]" />
            </div>
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold mb-4 text-[#2a1a10] dark:text-[#d4af37] drop-shadow-sm">
            Join the Tale
          </h1>
          <p className="text-lg text-[#5c4033] dark:text-[#d4af37]/80 font-serif italic">
            Enter the secret rune to find your party
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full"
        >
          <StorytellerCard className="text-center bg-white/80 dark:bg-[#2a1a10]/80 backdrop-blur-sm">
            <div className="mb-8 relative">
              <Input
                type="text"
                placeholder="Ex: AB12CD3"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase().slice(0, 6))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    void handleJoin()
                  }
                }}
                className="text-center text-3xl font-serif font-bold tracking-widest uppercase py-6 bg-[#f4e4bc]/30 dark:bg-black/20 border-2 border-[#d4af37]/30 focus:border-[#d4af37] text-[#2a1a10] dark:text-[#d4af37] placeholder:text-[#8b4513]/30 dark:placeholder:text-[#d4af37]/30 rounded-lg"
                maxLength={6}
                disabled={isJoining}
              />
            </div>

            <div className="flex gap-4 justify-center">
              <Link href="/stories/multiplayer" className="flex-1">
                <NeonButton variant="outline" className="w-full border-[#8b4513]/30 text-[#8b4513] hover:bg-[#8b4513]/10 dark:border-[#d4af37]/30 dark:text-[#d4af37] dark:hover:bg-[#d4af37]/10">
                  Return
                </NeonButton>
              </Link>
              <NeonButton
                glowColor="gold"
                onClick={handleJoin}
                disabled={isJoining || !roomCode.trim()}
                className="flex-[2]"
              >
                {isJoining ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Seeking...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Seek Audience
                  </>
                )}
              </NeonButton>
            </div>
          </StorytellerCard>
        </motion.div>
      </div>
    </div>
  )
}

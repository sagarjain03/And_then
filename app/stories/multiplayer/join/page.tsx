"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
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
    <div className="min-h-screen bg-[#1a0b05] text-[#d4af37] relative overflow-hidden font-serif selection:bg-[#d4af37] selection:text-[#1a0b05]">
      {/* Background Texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20 z-0 bg-repeat"
        style={{
          backgroundImage: `url("https://www.transparenttextures.com/patterns/leather.png")`
        }}
      ></div>

      {/* Spotlights */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-[#d4af37]/5 to-transparent pointer-events-none z-0 blur-3xl"></div>

      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 flex flex-col items-center justify-center min-h-screen">
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
            <div className="w-20 h-20 rounded-full border border-[#d4af37]/30 flex items-center justify-center mb-6 bg-[#1a0b05]">
              <Scroll className="w-10 h-10 text-[#d4af37]" strokeWidth={1.5} />
            </div>
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-[#d4af37] font-serif tracking-tight drop-shadow-md">
            Join the Tale
          </h1>
          <p className="text-lg text-[#d4af37]/60 font-serif italic">
            Enter the secret rune to find your party
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full"
        >
          <div className="bg-[#2a1a10] border border-[#d4af37]/30 rounded-xl p-8 relative overflow-hidden">
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
                className="text-center text-3xl font-serif font-bold tracking-widest uppercase py-6 bg-[#1a0b05] border-2 border-[#d4af37]/30 focus:border-[#d4af37] text-[#d4af37] placeholder:text-[#d4af37]/20 rounded-lg"
                maxLength={6}
                disabled={isJoining}
              />
            </div>

            <div className="flex gap-4 justify-center">
              <Link href="/stories/multiplayer" className="flex-1">
                <button className="w-full text-[10px] uppercase tracking-[0.2em] border border-[#d4af37]/30 px-6 py-3 rounded hover:bg-[#d4af37] hover:text-[#1a0b05] transition-all font-sans font-bold">
                  Return
                </button>
              </Link>
              <button
                onClick={handleJoin}
                disabled={isJoining || !roomCode.trim()}
                className="flex-[2] text-[10px] uppercase tracking-[0.2em] border border-[#d4af37]/30 px-6 py-3 rounded hover:bg-[#d4af37] hover:text-[#1a0b05] transition-all font-sans font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { StorytellerCard } from "@/components/ui/storyteller-card"
import { NeonButton } from "@/components/ui/neon-button"
import { Users, Copy, Check, Loader2, Feather } from "lucide-react"
import { toast } from "sonner"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"

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
    toast.success("Code inscribed to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleContinue = () => {
    if (roomCode) {
      router.push(`/stories/multiplayer/room/${roomCode}`)
    }
  }

  if (isCreating) {
    return (
      <div className="min-h-screen bg-[#f4e4bc] dark:bg-[#1a0b05] relative overflow-hidden flex items-center justify-center transition-colors">
        <div className="text-center relative z-10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          >
            <Feather className="w-12 h-12 text-[#8b4513] dark:text-[#d4af37] mx-auto mb-4" />
          </motion.div>
          <p className="text-[#8b4513] dark:text-[#d4af37] font-serif italic text-lg">Preparing the grand hall...</p>
        </div>
      </div>
    )
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
              <Users className="w-10 h-10 text-[#8b4513] dark:text-[#d4af37]" />
            </div>
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold mb-4 text-[#2a1a10] dark:text-[#d4af37] drop-shadow-sm">
            The Gathering
          </h1>
          <p className="text-lg text-[#5c4033] dark:text-[#d4af37]/80 font-serif italic">
            Summon your fellow storytellers
          </p>
        </motion.div>

        {roomCode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="w-full"
          >
            <StorytellerCard className="text-center bg-white/80 dark:bg-[#2a1a10]/80 backdrop-blur-sm">
              <div className="mb-8">
                <p className="text-sm text-[#8b4513] dark:text-[#d4af37]/70 mb-4 uppercase tracking-widest font-serif font-bold">
                  Secret Rune (Room Code)
                </p>
                <div className="flex items-center justify-center gap-4 bg-[#f4e4bc]/30 dark:bg-black/20 p-4 rounded-lg border border-[#d4af37]/20">
                  <div className="text-5xl font-serif font-bold text-[#2a1a10] dark:text-[#d4af37] tracking-wider font-mono">
                    {roomCode}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleCopy}
                    className="p-3 rounded-full bg-[#d4af37]/10 hover:bg-[#d4af37]/20 text-[#8b4513] dark:text-[#d4af37] transition-colors border border-[#d4af37]/30"
                    title="Copy Code"
                  >
                    {copied ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <Copy className="w-6 h-6" />
                    )}
                  </motion.button>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Link href="/stories/multiplayer" className="flex-1">
                  <NeonButton variant="outline" className="w-full border-[#8b4513]/30 text-[#8b4513] hover:bg-[#8b4513]/10 dark:border-[#d4af37]/30 dark:text-[#d4af37] dark:hover:bg-[#d4af37]/10">
                    Return
                  </NeonButton>
                </Link>
                <NeonButton glowColor="gold" onClick={handleContinue} className="flex-[2]">
                  Enter Great Hall
                </NeonButton>
              </div>
            </StorytellerCard>
          </motion.div>
        )}
      </div>
    </div>
  )
}

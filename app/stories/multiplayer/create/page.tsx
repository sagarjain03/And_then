"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { NeonButton } from "@/components/ui/neon-button"
import { Users, Copy, Check, Feather } from "lucide-react"
import { toast } from "sonner"
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
      <div className="min-h-screen bg-[#1a0b05] relative overflow-hidden flex items-center justify-center">
        <div className="text-center relative z-10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          >
            <Feather className="w-12 h-12 text-[#d4af37] mx-auto mb-4" />
          </motion.div>
          <p className="text-[#d4af37] font-serif italic text-lg">Preparing the grand hall...</p>
        </div>
      </div>
    )
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
              <Users className="w-10 h-10 text-[#d4af37]" strokeWidth={1.5} />
            </div>
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-[#d4af37] font-serif tracking-tight drop-shadow-md">
            The Gathering
          </h1>
          <p className="text-lg text-[#d4af37]/60 font-serif italic">
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
            <div className="bg-[#2a1a10] border border-[#d4af37]/30 rounded-xl p-8 relative overflow-hidden">
              <div className="mb-8">
                <p className="text-sm text-[#d4af37]/60 mb-4 uppercase tracking-widest font-sans font-bold text-center">
                  Secret Rune (Room Code)
                </p>
                <div className="flex items-center justify-center gap-4 bg-[#1a0b05] p-6 rounded-lg border border-[#d4af37]/20">
                  <div className="text-5xl font-serif font-bold text-[#d4af37] tracking-wider font-mono">
                    {roomCode}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleCopy}
                    className="p-3 rounded-full bg-[#d4af37]/10 hover:bg-[#d4af37]/20 text-[#d4af37] transition-colors border border-[#d4af37]/30"
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
                  <button className="w-full text-[10px] uppercase tracking-[0.2em] border border-[#d4af37]/30 px-6 py-3 rounded hover:bg-[#d4af37] hover:text-[#1a0b05] transition-all font-sans font-bold">
                    Return
                  </button>
                </Link>
                <button onClick={handleContinue} className="flex-[2] text-[10px] uppercase tracking-[0.2em] border border-[#d4af37]/30 px-6 py-3 rounded hover:bg-[#d4af37] hover:text-[#1a0b05] transition-all font-sans font-bold">
                  Enter Great Hall
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

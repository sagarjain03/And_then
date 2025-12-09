"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { MessageCircle, X, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface ChatMessage {
  userId: string
  username: string
  message: string
  timestamp: string | Date
}

interface MultiplayerChatProps {
  roomCode: string
  currentUserId: string | null
  messages: ChatMessage[]
  onMessageSent?: () => void
}

export function MultiplayerChat({ roomCode, currentUserId, messages, onMessageSent }: MultiplayerChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputMessage, setInputMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const chatBoxRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isOpen])

  useEffect(() => {
    if (isOpen && chatBoxRef.current) {
      const rect = chatBoxRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      const initialX = Math.max(20, viewportWidth - rect.width - 20)
      const initialY = Math.max(20, viewportHeight - rect.height - 100)

      setPosition({ x: initialX, y: initialY })
    }
  }, [isOpen])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !roomCode || isSending) return

    setIsSending(true)
    try {
      const res = await fetch(`/api/multiplayer/rooms/${roomCode}/chat/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: inputMessage.trim() }),
      })

      if (!res.ok) {
        const error = await res.json()
        console.error("Failed to send message:", error)
        return
      }

      setInputMessage("")
      onMessageSent?.()
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void handleSendMessage()
    }
  }

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!chatBoxRef.current) return

    const rect = chatBoxRef.current.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
    setIsDragging(true)
  }, [])

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !chatBoxRef.current) return

      const newX = e.clientX - dragOffset.x
      const newY = e.clientY - dragOffset.y

      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const rect = chatBoxRef.current.getBoundingClientRect()

      const constrainedX = Math.max(0, Math.min(newX, viewportWidth - rect.width))
      const constrainedY = Math.max(0, Math.min(newY, viewportHeight - rect.height))

      setPosition({ x: constrainedX, y: constrainedY })
    },
    [isDragging, dragOffset],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
      return () => {
        window.removeEventListener("mousemove", handleMouseMove)
        window.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const formatTime = (timestamp: string | Date) => {
    const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const sortedMessages = [...(messages || [])].sort((a, b) => {
    const timeA = typeof a.timestamp === "string" ? new Date(a.timestamp).getTime() : a.timestamp.getTime()
    const timeB = typeof b.timestamp === "string" ? new Date(b.timestamp).getTime() : b.timestamp.getTime()
    return timeA - timeB
  })

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#1a0b05] border-2 border-[#d4af37] text-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] transition-all flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95"
            aria-label="Open chat"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={chatBoxRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              position: "fixed",
              left: `${position.x}px`,
              top: `${position.y}px`,
              zIndex: 50,
              cursor: isDragging ? "grabbing" : "default",
            }}
            className="w-80 h-96 bg-[#1a0b05] border-2 border-[#d4af37] rounded-xl shadow-2xl flex flex-col min-h-0 overflow-hidden"
          >
            <div
              onMouseDown={handleMouseDown}
              className="flex items-center justify-between p-4 border-b border-[#d4af37]/30 bg-[#2a1a10] cursor-grab active:cursor-grabbing select-none"
            >
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#d4af37]" />
                <h3 className="font-serif font-bold text-[#d4af37] uppercase tracking-wider text-sm">Fellowship Chat</h3>
              </div>
              <button
                className="h-6 w-6 flex items-center justify-center text-[#d4af37] hover:text-[#f4e4bc] transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <ScrollArea className="flex-1 min-h-0 h-full p-4 bg-[#1a0b05]">
              <div className="space-y-3">
                {sortedMessages.length === 0 ? (
                  <div className="text-center text-[#d4af37]/50 text-xs font-serif italic py-8">The scroll is empty. Speak, friend...</div>
                ) : (
                  sortedMessages.map((msg, idx) => {
                    const isOwnMessage = msg.userId === currentUserId
                    return (
                      <div key={idx} className={cn("flex flex-col gap-1", isOwnMessage ? "items-end" : "items-start")}>
                        <div
                          className={cn(
                            "rounded-lg px-3 py-2 max-w-[85%] text-sm font-sans shadow-sm",
                            isOwnMessage
                              ? "bg-[#d4af37] text-[#1a0b05] font-bold"
                              : "bg-[#2a1a10] border border-[#d4af37]/30 text-[#d4af37]"
                          )}
                        >
                          {!isOwnMessage && <div className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-70 border-b border-[#d4af37]/20 pb-0.5">{msg.username}</div>}
                          <div className="leading-relaxed">{msg.message}</div>
                        </div>
                        <div className="text-[10px] text-[#d4af37]/40 px-1 font-serif">{formatTime(msg.timestamp)}</div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-3 border-t border-[#d4af37]/30 shrink-0 bg-[#2a1a10]">
              <div className="flex gap-2">
                <input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Whisper to the void..."
                  disabled={isSending}
                  className="flex-1 bg-[#1a0b05] border border-[#d4af37]/30 rounded px-3 py-2 text-sm text-[#d4af37] placeholder-[#d4af37]/30 focus:outline-none focus:border-[#d4af37] transition-colors font-sans"
                  maxLength={500}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isSending}
                  className="w-10 h-10 flex items-center justify-center rounded bg-[#d4af37] text-[#1a0b05] hover:bg-[#f4e4bc] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4 no-rotate" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}


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
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95"
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
            className="w-80 h-96 bg-background border border-border rounded-lg shadow-2xl flex flex-col min-h-0"
          >
            <div
              onMouseDown={handleMouseDown}
              className="flex items-center justify-between p-4 border-b border-border bg-muted/50 cursor-grab active:cursor-grabbing select-none"
            >
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm">Group Chat</h3>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <ScrollArea className="flex-1 min-h-0 h-full p-4">
              <div className="space-y-3">
                {sortedMessages.length === 0 ? (
                  <div className="text-center text-muted-foreground text-sm py-8">No messages yet. Start the conversation!</div>
                ) : (
                  sortedMessages.map((msg, idx) => {
                    const isOwnMessage = msg.userId === currentUserId
                    return (
                      <div key={idx} className={cn("flex flex-col gap-1", isOwnMessage ? "items-end" : "items-start")}> 
                        <div
                          className={cn(
                            "rounded-lg px-3 py-2 max-w-[80%]",
                            isOwnMessage ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                          )}
                        >
                          {!isOwnMessage && <div className="text-xs font-semibold mb-1 opacity-80">{msg.username}</div>}
                          <div className="text-sm">{msg.message}</div>
                        </div>
                        <div className="text-xs text-muted-foreground px-1">{formatTime(msg.timestamp)}</div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-border shrink-0 bg-background">
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  disabled={isSending}
                  className="flex-1"
                  maxLength={500}
                />
                <Button onClick={handleSendMessage} disabled={!inputMessage.trim() || isSending} size="icon">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}


"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Sparkles } from "lucide-react"

interface XPNotificationProps {
  show: boolean
  amount: number
  reason: string
  onComplete?: () => void
}

export function XPNotification({ show, amount, reason, onComplete }: XPNotificationProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.8 }}
          transition={{ duration: 0.5 }}
          onAnimationComplete={() => {
            setTimeout(() => onComplete?.(), 2000)
          }}
          className="fixed bottom-8 right-8 z-50 bg-primary text-primary-foreground px-6 py-4 rounded-lg shadow-lg flex items-center gap-3"
        >
          <Sparkles className="w-5 h-5" />
          <div>
            <div className="font-bold">+{amount} XP</div>
            <div className="text-sm opacity-90">{reason}</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

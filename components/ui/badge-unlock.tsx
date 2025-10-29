"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Award } from "lucide-react"
import type { Badge } from "@/lib/gamification"

interface BadgeUnlockProps {
  show: boolean
  badge: Badge | null
  onComplete?: () => void
}

export function BadgeUnlock({ show, badge, onComplete }: BadgeUnlockProps) {
  return (
    <AnimatePresence>
      {show && badge && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ type: "spring", duration: 0.7 }}
          onAnimationComplete={() => {
            setTimeout(() => onComplete?.(), 3000)
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            className="bg-card border-2 border-primary rounded-lg p-8 text-center max-w-md mx-4 shadow-2xl"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="text-6xl mb-4"
            >
              {badge.icon}
            </motion.div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Award className="w-5 h-5 text-primary" />
              <h3 className="text-2xl font-bold">Badge Unlocked!</h3>
            </div>
            <p className="text-xl font-bold text-primary mb-2">{badge.name}</p>
            <p className="text-muted-foreground">{badge.description}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

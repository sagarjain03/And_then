"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Zap } from "lucide-react"
import Confetti from "react-confetti"
import { useWindowSize } from "@/hooks/use-window-size"

interface LevelUpProps {
  show: boolean
  level: number
  onComplete?: () => void
}

export function LevelUp({ show, level, onComplete }: LevelUpProps) {
  const { width, height } = useWindowSize()

  return (
    <AnimatePresence>
      {show && (
        <>
          <Confetti width={width} height={height} recycle={false} numberOfPieces={200} />
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
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
              }}
              className="bg-gradient-to-br from-primary to-primary/50 rounded-lg p-12 text-center max-w-md mx-4 shadow-2xl"
            >
              <motion.div
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", duration: 1 }}
              >
                <Zap className="w-20 h-20 text-primary-foreground mx-auto mb-4" />
              </motion.div>
              <h3 className="text-4xl font-bold text-primary-foreground mb-2">Level Up!</h3>
              <p className="text-6xl font-bold text-primary-foreground">{level}</p>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

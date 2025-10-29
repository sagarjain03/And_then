"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface HUDPanelProps {
  children: ReactNode
  className?: string
  title?: string
  cornerAccent?: boolean
}

export function HUDPanel({ children, className, title, cornerAccent = true }: HUDPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("relative bg-card/50 backdrop-blur-xl border border-primary/30 rounded-lg p-6", className)}
    >
      {cornerAccent && (
        <>
          {/* Top-left corner */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary" />
          {/* Top-right corner */}
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary" />
          {/* Bottom-left corner */}
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary" />
          {/* Bottom-right corner */}
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary" />
        </>
      )}

      {title && (
        <div className="mb-4 pb-2 border-b border-primary/30">
          <h3 className="font-display text-lg uppercase tracking-wider text-primary text-glow-violet">{title}</h3>
        </div>
      )}

      {children}
    </motion.div>
  )
}

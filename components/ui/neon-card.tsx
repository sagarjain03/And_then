"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface NeonCardProps {
  children: ReactNode
  className?: string
  glowColor?: "violet" | "cyan" | "blue"
  tiltEffect?: boolean
}

export function NeonCard({ children, className, glowColor = "violet", tiltEffect = true }: NeonCardProps) {
  const glowClass = {
    violet: "hover:glow-violet hover:border-primary",
    cyan: "hover:glow-cyan hover:border-secondary",
    blue: "hover:glow-blue hover:border-accent",
  }[glowColor]

  return (
    <motion.div
      className={cn(
        "relative bg-card border border-border rounded-lg p-6 transition-all duration-300",
        glowClass,
        className,
      )}
      whileHover={
        tiltEffect
          ? {
              scale: 1.02,
              rotateX: 2,
              rotateY: 2,
            }
          : { scale: 1.02 }
      }
      style={
        tiltEffect
          ? {
              transformStyle: "preserve-3d",
              perspective: 1000,
            }
          : undefined
      }
    >
      {children}
    </motion.div>
  )
}

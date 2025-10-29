"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface NeonButtonProps {
  children: ReactNode
  className?: string
  glowColor?: "violet" | "cyan" | "blue"
  onClick?: () => void
  disabled?: boolean
  type?: "button" | "submit" | "reset"
}

export function NeonButton({
  children,
  className,
  glowColor = "violet",
  onClick,
  disabled,
  type = "button",
}: NeonButtonProps) {
  const colorClasses = {
    violet: "bg-primary text-primary-foreground hover:glow-violet",
    cyan: "bg-secondary text-secondary-foreground hover:glow-cyan",
    blue: "bg-accent text-accent-foreground hover:glow-blue",
  }[glowColor]

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative px-6 py-3 rounded-lg font-display font-semibold uppercase tracking-wider",
        "transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed",
        "before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-r",
        "before:from-transparent before:via-white/10 before:to-transparent",
        "before:translate-x-[-200%] hover:before:translate-x-[200%]",
        "before:transition-transform before:duration-700",
        colorClasses,
        className,
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="relative z-10">{children}</span>
    </motion.button>
  )
}

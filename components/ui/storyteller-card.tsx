import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import type { ReactNode } from "react"

interface StorytellerCardProps {
    children: ReactNode
    className?: string
    delay?: number
}

export function StorytellerCard({ children, className, delay = 0 }: StorytellerCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay, ease: "easeOut" }}
            className={cn(
                "relative overflow-hidden rounded-xl bg-[#f4e4bc] dark:bg-[#1a0b05] p-6 transition-colors duration-300",
                // Main Border
                "border-[3px] border-double border-[#d4af37]/40 dark:border-[#d4af37]/20",
                "shadow-[0_4px_20px_-2px_rgba(42,26,16,0.1)] dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.5)]", // Warm shadow
                // Paper texture overlay
                "before:absolute before:inset-0 before:z-0 before:opacity-10 before:bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] dark:before:bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] dark:before:opacity-20",
                // Inner highlight for depth
                "after:absolute after:inset-0 after:z-0 after:rounded-xl after:shadow-[inset_0_0_20px_rgba(212,175,55,0.05)] dark:after:shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] after:pointer-events-none",
                // Corner accents (simulated via box-shadow or similar if svg is too complex, but let's stick to CSS borders for now)
                className
            )}
        >
            <div className="relative z-10">{children}</div>
        </motion.div>
    )
}

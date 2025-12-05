"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BOOK_THEMES, DEFAULT_THEME } from "@/lib/book-themes"
import { cn } from "@/lib/utils"

interface BookLayoutProps {
    leftContent: React.ReactNode
    rightContent: React.ReactNode
    genre: string
    onPageTurn?: () => void
    currentPage: number
}

export function BookLayout({ leftContent, rightContent, genre, onPageTurn, currentPage }: BookLayoutProps) {
    const theme = BOOK_THEMES[genre] || DEFAULT_THEME
    const [isFlipping, setIsFlipping] = useState(false)

    // Trigger flip animation when page changes
    useEffect(() => {
        setIsFlipping(true)
        const timer = setTimeout(() => setIsFlipping(false), 800)
        return () => clearTimeout(timer)
    }, [currentPage])

    return (
        <div className={cn("min-h-screen w-full flex items-center justify-center p-2 md:p-8 transition-colors duration-500 overflow-hidden", theme.styles.container)}>
            <div className="relative w-full max-w-6xl aspect-[3/2] perspective-2000">

                {/* Book Cover/Backing */}
                <div className={cn("absolute inset-0 rounded-lg shadow-2xl transform translate-x-4 translate-y-4 -z-20 opacity-60", theme.styles.accent)} />

                <div className="relative w-full h-full flex shadow-2xl rounded-lg overflow-hidden">

                    {/* Left Page (Static/Base) */}
                    <div className={cn("w-1/2 h-full relative z-0", theme.styles.page, "rounded-l-lg border-r border-black/10")}>
                        {/* Binding Shadow Left */}
                        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black/10 to-transparent pointer-events-none z-10" />

                        <div className="h-full w-full overflow-y-auto custom-scrollbar">
                            <div className={cn("max-w-prose mx-auto min-h-full flex flex-col", theme.styles.text)}>
                                {leftContent}
                            </div>
                            <div className="absolute bottom-4 left-8 text-xs opacity-50 pointer-events-none">
                                Page {currentPage * 2 + 1}
                            </div>
                        </div>
                    </div>

                    {/* Right Page (Static/Base) */}
                    <div className={cn("w-1/2 h-full relative z-0", theme.styles.page, "rounded-r-lg")}>
                        {/* Binding Shadow Right */}
                        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black/10 to-transparent pointer-events-none z-10" />

                        <div className="h-full w-full overflow-y-auto custom-scrollbar">
                            <div className={cn("max-w-prose mx-auto min-h-full flex flex-col", theme.styles.text)}>
                                {rightContent}
                            </div>
                            <div className="absolute bottom-4 right-8 text-xs opacity-50 pointer-events-none">
                                Page {currentPage * 2 + 2}
                            </div>
                        </div>
                    </div>

                    {/* Animated Page Flip Layer */}
                    <AnimatePresence mode="wait">
                        {isFlipping && (
                            <motion.div
                                key={currentPage}
                                initial={{ rotateY: 0, zIndex: 50, transformOrigin: "left center" }}
                                animate={{ rotateY: -180, zIndex: 50 }}
                                transition={{ duration: 0.8, ease: "easeInOut" }}
                                className={cn(
                                    "absolute right-0 top-0 w-1/2 h-full rounded-r-lg origin-left backface-hidden",
                                    theme.styles.page
                                )}
                                style={{ transformStyle: "preserve-3d" }}
                            >
                                {/* Front of the flipping page (Old Right Content - simplified or empty for effect) */}
                                <div className="absolute inset-0 backface-hidden bg-black/5" />

                                {/* Back of the flipping page (New Left Content) */}
                                <div
                                    className={cn("absolute inset-0 w-full h-full rounded-l-lg", theme.styles.page)}
                                    style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
                                >
                                    <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black/10 to-transparent pointer-events-none z-10" />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Central Spine */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-black/20 z-20" />
                </div>
            </div>
        </div>
    )
}

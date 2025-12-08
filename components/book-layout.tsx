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
        <div className={cn("min-h-screen w-full flex items-center justify-center p-2 sm:p-4 lg:p-8 transition-colors duration-500 overflow-hidden", theme.styles.container)}>
            {/* Mobile Portrait: Vertical Stack */}
            <div className="block portrait:block landscape:hidden w-full max-w-md mx-auto space-y-4 py-4">
                {/* Left Page (Top on Mobile Portrait) */}
                <div className={cn("w-full aspect-[3/4] relative", theme.styles.page, "rounded-lg shadow-xl")}>
                    <div className="h-full w-full overflow-y-auto p-4 sm:p-6 custom-scrollbar">
                        <div className={cn("max-w-prose mx-auto min-h-full flex flex-col", theme.styles.text)}>
                            {leftContent}
                        </div>
                        <div className="absolute bottom-2 left-4 text-xs opacity-50 pointer-events-none">
                            Page {currentPage * 2 + 1}
                        </div>
                    </div>
                </div>

                {/* Right Page (Bottom on Mobile Portrait) */}
                <div className={cn("w-full aspect-[3/4] relative", theme.styles.page, "rounded-lg shadow-xl")}>
                    <div className="h-full w-full overflow-y-auto p-4 sm:p-6 custom-scrollbar">
                        <div className={cn("max-w-prose mx-auto min-h-full flex flex-col", theme.styles.text)}>
                            {rightContent}
                        </div>
                        <div className="absolute bottom-2 right-4 text-xs opacity-50 pointer-events-none">
                            Page {currentPage * 2 + 2}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tablet/Desktop & Mobile Landscape: Side-by-Side */}
            <div className="hidden landscape:block w-full max-w-6xl">
                <div className="relative w-full aspect-[4/3] md:aspect-[3/2] perspective-2000">

                    {/* Book Cover/Backing */}
                    <div className={cn("absolute inset-0 rounded-lg shadow-2xl transform translate-x-2 translate-y-2 sm:translate-x-4 sm:translate-y-4 -z-20 opacity-60", theme.styles.accent)} />

                    <div className="relative w-full h-full flex shadow-2xl rounded-lg overflow-hidden">

                        {/* Left Page (Static/Base) */}
                        <div className={cn("w-1/2 h-full relative z-0", theme.styles.page, "rounded-l-lg border-r border-black/10")}>
                            {/* Binding Shadow Left */}
                            <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-l from-black/10 to-transparent pointer-events-none z-10" />

                            <div className="h-full w-full overflow-y-auto no-scrollbar">
                                <div className={cn("max-w-prose mx-auto min-h-full flex flex-col", theme.styles.text)}>
                                    {leftContent}
                                </div>
                                <div className="absolute bottom-2 left-4 sm:bottom-4 sm:left-8 text-xs opacity-50 pointer-events-none">
                                    Page {currentPage * 2 + 1}
                                </div>
                            </div>
                        </div>

                        {/* Right Page (Static/Base) */}
                        <div className={cn("w-1/2 h-full relative z-0", theme.styles.page, "rounded-r-lg")}>
                            {/* Binding Shadow Right */}
                            <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-r from-black/10 to-transparent pointer-events-none z-10" />

                            <div className="h-full w-full overflow-y-auto no-scrollbar">
                                <div className={cn("max-w-prose mx-auto min-h-full flex flex-col", theme.styles.text)}>
                                    {rightContent}
                                </div>
                                <div className="absolute bottom-2 right-4 sm:bottom-4 sm:right-8 text-xs opacity-50 pointer-events-none">
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
                                    {/* Front of the flipping page */}
                                    <div className="absolute inset-0 backface-hidden bg-black/5" />

                                    {/* Back of the flipping page */}
                                    <div
                                        className={cn("absolute inset-0 w-full h-full rounded-l-lg", theme.styles.page)}
                                        style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
                                    >
                                        <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-l from-black/10 to-transparent pointer-events-none z-10" />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Central Spine */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-black/20 z-20" />
                    </div>
                </div>
            </div>
        </div>
    )
}

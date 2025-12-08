"use client";
import React from "react";
import { motion } from "framer-motion";

export const SparklesCore = () => {
    // Generate random sparkles on client side to avoid hydration mismatch
    // or use a fixed seed if possible, but simplest is just ensuring this renders client-side only (which it does via "use client")
    // To be safe against hydration errors with random numbers, we should generate them in useEffect or use a deterministic seed.
    // Converting to a robust version:

    const [sparkles, setSparkles] = React.useState<Array<{ id: number, x: number, y: number, size: number, duration: number, delay: number }>>([]);

    React.useEffect(() => {
        const newSparkles = Array.from({ length: 40 }).map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 2 + 1,
            duration: Math.random() * 2 + 3,
            delay: Math.random() * 2
        }));
        setSparkles(newSparkles);
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {sparkles.map((sparkle) => (
                <motion.div
                    key={sparkle.id}
                    className="absolute rounded-full bg-[#D4AF37]"
                    style={{
                        left: `${sparkle.x}%`,
                        top: `${sparkle.y}%`,
                        width: sparkle.size,
                        height: sparkle.size,
                        boxShadow: "0 0 5px 1px rgba(212,175,55,0.4)"
                    }}
                    animate={{
                        y: [0, -60, 0],
                        opacity: [0, 0.6, 0],
                        scale: [0, 1.5, 0]
                    }}
                    transition={{
                        duration: sparkle.duration,
                        repeat: Infinity,
                        delay: sparkle.delay,
                        ease: "easeInOut"
                    }}
                />
            ))}
        </div>
    );
};

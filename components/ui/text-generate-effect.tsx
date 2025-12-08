"use client";
import { useEffect } from "react";
import { motion, stagger, useAnimate } from "framer-motion";
import { cn } from "@/lib/utils";

export const TextGenerateEffect = ({
    words,
    className,
}: {
    words: string;
    className?: string;
}) => {
    const [scope, animate] = useAnimate();
    const wordsArray = words.split(" ");

    useEffect(() => {
        animate(
            "span",
            {
                opacity: 1,
                filter: "blur(0px)",
            },
            {
                duration: 1,
                delay: stagger(0.05),
                ease: "easeOut"
            }
        );
    }, [scope.current]);

    return (
        <div className={cn("font-sans font-light leading-relaxed tracking-wide", className)}>
            <motion.div ref={scope}>
                {wordsArray.map((word, idx) => {
                    return (
                        <motion.span
                            key={word + idx}
                            className="opacity-0 filter blur-[10px] inline-block mr-1.5"
                        >
                            {word}
                        </motion.span>
                    );
                })}
            </motion.div>
        </div>
    );
};

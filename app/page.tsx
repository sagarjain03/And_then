"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { motion, useAnimate, stagger } from "framer-motion";
import { cn } from "@/lib/utils";
import { Play, ArrowRight, Sparkles as SparklesIcon, Menu } from "lucide-react";

export default function GhibliHomePage() {
  return (
    <div className="min-h-screen md:h-screen w-full overflow-x-hidden md:overflow-hidden bg-[#F2E8DC] relative flex flex-col md:flex-row font-serif selection:bg-[#D4AF37]/30">
      {/* DIAGONAL SPLIT */}
      {/* LEFT CONTENT SECTION */}
      <div className="w-full md:w-[60%] h-full flex flex-col justify-center px-8 md:px-20 z-20 relative bg-[#F2E8DC]">
        {/* Navigation Logo */}
        <nav className="absolute top-8 left-0 right-0 flex items-center justify-between px-8 md:px-20 z-30">
          <div className="flex md:flex gap-8 text-[#8A7968] text-xs font-bold tracking-widest font-sans uppercase">
            <Link href="/stories" className="hover:text-[#5C4033] transition-colors relative group flex flex-col items-center">
              <SparklesIcon className="w-4 h-4 text-[#D4AF37]" />
              Your
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#D4AF37] transition-all group-hover:w-full" />
            </Link>
          </div>
          {/* Small pop‑up title */}
          <div className="flex flex-col items-center absolute left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-3 bg-[#F2E8DC] text-[#4A332A] px-4 py-2 rounded-lg shadow-md text-xl font-medium">
              <span className="font-bold">And</span>
              <span className="font-bold bg-[#4A332A] text-[#F2E8DC] px-2 rounded-md">Then?</span>
            </div>
          </div>
          {/* Placeholder for right-aligned items if needed, to balance justify-between */}

          <div className="hidden md:flex w-[70px]"></div> {/* Adjust width as needed to balance the 'Stories' link */}
          <div className="flex md:flex gap-8 text-[#8A7968] text-xs font-bold tracking-widest font-sans uppercase">
            <Link href="/stories" className="hover:text-[#5C4033] transition-colors relative group flex flex-col items-center">
              <SparklesIcon className="w-4 h-4 text-[#D4AF37]" />
              Story
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#D4AF37] transition-all group-hover:w-full" />
            </Link>
          </div>
        </nav>

        {/* Main Typography */}
        <div className="mt-32 md:mt-[-40px] relative z-20 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-3 py-1 mb-6 border border-[#8A7968]/30 rounded-full text-[#8A7968] text-[0.65rem] tracking-[0.2em] font-sans uppercase bg-[#fff8e7]/50"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
            AI-Powered Interactive Fiction
          </motion.div>



          {/* Main title */}
          <h1 className="text-6xl md:text-8xl font-bold text-[#4A332A] leading-[1.05] mb-8 tracking-tight">
            Stories That <br />
            <span className="relative inline-block">
              <span className="text-[#D4AF37] italic font-serif">Know You</span>
              <motion.svg
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay: 1, duration: 1.5, ease: "easeInOut" }}
                className="absolute w-[110%] h-4 -bottom-1 -left-[5%] text-[#D4AF37]/60"
                viewBox="0 0 100 10"
                preserveAspectRatio="none"
              >
                <motion.path d="M0 5 Q 50 12 100 5" stroke="currentColor" strokeWidth="2" fill="none" />
              </motion.svg>
            </span>
          </h1>

          {/* Text generate effect */}
          <TextGenerateEffect
            words="Discover narratives woven from the threads of your own personality. Take the test, and step into a world that adapts to your soul."
            className="text-[#8A7968] text-lg md:text-xl max-w-lg leading-relaxed mb-10 font-medium"
          />

          {/* Signup button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="flex items-center gap-6"
          >
            <Link href="/auth/signup">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#4A332A] text-[#F2E8DC] px-8 py-4 rounded-xl shadow-xl transition-all flex items-center gap-3 font-sans font-bold tracking-wider text-sm hover:bg-[#2a1a10]"
              >
                START STORY <ArrowRight className="w-4 h-4 ml-1" />
              </motion.button>
            </Link>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-6 text-[#8A7968]/40 text-[0.6rem] tracking-widest font-sans uppercase"
        >
          © 2025 And-Then Platform
        </motion.div>
      </div>

      {/* CENTER CHARACTER - BRIDGING THE SPLIT */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
        className="absolute -bottom-10 left-[60%] -translate-x-1/2 z-30 h-[100vh] w-auto pointer-events-none hidden md:block"
      >
        {/* Character Image */}
        <img
          src="/backgrounds/ghibli-character-middle.png"
          alt="Character"
          className="h-full w-auto object-contain object-bottom drop-shadow-[0_0_30px_rgba(212,175,55,0.4)]"
        />
      </motion.div>

      {/* RIGHT IMAGE SECTION */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute top-0 right-0 w-full md:w-[50%] h-full z-10 bg-[#1a0b05] hidden md:block"
        style={{ clipPath: "polygon(40% 0, 100% 0, 100% 100%, 20% 100%)" }}
      >
        <div className="relative w-full h-full overflow-hidden">
          {/* Background Image - Darker Tint */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/backgrounds/ghibli-3d-hero.png')" }}
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-[#2a1a10]/60 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a0b05] via-transparent to-transparent" />
          {/* Particles */}
          <SparklesCore />
        </div>
      </motion.div>

      {/* RIGHT SIDE VERTICAL MENU */}
      <div className="absolute right-0 top-0 h-full w-20 md:w-24 z-50 flex flex-col items-center py-10 bg-gradient-to-l from-[#1a0b05]/80 to-transparent hidden md:flex">
        {/* Hamburger Icon (placeholder) */}
        {/* Vertical Text Links */}
        <div className="flex flex-col gap-8 items-center justify-center h-full">
          <Link href="/auth/signup">
            <div className="writing-vertical-rl text-[#D4AF37] font-bold tracking-[0.3em] text-xs uppercase hover:text-[#F2E8DC] transition-colors cursor-pointer py-4 border-l border-transparent ">
              SIGN UP
            </div>
          </Link>
          <div className="h-10 w-[1px] bg-[#D4AF37]/30" />
          <Link href="/auth/login">
            <div className="writing-vertical-rl text-[#D4AF37] font-bold tracking-[0.3em] text-xs uppercase hover:text-[#F2E8DC] transition-colors cursor-pointer py-4">
              LOGIN
            </div>
          </Link>
        </div>
        <div className="mt-auto" />
      </div>

      {/* Decorative Diagonal Line */}
      <div
        className="absolute top-0 right-[50%] w-[1px] h-full bg-gradient-to-b from-[#D4AF37]/0 via-[#D4AF37]/50 to-[#D4AF37]/0 z-20 hidden md:block transform -skew-x-[11deg] origin-top opacity-30"
        style={{ left: "55%" }}
      />
    </div>
  );
}

// --- Aceternity Style Components ---

const TextGenerateEffect = ({ words, className }: { words: string; className?: string }) => {
  const [scope, animate] = useAnimate();
  const wordsArray = words.split(" ");

  useEffect(() => {
    animate(
      "span",
      { opacity: 1, filter: "blur(0px)" },
      { duration: 1, delay: stagger(0.1), ease: "easeOut" }
    );
  }, [scope.current]);

  return (
    <div className={cn("font-serif leading-snug tracking-wide", className)}>
      <motion.div ref={scope}>
        {wordsArray.map((word, idx) => (
          <motion.span key={word + idx} className="opacity-0 filter blur-[10px] inline-block mr-1.5">
            {word}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
};

const SparklesCore = () => {
  const sparkles = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    duration: Math.random() * 2 + 3,
    delay: Math.random() * 2,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          className="absolute rounded-full"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            width: sparkle.size,
            height: sparkle.size,
            background:
              "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(212,175,55,0.8) 50%, rgba(0,0,0,0) 100%)",
            boxShadow: "0 0 4px 1px rgba(212,175,55,0.3)",
          }}
          animate={{ y: [0, -40, 0], opacity: [0, 0.8, 0], scale: [0, 1.2, 0] }}
          transition={{ duration: sparkle.duration, repeat: Infinity, delay: sparkle.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
};

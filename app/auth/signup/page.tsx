"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { NeonButton } from "@/components/ui/neon-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Feather, Menu, Sparkles as SparklesIcon, ArrowRight } from "lucide-react"
import { motion, useAnimate, stagger } from "framer-motion"
import { cn } from "@/lib/utils"
import { SparklesCore } from "@/components/ui/sparkles"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ""

export default function SignupPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    // Validate username
    if (!username.trim()) {
      setError("Username is required")
      return
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters")
      return
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      setError("Username can only contain letters, numbers, underscores, and hyphens")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)
    setError(null)

    // Validate email format
    const emailRegex = /^[^\s@]+@gmail\.com$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address")
      setIsLoading(false)
      return
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    if (!passwordRegex.test(password)) {
      setError("Password must be at least 8 characters with uppercase, lowercase, number, and special character")
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch(`${API_BASE_URL || ""}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to create account. Please try again.")
        return
      }

      // After successful signup, send the user to login
      toast.success("Account created successfully! Please log in.")
      router.push("/auth/login")
    } catch (err) {
      console.error("Signup error", err)
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-[#F2E8DC] relative flex flex-col md:flex-row font-serif selection:bg-[#D4AF37]/30">

      {/* LEFT CONTENT SECTION (FORM) */}
      <div className="w-full md:w-[60%] h-full flex flex-col justify-center px-8 md:px-20 z-20 relative bg-[#F2E8DC]">
        {/* Navigation Logo */}
        <nav className="absolute top-8 left-0 right-0 flex items-center justify-between px-8 md:px-20 z-30">
          <div className="hidden md:flex gap-8 text-[#8A7968] text-xs font-bold tracking-widest font-sans uppercase">
            <Link href="/" className="hover:text-[#5C4033] transition-colors relative group flex flex-col items-center">
              <SparklesIcon className="w-4 h-4 text-[#D4AF37]" />
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#D4AF37] transition-all group-hover:w-full" />
            </Link>
          </div>
          {/* Small pop-up title */}
          <div className="flex flex-col items-center absolute left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-3 bg-[#F2E8DC] text-[#4A332A] px-4 py-2 rounded-lg shadow-md text-xl font-medium">
              <span className="font-bold">And</span>
              <span className="font-bold bg-[#4A332A] text-[#F2E8DC] px-2 rounded-md">Then?</span>
            </div>
          </div>
          <div className="hidden md:flex w-[70px]"></div>
          <div className="hidden md:flex gap-8 text-[#8A7968] text-xs font-bold tracking-widest font-sans uppercase">
            <Link href="/auth/login" className="hover:text-[#5C4033] transition-colors relative group flex flex-col items-center">
              <SparklesIcon className="w-4 h-4 text-[#D4AF37]" />
              Login
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#D4AF37] transition-all group-hover:w-full" />
            </Link>
          </div>
        </nav>

        {/* Main Form Area */}
        <div className="mt-[-40px] relative z-20 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-1 border border-[#8A7968]/30 rounded-full text-[#8A7968] text-[0.65rem] tracking-[0.2em] font-sans uppercase bg-[#fff8e7]/50">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
              Join The Adventure
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-[#4A332A] leading-[1.05] mb-8 tracking-tight">
              Begin Your <br />
              <span className="relative inline-block">
                <span className="text-[#D4AF37] italic font-serif">Legend</span>
                <motion.svg
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 1.5, ease: "easeInOut" }}
                  className="absolute w-[110%] h-4 -bottom-1 -left-[5%] text-[#D4AF37]/60"
                  viewBox="0 0 100 10"
                  preserveAspectRatio="none"
                >
                  <motion.path d="M0 5 Q 50 12 100 5" stroke="currentColor" strokeWidth="2" fill="none" />
                </motion.svg>
              </span>
            </h1>

            <motion.p className="text-[#8A7968] text-lg md:text-xl max-w-lg leading-relaxed mb-10 font-medium">
              Create your account and discover narratives shaped by your essence.
            </motion.p>

            <motion.form 
              onSubmit={handleSignup} 
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="space-y-1">
              <Label htmlFor="username" className="text-[#8A7968] text-xs font-bold tracking-widest uppercase">Pen Name</Label>
              <Input
                id="username"
                type="text"
                placeholder="Storyteller123"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-transparent border-b border-[#8A7968]/30 rounded-none px-0 pl-4 h-10 focus:border-[#D4AF37] text-[#4A332A] font-serif placeholder:text-[#8A7968]/30 focus-visible:ring-0 shadow-none"
              />
              </div>

              <div className="space-y-1">
              <Label htmlFor="email" className="text-[#8A7968] text-xs font-bold tracking-widest uppercase">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@story.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-transparent border-b border-[#8A7968]/30 rounded-none px-0 pl-4 h-10 focus:border-[#D4AF37] text-[#4A332A] font-serif placeholder:text-[#8A7968]/30 focus-visible:ring-0 shadow-none"
              />
              </div>

              <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="password" className="text-[#8A7968] text-xs font-bold tracking-widest uppercase">Password</Label>
                <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-transparent border-b border-[#8A7968]/30 rounded-none px-0 pl-4 h-10 focus:border-[#D4AF37] text-[#4A332A] font-serif placeholder:text-[#8A7968]/30 focus-visible:ring-0 shadow-none"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="confirmPassword" className="text-[#8A7968] text-xs font-bold tracking-widest uppercase">Confirm</Label>
                <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-transparent border-b border-[#8A7968]/30 rounded-none px-0 pl-4 h-10 focus:border-[#D4AF37] text-[#4A332A] font-serif placeholder:text-[#8A7968]/30 focus-visible:ring-0 shadow-none"
                />
              </div>
              </div>

              {error && <p className="text-xs text-red-500 font-serif italic">{error}</p>}

              <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="flex items-center gap-6 pt-2"
              >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={isLoading}
                className="bg-[#4A332A] text-[#F2E8DC] px-8 py-4 rounded-xl shadow-xl transition-all flex items-center gap-3 font-sans font-bold tracking-wider text-sm hover:bg-[#2a1a10] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                <span className="flex items-center gap-2">
                  <Feather className="w-4 h-4 animate-spin" />
                  Creating...
                </span>
                ) : (
                <>CREATE ACCOUNT <ArrowRight className="w-4 h-4 ml-1" /></>
                )}
              </motion.button>
              </motion.div>
            </motion.form>

            <div className="mt-6 text-center">
              <p className="text-xs text-[#8A7968] font-sans">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-[#D4AF37] hover:text-[#b4941f] font-bold underline decoration-[#D4AF37]/50 underline-offset-4 transition-colors">
                  Log in
                </Link>
              </p>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-8 text-[#8A7968]/40 text-[0.6rem] tracking-widest font-sans uppercase"
        >
          © 2025 And-Then Platform
        </motion.div>
      </div>

      {/* CENTER CHARACTER - BRIDGING THE SPLIT */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
        className="absolute -bottom-10 left-[60%] -translate-x-1/2 z-30 h-[100vh] w-auto pointer-events-none"
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
        className="absolute top-0 right-0 w-full md:w-[50%] h-full z-10 bg-[#1a0b05]"
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
      <div className="absolute right-0 top-0 h-full w-20 md:w-24 z-50 flex flex-col items-center py-10 bg-gradient-to-l from-[#1a0b05]/80 to-transparent">
        <div className="flex flex-col gap-8 items-center justify-center h-full">
          <Link href="/">
            <div className="writing-vertical-rl text-[#D4AF37] font-bold tracking-[0.3em] text-xs uppercase hover:text-[#F2E8DC] transition-colors cursor-pointer py-4 border-l border-transparent">
              HOME
            </div>
          </Link>
          <div className="h-10 w-[1px] bg-[#D4AF37]/30" />
          <Link href="/auth/login">
            <div className="writing-vertical-rl text-[#D4AF37] font-bold tracking-[0.3em] text-xs uppercase hover:text-[#F2E8DC] transition-colors cursor-pointer py-4">
              LOGIN
            </div>
          </Link>
        </div>
        <div className="mt-auto"></div>
      </div>

      {/* Decorative Diagonal Line */}
      <div
        className="absolute top-0 right-[50%] w-[1px] h-full bg-gradient-to-b from-[#D4AF37]/0 via-[#D4AF37]/50 to-[#D4AF37]/0 z-20 hidden md:block transform -skew-x-[11deg] origin-top opacity-30"
        style={{ left: "55%" }}
      />
    </div>
  )
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

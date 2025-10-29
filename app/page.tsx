"use client"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import { NeonButton } from "@/components/ui/neon-button"
import { NeonCard } from "@/components/ui/neon-card"
import { AnimatedGrid } from "@/components/ui/animated-grid"
import { BookOpen, Sparkles, Users, Zap, ChevronRight } from "lucide-react"

export default function LandingPage() {
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 500], [0, 150])
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0])

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <div className="fixed inset-0 z-0">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-20">
          <source src="/abstract-futuristic-digital-space-particles.jpg" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/90" />
      </div>

      <AnimatedGrid />

      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6 px-8 py-4 bg-card/20 backdrop-blur-2xl border border-primary/30 rounded-full glow-violet"
      >
        <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.05 }}>
          <BookOpen className="w-5 h-5 text-primary" />
          <span className="text-lg font-display font-bold text-glow-violet">STORYWEAVE</span>
        </motion.div>
        <div className="w-px h-6 bg-primary/30" />
        <Link href="/auth/login">
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="px-4 py-2 text-sm font-display uppercase tracking-wider text-foreground/80 hover:text-primary transition-colors"
          >
            Log in
          </motion.button>
        </Link>
        <Link href="/auth/signup">
          <NeonButton glowColor="violet" className="text-sm px-6 py-2">
            Sign up
          </NeonButton>
        </Link>
      </motion.div>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-block mb-8 px-6 py-3 bg-card/50 backdrop-blur-xl rounded-full border border-primary/30 glow-violet"
          >
            <span className="text-sm font-display uppercase tracking-wider text-primary">AI-Powered Storytelling</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-6xl sm:text-7xl lg:text-8xl font-display font-bold mb-8 text-balance"
          >
            STORIES THAT KNOW{" "}
            <span className="text-primary text-glow-violet bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              YOU
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-xl text-foreground/70 mb-12 text-balance max-w-3xl mx-auto leading-relaxed"
          >
            Discover personalized narratives tailored to your personality. Take a quick personality test and step into
            stories that adapt to your choices and character.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center mb-20"
          >
            <Link href="/auth/signup">
              <NeonButton glowColor="violet" className="text-base px-8 py-4">
                Start Your Story
                <ChevronRight className="w-5 h-5 ml-2 inline" />
              </NeonButton>
            </Link>
            <NeonButton glowColor="cyan" className="text-base px-8 py-4">
              Watch Demo
            </NeonButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="relative rounded-lg overflow-hidden border-2 border-primary/30 bg-card/30 backdrop-blur-xl h-[500px] flex items-center justify-center glow-violet"
          >
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary" />

            {/* Animated background */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 90, 180, 270, 360],
              }}
              transition={{
                duration: 30,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
              className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10"
            />

            <div className="text-center relative z-10">
              <motion.div
                animate={{
                  rotate: 360,
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  rotate: { duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
                  scale: { duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
                }}
              >
                <Sparkles className="w-24 h-24 text-primary mx-auto mb-6 drop-shadow-[0_0_20px_rgba(147,51,234,0.8)]" />
              </motion.div>
              <p className="text-2xl font-display uppercase tracking-wider text-foreground/50">Your story awaits...</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-display font-bold mb-6 text-glow-violet">HOW IT WORKS</h2>
            <p className="text-xl text-foreground/60">Three simple steps to your personalized adventure</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Sparkles,
                title: "DISCOVER YOUR PERSONALITY",
                description:
                  "Take our engaging 16-question personality test to reveal your unique traits and story preferences.",
                color: "violet" as const,
              },
              {
                icon: Zap,
                title: "AI GENERATES YOUR STORY",
                description:
                  "Our AI creates a unique narrative tailored to your personality across 5 immersive genres.",
                color: "cyan" as const,
              },
              {
                icon: Users,
                title: "MAKE MEANINGFUL CHOICES",
                description:
                  "Your decisions shape the story. Every choice matters and influences the narrative outcome.",
                color: "blue" as const,
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
              >
                <NeonCard glowColor={feature.color} className="h-full">
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center mb-6 border border-primary/30"
                  >
                    <feature.icon className="w-8 h-8 text-primary" />
                  </motion.div>
                  <h3 className="text-xl font-display font-bold mb-4 uppercase tracking-wide">{feature.title}</h3>
                  <p className="text-foreground/70 leading-relaxed">{feature.description}</p>
                </NeonCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-5xl font-display font-bold mb-8 text-glow-violet">READY TO BEGIN?</h2>
          <p className="text-xl text-foreground/60 mb-12 leading-relaxed">
            Join thousands of story enthusiasts discovering personalized narratives powered by AI.
          </p>
          <Link href="/auth/signup">
            <NeonButton glowColor="violet" className="text-lg px-10 py-5">
              Create Your Account
              <ChevronRight className="w-6 h-6 ml-2 inline" />
            </NeonButton>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-primary/20 py-8 px-4 sm:px-6 lg:px-8 bg-card/30 backdrop-blur-xl relative">
        <div className="max-w-6xl mx-auto text-center text-foreground/50 text-sm font-display uppercase tracking-wider">
          <p>&copy; 2025 STORYWEAVE. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>
    </div>
  )
}

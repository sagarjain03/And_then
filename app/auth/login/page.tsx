"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // TODO: Implement login logic
    setTimeout(() => setIsLoading(false), 1000)
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary-foreground" />
          </div>
        </div>
        <h1 className="text-2xl font-bold">Welcome Back</h1>
        <p className="text-muted-foreground">Log in to continue your story</p>
      </div>

      <Card className="border-border">
        <CardContent className="pt-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Log in"}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button variant="outline" className="w-full bg-transparent">
            Continue with Google
          </Button>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link href="/auth/signup" className="text-primary hover:underline font-medium">
          Sign up
        </Link>
      </p>
    </div>
  )
}

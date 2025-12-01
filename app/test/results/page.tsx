"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

// Lightweight redirector: resolve the authenticated user's ID and
// send them to /test/results/[id] so the URL is user-specific.
export default function PersonalityResultsRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    const redirect = async () => {
      try {
        const res = await fetch("/api/auth/profile")
        if (!res.ok) {
          router.replace("/auth/login")
          return
        }
        const profile = (await res.json()) as { id?: string }
        if (!profile.id) {
          router.replace("/auth/login")
          return
        }
        router.replace(`/test/results/${profile.id}`)
      } catch (err) {
        console.error("Failed to resolve profile for results redirect", err)
        router.replace("/auth/login")
      }
    }

    void redirect()
  }, [router])

  return null
}

"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function StoryPlayIndexPage() {
  const router = useRouter()

  useEffect(() => {
    // If someone hits /stories/play without an id, send them to new story creator.
    router.replace("/stories/new")
  }, [router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground">Redirecting to create a new story...</p>
    </div>
  )
}

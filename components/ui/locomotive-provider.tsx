"use client"
import React, { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

export default function LocomotiveProvider({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const locoRef = useRef<any>(null)
  const pathname = usePathname()

  useEffect(() => {
    let mounted = true
    let LocomotiveScroll: any = null

    async function init() {
      if (!containerRef.current || !mounted) return

      // Dynamic import prevents server-side evaluation
      const mod = await import("locomotive-scroll")
      LocomotiveScroll = mod.default ?? mod
      await import("locomotive-scroll/dist/locomotive-scroll.css")

      // destroy previous instance if present
      if (locoRef.current) {
        try {
          locoRef.current.destroy()
        } catch {}
        locoRef.current = null
      }

      locoRef.current = new LocomotiveScroll({
        el: containerRef.current,
        smooth: true,
        direction: "vertical",
        smartphone: { smooth: true },
        tablet: { smooth: true },
      })
    }

    init()

    return () => {
      mounted = false
      if (locoRef.current) {
        try {
          locoRef.current.destroy()
        } catch {}
        locoRef.current = null
      }
    }
  }, []) // init once

  // update on navigation
  useEffect(() => {
    const t = setTimeout(() => locoRef.current?.update?.(), 200)
    return () => clearTimeout(t)
  }, [pathname])

  return (
    <div ref={containerRef} data-scroll-container>
      {children}
    </div>
  )
}
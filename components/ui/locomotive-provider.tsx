"use client"
import React, { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import LocomotiveScroll from "locomotive-scroll"
import "locomotive-scroll/dist/locomotive-scroll.css"

export default function LocomotiveProvider({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const locoRef = useRef<any>(null)
  const pathname = usePathname()

  useEffect(() => {
    if (!containerRef.current) return

    // destroy previous instance if present
    if (locoRef.current) {
      try {
        locoRef.current.destroy()
      } catch (e) {
        // ignore
      }
      locoRef.current = null
    }

    // init
    locoRef.current = new LocomotiveScroll({
      el: containerRef.current,
      smooth: true,
      direction: "vertical",
      smartphone: { smooth: true },
      tablet: { smooth: true },
    })

    return () => {
      if (locoRef.current) {
        try {
          locoRef.current.destroy()
        } catch (e) {}
        locoRef.current = null
      }
    }
  }, [pathname])

  // Expose update helper if needed
  useEffect(() => {
    const id = setTimeout(() => (locoRef.current?.update?.()), 200)
    return () => clearTimeout(id)
  }, [pathname])

  return (
    <div ref={containerRef} data-scroll-container>
      {children}
    </div>
  )
}
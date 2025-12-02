"use client"

import type React from "react"
import { Toaster } from "sonner"

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster richColors closeButton position="top-center" />
    </>
  )
}

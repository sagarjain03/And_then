"use client"

import React from "react"
import LocomotiveProvider from "@/components/ui/locomotive-provider"
import { Toaster } from "@/components/ui/toaster" // example existing provider

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LocomotiveProvider>
      {/* keep your existing global providers / toasters inside */}
      {children}
      <Toaster />
    </LocomotiveProvider>
  )
}

import type React from "react"
import type { Metadata } from "next"
import { Orbitron, Exo_2, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
})

const exo2 = Exo_2({
  subsets: ["latin"],
  variable: "--font-exo2",
  display: "swap",
})

const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AndThen - AI-Powered Personalized Stories",
  description:
    "Discover stories tailored to your personality. Take a personality test and step into narratives that adapt to your choices.",
  generator: "sagar Jain",
  icons: {
    icon: "/logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${orbitron.variable} ${exo2.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}

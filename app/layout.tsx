import type React from "react"
import type { Metadata } from "next"
import { Orbitron, Exo_2, Geist_Mono, Cinzel, Libre_Baskerville } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import AppProviders from "./providers"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"

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

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
})

const libreBaskerville = Libre_Baskerville({
  weight: ["400", "700", "400"],
  subsets: ["latin"],
  variable: "--font-libre",
  display: "swap",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

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
    <html lang="en" suppressHydrationWarning>
      <body className={`${orbitron.variable} ${exo2.variable} ${cinzel.variable} ${libreBaskerville.variable} ${geistMono.variable} font-serif antialiased`}>
        <AppProviders>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
            <Analytics />
          </ThemeProvider>
        </AppProviders>
      </body>
    </html>
  )
}

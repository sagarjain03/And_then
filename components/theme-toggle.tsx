"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
    const { setTheme } = useTheme()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="relative border-[#d4af37]/50 bg-[#f4e4bc] dark:bg-[#2a1a10] hover:bg-[#d4af37]/20 rounded-full w-10 h-10">
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-[#8b4513] dark:text-[#d4af37]" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-[#8b4513] dark:text-[#d4af37]" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#f4e4bc] dark:bg-[#2a1a10] border-[#d4af37]/50">
                <DropdownMenuItem onClick={() => setTheme("light")} className="text-[#8b4513] dark:text-[#d4af37] focus:bg-[#d4af37]/20 cursor-pointer font-serif">
                    Light (Parchment)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")} className="text-[#8b4513] dark:text-[#d4af37] focus:bg-[#d4af37]/20 cursor-pointer font-serif">
                    Dark (Leather)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")} className="text-[#8b4513] dark:text-[#d4af37] focus:bg-[#d4af37]/20 cursor-pointer font-serif">
                    System
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

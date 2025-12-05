export interface BookTheme {
    id: string
    name: string
    styles: {
        container: string
        page: string
        text: string
        heading: string
        accent: string
        choice: string
    }
}

export const BOOK_THEMES: Record<string, BookTheme> = {
    fantasy: {
        id: "fantasy",
        name: "Ancient Grimoire",
        styles: {
            // Fantasy background with warm brown overlay for atmospheric effect
            container: "bg-[#2a1a10] bg-[url('/themes/fantasy/background.png')] bg-cover bg-center bg-no-repeat bg-blend-multiply",
            // Celtic knot border - very generous padding to keep text well within border
            page: "bg-[#f4e4bc]/80 bg-[url('/themes/fantasy/border.jpg')] bg-[length:100%_100%] bg-no-repeat shadow-inner p-20 md:p-28 lg:p-32",
            text: "font-serif text-[#2a1a10] text-sm md:text-base leading-relaxed",
            heading: "font-serif font-bold text-[#4a0404] text-lg md:text-xl",
            accent: "border-[#4a0404]",
            choice: "hover:bg-[#e6d2a0]/60 border-[#8b4513] text-[#3e2723] bg-white/40 backdrop-blur-sm text-sm",
        },
    },
    scifi: {
        id: "scifi",
        name: "Holographic Datapad",
        styles: {
            // Sci-Fi background with cyan overlay for futuristic ambiance
            container: "bg-[#050a14] bg-[url('/themes/scifi/background.jpg')] bg-cover bg-center bg-no-repeat bg-blend-overlay",
            // Futuristic tech border - generous padding to avoid hexagonal frame
            page: "bg-cyan-50/20 bg-[url('/themes/scifi/border.jpg')] bg-[length:100%_100%] bg-no-repeat backdrop-blur-sm p-20 md:p-28 lg:p-32",
            text: "font-mono text-slate-900 font-medium text-sm md:text-base leading-relaxed",
            heading: "font-sans font-bold text-cyan-700 tracking-wider uppercase text-base md:text-lg",
            accent: "border-cyan-500",
            choice: "hover:bg-cyan-50/60 border-cyan-300 text-cyan-900 bg-white/50 backdrop-blur-md text-sm",
        },
    },
    mystery: {
        id: "mystery",
        name: "Detective's Case File",
        styles: {
            // Mystery background with dark overlay for noir atmosphere
            container: "bg-[#1a1a1a] bg-[url('/themes/mystery/background.jpg')] bg-cover bg-center bg-no-repeat bg-blend-multiply",
            // Steampunk gears border - generous padding to avoid mechanical elements
            page: "bg-[#f0f0f0]/70 bg-[url('/themes/mystery/border.jpg')] bg-[length:100%_100%] bg-no-repeat shadow-md p-20 md:p-28 lg:p-32",
            text: "font-mono text-[#1a1a1a] text-sm md:text-base leading-relaxed",
            heading: "font-mono font-bold text-[#8b0000] tracking-tight text-base md:text-lg",
            accent: "border-[#1a1a1a]",
            choice: "hover:bg-[#e0e0e0]/70 border-[#333] text-[#111] bg-white/60 text-sm",
        },
    },
    romance: {
        id: "romance",
        name: "Love Letter",
        styles: {
            // Romance background with soft pink overlay for romantic ambiance
            container: "bg-[#fff0f5] bg-[url('/themes/romance/background.png')] bg-cover bg-center bg-no-repeat bg-blend-overlay",
            // Floral rose border - very generous padding for decorative roses
            page: "bg-pink-50/30 bg-[url('/themes/romance/border.jpg')] bg-[length:100%_100%] bg-no-repeat shadow-[0_0_20px_rgba(255,182,193,0.3)] p-20 md:p-28 lg:p-32",
            text: "font-serif text-slate-700 italic text-sm md:text-base leading-relaxed",
            heading: "font-serif font-normal text-pink-800 text-lg md:text-xl",
            accent: "border-pink-300",
            choice: "hover:bg-pink-50/70 border-pink-300 text-pink-900 bg-white/60 text-sm",
        },
    },
    adventure: {
        id: "adventure",
        name: "Explorer's Journal",
        styles: {
            // Adventure background with warm sepia overlay for aged map feel
            container: "bg-[#2f3e46] bg-[url('/themes/adventure/background.jpg')] bg-cover bg-center bg-no-repeat bg-blend-multiply",
            // Nautical border - generous padding to avoid compass and ships
            page: "bg-amber-50/40 bg-[url('/themes/adventure/border.jpg')] bg-[length:100%_100%] bg-no-repeat shadow-lg p-20 md:p-28 lg:p-32",
            text: "font-sans text-[#2f3e46] font-medium text-sm md:text-base leading-relaxed",
            heading: "font-sans font-black text-[#5c4033] uppercase text-base md:text-lg",
            accent: "border-[#8b4513]",
            choice: "hover:bg-[#dcd9c0]/70 border-[#5c4033] text-[#2f3e46] bg-white/50 text-sm",
        },
    },
}

export const DEFAULT_THEME = BOOK_THEMES.fantasy

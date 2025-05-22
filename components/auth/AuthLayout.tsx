"use client"

import { LanguageSelector } from "@/components/select/select-language"
import { useIsMobile } from "@/hooks/use-mobile"
import logoNoBg from "@/public/logo-no-bg.png"
import Image from "next/image"
import { ReactNode } from "react"

export function AuthLayout({ children }: { children: ReactNode }) {
    const isMobile = useIsMobile()

    if (isMobile) {
        return (
            <div className="flex flex-col min-h-screen w-full h-dvh">
                <div className="p-8 flex justify-center h-44 relative">
                    <Image 
                        src={logoNoBg}
                        alt="Stockaly Logo" 
                        priority
                        fill
                        sizes="(max-width: 176px)"
                        className="object-contain"
                    />
                </div>
                <LanguageSelector className="absolute top-4 right-4" showText={true} />
                <main className="flex-1 flex items-center justify-center p-4">
                    {children}
                </main>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen w-full h-dvh">     
            <main className="w-1/2 flex items-center justify-center p-8 relative">
                <div className="absolute top-4 right-4">
                    <LanguageSelector  />
                </div>
                {children}
            </main>
            <div className="w-1/2 flex items-center justify-center bg-gray-950">
                <div className="w-[500px] h-[500px] relative">
                    <Image 
                        src={logoNoBg}
                        alt="Stockaly Logo" 
                        priority
                        fill
                        sizes="(max-width: 500px)"
                        className="object-contain"
                    />
                </div>
            </div>
        </div>
    )
} 
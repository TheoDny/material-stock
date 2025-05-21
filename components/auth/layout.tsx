"use client"

import { useIsMobile } from "@/hooks/use-mobile"
import Image from "next/image"
import { ReactNode } from "react"

export function AuthLayout({ children }: { children: ReactNode }) {
    const isMobile = useIsMobile()

    if (isMobile) {
        return (
            <div className="flex flex-col min-h-screen h-dvh">
                <div className="p-8 flex justify-center h-24 relative">
                    <Image 
                        src="/logo.png"
                        alt="Material Stock Logo" 
                        priority
                        fill
                        sizes="(max-width: 96px)"
                        className="object-contain"
                    />
                </div>
                <main className="flex-1 flex items-center justify-center p-4">
                    {children}
                </main>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen w-full h-dvh">
            <main className="w-1/2 flex items-center justify-center p-8">
                {children}
            </main>
            <div className="w-1/2 flex items-center justify-center">
                <div className="w-[500px] h-[500px] relative">
                    <Image 
                        src="/logo.png"
                        alt="Material Stock Logo" 
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
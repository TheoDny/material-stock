"use client"

import { Button, buttonVariants } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import * as React from "react"
import type { VariantProps } from "class-variance-authority"
import { useTranslations } from "next-intl"

interface ModeToggleButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

export function ModeToggle(props: ModeToggleButtonProps) {
    const { setTheme } = useTheme()
    const t = useTranslations("Common")

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className="self-center"
                    {...props}
                >
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">{t("changeLanguage")}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>light</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>dark</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>system</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

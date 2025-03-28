"use client"

import { ChevronsUpDown, LogOut, SquareUserRound } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { ModeToggle } from "@/components/select/select-theme"
import * as React from "react"
import Link from "next/link"
import { signOut } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"

export function NavUser({
    user,
}: {
    user: {
        name: string
        avatar: string
    }
}) {
    const { isMobile, open } = useSidebar()
    return (
        <SidebarMenu>
            <SidebarMenuItem className={"flex gap-2 " + (open ? "flex-row" : "flex-col-reverse")}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage
                                    src={user.avatar}
                                    alt={user.name}
                                />
                                <AvatarFallback className="rounded-lg">
                                    {user.name
                                        .split(" ")
                                        .map((n: string) => n[0].toUpperCase())
                                        .join("")
                                        .slice(0, 3)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">{user.name}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage
                                        src={user.avatar}
                                        alt={user.name}
                                    />
                                    <AvatarFallback className="rounded-lg">
                                        {user.name
                                            .split(" ")
                                            .map((n: string) => n[0].toUpperCase())
                                            .join("")
                                            .slice(0, 3)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">{user.name}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                <Link
                                    href={"/account"}
                                    prefetch={false}
                                    className="flex flex-row align-middle gap-2 "
                                >
                                    <SquareUserRound className={"self-center"} />
                                    Account
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => signOut()}>
                            <form className="flex flex-row align-middle gap-2 cursor-pointer">
                                <Button
                                    className="cursor-pointer"
                                    variant="none"
                                    size="none"
                                    type="submit"
                                    formAction={async () => {
                                        await signOut()
                                        window.location.href = "/"
                                    }}
                                >
                                    <LogOut />
                                    D&eacute;connexion
                                </Button>
                            </form>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <ModeToggle size={open ? "default" : "icon"} />
            </SidebarMenuItem>
        </SidebarMenu>
    )
}

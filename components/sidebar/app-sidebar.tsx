"use client"

import * as React from "react"

import { NavMain } from "@/components/sidebar/nav-main"
import { NavUser } from "@/components/sidebar/nav-user"

import { Separator } from "@/components/ui/separator"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import Link from "next/link"

export function AppSidebar({ data, ...props }: React.ComponentProps<typeof Sidebar> & { data: any }) {
    return (
        <Sidebar
            collapsible="icon"
            {...props}
        >
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem className="flex flex-row justify-between">
                        <SidebarMenuButton
                            size="lg"
                            asChild
                        >
                            <div className={"flex justify-between"}>
                                <Link
                                    href="/"
                                    prefetch={false}
                                    className="flex flex-row items-center gap-2 p-2"
                                >
                                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                        {data.header.logo}
                                    </div>
                                    <div className="flex flex-col gap-0.5 leading-none">
                                        <span className="font-semibold">{data.header.name}</span>
                                    </div>
                                </Link>
                            </div>
                        </SidebarMenuButton>
                        <SidebarTrigger className="ml-2 self-center" />
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>{<NavMain groups={data.groups} />}</SidebarContent>
            <Separator />
            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}

import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { auth } from "@/lib/auth"
import { NavigationGroupType, NavigationType } from "@/types/navigation.type"
import { Permission } from "@prisma/client"
import { Boxes, IdCard, ListTree, Logs, SquareChartGantt, Tags, Users } from "lucide-react"
import { NextIntlClientProvider } from "next-intl"
import { getLocale, getTranslations } from "next-intl/server"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { headers } from "next/headers"
import { unauthorized } from "next/navigation"
import type { ReactNode } from "react"
import "../globals.css"

interface RootLayoutProps {
    children: ReactNode
}

export default async function RootLayout({ children }: RootLayoutProps) {
    const session = await auth.api.getSession({
        headers: await headers(),
    }) 

    const locale = await getLocale()
    const tSidebar = await getTranslations("Sidebar")

    if (!session) {
        unauthorized()
    }

    const buildNavigation = async (session: any): Promise<NavigationType> => {
        const navigation: NavigationType = {
            user: {
                name: session.user.name,
                avatar: session.user.image ?? "",
                Entities: session.user.Entities as { id: string; name: string }[],
                EntitySelected: session.user.EntitySelected as { id: string; name: string },
            },
            header: {
                name: "Stockaly",
                logo: <Boxes />,
            },
            groups: [],
        }
        const permissions = new Set(session.user.Permissions.map((permission: Permission) => permission.code))

        if (permissions.has("user_read") || permissions.has("role_read") || permissions.has("log_read")) {
            const adminGroup: NavigationGroupType = {
                title: "Administration",
                items: [],
            }
            if (permissions.has("role_read")) {
                adminGroup.items.push({
                    title: tSidebar("roles"),
                    url: "/administration/roles",
                    icon: <IdCard />,
                })
            }
            if (permissions.has("user_read")) {
                adminGroup.items.push({
                    title: tSidebar("users"),
                    url: "/administration/users",
                    icon: <Users />,
                })
            }
            if (permissions.has("log_read")) {
                adminGroup.items.push({
                    title: tSidebar("logs"),
                    url: "/administration/log",
                    icon: <Logs />,
                })
            }
            navigation.groups.push(adminGroup)
        }

        if (permissions.has("charac_read") || permissions.has("tag_read")) {
            const ConfigGroup: NavigationGroupType = {
                title: tSidebar("configuration"),
                items: [],
            }
            if (permissions.has("charac_read")) {
                ConfigGroup.items.push({
                    title: tSidebar("characteristics"),
                    url: "/configuration/characteristics",
                    icon: <ListTree />,
                })
            }
            if (permissions.has("tag_read")) {
                ConfigGroup.items.push({
                    title: tSidebar("tags"),
                    url: "/configuration/tags",
                    icon: <Tags />,
                })
            }
            navigation.groups.push(ConfigGroup)
        }

        if (permissions.has("charac_read") || permissions.has("tag_read")) {
            const ConfigGroup: NavigationGroupType = {
                title: tSidebar("materials"),
                items: [],
            }
            if (permissions.has("charac_read")) {
                ConfigGroup.items.push({
                    title: tSidebar("materials"),
                    url: "/materials",
                    icon: <SquareChartGantt />,
                })
            }
            navigation.groups.push(ConfigGroup)
        }

        return navigation
    }

    const navigation = await buildNavigation(session)

    return (
        <html
            lang={locale}
            suppressHydrationWarning
        >
            <head>
                <title>Stockaly</title>
                <link rel="icon" href="/favicon.ico" />
            </head>
            <body>
                <NextThemesProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <TooltipProvider delayDuration={100}>
                        <NextIntlClientProvider>
                            <Toaster />
                            <SidebarProvider>
                                <AppSidebar data={navigation} />
                                <SidebarInset className={"p-1.5"}>{children}</SidebarInset>
                            </SidebarProvider>
                        </NextIntlClientProvider>
                    </TooltipProvider>
                </NextThemesProvider>
            </body>
        </html>
    )
}

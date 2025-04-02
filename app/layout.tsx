import type { ReactNode } from "react"
import { Users, Boxes, IdCard, ListTree, Logs, Tags, SquareChartGantt } from "lucide-react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import "./globals.css"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { NavigationType, NavigationGroupType } from "@/types/navigation.type"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { Permission } from "@prisma/client"
import { getLocale, getTranslations } from "next-intl/server"
import { NextIntlClientProvider } from "next-intl"

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
        return (
            <html
                lang={locale}
                suppressHydrationWarning
            >
                <head>
                    <title>Material Stock</title>
                </head>
                <body>
                    <NextIntlClientProvider>
                        <main>{children}</main>
                    </NextIntlClientProvider>
                </body>
            </html>
        )
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
                name: "Material Stock",
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
                    url: "/admin/log",
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
                <title>Material Stock</title>
            </head>
            <body>
                <NextThemesProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <NextIntlClientProvider>
                        <SidebarProvider>
                            <AppSidebar data={navigation} />
                            <SidebarInset className={"p-1.5"}>{children}</SidebarInset>
                        </SidebarProvider>
                    </NextIntlClientProvider>
                </NextThemesProvider>
            </body>
        </html>
    )
}

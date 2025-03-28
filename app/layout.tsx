import type { ReactNode } from "react"
import { Users, Boxes, IdCard, ListTree, Logs, Tags } from "lucide-react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import "./globals.css"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { NavigationType, NavigationGroupType } from "@/types/navigation.type"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { Permission } from "@prisma/client"

interface RootLayoutProps {
    children: ReactNode
}

export default async function RootLayout({ children }: RootLayoutProps) {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    const buildNavigation = async (session: any): Promise<NavigationType> => {
        const navigation: NavigationType = {
            user: {
                name: session.user.name,
                avatar: session.user.image ?? "",
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
                title: "administration",
                items: [],
            }
            if (permissions.has("role_read")) {
                adminGroup.items.push({
                    title: "Roles management",
                    url: "/administration/roles",
                    icon: <IdCard />,
                })
            }
            if (permissions.has("user_read")) {
                adminGroup.items.push({
                    title: "Users management",
                    url: "/administration/users",
                    icon: <Users />,
                })
            }
            if (permissions.has("log_read")) {
                adminGroup.items.push({
                    title: "log",
                    url: "/admin/log",
                    icon: <Logs />,
                })
            }
            navigation.groups.push(adminGroup)
        }

        if (permissions.has("charac_read") || permissions.has("tag_read")) {
            const ConfigGroup: NavigationGroupType = {
                title: "configuration",
                items: [],
            }
            if (permissions.has("charac_read")) {
                ConfigGroup.items.push({
                    title: "Characteristic",
                    url: "/configuration/characteristics",
                    icon: <ListTree />,
                })
            }
            if (permissions.has("tag_read")) {
                ConfigGroup.items.push({
                    title: "Tag",
                    url: "/configuration/tags",
                    icon: <Tags />,
                })
            }
            navigation.groups.push(ConfigGroup)
        }

        return navigation
    }

    const navigation = await buildNavigation(session)

    return (
        <html suppressHydrationWarning>
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
                    <SidebarProvider>
                        <AppSidebar data={navigation} />
                        <SidebarInset className={"p-1.5"}>{children}</SidebarInset>
                    </SidebarProvider>
                </NextThemesProvider>
            </body>
        </html>
    )
}

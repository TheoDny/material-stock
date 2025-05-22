
import { AuthLayout } from "@/components/auth/AuthLayout"
import { NextIntlClientProvider } from "next-intl"
import { getLocale } from "next-intl/server"
import type { ReactNode } from "react"
import "../globals.css"

interface RootLayoutProps {
    children: ReactNode
}

export default async function RootLayout({ children }: RootLayoutProps) {
    const locale = await getLocale()

    return (
        <html
            lang={locale}
            suppressHydrationWarning
        >
            <head>
                <title>Stockaly</title>
                <link rel="icon" href="/favicon.ico" />
            </head>
            <body className="dark">
                <NextIntlClientProvider>
                    <AuthLayout>{children}</AuthLayout>
                </NextIntlClientProvider>
            </body>
        </html>
    )
}

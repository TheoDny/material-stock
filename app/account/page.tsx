import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { Account } from "@/components/account/account"
import { getTranslations } from "next-intl/server"

export default async function AccountPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    })
    const tAccount = await getTranslations("Account")

    return (
        <div className="p-2">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">{tAccount("title")}</h1>
                <p className="text-muted-foreground">{tAccount("description")}</p>
            </div>
            {/* @ts-ignore - TypeScript doesn't recognize our custom session extensions */}
            <Account session={session} />
        </div>
    )
}

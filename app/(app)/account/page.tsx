import { Account } from "@/components/account/account"
import { auth } from "@/lib/auth"
import { getTranslations } from "next-intl/server"
import { headers } from "next/headers"

export default async function AccountPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    })
    if (!session) {
        return null
    }

    const tAccount = await getTranslations("Account")

    return (
        <div className="p-2">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">{tAccount("title")}</h1>
                <p className="text-muted-foreground">{tAccount("description")}</p>
            </div>
            <Account session={session} />
        </div>
    )
}

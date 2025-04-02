import { Suspense } from "react"
import { UserManagement } from "@/components/user-management/user-management"
import { Skeleton } from "@/components/ui/skeleton"
import { getTranslations } from "next-intl/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export default async function UsersPage() {
    const t = await getTranslations("UserManagement")

    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session) {
        return null
    }

    delete session.user.image

    return (
        <div className="p-2">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
                <p className="text-muted-foreground">{t("description")}</p>
            </div>
            <Suspense fallback={<UserManagementSkeleton />}>
                <UserManagement
                    // @ts-ignore because i removed image
                    sessionUser={session.user}
                />
            </Suspense>
        </div>
    )
}

function UserManagementSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-[400px] w-full" />
            </div>
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-[400px] w-full" />
            </div>
        </div>
    )
}

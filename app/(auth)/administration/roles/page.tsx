import { Suspense } from "react"
import { RoleManagement } from "@/components/role-management/role-management"
import { Skeleton } from "@/components/ui/skeleton"
import { getTranslations } from "next-intl/server"

export default async function RolesPage() {
    const t = await getTranslations("RoleManagement")

    return (
        <div className="p-2">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
                <p className="text-muted-foreground">{t("description")}</p>
            </div>
            <Suspense fallback={<RoleManagementSkeleton />}>
                <RoleManagement />
            </Suspense>
        </div>
    )
}

function RoleManagementSkeleton() {
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

import { Suspense } from "react"
import { RoleManagement } from "@/components/role-management/role-management"
import { Skeleton } from "@/components/ui/skeleton"

export default function RolesPage() {
    return (
        <div className="p-2">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
                <p className="text-muted-foreground">Create, edit and manage roles and their permissions</p>
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

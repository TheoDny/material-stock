import { Suspense } from "react"
import { UserManagement } from "@/components/user-management/user-management"
import { Skeleton } from "@/components/ui/skeleton"

export default function UsersPage() {
    return (
        <div className="p-2">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                <p className="text-muted-foreground">Create, edit and manage users and their roles</p>
            </div>
            <Suspense fallback={<UserManagementSkeleton />}>
                <UserManagement />
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

import { Suspense } from "react"
import { CharacteristicManagement } from "@/components/characteristic-management/characteristic-management"
import { Skeleton } from "@/components/ui/skeleton"

export default function CharacteristicsPage() {
    return (
        <div className="p-2">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Characteristic Management</h1>
                <p className="text-muted-foreground">Create and manage characteristics for materials</p>
            </div>
            <Suspense fallback={<CharacteristicManagementSkeleton />}>
                <CharacteristicManagement />
            </Suspense>
        </div>
    )
}

function CharacteristicManagementSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex justify-between">
                <Skeleton className="h-10 w-[250px]" />
                <Skeleton className="h-10 w-[100px]" />
            </div>
            <Skeleton className="h-[500px] w-full" />
        </div>
    )
}

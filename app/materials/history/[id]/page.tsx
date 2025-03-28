import { Suspense } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { MaterialHistoryView } from "@/components/material-management/material-history-view"
import { Skeleton } from "@/components/ui/skeleton"
import { getMaterialByIdAction } from "@/actions/material-history-actions"

interface MaterialHistoryPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function MaterialHistoryPage({ params }: MaterialHistoryPageProps) {
    // Await params before accessing its properties
    const resolvedParams = await params
    const materialId = resolvedParams.id

    const material = await getMaterialByIdAction(materialId)

    if (!material) {
        notFound()
    }

    return (
        <div className="p-2">
            <div className="mb-6">
                <Link href="/dashboard/materials">
                    <Button
                        variant="ghost"
                        className="mb-4"
                    >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Back to Materials
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Material History</h1>
                <p className="text-muted-foreground">View history for {material.name}</p>
            </div>
            <Suspense fallback={<MaterialHistorySkeleton />}>
                <MaterialHistoryView
                    materialId={materialId}
                    materialName={material.name}
                />
            </Suspense>
        </div>
    )
}

function MaterialHistorySkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-[500px] w-full" />
        </div>
    )
}

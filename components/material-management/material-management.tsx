"use client"

import { useState, useEffect } from "react"
import { Plus, Search, History, FileEdit, Pencil } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MaterialDialog } from "./material-dialog"
import { getMaterialsAction } from "@/actions/material-actions"
import { formatDate } from "@/lib/utils"
import { MaterialWithTag } from "@/types/material.type"
import { DataTable, Column } from "@/components/ui/data-table"

type SortField = "name" | "updatedAt"
type SortDirection = "asc" | "desc"

export function MaterialManagement() {
    const router = useRouter()
    const [materials, setMaterials] = useState<MaterialWithTag[]>([])
    const [filteredMaterials, setFilteredMaterials] = useState<MaterialWithTag[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingMaterial, setEditingMaterial] = useState<MaterialWithTag | null>(null)
    const [sortField, setSortField] = useState<SortField>("updatedAt")
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
    const t = useTranslations("Materials")

    useEffect(() => {
        loadMaterials()
    }, [])

    useEffect(() => {
        filterMaterials()
    }, [materials, searchQuery, sortField, sortDirection])

    const loadMaterials = async () => {
        try {
            const materialsData = await getMaterialsAction()
            setMaterials(materialsData)
        } catch (error) {
            console.error(error)
            toast.error("Failed to load materials")
        }
    }

    const filterMaterials = () => {
        let filtered = [...materials]

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(
                (material) =>
                    material.name.toLowerCase().includes(query) ||
                    material.description.toLowerCase().includes(query),
            )
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let comparison = 0

            if (sortField === "name") {
                comparison = a.name.localeCompare(b.name)
            } else if (sortField === "updatedAt") {
                comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
            }

            return sortDirection === "asc" ? comparison : -comparison
        })

        setFilteredMaterials(filtered)
    }

    const handleCreateMaterial = () => {
        setEditingMaterial(null)
        setIsDialogOpen(true)
    }

    const handleEditMaterial = (material: MaterialWithTag) => {
        setEditingMaterial(material)
        setIsDialogOpen(true)
    }

    const handleViewHistory = (materialId: string) => {
        router.push(`/materials/history/${materialId}`)
    }

    const handleMaterialDialogClose = (success: boolean) => {
        setIsDialogOpen(false)

        if (success) {
            loadMaterials()
        }
    }

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        } else {
            setSortField(field)
            setSortDirection("asc")
        }
    }

    // Définition des colonnes pour DataTable
    const columns: Column<MaterialWithTag>[] = [
        {
            key: "name",
            header: "Name",
            cell: (material) => (
                <div>
                    <div className="font-medium">{material.name}</div>
                    <div className="text-sm text-muted-foreground truncate max-w-[250px]">
                        {material.description}
                    </div>
                </div>
            ),
        },
        {
            key: "tags",
            header: "Tags",
            cell: (material) => (
                <div className="flex flex-wrap gap-1">
                    {material.Tags.length > 0 ? (
                        material.Tags.map((tag) => (
                            <Badge
                                key={tag.id}
                                style={{
                                    backgroundColor: tag.color,
                                    color: tag.fontColor,
                                }}
                            >
                                {tag.name}
                            </Badge>
                        ))
                    ) : (
                        <span className="text-muted-foreground">No tags</span>
                    )}
                </div>
            ),
        },
        {
            key: "updatedAt",
            header: "Last Updated",
            cell: (material) => formatDate(material.updatedAt),
        },
        {
            key: "actions",
            header: "Actions",
            cell: (material) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                        >
                            <FileEdit className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditMaterial(material)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit Material
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewHistory(material.id)}>
                            <History className="h-4 w-4 mr-2" />
                            View History
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ]

    return (
        <div className="space-y-4 ">
            <div className="flex justify-between items-center">
                <div className="relative w-[300px]">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t("search")}
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button onClick={handleCreateMaterial}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t("newMaterial")}
                </Button>
            </div>

            <DataTable
                data={filteredMaterials}
                columns={columns}
                keyExtractor={(material) => material.id}
                pageSizeOptions={[15, 50, 100]}
                defaultPageSize={15}
                noDataMessage="No materials found."
            />

            <MaterialDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                material={editingMaterial}
                onClose={handleMaterialDialogClose}
            />
        </div>
    )
}

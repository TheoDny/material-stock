"use client"

import { useState, useEffect } from "react"
import { Plus, Search, ArrowUpDown, Eye, History, FileEdit } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
            console.error(error);
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

    const getSortIcon = (field: SortField) => {
        if (sortField !== field) return null

        return <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "desc" ? "transform rotate-180" : ""}`} />
    }

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

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[250px]">
                                <Button
                                    variant="ghost"
                                    onClick={() => handleSort("name")}
                                    className="flex items-center"
                                >
                                    Name
                                    {getSortIcon("name")}
                                </Button>
                            </TableHead>
                            <TableHead>Tags</TableHead>
                            <TableHead className="w-[180px]">
                                <Button
                                    variant="ghost"
                                    onClick={() => handleSort("updatedAt")}
                                    className="flex items-center"
                                >
                                    Last Updated
                                    {getSortIcon("updatedAt")}
                                </Button>
                            </TableHead>
                            <TableHead className="w-[120px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredMaterials.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="text-center h-24"
                                >
                                    No materials found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredMaterials.map((material) => (
                                <TableRow key={material.id}>
                                    <TableCell className="font-medium">
                                        <div>{material.name}</div>
                                        <div className="text-sm text-muted-foreground truncate max-w-[250px]">
                                            {material.description}
                                        </div>
                                    </TableCell>
                                    <TableCell>
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
                                    </TableCell>
                                    <TableCell>{formatDate(material.updatedAt)}</TableCell>
                                    <TableCell>
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
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    Edit Material
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleViewHistory(material.id)}>
                                                    <History className="h-4 w-4 mr-2" />
                                                    View History
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <MaterialDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                material={editingMaterial}
                onClose={handleMaterialDialogClose}
            />
        </div>
    )
}

"use client"

import { useState, useEffect } from "react"
import { Plus, Pencil, Search, ArrowUpDown } from "lucide-react"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TagDialog } from "./tag-dialog"
import { getTagsAction } from "@/actions/tag-actions"
import { TagAndCountMaterial } from "@/types/tag.type"

type SortField = "name" | "colorText" | "materialsCount"
type SortDirection = "asc" | "desc"

export function TagManagement() {
    const t = useTranslations("Configuration.tags")
    const [tags, setTags] = useState<TagAndCountMaterial[]>([])
    const [filteredTags, setFilteredTags] = useState<TagAndCountMaterial[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingTag, setEditingTag] = useState<TagAndCountMaterial | null>(null)
    const [sortField, setSortField] = useState<SortField>("name")
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

    useEffect(() => {
        loadTags()
    }, [])

    useEffect(() => {
        filterTags()
    }, [tags, searchQuery, sortField, sortDirection])

    const loadTags = async () => {
        try {
            const tagsData = await getTagsAction()
            setTags(tagsData)
        } catch (error) {
            toast.error("Failed to load tags")
        }
    }

    const filterTags = () => {
        let filtered = [...tags]

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(
                (tag) => tag.name.toLowerCase().includes(query) || tag.fontColor.toLowerCase().includes(query),
            )
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let comparison = 0

            if (sortField === "name") {
                comparison = a.name.localeCompare(b.name)
            } else if (sortField === "colorText") {
                comparison = a.fontColor.localeCompare(b.fontColor)
            } else if (sortField === "materialsCount") {
                comparison = a._count.Materials - b._count.Materials
            }

            return sortDirection === "asc" ? comparison : -comparison
        })

        setFilteredTags(filtered)
    }

    const handleCreateTag = () => {
        setEditingTag(null)
        setIsDialogOpen(true)
    }

    const handleEditTag = (tag: TagAndCountMaterial) => {
        setEditingTag(tag)
        setIsDialogOpen(true)
    }

    const handleTagDialogClose = (success: boolean) => {
        setIsDialogOpen(false)

        if (success) {
            loadTags()
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
        <div className="space-y-4">
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
                <Button onClick={handleCreateTag}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t("newTag")}
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[200px]">
                                <Button
                                    variant="ghost"
                                    onClick={() => handleSort("name")}
                                    className="flex items-center"
                                >
                                    Name
                                    {getSortIcon("name")}
                                </Button>
                            </TableHead>
                            <TableHead>
                                <Button
                                    variant="ghost"
                                    onClick={() => handleSort("colorText")}
                                    className="flex items-center"
                                >
                                    Color Text
                                    {getSortIcon("colorText")}
                                </Button>
                            </TableHead>
                            <TableHead>Color</TableHead>
                            <TableHead>
                                <Button
                                    variant="ghost"
                                    onClick={() => handleSort("materialsCount")}
                                    className="flex items-center"
                                >
                                    Materials
                                    {getSortIcon("materialsCount")}
                                </Button>
                            </TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTags.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="text-center h-24"
                                >
                                    No tags found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredTags.map((tag) => (
                                <TableRow key={tag.id}>
                                    <TableCell>
                                        <Badge
                                            style={{
                                                backgroundColor: tag.color,
                                                color: tag.fontColor,
                                            }}
                                        >
                                            {tag.name}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{tag.fontColor}</TableCell>
                                    <TableCell>
                                        <div
                                            className="w-6 h-6 rounded-full"
                                            style={{ backgroundColor: tag.color }}
                                        />
                                    </TableCell>
                                    <TableCell>{tag._count.Materials}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEditTag(tag)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <TagDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                tag={editingTag}
                onClose={handleTagDialogClose}
            />
        </div>
    )
}

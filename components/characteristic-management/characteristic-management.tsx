"use client"

import { useState, useEffect } from "react"
import { Plus, Pencil, Search, ArrowUpDown } from "lucide-react"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CharacteristicDialog } from "./characteristic-dialog"
import { getCharacteristicsAction } from "@/actions/characteritic-actions"
import { CharacteristicAndCountMaterial } from "@/types/characteristic.type"
import { CharacteristicType } from "@prisma/client"
import { getTypeColor } from "@/lib/utils"

type SortField = "name" | "type" | "materialsCount"
type SortDirection = "asc" | "desc"

export function CharacteristicManagement() {
    const t = useTranslations("Configuration.characteristics")
    const [characteristics, setCharacteristics] = useState<CharacteristicAndCountMaterial[]>([])
    const [filteredCharacteristics, setFilteredCharacteristics] = useState<CharacteristicAndCountMaterial[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingCharacteristic, setEditingCharacteristic] = useState<CharacteristicAndCountMaterial | null>(null)
    const [sortField, setSortField] = useState<SortField>("name")
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

    useEffect(() => {
        loadCharacteristics()
    }, [])

    useEffect(() => {
        filterCharacteristics()
    }, [characteristics, searchQuery, sortField, sortDirection])

    const loadCharacteristics = async () => {
        try {
            const characteristicsData = await getCharacteristicsAction()
            setCharacteristics(characteristicsData)
        } catch (error) {
            toast.error("Failed to load characteristics")
        }
    }

    const filterCharacteristics = () => {
        let filtered = [...characteristics]

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(
                (characteristic) =>
                    characteristic.name.toLowerCase().includes(query) ||
                    characteristic.description.toLowerCase().includes(query) ||
                    characteristic.type.toLowerCase().includes(query),
            )
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let comparison = 0

            if (sortField === "name") {
                comparison = a.name.localeCompare(b.name)
            } else if (sortField === "type") {
                comparison = a.type.localeCompare(b.type)
            } else if (sortField === "materialsCount") {
                comparison = a._count.Materials - b._count.Materials
            }

            return sortDirection === "asc" ? comparison : -comparison
        })

        setFilteredCharacteristics(filtered)
    }

    const handleCreateCharacteristic = () => {
        setEditingCharacteristic(null)
        setIsDialogOpen(true)
    }

    const handleEditCharacteristic = (characteristic: CharacteristicAndCountMaterial) => {
        setEditingCharacteristic(characteristic)
        setIsDialogOpen(true)
    }

    const handleCharacteristicDialogClose = (success: boolean) => {
        setIsDialogOpen(false)

        if (success) {
            loadCharacteristics()
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
                <Button onClick={handleCreateCharacteristic}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t("newCharacteristic")}
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
                            <TableHead>Description</TableHead>
                            <TableHead>
                                <Button
                                    variant="ghost"
                                    onClick={() => handleSort("type")}
                                    className="flex items-center"
                                >
                                    Type
                                    {getSortIcon("type")}
                                </Button>
                            </TableHead>
                            <TableHead>Options</TableHead>
                            <TableHead>Units</TableHead>
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
                        {filteredCharacteristics.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
                                    className="text-center h-24"
                                >
                                    No characteristics found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredCharacteristics.map((characteristic) => (
                                <TableRow key={characteristic.id}>
                                    <TableCell className="font-medium">{characteristic.name}</TableCell>
                                    <TableCell className="max-w-[200px] truncate">
                                        {characteristic.description}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getTypeColor(characteristic.type)}>
                                            {characteristic.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{/* TODO handle option with different type*/}</TableCell>
                                    <TableCell>
                                        {characteristic.units || (
                                            <span className="text-muted-foreground">None</span>
                                        )}
                                    </TableCell>
                                    <TableCell>{characteristic._count.Materials}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEditCharacteristic(characteristic)}
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

            <CharacteristicDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                characteristic={editingCharacteristic}
                onClose={handleCharacteristicDialogClose}
            />
        </div>
    )
}

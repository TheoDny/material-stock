"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { format } from "date-fns"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getMaterialHistoryAction } from "@/actions/material-history-actions"
import { Material_History } from "@prisma/client"

interface MaterialHistoryViewProps {
    materialId: string
    materialName: string
}

export function MaterialHistoryView({ materialId, materialName }: MaterialHistoryViewProps) {
    const [history, setHistory] = useState<Material_History[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadHistory()
    }, [materialId])

    const loadHistory = async () => {
        try {
            setLoading(true)
            const historyData = await getMaterialHistoryAction(materialId)
            setHistory(historyData)
        } catch (error) {
            toast.error("Failed to load material history")
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Loading history...</CardTitle>
                </CardHeader>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Version History for {materialName}</CardTitle>
            </CardHeader>
            <CardContent>
                {history.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        No history records found for this material.
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Description</TableHead>
                                <TableHead className="w-[180px]">Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {history.map((record) => (
                                <TableRow key={record.id}>
                                    <TableCell className="max-w-[300px] truncate">
                                        {record.description || (
                                            <span className="text-muted-foreground">No description</span>
                                        )}
                                    </TableCell>
                                    <TableCell>{format(new Date(record.createdAt), "PPP p")}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    )
}

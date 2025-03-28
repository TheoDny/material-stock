"use client"

import React from "react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { format } from "date-fns"
import { Material_History } from "@prisma/client"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { JsonValue } from "@prisma/client/runtime/library"
import { getMaterialHistoryAction } from "@/actions/material-history-actions"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Check, X } from "lucide-react"
import { isEmpty } from "@/lib/utils"

// Define types for parsed JSON fields
type Tag = {
    id: string
    name: string
    color: string
    fontColor?: string
}

type Characteristic = {
    id: string
    name: string
    value: any
    type: string
    units?: string
}

interface MaterialHistoryViewProps {
    materialId: string
    materialName: string
}

// Helper function to safely convert JsonValue to string
const safeJsonToString = (json: JsonValue): string => {
    if (typeof json === "string") return json
    if (json === null) return ""
    return JSON.stringify(json)
}

// Helper function to parse Tags JSON
const parseTags = (tagsJson: JsonValue): Tag[] => {
    if (!tagsJson) return []
    try {
        const jsonString = safeJsonToString(tagsJson)
        return jsonString ? JSON.parse(jsonString) : []
    } catch (error) {
        console.error("Error parsing Tags JSON:", error)
        return []
    }
}

// Helper function to parse Characteristics JSON
const parseCharacteristics = (characteristicsJson: JsonValue): Characteristic[] => {
    if (!characteristicsJson) return []
    try {
        const jsonString = safeJsonToString(characteristicsJson)
        return jsonString ? JSON.parse(jsonString) : []
    } catch (error) {
        console.error("Error parsing Characteristics JSON:", error)
        return []
    }
}

// Format characteristic value based on type
const formatCharacteristicValue = (characteristic: Characteristic) => {
    if (characteristic.value === null || characteristic.value === undefined || isEmpty(characteristic.value))
        return "N/A"

    switch (characteristic.type) {
        case "checkbox":
            return characteristic.value ? (
                <>
                    <Check className="text-green-600" />
                    "Yes"
                </>
            ) : (
                <>
                    <X className="text-red-700" />
                    "No"
                </>
            )
        case "number":
        case "float":
            return characteristic.value.toString()
        case "date":
            return new Date(characteristic.value).toLocaleDateString()
        case "multiSelect":
            return Array.isArray(characteristic.value) ? characteristic.value.join(", ") : characteristic.value
        default:
            return characteristic.value.toString()
    }
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
                    <CardTitle>Material History - {materialName}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">Loading history...</div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Material History - {materialName}</CardTitle>
            </CardHeader>
            <CardContent>
                <MaterialHistoryDisplay history={history} />
            </CardContent>
        </Card>
    )
}

// Component that just displays the history without fetching it
export default function MaterialHistoryDisplay({ history }: { history: Material_History[] }) {
    if (!history || history.length === 0) {
        return <div>No history records found.</div>
    }

    return (
        <div className="space-y-4">
            <div className="border rounded-md">
                {history.map((record, index) => (
                    <React.Fragment key={record.id || index}>
                        {index > 0 && <Separator />}
                        <Accordion
                            type="single"
                            collapsible
                            className="w-full"
                        >
                            <AccordionItem value={`item-${index}`}>
                                <AccordionTrigger className="px-4">
                                    <div className="flex justify-between w-full">
                                        <span>{new Date(record.createdAt).toLocaleString()}</span>
                                        <span className="text-sm text-gray-500">Record for {record.name}</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-4">
                                    {/* Tabs for mobile and medium screens */}
                                    <div className="lg:hidden">
                                        <Tabs defaultValue="details">
                                            <TabsList className="w-full grid grid-cols-2 gap-2 mt-2">
                                                <TabsTrigger value="details">Details & Tags</TabsTrigger>
                                                <TabsTrigger value="characteristics">Characteristics</TabsTrigger>
                                            </TabsList>

                                            <TabsContent value="details">
                                                <div className="grid grid-cols-2 gap-2 mt-2">
                                                    <div className="text-sm font-medium">Name:</div>
                                                    <div className="text-sm">{record.name || "N/A"}</div>

                                                    <div className="text-sm font-medium">Description:</div>
                                                    <div className="text-sm">{record.description || "N/A"}</div>

                                                    <div className="text-sm font-medium">Created at:</div>
                                                    <div className="text-sm">
                                                        {new Date(record.createdAt).toLocaleString()}
                                                    </div>
                                                </div>

                                                <div className="mt-4">
                                                    <div className="text-sm font-medium mb-2">Tags:</div>
                                                    {parseTags(record.Tags).length > 0 ? (
                                                        <div className="flex flex-wrap gap-2">
                                                            {parseTags(record.Tags).map((tag, idx) => (
                                                                <Badge
                                                                    style={{
                                                                        backgroundColor: tag.color,
                                                                        color: tag.fontColor,
                                                                    }}
                                                                >
                                                                    {tag.name}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="text-sm text-gray-500">No tags</div>
                                                    )}
                                                </div>
                                            </TabsContent>

                                            <TabsContent value="characteristics">
                                                {parseCharacteristics(record.Characteristics).length > 0 ? (
                                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                                        {parseCharacteristics(record.Characteristics).map(
                                                            (char, idx) => (
                                                                <React.Fragment key={char.id || idx}>
                                                                    {idx > 0 && (
                                                                        <Separator className="w-2/3 col-span-2 my-2" />
                                                                    )}
                                                                    <div className="text-sm font-medium">
                                                                        {char.name}:
                                                                    </div>
                                                                    <div className="text-sm">
                                                                        {formatCharacteristicValue(char)}
                                                                        {char.units ? ` ${char.units}` : ""}
                                                                    </div>
                                                                </React.Fragment>
                                                            ),
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="mt-2 text-sm text-gray-500">
                                                        No characteristics
                                                    </div>
                                                )}
                                            </TabsContent>
                                        </Tabs>
                                    </div>

                                    {/* Side by side for large screens */}
                                    <div className="hidden lg:grid lg:grid-cols-2 lg:gap-6 lg:mt-2">
                                        {/* Left column: Details and Tags */}
                                        <div>
                                            <h3 className="text-sm font-medium mb-3">Details & Tags</h3>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="text-sm font-medium">Name:</div>
                                                <div className="text-sm">{record.name || "N/A"}</div>

                                                <div className="text-sm font-medium">Description:</div>
                                                <div className="text-sm">{record.description || "N/A"}</div>

                                                <div className="text-sm font-medium">Created at:</div>
                                                <div className="text-sm">
                                                    {new Date(record.createdAt).toLocaleString()}
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <div className="text-sm font-medium mb-2">Tags:</div>
                                                {parseTags(record.Tags).length > 0 ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {parseTags(record.Tags).map((tag, idx) => (
                                                            <Badge
                                                                style={{
                                                                    backgroundColor: tag.color,
                                                                    color: tag.fontColor,
                                                                }}
                                                            >
                                                                {tag.name}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-gray-500">No tags</div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right column: Characteristics */}
                                        <div>
                                            <h3 className="text-sm font-medium mb-3">Characteristics</h3>
                                            {parseCharacteristics(record.Characteristics).length > 0 ? (
                                                <div className="grid grid-cols-2 gap-2">
                                                    {parseCharacteristics(record.Characteristics).map(
                                                        (char, idx) => (
                                                            <React.Fragment key={char.id || idx}>
                                                                {idx > 0 && (
                                                                    <Separator className="!w-29/30 justify-self-center col-span-2 my-2" />
                                                                )}
                                                                <div className="text-sm font-medium">
                                                                    {char.name}:
                                                                </div>
                                                                <div className="text-sm">
                                                                    {formatCharacteristicValue(char)}
                                                                    {char.units ? ` ${char.units}` : ""}
                                                                </div>
                                                            </React.Fragment>
                                                        ),
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-sm text-gray-500">No characteristics</div>
                                            )}
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </React.Fragment>
                ))}
            </div>
        </div>
    )
}

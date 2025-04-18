"use client"

import React from "react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Material_History } from "@prisma/client"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { JsonValue } from "@prisma/client/runtime/library"
import { getMaterialHistoryAction } from "@/actions/material-history-actions"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Check, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { isEmpty } from "@/lib/utils"
import { DatePickerRange } from "@/components/ui/date-picker-range"
import { Button } from "@/components/ui/button"
import { addMonths, startOfDay, endOfDay } from "date-fns"
import { DateRange } from "react-day-picker"
import { useTranslations } from "next-intl"
import { Skeleton } from "../ui/skeleton"

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
    value: ValueCharacteristic
    type: string
    units?: string
}

type ValueCharacteristic = any

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
                    Yes
                </>
            ) : (
                <>
                    <X className="text-red-700" />
                    No
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
    const historyT = useTranslations("MaterialHistory")
    const common = useTranslations("Common")
    const materialsT = useTranslations("Materials")

    const [history, setHistory] = useState<Material_History[]>([])
    const [loading, setLoading] = useState(true)
    const [dateRange, setDateRange] = useState<DateRange>({
        from: addMonths(new Date(), -1),
        to: new Date(),
    })
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const itemsPerPage = 10

    useEffect(() => {
        loadHistory()
    }, [materialId])

    const handleSetDateRange = (range: DateRange | undefined) => {
        if (range) setDateRange(range)
    }

    const loadHistory = async () => {
        try {
            setLoading(true)
            const result = await getMaterialHistoryAction({
                materialId,
                dateFrom: dateRange.from ? startOfDay(dateRange.from) : addMonths(startOfDay(new Date()), -1),
                dateTo: dateRange.to ? endOfDay(dateRange.to) : endOfDay(new Date()),
            })

            if (result?.bindArgsValidationErrors) {
                console.error(result?.bindArgsValidationErrors)
                toast.error(historyT("validationError"))
            } else if (result?.serverError) {
                console.error(result?.serverError)
                toast.error(historyT("serverError"))
            } else if (result?.validationErrors) {
                console.error(result?.validationErrors)
                toast.error(historyT("validationError"))
            } else if (!result?.data) {
                console.error("No data returned")
                toast.error(historyT("noData"))
            } else {
                setHistory(result.data)
                setTotalPages(Math.ceil(result.data.length / itemsPerPage))
                setCurrentPage(1) // Reset to first page when new data is loaded
            }
        } catch (error) {
            console.error(error)
            toast.error(historyT("failedToLoad"))
        } finally {
            setLoading(false)
        }
    }

    // Get current page items
    const getCurrentPageItems = () => {
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        return history.slice(startIndex, endIndex)
    }

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage((current) => current + 1)
        }
    }

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage((current) => current - 1)
        }
    }

    const goToFirstPage = () => {
        setCurrentPage(1)
    }

    const goToLastPage = () => {
        setCurrentPage(totalPages)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {materialsT("history.title")} - {materialName}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-4 mb-4 sm:flex-row items-end">
                    <DatePickerRange
                        date={dateRange}
                        setDate={handleSetDateRange}
                        textHolder={common("selectDateRange")}
                        className="w-full sm:w-auto"
                        hoursText={{
                            label: common("language") === "fr" ? "Heures" : "Hours",
                            from: common("language") === "fr" ? "De" : "From",
                            to: common("language") === "fr" ? "À" : "To",
                        }}
                    />
                    <Button
                        onClick={loadHistory}
                        disabled={loading}
                    >
                        {loading ? common("loading") : common("filter")}
                    </Button>
                </div>

                {loading ? (
                    <>
                        <Skeleton className="h-[570px] w-full mb-1" />
                        <Skeleton className="h-[35px] w-full" />
                    </>
                ) : (
                    <>
                        <MaterialHistoryDisplay history={getCurrentPageItems()} />

                        {/* Pagination controls */}
                        {history.length > 0 && (
                            <div className="flex justify-between items-center mt-4">
                                <div className="text-sm text-muted-foreground">
                                    {(currentPage - 1) * itemsPerPage + 1}
                                    {" - "}
                                    {Math.min(currentPage * itemsPerPage, history.length)}{" "}
                                    {" -- (" + history.length + ")"}
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={goToFirstPage}
                                        disabled={currentPage === 1}
                                    >
                                        <ChevronsLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={goToPreviousPage}
                                        disabled={currentPage === 1}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <span className="text-sm">
                                        {currentPage} / {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={goToNextPage}
                                        disabled={currentPage >= totalPages}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={goToLastPage}
                                        disabled={currentPage >= totalPages}
                                    >
                                        <ChevronsRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    )
}

// Component that just displays the history without fetching it
export default function MaterialHistoryDisplay({ history }: { history: Material_History[] }) {
    const historyT = useTranslations("MaterialHistory")
    const materialsT = useTranslations("Materials")

    if (!history || history.length === 0) {
        return <div>{materialsT("history.noHistory")}</div>
    }

    return (
        <div className="space-y-4">
            <div className="border rounded-md">
                {history.map((record, index) => (
                    <React.Fragment key={index}>
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
                                        <span className="text-sm text-gray-500">
                                            {historyT("recordFor")} {record.name}
                                        </span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-4">
                                    {/* Tabs for mobile and medium screens */}
                                    <div className="lg:hidden">
                                        <Tabs defaultValue="details">
                                            <TabsList className="w-full grid grid-cols-2 gap-2 mt-2">
                                                <TabsTrigger value="details">
                                                    {historyT("detailsAndTags")}
                                                </TabsTrigger>
                                                <TabsTrigger value="characteristics">
                                                    {historyT("characteristics")}
                                                </TabsTrigger>
                                            </TabsList>

                                            <TabsContent value="details">
                                                <div className="grid grid-cols-2 gap-2 mt-2">
                                                    <div className="text-sm font-medium">{historyT("name")}:</div>
                                                    <div className="text-sm">{record.name || historyT("na")}</div>

                                                    <div className="text-sm font-medium">
                                                        {historyT("description")}:
                                                    </div>
                                                    <div className="text-sm">
                                                        {record.description || historyT("na")}
                                                    </div>

                                                    <div className="text-sm font-medium">
                                                        {historyT("createdAt")}:
                                                    </div>
                                                    <div className="text-sm">
                                                        {new Date(record.createdAt).toLocaleString()}
                                                    </div>
                                                </div>

                                                <div className="mt-4">
                                                    <div className="text-sm font-medium mb-2">
                                                        {historyT("tags")}:
                                                    </div>
                                                    {parseTags(record.Tags).length > 0 ? (
                                                        <div className="flex flex-wrap gap-2">
                                                            {parseTags(record.Tags).map((tag, idx) => (
                                                                <Badge
                                                                    style={{
                                                                        backgroundColor: tag.color,
                                                                        color: tag.fontColor,
                                                                    }}
                                                                    key={idx}
                                                                >
                                                                    {tag.name}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="text-sm text-gray-500">
                                                            {historyT("noTags")}
                                                        </div>
                                                    )}
                                                </div>
                                            </TabsContent>

                                            <TabsContent value="characteristics">
                                                {parseCharacteristics(record.Characteristics).length > 0 ? (
                                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                                        {parseCharacteristics(record.Characteristics).map(
                                                            (char, idx) => (
                                                                <React.Fragment key={idx}>
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
                                                        {historyT("noCharacteristics")}
                                                    </div>
                                                )}
                                            </TabsContent>
                                        </Tabs>
                                    </div>

                                    {/* Side by side for large screens */}
                                    <div className="hidden lg:grid lg:grid-cols-2 lg:gap-6 lg:mt-2">
                                        {/* Left column: Details and Tags */}
                                        <div>
                                            <h3 className="text-sm font-medium mb-3">
                                                {historyT("detailsAndTags")}
                                            </h3>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="text-sm font-medium">{historyT("name")}:</div>
                                                <div className="text-sm">{record.name || historyT("na")}</div>

                                                <div className="text-sm font-medium">
                                                    {historyT("description")}:
                                                </div>
                                                <div className="text-sm">
                                                    {record.description || historyT("na")}
                                                </div>

                                                <div className="text-sm font-medium">{historyT("createdAt")}:</div>
                                                <div className="text-sm">
                                                    {new Date(record.createdAt).toLocaleString()}
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <div className="text-sm font-medium mb-2">{historyT("tags")}:</div>
                                                {parseTags(record.Tags).length > 0 ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {parseTags(record.Tags).map((tag, idx) => (
                                                            <Badge
                                                                style={{
                                                                    backgroundColor: tag.color,
                                                                    color: tag.fontColor,
                                                                }}
                                                                key={idx}
                                                            >
                                                                {tag.name}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-gray-500">
                                                        {historyT("noTags")}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right column: Characteristics */}
                                        <div>
                                            <h3 className="text-sm font-medium mb-3">
                                                {historyT("characteristics")}
                                            </h3>
                                            {parseCharacteristics(record.Characteristics).length > 0 ? (
                                                <div className="grid grid-cols-2 gap-2">
                                                    {parseCharacteristics(record.Characteristics).map(
                                                        (char, idx) => (
                                                            <React.Fragment key={idx}>
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
                                                <div className="text-sm text-gray-500">
                                                    {historyT("noCharacteristics")}
                                                </div>
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

"use client"

import { useState, useEffect } from "react"
import { useTranslations, useLocale } from "next-intl"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Combobox, ComboboxOption } from "@/components/ui/combobox"
import { Button } from "@/components/ui/button"
import { format, subDays } from "date-fns"
import { fr, enUS } from "date-fns/locale"
import { LogEntry } from "@/types/log.type"
import { Skeleton } from "../ui/skeleton"
import { LogType } from "@prisma/client"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { getLogsAction } from "@/actions/log-actions"

export function LogTable({ logs }: { logs: LogEntry[] }) {
    const t = useTranslations("Logs")
    const tCommon = useTranslations("Common")
    const locale = useLocale()
    const [filterLoading, setFilterLoading] = useState(true)
    const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([])
    const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 7))
    const [endDate, setEndDate] = useState<Date>(new Date())
    const [isLoadingData, setIsLoadingData] = useState(false)
    const [filters, setFilters] = useState<{
        logType: string[]
        user: string[]
        entity: string[]
        role: string[]
        material: string[]
        characteristic: string[]
        tag: string[]
    }>({
        logType: [],
        user: [],
        entity: [],
        role: [],
        material: [],
        characteristic: [],
        tag: [],
    })

    // Charger les logs avec les dates sélectionnées
    const loadLogs = async () => {
        setIsLoadingData(true)
        try {
            let result = await getLogsAction({
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
            })

            if (result?.bindArgsValidationErrors) {
                console.error("Validation errors:", result.bindArgsValidationErrors)
                result.data = []
            } else if (result?.serverError) {
                console.error("Server error:", result.serverError)
                result.data = []
            } else if (result?.validationErrors) {
                console.error("Validation errors:", result.validationErrors)
                result.data = []
            } else if (!result?.data) {
                console.error("No data returned from server")
                result = { data: [] }
            }

            setFilteredLogs(result.data as LogEntry[])
            setIsLoadingData(false)
            setFilterLoading(false)
        } catch (error) {
            console.error("Error loading logs:", error)
            setIsLoadingData(false)
        }
    }

    // Charger les logs au changement de dates
    useEffect(() => {
        loadLogs()
    }, [startDate, endDate])

    // Charger les logs initiaux
    useEffect(() => {
        if (logs.length > 0) {
            setFilteredLogs(logs)
            setFilterLoading(false)
        }
    }, [logs])

    // Get log types for filter
    const logTypes = Object.values(LogType).map((type) => ({
        value: type,
        label: t("label." + type),
    }))

    // Extract users, entities, roles, etc. for filters
    const getFilterOptions = (logs: LogEntry[], key: string): ComboboxOption[] => {
        const uniqueItems = new Map<string, string>()

        logs.forEach((log) => {
            if (key === "user" && log.user) {
                uniqueItems.set(log.user.id, log.user.name)
            } else if (key === "entity" && log.entity) {
                uniqueItems.set(log.entity.id, log.entity.name)
            } else if (key === "role" && log.type.includes("role_") && log.info?.role) {
                uniqueItems.set(log.info.role.id, log.info.role.name)
            } else if (key === "material" && log.type.includes("material_") && log.info?.material) {
                uniqueItems.set(log.info.material.id, log.info.material.name)
            } else if (
                key === "characteristic" &&
                log.type.includes("characteristic_") &&
                log.info?.characteristic
            ) {
                uniqueItems.set(log.info.characteristic.id, log.info.characteristic.name)
            } else if (key === "tag" && log.type.includes("tag_") && log.info?.tag) {
                uniqueItems.set(log.info.tag.id, log.info.tag.name)
            }
        })

        return Array.from(uniqueItems).map(([id, name]) => ({
            value: id,
            label: name,
        }))
    }

    // Apply filters when they change
    useEffect(() => {
        setFilterLoading(true)

        let result = [...filteredLogs]

        if (filters.logType.length > 0) {
            result = result.filter((log) => filters.logType.includes(log.type))
        }

        if (filters.user.length > 0) {
            result = result.filter((log) => log.user && filters.user.includes(log.user.id))
        }

        if (filters.entity.length > 0) {
            result = result.filter((log) => log.entity && filters.entity.includes(log.entity.id))
        }

        if (filters.role.length > 0) {
            result = result.filter(
                (log) => log.type.includes("role_") && log.info?.role && filters.role.includes(log.info.role.id),
            )
        }

        if (filters.material.length > 0) {
            result = result.filter(
                (log) =>
                    log.type.includes("material_") &&
                    log.info?.material &&
                    filters.material.includes(log.info.material.id),
            )
        }

        if (filters.characteristic.length > 0) {
            result = result.filter(
                (log) =>
                    log.type.includes("characteristic_") &&
                    log.info?.characteristic &&
                    filters.characteristic.includes(log.info.characteristic.id),
            )
        }

        if (filters.tag.length > 0) {
            result = result.filter(
                (log) => log.type.includes("tag_") && log.info?.tag && filters.tag.includes(log.info.tag.id),
            )
        }

        setFilteredLogs(result)

        setFilterLoading(false)
    }, [filters])

    // Handle filter change
    const handleFilterChange = (key: string, value: string | string[]) => {
        setFilters((prev) => ({ ...prev, [key]: value }))
    }

    // Reset all filters
    const resetFilters = () => {
        setFilters({
            logType: [],
            user: [],
            entity: [],
            role: [],
            material: [],
            characteristic: [],
            tag: [],
        })
    }

    // Format date based on locale
    const formatDate = (date: Date) => {
        // Format date as dd/mm/yyyy hh:mm:ss with proper UTC handling using date-fns
        const dateLocale = locale === "fr" ? fr : enUS

        return format(new Date(date), "dd/MM/yyyy HH:mm:ss")
    }

    // Get the translated log message
    const getLogMessage = (log: LogEntry) => {
        const type = log.type

        if (!type || !t.has(type)) {
            return type.replace(/_/g, " ")
        }

        let name = ""

        if (type.startsWith("user_") && log.info?.user) {
            name = log.info.user.name
        } else if (type.startsWith("role_") && log.info?.role) {
            name = log.info.role.name
        } else if (type.startsWith("tag_") && log.info?.tag) {
            name = log.info.tag.name
        } else if (type.startsWith("characteristic_") && log.info?.characteristic) {
            name = log.info.characteristic.name
        } else if (type.startsWith("material_") && log.info?.material) {
            name = log.info.material.name
        } else if (type.startsWith("entity_") && log.info?.entity) {
            name = log.info.entity.name
        }

        return t(type, { name })
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                {/* Date Range Filters */}
                <div>
                    <label className="text-sm font-medium mb-1 block">{tCommon("startDate")}</label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !startDate && "text-muted-foreground",
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {startDate ? (
                                    format(startDate, "PPP", { locale: locale === "fr" ? fr : enUS })
                                ) : (
                                    <span>Pick a date</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={startDate}
                                onSelect={(date) => date && setStartDate(date)}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                <div>
                    <label className="text-sm font-medium mb-1 block">{tCommon("endDate")}</label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !endDate && "text-muted-foreground",
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {endDate ? (
                                    format(endDate, "PPP", { locale: locale === "fr" ? fr : enUS })
                                ) : (
                                    <span>Pick a date</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={endDate}
                                onSelect={(date) => date && setEndDate(date)}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="flex items-end">
                    <Button
                        variant="outline"
                        onClick={loadLogs}
                        className="w-full"
                        disabled={isLoadingData}
                    >
                        {isLoadingData ? tCommon("loading") : tCommon("refresh")}
                    </Button>
                </div>
                <div className="flex items-end">
                    <Button
                        variant="outline"
                        onClick={resetFilters}
                        className="w-full"
                    >
                        {tCommon("reset")}
                    </Button>
                </div>

                <div>
                    <label className="text-sm font-medium mb-1 block">{t("filterByType")}</label>
                    <Combobox
                        options={logTypes}
                        value={filters.logType}
                        onChange={(value) => handleFilterChange("logType", value)}
                        placeholder={t("selectLogType")}
                        emptyMessage={tCommon("noOptions")}
                        multiple={true}
                    />
                </div>
                <div>
                    <label className="text-sm font-medium mb-1 block">{t("filterByUser")}</label>
                    <Combobox
                        options={getFilterOptions(logs, "user")}
                        value={filters.user}
                        onChange={(value) => handleFilterChange("user", value)}
                        placeholder={t("selectUser")}
                        emptyMessage={tCommon("noOptions")}
                        multiple={true}
                    />
                </div>
                <div>
                    <label className="text-sm font-medium mb-1 block">{t("filterByEntity")}</label>
                    <Combobox
                        options={getFilterOptions(logs, "entity")}
                        value={filters.entity}
                        onChange={(value) => handleFilterChange("entity", value)}
                        placeholder={t("selectEntity")}
                        emptyMessage={tCommon("noOptions")}
                        multiple={true}
                    />
                </div>
                <div>
                    <label className="text-sm font-medium mb-1 block">{t("filterByRole")}</label>
                    <Combobox
                        options={getFilterOptions(logs, "role")}
                        value={filters.role}
                        onChange={(value) => handleFilterChange("role", value)}
                        placeholder={t("selectRole")}
                        emptyMessage={tCommon("noOptions")}
                        multiple={true}
                    />
                </div>
                <div>
                    <label className="text-sm font-medium mb-1 block">{t("filterByMaterial")}</label>
                    <Combobox
                        options={getFilterOptions(logs, "material")}
                        value={filters.material}
                        onChange={(value) => handleFilterChange("material", value)}
                        placeholder={t("selectMaterial")}
                        emptyMessage={tCommon("noOptions")}
                        multiple={true}
                    />
                </div>
                <div>
                    <label className="text-sm font-medium mb-1 block">{t("filterByCharacteristic")}</label>
                    <Combobox
                        options={getFilterOptions(logs, "characteristic")}
                        value={filters.characteristic}
                        onChange={(value) => handleFilterChange("characteristic", value)}
                        placeholder={t("selectCharacteristic")}
                        emptyMessage={tCommon("noOptions")}
                        multiple={true}
                    />
                </div>
                <div>
                    <label className="text-sm font-medium mb-1 block">{t("filterByTag")}</label>
                    <Combobox
                        options={getFilterOptions(logs, "tag")}
                        value={filters.tag}
                        onChange={(value) => handleFilterChange("tag", value)}
                        placeholder={t("selectTag")}
                        emptyMessage={tCommon("noOptions")}
                        multiple={true}
                    />
                </div>
            </div>
            {filterLoading || isLoadingData ? (
                <div>
                    <Skeleton className="h-[35px] w-full mb-0.5" />
                    <Skeleton className="h-[500px] w-full" />
                </div>
            ) : filteredLogs.length === 0 ? (
                <div className="text-center p-6">
                    <p>{t("noLogs")}</p>
                </div>
            ) : (
                <div className="rounded-md border overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t("message")}</TableHead>
                                <TableHead>{t("user")}</TableHead>
                                <TableHead>{t("entity")}</TableHead>
                                <TableHead>{t("date")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredLogs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell className="font-medium">{getLogMessage(log)}</TableCell>
                                    <TableCell>{log.user?.name}</TableCell>
                                    <TableCell>{log.entity?.name || "-"}</TableCell>
                                    <TableCell>{formatDate(log.createdAt)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    )
}

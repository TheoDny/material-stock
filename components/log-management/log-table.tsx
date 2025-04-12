"use client"

import { useState, useEffect } from "react"
import { useTranslations, useLocale } from "next-intl"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Combobox, ComboboxOption } from "@/components/ui/combobox"
import { Button } from "@/components/ui/button"
import { format, formatDistanceToNow } from "date-fns"
import { fr, enUS } from "date-fns/locale"
import { LogEntry } from "@/types/log.type"
import { Skeleton } from "../ui/skeleton"

export function LogTable({ logs }: { logs: LogEntry[] }) {
    const t = useTranslations("Logs")
    const tCommon = useTranslations("Common")
    const locale = useLocale()
    const [filterLoading, setFilterLoading] = useState(true)
    const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([])
    const [filters, setFilters] = useState({
        logType: "",
        user: "",
        entity: "",
        role: "",
        material: "",
        characteristic: "",
        tag: "",
    })

    // Get log types for filter
    const logTypes: ComboboxOption[] = [
        { value: "user_create", label: "User Create" },
        { value: "user_update", label: "User Update" },
        { value: "user_set_role", label: "User Set Role" },
        { value: "user_set_entity", label: "User Set Entity" },
        { value: "user_disable", label: "User Disable" },
        { value: "user_email_verified", label: "User Email Verified" },
        { value: "role_create", label: "Role Create" },
        { value: "role_update", label: "Role Update" },
        { value: "role_delete", label: "Role Delete" },
        { value: "role_set_permission", label: "Role Set Permission" },
        { value: "tag_create", label: "Tag Create" },
        { value: "tag_update", label: "Tag Update" },
        { value: "characteristic_create", label: "Characteristic Create" },
        { value: "characteristic_update", label: "Characteristic Update" },
        { value: "characteristic_delete", label: "Characteristic Delete" },
        { value: "material_create", label: "Material Create" },
        { value: "material_update", label: "Material Update" },
        { value: "entity_update", label: "Entity Update" },
        { value: "entity_disable", label: "Entity Disable" },
    ]

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

        let result = [...logs]

        if (filters.logType) {
            result = result.filter((log) => log.type === filters.logType)
        }

        if (filters.user) {
            result = result.filter((log) => log.user?.id === filters.user)
        }

        if (filters.entity) {
            result = result.filter((log) => log.entity?.id === filters.entity)
        }

        if (filters.role) {
            result = result.filter((log) => log.type.includes("role_") && log.info?.role?.id === filters.role)
        }

        if (filters.material) {
            result = result.filter(
                (log) => log.type.includes("material_") && log.info?.material?.id === filters.material,
            )
        }

        if (filters.characteristic) {
            result = result.filter(
                (log) =>
                    log.type.includes("characteristic_") &&
                    log.info?.characteristic?.id === filters.characteristic,
            )
        }

        if (filters.tag) {
            result = result.filter((log) => log.type.includes("tag_") && log.info?.tag?.id === filters.tag)
        }

        setFilteredLogs(result)

        setFilterLoading(false)
    }, [filters, logs])

    // Handle filter change
    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }))
    }

    // Reset all filters
    const resetFilters = () => {
        setFilters({
            logType: "",
            user: "",
            entity: "",
            role: "",
            material: "",
            characteristic: "",
            tag: "",
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                    <label className="text-sm font-medium mb-1 block">{t("filterByType")}</label>
                    <Combobox
                        options={logTypes}
                        value={filters.logType}
                        onChange={(value) => handleFilterChange("logType", value)}
                        placeholder={t("selectLogType")}
                        emptyMessage={tCommon("noOptions")}
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
                    />
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
            </div>
            {filterLoading ? (
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

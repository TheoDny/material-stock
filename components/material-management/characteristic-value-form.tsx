"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button, buttonVariants } from "@/components/ui/button"
import {
    CalendarIcon,
    FileIcon,
    X,
    Upload,
    Download,
    Eye,
    File,
    FileText,
    FileSpreadsheet,
    FileArchive,
    FileVolume,
    Undo,
} from "lucide-react"
import { format } from "date-fns"
import { Characteristic, FileDb } from "@prisma/client"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { FilePreviewDialog } from "@/components/ui/file-preview-dialog"
import Image from "next/image"

interface CharacteristicValueFormProps {
    characteristic: Characteristic
    value: any
    onChange: (value: any) => void
    isEditing?: boolean
}

// File type detection helpers
const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase() || ""

    switch (extension) {
        case "pdf":
            return <FileText className="h-10 w-10 text-red-700" />
        case "doc":
        case "docx":
            return <FileText className="h-10 w-10 text-blue-600" />
        case "xls":
        case "xlsx":
            return <FileSpreadsheet className="h-10 w-10 text-green-600" />
        case "txt":
        case "csv":
            return <FileText className="h-10 w-10 text-gray-500" />
        case "zip":
        case "rar":
        case "7z":
        case "tar":
            return <FileArchive className="h-10 w-10 text-orange-700" />
        case "mp3":
        case "wav":
        case "ogg":
        case "wmv":
        case "mp4":
        case "avi":
        case "mkv":
            return <FileVolume className="h-10 w-10 text-purple-600" />
        default:
            return <File className="h-10 w-10 text-gray-500" />
    }
}

const isImageFile = (fileName: string) => {
    const extensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg"]
    return extensions.some((ext) => fileName.toLowerCase().endsWith(ext))
}

// Constants for file size limits
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB per file
const MAX_TOTAL_FILE_SIZE = 50 * 1024 * 1024 // 50MB max total for all files

const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
}

// Check if file type is supported for preview
const isPreviewSupported = (fileName: string): boolean => {
    const extension = fileName.split(".").pop()?.toLowerCase() || ""
    const supportedExtensions = [
        // Images
        "jpg",
        "jpeg",
        "png",
        "gif",
        "webp",
        "bmp",
        "svg",
        // Documents
        "pdf",
        // Text files
        "txt",
        "csv",
        "json",
        "md",
        "xml",
        "html",
        "css",
        "js",
    ]
    return supportedExtensions.includes(extension)
}

export function CharacteristicValueForm({
    characteristic,
    value,
    onChange,
    isEditing = false,
}: CharacteristicValueFormProps) {
    const tMat = useTranslations("Materials.files")
    const tCommon = useTranslations("Common")
    const [date, setDate] = useState<Date | undefined>(
        value && typeof value === "string" ? new Date(value) : undefined,
    )
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [filePreviewUrls, setFilePreviewUrls] = useState<Map<string, string>>(new Map())

    // State for file preview dialog
    const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
    const [previewFile, setPreviewFile] = useState<{
        url: string
        name: string
        type?: string
    } | null>(null)

    // Create preview URLs for uploaded files
    useEffect(() => {
        // Clean up previous preview URLs
        return () => {
            filePreviewUrls.forEach((url) => {
                if (url.startsWith("blob:")) {
                    URL.revokeObjectURL(url)
                }
            })
        }
    }, [filePreviewUrls])

    const handleDateChange = (date: Date | undefined) => {
        setDate(date)
        if (date) {
            onChange(date.toISOString())
        } else {
            onChange("")
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files)

            // Check individual file sizes
            const oversizedFiles = newFiles.filter((file) => file.size > MAX_FILE_SIZE)
            if (oversizedFiles.length > 0) {
                const fileNames = oversizedFiles.map((f) => f.name).join(", ")
                const message = tMat.rich("fileSizeError", {
                    size: formatFileSize(MAX_FILE_SIZE),
                    files: fileNames,
                })
                console.error(message)

                toast.error(
                    tMat.rich("fileSizeError", {
                        size: formatFileSize(MAX_FILE_SIZE),
                        files: fileNames,
                    }),
                )
            }

            // Filter out oversized files
            const validFiles = newFiles.filter((file) => file.size <= MAX_FILE_SIZE)
            if (validFiles.length === 0) return
            // Create preview URLs for new files
            validFiles.forEach((file) => {
                const previewUrl = URL.createObjectURL(file)
                setFilePreviewUrls((prev) => new Map(prev).set(file.name + Math.random(), previewUrl))
            })

            // Calculate total size of files being uploaded in this operation
            const totalNewFilesSize = validFiles.reduce((sum, file) => sum + file.size, 0)

            // Check if the size of files in this upload operation exceeds the limit
            if (totalNewFilesSize > MAX_TOTAL_FILE_SIZE) {
                const message = tMat.rich("totalSizeError", {
                    size: formatFileSize(totalNewFilesSize),
                    maxSize: formatFileSize(MAX_TOTAL_FILE_SIZE),
                })

                console.error(message)
                toast.error(message)
                return
            }

            // Update for edit mode (append to existing fileToAdd)
            const currentValue = value || {}
            const currentFilesToAdd = Array.isArray(currentValue.fileToAdd) ? currentValue.fileToAdd : []
            const currentFilesToDelete = Array.isArray(currentValue.fileToDelete) ? currentValue.fileToDelete : []

            onChange({
                fileToAdd: [...currentFilesToAdd, ...validFiles],
                fileToDelete: currentFilesToDelete,
                file: currentValue.file,
            })
        }
        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const removeNewFile = (index: number) => {
        if (isEditing) {
            // Remove from fileToAdd in edit mode
            const currentValue = value || {}
            const currentFilesToAdd = Array.isArray(currentValue.fileToAdd) ? [...currentValue.fileToAdd] : []

            // Revoke the URL if it exists
            const file = currentFilesToAdd[index]
            const key = file.name + index
            if (filePreviewUrls.has(key)) {
                URL.revokeObjectURL(filePreviewUrls.get(key)!)
                setFilePreviewUrls((prev) => {
                    const newMap = new Map(prev)
                    newMap.delete(key)
                    return newMap
                })
            }

            currentFilesToAdd.splice(index, 1)

            onChange({
                ...currentValue,
                fileToAdd: currentFilesToAdd,
            })
        } else {
            // Remove from file array in create mode
            const currentFiles = value && typeof value === "object" && "file" in value ? [...value.file] : []

            // Revoke the URL if it exists
            const file = currentFiles[index]
            const key = file.name + index
            if (filePreviewUrls.has(key)) {
                URL.revokeObjectURL(filePreviewUrls.get(key)!)
                setFilePreviewUrls((prev) => {
                    const newMap = new Map(prev)
                    newMap.delete(key)
                    return newMap
                })
            }

            currentFiles.splice(index, 1)
            onChange({ file: currentFiles })
        }
    }

    const markFileForDeletion = (fileId: string) => {
        if (!isEditing) return

        const currentValue = value || {}
        const currentFilesToDelete = Array.isArray(currentValue.fileToDelete) ? [...currentValue.fileToDelete] : []

        // Add file to delete list if not already there
        if (!currentFilesToDelete.includes(fileId)) {
            onChange({
                ...currentValue,
                fileToDelete: [...currentFilesToDelete, fileId],
            })
        }
    }

    const unmarkFileForDeletion = (fileId: string) => {
        if (!isEditing) return

        const currentValue = value || {}
        const currentFilesToDelete = Array.isArray(currentValue.fileToDelete)
            ? currentValue.fileToDelete.filter((id: string) => id !== fileId)
            : []

        onChange({
            ...currentValue,
            fileToDelete: currentFilesToDelete,
        })
    }

    const isFileMarkedForDeletion = (fileId: string): boolean => {
        if (!isEditing) return false
        return (
            value &&
            typeof value === "object" &&
            "fileToDelete" in value &&
            Array.isArray(value.fileToDelete) &&
            (value as { fileToDelete: string[] }).fileToDelete.includes(fileId)
        )
    }

    // Open file preview dialog
    const handleOpenPreview = (file: { id: string; name: string; type: string }) => {
        const fileUrl = `/api/image/${file.id}`
        setPreviewFile({
            url: fileUrl,
            name: file.name,
            type: file.type,
        })
        setPreviewDialogOpen(true)
    }

    const renderFormControl = () => {
        const { type, options, units } = characteristic
        const optionsArray = options as string[]

        switch (type) {
            case "text":
                return (
                    <Input
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Enter text value"
                    />
                )

            case "textarea":
                return (
                    <Textarea
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Enter detailed text"
                        className="resize-none"
                    />
                )

            case "number":
                return (
                    <div className="flex items-center space-x-2">
                        <Input
                            type="number"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder="Enter number"
                        />
                        {units && <span className="text-sm text-muted-foreground">{units}</span>}
                    </div>
                )

            case "float":
                return (
                    <div className="flex items-center space-x-2">
                        <Input
                            type="number"
                            step="0.01"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder="Enter decimal number"
                        />
                        {units && <span className="text-sm text-muted-foreground">{units}</span>}
                    </div>
                )
            case "checkbox":
                return (
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            checked={value === "true"}
                            onCheckedChange={(checked) => onChange(checked ? "true" : "false")}
                            id={`checkbox-${characteristic.id}`}
                        />
                        <Label htmlFor={`checkbox-${characteristic.id}`}>{optionsArray?.[0] || "Yes"}</Label>
                    </div>
                )

            case "select":
                return (
                    <Select
                        value={value}
                        onValueChange={onChange}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                            {optionsArray?.map((option) => (
                                <SelectItem
                                    key={option}
                                    value={option}
                                >
                                    {option}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )

            case "radio":
                return (
                    <RadioGroup
                        value={value}
                        onValueChange={onChange}
                        className="flex flex-col space-y-1"
                    >
                        {optionsArray?.map((option) => (
                            <div
                                key={option}
                                className="flex items-center space-x-2"
                            >
                                <RadioGroupItem
                                    value={option}
                                    id={`radio-${characteristic.id}-${option}`}
                                />
                                <Label htmlFor={`radio-${characteristic.id}-${option}`}>{option}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                )

            case "multiSelect":
                const selectedValues = value ? value.split(",") : []
                return (
                    <div className="space-y-2">
                        {optionsArray?.map((option) => (
                            <div
                                key={option}
                                className="flex items-center space-x-2"
                            >
                                <Checkbox
                                    checked={selectedValues.includes(option)}
                                    onCheckedChange={(checked) => {
                                        let newValues
                                        if (checked) {
                                            newValues = [...selectedValues, option]
                                        } else {
                                            newValues = selectedValues.filter((v: string) => v !== option)
                                        }
                                        onChange(newValues.join(","))
                                    }}
                                    id={`multiselect-${characteristic.id}-${option}`}
                                />
                                <Label htmlFor={`multiselect-${characteristic.id}-${option}`}>{option}</Label>
                            </div>
                        ))}
                    </div>
                )

            case "date":
                return (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={`w-full justify-start text-left font-normal ${!date && "text-muted-foreground"}`}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : "Select a date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={handleDateChange}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                )

            case "email":
                return (
                    <Input
                        type="email"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Enter email address"
                    />
                )

            case "link":
                return (
                    <Input
                        type="url"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Enter URL"
                    />
                )

            case "file":
                let files: File[] = []
                let existingFiles: Array<{ id: string; name: string; type: string }> = []
                let filesToDelete: string[] = []

                // Initialize file data based on value and editing state
                if (isEditing) {
                    if (value && typeof value === "object") {
                        if ("fileToAdd" in value && Array.isArray(value.fileToAdd)) {
                            files = value.fileToAdd

                            // Create preview URLs for new files
                            files.forEach((file, index) => {
                                if (!filePreviewUrls.has(file.name + index)) {
                                    const previewUrl = URL.createObjectURL(file)
                                    setFilePreviewUrls((prev) => new Map(prev).set(file.name + index, previewUrl))
                                }
                            })
                        }
                        if ("fileToDelete" in value && Array.isArray(value.fileToDelete)) {
                            filesToDelete = value.fileToDelete
                        }
                    }

                    // Get existing files from the related File entities
                    if (characteristic && characteristic.id) {
                        // Parse existingFiles from the original value
                        const currentMaterialValue =
                            value && typeof value === "object" && "file" in value ? value.file : []
                        existingFiles = Array.isArray(currentMaterialValue) ? currentMaterialValue : []
                    }
                } else {
                    // For new material, just handle new files
                    if (value && typeof value === "object" && "file" in value && Array.isArray(value.file)) {
                        files = value.file

                        // Create preview URLs for new files
                        files.forEach((file, index) => {
                            if (!filePreviewUrls.has(file.name + index)) {
                                const previewUrl = URL.createObjectURL(file)
                                setFilePreviewUrls((prev) => new Map(prev).set(file.name + index, previewUrl))
                            }
                        })
                    }
                }

                return (
                    <div>
                        {/* Upload button */}
                        <div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                multiple
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    fileInputRef.current?.click()
                                }}
                                className="w-full"
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                {tMat("uploadFiles")}
                            </Button>
                        </div>

                        <div className="flex flex-col gap-1">
                            {/* Display new files */}
                            {files && files.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium mb-2">{tMat("newFiles")}</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                                        {files.map((file, index) => (
                                            <div
                                                key={`new-${index}`}
                                                className="relative border rounded-md p-2 flex items-center gap-1 group bg-green-600/20"
                                            >
                                                <div className="h-18 w-18 min-w-14  rounded-md overflow-hidden bg-accent/10 flex items-center justify-center">
                                                    {isImageFile(file.name) ? (
                                                        <img
                                                            src={filePreviewUrls.get(file.name + index) || ""}
                                                            alt={file.name}
                                                            className="h-full w-full object-scale-down"
                                                        />
                                                    ) : (
                                                        getFileIcon(file.name)
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p
                                                        className="text-sm font-medium truncate"
                                                        title={file.name}
                                                    >
                                                        {file.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {Math.round(file.size / 1024)} KB
                                                    </p>
                                                </div>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => removeNewFile(index)}
                                                    aria-label={tCommon("delete")}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {isEditing && existingFiles && existingFiles.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium mb-2">{tMat("existingFiles")}</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                                        {existingFiles.map((file) => {
                                            const isMarkedForDeletion = isFileMarkedForDeletion(file.id)
                                            const fileUrl = `/api/image/${file.id}`
                                            const canPreview = isPreviewSupported(file.name)

                                            return (
                                                <div
                                                    key={`existing-${file.id}`}
                                                    className={cn(
                                                        "relative border rounded-md p-2 flex items-center gap-2 group transition-all",
                                                        isMarkedForDeletion
                                                            ? "bg-destructive/20"
                                                            : "hover:bg-accent/20",
                                                    )}
                                                >
                                                    <div className="h-18 w-18 min-w-14 rounded-md overflow-hidden bg-accent/10 flex items-center justify-center">
                                                        {isImageFile(file.name) ? (
                                                            <Image
                                                                src={fileUrl}
                                                                alt={file.name}
                                                                width={72}
                                                                height={72}
                                                                className="h-full w-full object-scale-down"
                                                                onError={(e) => {
                                                                    // If image fails to load, show file icon instead
                                                                    const target = e.target as HTMLImageElement
                                                                    target.style.display = "none"
                                                                    target.parentElement!.appendChild(
                                                                        (() => {
                                                                            const div =
                                                                                document.createElement("div")
                                                                            div.className =
                                                                                "h-full w-full flex items-center justify-center"
                                                                            div.appendChild(
                                                                                getFileIcon(
                                                                                    file.name,
                                                                                ) as unknown as Node,
                                                                            )
                                                                            return div
                                                                        })(),
                                                                    )
                                                                }}
                                                            />
                                                        ) : (
                                                            getFileIcon(file.name)
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p
                                                            className="text-sm font-medium truncate"
                                                            title={file.name}
                                                        >
                                                            {file.name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {isMarkedForDeletion
                                                                ? tMat("markedForDeletion")
                                                                : file.type || "File"}
                                                        </p>
                                                        {!isMarkedForDeletion && (
                                                            <div className="flex gap-1">
                                                                {canPreview && (
                                                                    <Button
                                                                        type="button"
                                                                        size={"sm"}
                                                                        variant={"ghost"}
                                                                        className="cursor-pointer inline-flex font-normal items-center text-xs text-primary hover:underline"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            handleOpenPreview(file)
                                                                        }}
                                                                    >
                                                                        <Eye className="h-3 w-3" />
                                                                        {tMat("view")}
                                                                    </Button>
                                                                )}
                                                                <a
                                                                    href={fileUrl}
                                                                    download={file.name}
                                                                    className={cn(
                                                                        buttonVariants({
                                                                            variant: "ghost",
                                                                            size: "sm",
                                                                        }),
                                                                        "text-xs hover:underline font-normal",
                                                                    )}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                    }}
                                                                >
                                                                    <Download className="h-3 w-3 mr-1" />
                                                                    {tMat("download")}
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            e.preventDefault()
                                                            isMarkedForDeletion
                                                                ? unmarkFileForDeletion(file.id)
                                                                : markFileForDeletion(file.id)
                                                        }}
                                                    >
                                                        {isMarkedForDeletion ? (
                                                            <Undo className="h-4 w-4" />
                                                        ) : (
                                                            <X className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* File Preview Dialog */}
                        {previewFile && (
                            <FilePreviewDialog
                                open={previewDialogOpen}
                                onOpenChange={setPreviewDialogOpen}
                                fileUrl={previewFile.url}
                                fileName={previewFile.name}
                                fileType={previewFile.type}
                            />
                        )}
                    </div>
                )

            default:
                throw new Error(`Unsupported characteristic type: ${type}`)
        }
    }

    return <div className="space-y-2">{renderFormControl()}</div>
}

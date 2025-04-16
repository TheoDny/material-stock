"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useTranslations } from "next-intl"
import { Loader2, Download, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FilePreviewDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    fileUrl: string
    fileName: string
    fileType?: string
}

export function FilePreviewDialog({ open, onOpenChange, fileUrl, fileName, fileType }: FilePreviewDialogProps) {
    const t = useTranslations("Materials.files")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [textContent, setTextContent] = useState<string | null>(null)

    // Get file extension from filename
    const fileExtension = fileName.split(".").pop()?.toLowerCase() || ""

    // Determine file content type
    const isImage = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(fileExtension)
    const isPdf = fileExtension === "pdf"
    const isText = ["txt", "csv", "json", "md", "xml", "html", "css", "js"].includes(fileExtension)

    useEffect(() => {
        if (!open) return

        // Reset states on open
        setLoading(true)
        setError(null)
        setTextContent(null)

        // For text files, fetch and display the content
        if (isText && open) {
            fetch(fileUrl)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`Failed to load file: ${response.statusText}`)
                    }
                    return response.text()
                })
                .then((text) => {
                    setTextContent(text)
                    setLoading(false)
                })
                .catch((err) => {
                    console.error("Error loading text file:", err)
                    setError(t("errorLoadingFile"))
                    setLoading(false)
                })
        } else {
            // For images and PDFs, the loading is handled by the browser
            setLoading(false)
        }
    }, [fileUrl, open, isText, t])

    const renderFilePreview = () => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center h-[50vh]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="mt-4 text-muted-foreground">{t("loading")}</p>
                </div>
            )
        }

        if (error) {
            return (
                <div className="flex flex-col items-center justify-center h-[50vh]">
                    <p className="text-destructive">{error}</p>
                </div>
            )
        }

        if (isImage) {
            return (
                <div className="flex items-center justify-center p-4 max-h-[70vh] overflow-auto">
                    <img
                        src={fileUrl}
                        alt={fileName}
                        className="max-w-full max-h-full object-contain"
                        onError={() => setError(t("errorLoadingFile"))}
                    />
                </div>
            )
        }

        if (isPdf) {
            return (
                <div className="w-full h-[70vh]">
                    <iframe
                        src={`${fileUrl}#toolbar=0`}
                        title={fileName}
                        className="w-full h-full border-0"
                        onError={() => setError(t("errorLoadingFile"))}
                    />
                </div>
            )
        }

        if (isText && textContent) {
            const isCSV = fileExtension === "csv"

            if (isCSV) {
                // Simple CSV display with table
                const rows = textContent.split("\n").map((row) => row.split(","))

                return (
                    <div className="p-4 max-h-[70vh] overflow-auto">
                        <div className="border rounded-md overflow-x-auto">
                            <table className="w-full text-sm">
                                <tbody>
                                    {rows.map((row, rowIndex) => (
                                        <tr
                                            key={rowIndex}
                                            className={rowIndex % 2 === 0 ? "bg-muted/50" : ""}
                                        >
                                            {row.map((cell, cellIndex) => (
                                                <td
                                                    key={cellIndex}
                                                    className="px-4 py-2 border-r border-b last:border-r-0"
                                                >
                                                    {cell}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            }

            return (
                <div className="p-4 max-h-[70vh] overflow-auto">
                    <pre className="text-sm p-4 bg-muted rounded-md whitespace-pre-wrap">{textContent}</pre>
                </div>
            )
        }

        return (
            <div className="flex flex-col items-center justify-center h-[50vh]">
                <p className="text-muted-foreground">{t("previewNotAvailable")}</p>
                <Button
                    className="mt-4"
                    asChild
                >
                    <a
                        href={fileUrl}
                        download={fileName}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        {t("download")}
                    </a>
                </Button>
            </div>
        )
    }

    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
        >
            <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="truncate h-5">{fileName}</DialogTitle>
                    </div>
                    {fileType && <DialogDescription>{fileType}</DialogDescription>}
                </DialogHeader>
                <div className="flex-1 overflow-hidden">{renderFilePreview()}</div>
                <div className="flex justify-end mt-4">
                    <Button
                        variant="outline"
                        asChild
                    >
                        <a
                            href={fileUrl}
                            download={fileName}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            {t("download")}
                        </a>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

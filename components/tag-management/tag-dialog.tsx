"use client"

import { useState, useEffect } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { HexColorPicker } from "react-colorful"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { createTagAction, updateTagAction } from "@/actions/tag-actions"
import { TagAndCountMaterial } from "@/types/tag.type"

const createTagSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    fontColor: z.string().min(4, "Color text must be a valid color"),
    color: z.string().min(4, "Color must be a valid color"),
})

const updateTagSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    fontColor: z.string().min(4, "Color text must be a valid color"),
    color: z.string().min(4, "Color must be a valid color"),
})

type CreateTagFormValues = z.infer<typeof createTagSchema>
type UpdateTagFormValues = z.infer<typeof updateTagSchema>

interface TagDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    tag: TagAndCountMaterial | null
    onClose: (success: boolean) => void
}

export function TagDialog({ open, onOpenChange, tag, onClose }: TagDialogProps) {
    const t = useTranslations("Configuration.tags.dialog")
    const tCommon = useTranslations("Common")

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showColorPicker, setShowColorPicker] = useState(false)
    const [showTextColorPicker, setShowTextColorPicker] = useState(false)

    const isEditing = !!tag

    const createForm = useForm<CreateTagFormValues>({
        resolver: zodResolver(createTagSchema),
        defaultValues: {
            name: "",
            fontColor: "#000000",
            color: "#ffffff",
        },
    })

    const updateForm = useForm<UpdateTagFormValues>({
        resolver: zodResolver(updateTagSchema),
        defaultValues: {
            name: tag?.name || "",
            fontColor: tag?.fontColor || "#000000",
            color: tag?.color || "#ffffff",
        },
    })

    const form = isEditing ? updateForm : createForm

    useEffect(() => {
        if (open && tag) {
            updateForm.reset({
                name: tag.name,
                fontColor: tag.fontColor,
                color: tag.color,
            })
        } else if (open && !tag) {
            createForm.reset({
                name: "",
                fontColor: "#000000",
                color: "#ffffff",
            })
        }
    }, [open, tag, updateForm, createForm])

    const handleClose = () => {
        form.reset()
        setShowColorPicker(false)
        setShowTextColorPicker(false)
        onOpenChange(false)
        onClose(false)
    }

    const onSubmit = async (values: CreateTagFormValues | UpdateTagFormValues) => {
        setIsSubmitting(true)

        try {
            if (isEditing && tag) {
                // Update existing tag
                const updateValues = values as UpdateTagFormValues
                await updateTagAction({
                    id: tag.id,
                    name: updateValues.name,
                    fontColor: updateValues.fontColor,
                    color: updateValues.color,
                })
                toast.success(t("updateSuccess"))
            } else {
                // Create new tag
                const createValues = values as CreateTagFormValues
                await createTagAction({
                    name: createValues.name,
                    fontColor: createValues.fontColor,
                    color: createValues.color,
                })
                toast.success(t("createSuccess"))
            }

            form.reset()
            setShowColorPicker(false)
            setShowTextColorPicker(false)
            onOpenChange(false)
            onClose(true)
        } catch (error) {
            console.error(error)
            toast.error(isEditing ? t("updateError") : t("createError"))
        } finally {
            setIsSubmitting(false)
        }
    }

    const getPreviewBadge = () => {
        const color = form.watch("color")
        const fontColor = form.watch("fontColor")
        const name = form.watch("name")

        return (
            <Badge
                style={{
                    backgroundColor: color,
                    color: fontColor,
                }}
            >
                {name || "Preview"}
            </Badge>
        )
    }

    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
        >
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? t("edit") : t("create")}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? t("editDescription") : t("createDescription")}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("name")}</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder={t("namePlaceholder")}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                    {isEditing ? (
                                        <FormDescription>{t("nameUpdateWarning")}</FormDescription>
                                    ) : (
                                        <FormDescription>{t("nameHelp")}</FormDescription>
                                    )}
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="fontColor"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("textColor")}</FormLabel>
                                    <FormControl>
                                        <div className="flex items-center space-x-2">
                                            <div
                                                className="w-6 h-6 rounded-full cursor-pointer border"
                                                style={{ backgroundColor: field.value }}
                                                onClick={() => setShowTextColorPicker(!showTextColorPicker)}
                                            />
                                            <Input
                                                placeholder="#000000"
                                                {...field}
                                                onClick={() => setShowTextColorPicker(true)}
                                            />
                                        </div>
                                    </FormControl>
                                    {showTextColorPicker && (
                                        <div className="mt-2">
                                            <HexColorPicker
                                                color={field.value}
                                                onChange={field.onChange}
                                            />
                                        </div>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="color"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("backgroundColor")}</FormLabel>
                                    <FormControl>
                                        <div className="flex items-center space-x-2">
                                            <div
                                                className="w-6 h-6 rounded-full cursor-pointer border"
                                                style={{ backgroundColor: field.value }}
                                                onClick={() => setShowColorPicker(!showColorPicker)}
                                            />
                                            <Input
                                                placeholder="#ffffff"
                                                {...field}
                                                onClick={() => setShowColorPicker(true)}
                                            />
                                        </div>
                                    </FormControl>
                                    {showColorPicker && (
                                        <div className="mt-2">
                                            <HexColorPicker
                                                color={field.value}
                                                onChange={field.onChange}
                                            />
                                        </div>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-2">
                            <FormLabel>{t("preview")}</FormLabel>
                            <div className="p-4 border rounded-md flex items-center justify-center">
                                {getPreviewBadge()}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                            >
                                {tCommon("cancel")}
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting
                                    ? tCommon("saving")
                                    : isEditing
                                      ? tCommon("update")
                                      : tCommon("create")}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

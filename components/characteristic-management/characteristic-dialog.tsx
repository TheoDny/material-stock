"use client"

import { useState, useEffect } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createCharacteristicAction, updateCharacteristicAction } from "@/actions/characteritic-actions"
import { CharacteristicAndCountMaterial } from "@/types/characteristic.type"
import { CharacteristicType } from "@prisma/client"
import { getTypeColor } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

const characteristicTypes: CharacteristicType[] = [
    "checkbox",
    "select",
    "radio",
    "multiSelect",
    "text",
    "textarea",
    "number",
    "float",
    "email",
    "date",
    "dateHour",
    "dateRange",
    "dateHourRange",
    "link",
] as const

const createCharacteristicSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().optional(),
    type: z.nativeEnum(CharacteristicType),
    options: z.string().optional(),
    units: z.string().optional(),
})

const updateCharacteristicSchema = z.object({
    description: z.string().optional(),
})

type CreateCharacteristicFormValues = z.infer<typeof createCharacteristicSchema>
type UpdateCharacteristicFormValues = z.infer<typeof updateCharacteristicSchema>

interface CharacteristicDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    characteristic: CharacteristicAndCountMaterial | null
    onClose: (success: boolean) => void
}

export function CharacteristicDialog({ open, onOpenChange, characteristic, onClose }: CharacteristicDialogProps) {
    const t = useTranslations("Configuration.characteristics.dialog")
    const tCommon = useTranslations("Common")
    const tTypes = useTranslations("Configuration.characteristics.types")

    const [isSubmitting, setIsSubmitting] = useState(false)

    const isEditing = !!characteristic

    const createForm = useForm<CreateCharacteristicFormValues>({
        resolver: zodResolver(createCharacteristicSchema),
        defaultValues: {
            name: "",
            description: "",
            type: "text",
            options: "",
            units: "",
        },
    })

    const updateForm = useForm<UpdateCharacteristicFormValues>({
        resolver: zodResolver(updateCharacteristicSchema),
        defaultValues: {
            description: characteristic?.description || "",
        },
    })

    const form = isEditing ? updateForm : createForm

    useEffect(() => {
        if (open && characteristic) {
            updateForm.reset({
                description: characteristic.description,
            })
        } else if (open && !characteristic) {
            createForm.reset({
                name: "",
                description: "",
                type: "text",
                options: "",
                units: "",
            })
        }
    }, [open, characteristic, updateForm, createForm])

    const handleClose = () => {
        form.reset()
        onOpenChange(false)
        onClose(false)
    }

    const onSubmit = async (values: CreateCharacteristicFormValues | UpdateCharacteristicFormValues) => {
        setIsSubmitting(true)

        try {
            if (isEditing && characteristic) {
                // Update existing characteristic
                const updateValues = values as UpdateCharacteristicFormValues
                await updateCharacteristicAction({
                    id: characteristic.id,
                    description: updateValues.description || "",
                })
                toast.success(t("updateSuccess"))
            } else {
                // Create new characteristic
                const createValues = values as CreateCharacteristicFormValues
                const options = createValues.options
                    ? createValues.options.split(",").map((option) => option.trim())
                    : null

                await createCharacteristicAction({
                    name: createValues.name,
                    description: createValues.description || "",
                    type: createValues.type,
                    options,
                    units: createValues.units || null,
                })
                toast.success(t("createSuccess"))
            }

            form.reset()
            onOpenChange(false)
            onClose(true)
        } catch (error) {
            console.error(error)
            toast.error(isEditing ? t("updateError") : t("createError"))
        } finally {
            setIsSubmitting(false)
        }
    }

    const selectedType = createForm.watch("type")
    const needsOptions = ["select", "radio", "multiSelect", "checkbox"].includes(selectedType)
    const needsUnits = ["number", "float"].includes(selectedType)

    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
        >
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? t("edit") : t("create")}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? t("editDescription")
                            : t("createDescription")}
                    </DialogDescription>
                </DialogHeader>
                {isEditing ? (
                    <Form {...updateForm}>
                        <form
                            onSubmit={updateForm.handleSubmit(onSubmit)}
                            className="space-y-4"
                        >
                            <FormField
                                control={updateForm.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("description")}</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder={t("descriptionPlaceholder")}
                                                className="resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {characteristic && (
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <div className="font-medium">{t("type")}:</div>
                                        <Badge className={getTypeColor(characteristic.type)}>
                                            {tTypes[characteristic.type as keyof typeof tTypes] || characteristic.type}
                                        </Badge>
                                    </div>

                                    {characteristic.options && (
                                        <div className="flex items-center space-x-2">
                                            <div className="font-medium">{t("options")}:</div>
                                            <div>
                                                {Array.isArray(characteristic.options)
                                                    ? characteristic.options.join(", ")
                                                    : characteristic.options.toString()}
                                            </div>
                                        </div>
                                    )}

                                    {characteristic.units && (
                                        <div className="flex items-center space-x-2">
                                            <div className="font-medium">{t("unit")}:</div>
                                            <div>{characteristic.units}</div>
                                        </div>
                                    )}
                                </div>
                            )}

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
                                    {isSubmitting ? tCommon("saving") : tCommon("update")}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                ) : (
                    <Form {...createForm}>
                        <form
                                onSubmit={createForm.handleSubmit(onSubmit)}
                                className="space-y-4"
                            >
                                <FormField
                                    control={createForm.control}
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
                                            <FormDescription>
                                                {t("nameCannotBeChanged")}
                                            </FormDescription>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={createForm.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("type")}</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={t("selectType")} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {characteristicTypes.map((type) => (
                                                        <SelectItem
                                                            key={type}
                                                            value={type}
                                                        >
                                                        {tTypes[type as keyof typeof tTypes] || type}
                                                    </SelectItem>
                                                ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                            <FormDescription>
                                                {t("typeCannotBeChanged")}
                                            </FormDescription>
                                        </FormItem>
                                    )}
                                />

                                {needsOptions && (
                                    <FormField
                                        control={createForm.control}
                                        name="options"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("options")}</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder={t("optionsPlaceholder")}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                                <FormDescription>
                                                    {t("optionsCannotBeChanged")}
                                                </FormDescription>
                                            </FormItem>
                                        )}
                                    />
                                )}

                                {needsUnits && (
                                    <FormField
                                        control={createForm.control}
                                        name="units"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("unit")}</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder={t("unitPlaceholder")}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                                <FormDescription>
                                                    {t("unitCannotBeChanged")}
                                                </FormDescription>
                                            </FormItem>
                                        )}
                                    />
                                )}

                                <FormField
                                    control={createForm.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("description")}</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder={t("descriptionPlaceholder")}
                                                    className="resize-none"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

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
                                        {isSubmitting ? tCommon("saving") : tCommon("create")}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                )}
            </DialogContent>
        </Dialog>
    )
}

"use client"

import { useState, useEffect } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

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

const characteristicTypes = [
    "checkbox",
    "select",
    "radio",
    "multiselect",
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
    type: z.enum(characteristicTypes),
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
                toast.success("Characteristic updated successfully")
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
                toast.success("Characteristic created successfully")
            }

            form.reset()
            onOpenChange(false)
            onClose(true)
        } catch (error) {
            toast.error(isEditing ? "Failed to update characteristic" : "Failed to create characteristic")
        } finally {
            setIsSubmitting(false)
        }
    }

    const selectedType = createForm.watch("type")
    const needsOptions = ["select", "radio", "multiselect", "checkbox"].includes(selectedType)
    const needsUnits = ["number", "float"].includes(selectedType)

    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
        >
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Characteristic" : "Create Characteristic"}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Update the characteristic details below."
                            : "Fill in the details to create a new characteristic."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        {!isEditing && (
                            <>
                                <FormField
                                    control={createForm.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Characteristic name"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                            <FormDescription>
                                                Name cannot be changed after creation
                                            </FormDescription>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={createForm.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Type</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {characteristicTypes.map((type) => (
                                                        <SelectItem
                                                            key={type}
                                                            value={type}
                                                        >
                                                            {type}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                            <FormDescription>
                                                Type cannot be changed after creation
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
                                                <FormLabel>Options (comma separated)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Option 1, Option 2, Option 3"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                                <FormDescription>
                                                    Options cannot be changed after creation
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
                                                <FormLabel>Units</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="e.g. kg, cm, etc."
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                                <FormDescription>
                                                    Units cannot be changed after creation
                                                </FormDescription>
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </>
                        )}

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Characteristic description"
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {isEditing && (
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <div className="font-medium">Type:</div>
                                    <div>{characteristic?.type}</div>
                                </div>

                                {characteristic?.options && (
                                    <div className="flex items-center space-x-2">
                                        <div className="font-medium">Options:</div>
                                        <div>{characteristic.options.join(", ")}</div>
                                    </div>
                                )}

                                {characteristic?.units && (
                                    <div className="flex items-center space-x-2">
                                        <div className="font-medium">Units:</div>
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
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Saving..." : isEditing ? "Update" : "Create"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

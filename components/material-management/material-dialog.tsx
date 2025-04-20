"use client"

import { useState, useEffect } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { X, Check, GripVertical } from "lucide-react"

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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    createMaterialAction,
    updateMaterialAction,
    getMaterialCharacteristicsAction,
} from "@/actions/material-actions"
import { getTagsAction } from "@/actions/tag-actions"
import { getCharacteristicsAction } from "@/actions/characteritic-actions"
import { CharacteristicValueForm } from "./characteristic-value-form"
import { Tag, Characteristic, FileDb } from "@prisma/client"
import { CharacteristicValue, MaterialWithTag } from "@/types/material.type"

const materialSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().optional(),
    tagIds: z.array(z.string()).default([]),
    orderCharacteristics: z.array(z.string()).default([]),
})

type MaterialFormValues = z.infer<typeof materialSchema>

interface MaterialDialogProps {
    open: boolean
    material: MaterialWithTag | null
    onClose: (refreshData: boolean) => void
}

type ExtendedCharacteristicValue = CharacteristicValue & {
    File?: FileDb[]
}

export function MaterialDialog({ open, material, onClose }: MaterialDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [tags, setTags] = useState<Tag[]>([])
    const [characteristics, setCharacteristics] = useState<Characteristic[]>([])
    const [characteristicValues, setCharacteristicValues] = useState<ExtendedCharacteristicValue[]>([])
    const [activeTab, setActiveTab] = useState("general")
    const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null)

    const isEditing = !!material

    const form = useForm<MaterialFormValues>({
        resolver: zodResolver(materialSchema),
        defaultValues: {
            name: material?.name || "",
            description: material?.description || "",
            tagIds: material?.Tags.map((tag) => tag.id) || [],
            orderCharacteristics: material?.order_Material_Characteristic || [],
        },
    })

    useEffect(() => {
        if (open) {
            loadTags()
            loadCharacteristics()

            if (material) {
                form.reset({
                    name: material.name,
                    description: material.description,
                    tagIds: material.Tags.map((tag) => tag.id),
                    orderCharacteristics: material.order_Material_Characteristic || [],
                })

                loadMaterialCharacteristics(material.id)
            } else {
                form.reset({
                    name: "",
                    description: "",
                    tagIds: [],
                    orderCharacteristics: [],
                })
                setCharacteristicValues([])
            }
        }
    }, [open, material, form])

    // Update the order whenever characteristic values change
    useEffect(() => {
        const currentOrder = form.getValues("orderCharacteristics")
        const characteristicIds = characteristicValues.map((cv) => cv.characteristicId)

        // Add any new characteristic IDs to the order
        const newIds = characteristicIds.filter((id) => !currentOrder.includes(id))

        // Remove any IDs from the order that are no longer in the values
        const updatedOrder = currentOrder.filter((id) => characteristicIds.includes(id)).concat(newIds)

        form.setValue("orderCharacteristics", updatedOrder)
    }, [characteristicValues])

    const loadTags = async () => {
        try {
            const tagsData = await getTagsAction()
            setTags(tagsData)
        } catch (error) {
            console.error(error)
            toast.error("Failed to load tags")
        }
    }

    const loadCharacteristics = async () => {
        try {
            const characteristicsData = await getCharacteristicsAction()
            setCharacteristics(characteristicsData)
        } catch (error) {
            console.error(error)
            toast.error("Failed to load characteristics")
        }
    }

    const loadMaterialCharacteristics = async (materialId: string) => {
        try {
            const values = await getMaterialCharacteristicsAction(materialId)

            // Process file relationships into the proper format for the form
            const processedValues = values.map((cv) => {
                const result = { ...cv }

                // For file type characteristics, prepare file data for the UI
                if (cv.Characteristic.type === "file" && cv.File && cv.File.length > 0) {
                    // If using direct relationships, prepare file data for the form
                    result.value = {
                        file: cv.File.map((file) => ({
                            id: file.id,
                            name: file.name,
                            type: file.type,
                        })),
                    }
                }

                return result
            })

            setCharacteristicValues(processedValues)
        } catch (error) {
            console.error(error)
            toast.error("Failed to load material characteristics")
        }
    }

    const handleClose = (refreshData: boolean = false) => {
        form.reset()
        setActiveTab("general")
        onClose(refreshData)
    }

    const onSubmit = async (values: MaterialFormValues) => {
        setIsSubmitting(true)
        try {
            // Process characteristic values for saving
            const processedCharacteristicValues = characteristicValues.map((cv) => {
                // If it's a file characteristic, ensure it's in the proper format for saving
                if (cv.Characteristic.type === "file") {
                    if (isEditing) {
                        // For editing, need fileToAdd and fileToDelete format
                        const value = cv.value || {}
                        return {
                            characteristicId: cv.characteristicId,
                            value: {
                                fileToAdd: Array.isArray(value.fileToAdd) ? value.fileToAdd : [],
                                fileToDelete: Array.isArray(value.fileToDelete) ? value.fileToDelete : [],
                            },
                        }
                    } else {
                        // For creating, use simple file array format
                        return {
                            characteristicId: cv.characteristicId,
                            value: cv.value,
                        }
                    }
                }

                // For non-file types, just pass the value as is
                return {
                    characteristicId: cv.characteristicId,
                    value: cv.value,
                }
            })

            if (isEditing && material) {
                // Update existing material
                const result = await updateMaterialAction({
                    id: material.id,
                    name: values.name,
                    description: values.description || "",
                    tagIds: values.tagIds,
                    orderCharacteristics: values.orderCharacteristics,
                    characteristicValues: processedCharacteristicValues,
                })

                if (result?.bindArgsValidationErrors) {
                    console.error(result?.bindArgsValidationErrors)
                    return toast.error("Failed to update material")
                } else if (result?.serverError) {
                    console.error(result?.serverError)
                    return toast.error("Failed to update material")
                } else if (result?.validationErrors) {
                    console.error(result?.validationErrors)
                    return toast.error("Failed to update material")
                } else if (!result?.data) {
                    console.error("No data returned")
                    return toast.error("Failed to update material")
                }

                toast.success("Material updated successfully")
            } else {
                // Create new material
                const result = await createMaterialAction({
                    name: values.name,
                    description: values.description || "",
                    tagIds: values.tagIds,
                    orderCharacteristics: values.orderCharacteristics,
                    characteristicValues: processedCharacteristicValues,
                })

                if (result?.bindArgsValidationErrors) {
                    console.error(result?.bindArgsValidationErrors)
                    return toast.error("Failed to create material")
                } else if (result?.serverError) {
                    console.error(result?.serverError)
                    return toast.error("Failed to create material")
                } else if (result?.validationErrors) {
                    console.error(result?.validationErrors)
                    return toast.error("Failed to create material")
                } else if (!result?.data) {
                    console.error("No data returned")
                    return toast.error("Failed to create material")
                }

                toast.success("Material created successfully")
            }

            handleClose(true)
        } catch (error) {
            console.error(error)
            toast.error(isEditing ? "Failed to update material" : "Failed to create material")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleTagToggle = (tagId: string) => {
        const currentTagIds = form.getValues("tagIds")

        if (currentTagIds.includes(tagId)) {
            form.setValue(
                "tagIds",
                currentTagIds.filter((id) => id !== tagId),
            )
        } else {
            form.setValue("tagIds", [...currentTagIds, tagId])
        }
    }

    const handleAddCharacteristic = (characteristicId: string) => {
        // Check if already added
        if (characteristicValues.some((cv) => cv.characteristicId === characteristicId)) {
            return
        }

        const characteristic = characteristics.find((c) => c.id === characteristicId)

        if (characteristic) {
            setCharacteristicValues([
                ...characteristicValues,
                {
                    Characteristic: characteristic,
                    characteristicId,
                    value: null,
                    File: [],
                },
            ])

            // Add to the order list
            const currentOrder = form.getValues("orderCharacteristics")
            form.setValue("orderCharacteristics", [...currentOrder, characteristicId])
        }
    }

    const handleRemoveCharacteristic = (characteristicId: string) => {
        setCharacteristicValues(characteristicValues.filter((cv) => cv.characteristicId !== characteristicId))

        // Remove from the order list
        const currentOrder = form.getValues("orderCharacteristics")
        form.setValue(
            "orderCharacteristics",
            currentOrder.filter((id) => id !== characteristicId),
        )
    }

    const handleCharacteristicValueChange = (characteristicId: string, value: any) => {
        setCharacteristicValues(
            characteristicValues.map((cv) => (cv.characteristicId === characteristicId ? { ...cv, value } : cv)),
        )
    }

    const getAvailableCharacteristics = () => {
        return characteristics.filter((c) => !characteristicValues.some((cv) => cv.characteristicId === c.id))
    }

    // Get ordered characteristic values based on the current order
    const getOrderedCharacteristicValues = () => {
        const order = form.getValues("orderCharacteristics")

        // First, sort by the order array
        const orderedValues = [...characteristicValues].sort((a, b) => {
            const aIndex = order.indexOf(a.characteristicId)
            const bIndex = order.indexOf(b.characteristicId)

            // If not in order array, put at the end
            if (aIndex === -1) return 1
            if (bIndex === -1) return -1

            return aIndex - bIndex
        })

        return orderedValues
    }

    // Drag and drop handlers
    const handleDragStart = (index: number) => {
        setDraggedItemIndex(index)
    }

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault()
        if (draggedItemIndex === null || draggedItemIndex === index) return

        // Reorder the characteristics
        const orderedValues = getOrderedCharacteristicValues()
        const order = form.getValues("orderCharacteristics")

        // Get the item being dragged and the target position
        const draggedItem = orderedValues[draggedItemIndex]

        // Create new order by moving the dragged item
        const newOrder = [...order]
        const fromIndex = newOrder.indexOf(draggedItem.characteristicId)
        const toIndex = newOrder.indexOf(orderedValues[index].characteristicId)

        if (fromIndex !== -1 && toIndex !== -1) {
            newOrder.splice(fromIndex, 1)
            newOrder.splice(toIndex, 0, draggedItem.characteristicId)
            form.setValue("orderCharacteristics", newOrder)
        }

        setDraggedItemIndex(index)
    }

    const handleDragEnd = () => {
        setDraggedItemIndex(null)
    }

    return (
        <Dialog
            open={open}
            onOpenChange={handleClose}
        >
            <DialogContent
                className="sm:max-w-[700px] max-h-[80vh] flex flex-col top-[10%] translate-y-0"
                style={{ position: "fixed", margin: "0 auto", transformOrigin: "top" }}
            >
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Material" : "Create Material"}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Update the material details below."
                            : "Fill in the details to create a new material."}
                    </DialogDescription>
                </DialogHeader>

                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="flex flex-col flex-1 overflow-hidden"
                >
                    <TabsList className="grid grid-cols-3 w-full">
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="tags">Tags</TabsTrigger>
                        <TabsTrigger value="characteristics">Characteristics</TabsTrigger>
                    </TabsList>

                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-4 mt-4 flex flex-col overflow-hidden"
                        >
                            <div
                                className="overflow-y-auto pr-2"
                                style={{ maxHeight: "calc(70vh - 180px)" }}
                            >
                                <TabsContent
                                    value="general"
                                    className="space-y-4"
                                >
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Name</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Material name"
                                                        {...field}
                                                        disabled={isEditing}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                                {isEditing && (
                                                    <FormDescription>
                                                        Name cannot be changed after creation
                                                    </FormDescription>
                                                )}
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Material description"
                                                        className="resize-none"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </TabsContent>

                                <TabsContent
                                    value="tags"
                                    className="space-y-4"
                                >
                                    <FormField
                                        control={form.control}
                                        name="tagIds"
                                        render={() => (
                                            <FormItem>
                                                <FormLabel>Tags</FormLabel>
                                                <FormControl>
                                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                                        {tags.map((tag) => (
                                                            <div
                                                                key={tag.id}
                                                                className="flex items-center space-x-2 p-2 rounded-md border hover:bg-muted cursor-pointer"
                                                                onClick={() => handleTagToggle(tag.id)}
                                                            >
                                                                <div className="flex-1 flex items-center space-x-2">
                                                                    <Badge
                                                                        style={{
                                                                            backgroundColor: tag.color,
                                                                            color: tag.fontColor,
                                                                        }}
                                                                    >
                                                                        {tag.name}
                                                                    </Badge>
                                                                    <span className="text-sm">
                                                                        {form
                                                                            .getValues("tagIds")
                                                                            .includes(tag.id) ? (
                                                                            <Check className="h-4 w-4 text-green-500" />
                                                                        ) : null}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {tags.length === 0 && (
                                                            <div className="col-span-2 text-center py-4 text-muted-foreground">
                                                                No tags available. Create tags first.
                                                            </div>
                                                        )}
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </TabsContent>

                                <TabsContent
                                    value="characteristics"
                                    className="space-y-4"
                                >
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <FormLabel>Characteristics</FormLabel>
                                            <Select
                                                onValueChange={handleAddCharacteristic}
                                                value=""
                                            >
                                                <SelectTrigger className="w-[250px]">
                                                    <SelectValue placeholder="Add characteristic" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {getAvailableCharacteristics().map((characteristic) => (
                                                        <SelectItem
                                                            key={characteristic.id}
                                                            value={characteristic.id}
                                                        >
                                                            {characteristic.name}
                                                        </SelectItem>
                                                    ))}
                                                    {getAvailableCharacteristics().length === 0 && (
                                                        <SelectItem
                                                            value="none"
                                                            disabled
                                                        >
                                                            No characteristics available
                                                        </SelectItem>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-4 mb-0.5">
                                            {characteristicValues.length === 0 ? (
                                                <div className="text-center py-4 text-muted-foreground border rounded-md">
                                                    No characteristics added yet
                                                </div>
                                            ) : (
                                                getOrderedCharacteristicValues().map((cv, index) => (
                                                    <div
                                                        key={cv.characteristicId}
                                                        className="border rounded-md p-3 space-y-1"
                                                        draggable
                                                        onDragStart={() => handleDragStart(index)}
                                                        onDragOver={(e) => handleDragOver(e, index)}
                                                        onDragEnd={handleDragEnd}
                                                    >
                                                        <div className="flex justify-between items-center">
                                                            <div className="flex items-center gap-2">
                                                                <GripVertical className="h-4 w-4 cursor-move text-gray-400" />
                                                                <div className="font-medium">
                                                                    {cv.Characteristic.name}
                                                                </div>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() =>
                                                                    handleRemoveCharacteristic(cv.characteristicId)
                                                                }
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {cv.Characteristic.description}
                                                        </div>
                                                        <CharacteristicValueForm
                                                            characteristic={cv.Characteristic}
                                                            value={cv.value}
                                                            onChange={(value) => {
                                                                console.log(value)

                                                                handleCharacteristicValueChange(
                                                                    cv.characteristicId,
                                                                    value,
                                                                )
                                                            }}
                                                            isEditing={isEditing}
                                                        />
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </TabsContent>
                            </div>

                            <DialogFooter className="pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleClose()}
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
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}

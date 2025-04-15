import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { createMaterialHistory } from "@/services/material-history.service"
import { addMaterialCreateLog, addMaterialUpdateLog } from "@/services/log.service"
import { saveFile, deleteFiles } from "@/services/storage.service"
import { ValueFieldCharacteristic } from "@/types/material.type"

type CreateCharacteristicValueInput = {
    characteristicId: string
    value?: null | string[] | string | boolean | { date: Date } | { from: Date; to: Date } | { file: File[] }
}

type UpdateCharacteristicValueInput = {
    characteristicId: string
    value?:
        | null
        | string[]
        | string
        | boolean
        | { date: Date }
        | { from: Date; to: Date }
        | { fileToDelete: string[]; fileToAdd: File[] }
}

const materialImageMaxWidth = { imgMaxWidth: 720, imgMaxHeight: 720 }

// Get all materials with their tags
export async function getMaterials(entityId: string) {
    try {
        const materials = await prisma.material.findMany({
            where: {
                entityId,
            },
            include: {
                Tags: true,
            },
            orderBy: {
                updatedAt: "desc",
            },
        })

        return materials
    } catch (error) {
        console.error("Failed to fetch materials:", error)
        throw new Error("Failed to fetch materials")
    }
}

// Get material by ID
export async function getMaterialById(id: string) {
    try {
        const material = await prisma.material.findUnique({
            where: { id },
        })

        return material
    } catch (error) {
        console.error("Failed to fetch material:", error)
        throw new Error("Failed to fetch material")
    }
}

// Get material characteristics
export async function getMaterialCharacteristics(materialId: string) {
    try {
        const characteristicValues = await prisma.material_Characteristic.findMany({
            where: {
                materialId,
            },
            include: {
                Characteristic: true,
            },
        })

        return characteristicValues
    } catch (error) {
        console.error("Failed to fetch material characteristics:", error)
        throw new Error("Failed to fetch material characteristics")
    }
}

// Create a new material
export async function createMaterial(data: {
    name: string
    description: string
    tagIds: string[]
    orderCharacteristics: string[]
    characteristicValues: CreateCharacteristicValueInput[]
    entityId: string
}) {
    try {
        // Create the material
        const material = await prisma.material.create({
            data: {
                name: data.name,
                description: data.description || "",
                Tags: {
                    connect: data.tagIds.map((id) => ({ id })),
                },
                Characteristics: {
                    connect: data.orderCharacteristics.map((characteristicId) => ({ id: characteristicId })),
                },
                order_Material_Characteristic: data.orderCharacteristics,
                entityId: data.entityId,
            },
        })

        // Create material characteristics
        if (data.characteristicValues.length > 0) {
            for (const cv of data.characteristicValues) {
                let isFile = false
                let processedValue:
                    | null
                    | string[]
                    | string
                    | boolean
                    | { date: Date }
                    | { from: Date; to: Date }
                    | { file: string[] } = null

                // Check if value is a file upload object
                if (
                    cv.value &&
                    typeof cv.value === "object" &&
                    "file" in cv.value &&
                    Array.isArray(cv.value.file)
                ) {
                    isFile = true
                    const fileIds = []

                    // Process each file in the array
                    for (const file of cv.value.file) {
                        if (file instanceof File) {
                            // Save file using storage service
                            const savedFile = await saveFile(
                                file,
                                `materials/${material.id}/characteristics/${cv.characteristicId}`,
                                materialImageMaxWidth,
                            )

                            fileIds.push(savedFile.id)
                        }
                    }

                    // Store file IDs instead of actual files
                    processedValue = { file: fileIds.length > 0 ? fileIds : [] }
                }
                if (!isFile) {
                    processedValue = cv.value as
                        | null
                        | string[]
                        | string
                        | boolean
                        | { date: Date }
                        | { from: Date; to: Date }
                }

                // Create the characteristic value
                await prisma.material_Characteristic.create({
                    data: {
                        materialId: material.id,
                        characteristicId: cv.characteristicId,
                        value: processedValue || undefined,
                    },
                })
            }
        }

        // Create material history entry
        createMaterialHistory(material.id)

        // Add log
        addMaterialCreateLog({ id: material.id, name: material.name }, data.entityId)

        revalidatePath("/materials")
        return material
    } catch (error) {
        console.error("Failed to create material:", error)
        throw new Error("Failed to create material")
    }
}

// Update an existing material
export async function updateMaterial(
    id: string,
    entityId: string,
    data: {
        description: string
        tagIds: string[]
        orderCharacteristics: string[]
        characteristicValues: UpdateCharacteristicValueInput[]
    },
) {
    try {
        // Get current material to determine if version should be incremented
        const currentMaterial = await prisma.material.findUnique({
            where: { id, entityId },
            include: {
                Tags: true,
                Material_Characteristics: true,
            },
        })

        if (!currentMaterial) {
            throw new Error("Material not found")
        }

        // Update the material
        const material = await prisma.material.update({
            where: { id },
            data: {
                description: data.description || "",
                updatedAt: new Date(),
                Tags: {
                    set: data.tagIds.map((id) => ({ id })), // Add new tags
                },
                Characteristics: {
                    set: data.orderCharacteristics.map((characteristicId) => ({ id: characteristicId })), // Add new characteristics
                },
                order_Material_Characteristic: data.orderCharacteristics,
            },
        })

        // Update material characteristics
        // First, remove all existing characteristics
        await prisma.material_Characteristic.deleteMany({
            where: {
                materialId: id,
            },
        })

        // Then, add the new characteristics
        if (data.characteristicValues.length > 0) {
            for (const cv of data.characteristicValues) {
                let isFile = false
                let processedValue: ValueFieldCharacteristic = null

                // Check if value is a file upload object
                if (
                    cv.value &&
                    typeof cv.value === "object" &&
                    "fileToAdd" in cv.value &&
                    Array.isArray(cv.value.fileToAdd)
                ) {
                    isFile = true
                    const fileIds = []

                    // Process each file in the array
                    for (const file of cv.value.fileToAdd) {
                        if (file instanceof File) {
                            // Save file using storage service
                            const savedFile = await saveFile(
                                file,
                                `materials/${material.id}/characteristics/${cv.characteristicId}`,
                                materialImageMaxWidth,
                            )

                            fileIds.push(savedFile.id)
                        }
                    }

                    // Get existing file IDs if any
                    const existingCharacteristic = currentMaterial.Material_Characteristics.find(
                        (mc) => mc.characteristicId === cv.characteristicId,
                    )
                    let existingFileIds: string[] = []
                    if (
                        existingCharacteristic?.value &&
                        typeof existingCharacteristic.value === "object" &&
                        "file" in existingCharacteristic.value
                    ) {
                        existingFileIds = existingCharacteristic.value.file as string[]
                    }

                    // Remove files that should be deleted
                    const filesToKeep = existingFileIds.filter((id) => {
                        if (cv.value && typeof cv.value === "object" && "fileToDelete" in cv.value) {
                            return !(cv.value as { fileToDelete?: string[] }).fileToDelete?.includes(id)
                        }
                        return true
                    })

                    // Delete removed files
                    const filesToDelete = existingFileIds.filter((id) => !filesToKeep.includes(id))
                    if (filesToDelete.length > 0) {
                        await deleteFiles(filesToDelete, true) // Only delete from DB (for history purpose)
                    }

                    // Store file IDs instead of actual files
                    processedValue = { file: [...filesToKeep, ...fileIds] }
                }
                if (!isFile) {
                    processedValue = cv.value as
                        | null
                        | string[]
                        | string
                        | boolean
                        | { date: Date }
                        | { from: Date; to: Date }
                }

                // Create the characteristic value
                await prisma.material_Characteristic.create({
                    data: {
                        materialId: id,
                        characteristicId: cv.characteristicId,
                        value: processedValue || undefined,
                    },
                })
            }
        }

        // Create material history entry
        createMaterialHistory(material.id)

        // Add log
        addMaterialUpdateLog({ id: material.id, name: currentMaterial.name }, entityId)

        revalidatePath("/materials")
        return material
    } catch (error) {
        console.error("Failed to update material:", error)
        throw new Error("Failed to update material")
    }
}

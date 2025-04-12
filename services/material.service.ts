import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { createMaterialHistory } from "@/services/material-history.service"
import { addMaterialCreateLog, addMaterialUpdateLog } from "@/services/log.service"

type CharacteristicValueInput = {
    characteristicId: string
    value?: any
}

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
    characteristicValues: CharacteristicValueInput[]
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
            await prisma.material_Characteristic.createMany({
                data: data.characteristicValues.map((cv) => ({
                    materialId: material.id,
                    characteristicId: cv.characteristicId,
                    value: cv.value || null,
                })),
            })
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
        characteristicValues: CharacteristicValueInput[]
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
            await prisma.material_Characteristic.createMany({
                data: data.characteristicValues.map((cv) => ({
                    materialId: id,
                    characteristicId: cv.characteristicId,
                    value: cv.value || null,
                })),
            })
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

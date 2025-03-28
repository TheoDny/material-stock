"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { actionClient } from "@/lib/safe-action"
import { checkAuth } from "@/lib/auth-guard"
import { createMaterialHistory } from "@/services/material-history.service"

// Schema for creating a material
const createMaterialSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().optional(),
    tagIds: z.array(z.string()).default([]),
    characteristicValues: z
        .array(
            z.object({
                characteristicId: z.string(),
                value: z.any(),
            }),
        )
        .default([]),
})

// Schema for updating a material
const updateMaterialSchema = z.object({
    id: z.string(),
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().optional(),
    tagIds: z.array(z.string()).default([]),
    characteristicValues: z
        .array(
            z.object({
                characteristicId: z.string(),
                value: z.any(),
            }),
        )
        .default([]),
})

// Get all materials with their tags and characteristic count
export async function getMaterialsAction() {
    try {
        // Basic auth check
        const session = await checkAuth()

        const materials = await prisma.material.findMany({
            where: {
                entityId: session.user.entitySelectedId,
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
export async function getMaterialCharacteristicsAction(materialId: string) {
    try {
        // Basic auth check
        await checkAuth()

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
export const createMaterial = actionClient
    .schema(createMaterialSchema)
    .action(async ({ parsedInput: { name, description, tagIds, characteristicValues } }) => {
        try {
            // We need a custom permission code for materials, but for now we'll use tag_create
            const session = await checkAuth({ requiredPermission: "tag_create" })

            // Create the material
            const material = await prisma.material.create({
                data: {
                    name,
                    description: description || "",
                    Tags: {
                        connect: tagIds.map((id) => ({ id })),
                    },
                    entityId: session.user.entitySelectedId,
                },
            })

            // Create material characteristics
            if (characteristicValues.length > 0) {
                await prisma.material_Characteristic.createMany({
                    data: characteristicValues.map((cv) => ({
                        materialId: material.id,
                        characteristicId: cv.characteristicId,
                        value: cv.value,
                    })),
                })
            }

            // Create material history entry
            createMaterialHistory(material.id)

            revalidatePath("/materials")
            return material
        } catch (error) {
            console.error("Failed to create material:", error)
            throw new Error("Failed to create material")
        }
    })

// Update an existing material
export const updateMaterialAction = actionClient
    .schema(updateMaterialSchema)
    .action(async ({ parsedInput: { id, description, tagIds, characteristicValues } }) => {
        try {
            // We need a custom permission code for materials, but for now we'll use tag_edit
            const session = await checkAuth({ requiredPermission: "tag_edit" })

            // Get current material to determine if version should be incremented
            const currentMaterial = await prisma.material.findUnique({
                where: { id, entityId: session.user.entitySelectedId },
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
                    description: description || "",
                    updatedAt: new Date(),
                    Tags: {
                        set: tagIds.map((id) => ({ id })), // Add new tags
                    },
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
            if (characteristicValues.length > 0) {
                await prisma.material_Characteristic.createMany({
                    data: characteristicValues.map((cv) => ({
                        materialId: id,
                        characteristicId: cv.characteristicId,
                        value: cv.value,
                    })),
                })
            }

            // Create material history entry
            createMaterialHistory(material.id)

            revalidatePath("/materials")
            return material
        } catch (error) {
            console.error("Failed to update material:", error)
            throw new Error("Failed to update material")
        }
    })

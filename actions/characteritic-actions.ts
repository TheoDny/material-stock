"use server"

import { z } from "zod"
import { actionClient } from "@/lib/safe-action"
import { CharacteristicType } from "@prisma/client"
import { checkAuth } from "@/lib/auth-guard"
import { getCharacteristics, createCharacteristic, updateCharacteristic } from "@/services/characteristic.service"

// Schema for creating a characteristic
const createCharacteristicSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(64, "Name must be at most 64 characters"),
    description: z.string().trim().max(255, "Description must be at most 255 characters").optional(),
    type: z.nativeEnum(CharacteristicType, {
        errorMap: () => ({ message: "Invalid characteristic type" }),
    }),
    options: z.array(z.string().trim()).nullable(),
    units: z.string().trim().nullable(),
})

// Schema for updating a characteristic
const updateCharacteristicSchema = z.object({
    id: z.string().trim(),
    description: z.string().trim().max(255, "Description must be at most 255 characters"),
})

// Get all characteristics
export async function getCharacteristicsAction() {
    try {
        // Basic auth check
        const session = await checkAuth()

        return await getCharacteristics(session.user.entitySelectedId)
    } catch (error) {
        console.error("Failed to fetch characteristics:", error)
        throw new Error("Failed to fetch characteristics")
    }
}

// Create a new characteristic
export const createCharacteristicAction = actionClient
    .schema(createCharacteristicSchema)
    .action(async ({ parsedInput }) => {
        try {
            const session = await checkAuth({ requiredPermission: "tag_create" })

            const { name, description, type, options, units } = parsedInput

            const characteristic = await createCharacteristic({
                name,
                description: description || "",
                type,
                options,
                units,
                entityId: session.user.entitySelectedId,
            })

            return characteristic
        } catch (error) {
            console.error("Failed to create characteristic:", error)
            throw new Error("Failed to create characteristic")
        }
    })

// Update an existing characteristic
export const updateCharacteristicAction = actionClient
    .schema(updateCharacteristicSchema)
    .action(async ({ parsedInput }) => {
        try {
            const session = await checkAuth({ requiredPermission: "tag_edit" })

            const { id, description } = parsedInput

            return await updateCharacteristic(id, session.user.entitySelectedId, {
                description,
            })
        } catch (error) {
            console.error("Failed to update characteristic:", error)
            throw new Error("Failed to update characteristic")
        }
    })

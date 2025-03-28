"use server"

import { z } from "zod"
import { actionClient } from "@/lib/safe-action"
import { CharacteristicType } from "@prisma/client"
import { Prisma } from "@prisma/client"
import { checkAuth } from "@/lib/auth-guard"
import { getCharacteristics, createCharacteristic, updateCharacteristic } from "@/services/characteristic.service"

// Schema for creating a characteristic
const createCharacteristicSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().optional(),
    type: z.nativeEnum(CharacteristicType, {
        errorMap: () => ({ message: "Invalid characteristic type" }),
    }),
    options: z
        .array(z.string())
        .nullable()
        .transform((val) => (val === null ? Prisma.JsonNull : val)),
    units: z.string().nullable(),
})

// Schema for updating a characteristic
const updateCharacteristicSchema = z.object({
    id: z.string(),
    description: z.string(),
})

// Get all characteristics with material count
export async function getCharacteristicsAction() {
    try {
        // Auth check for basic session validation
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
            // Check for charac_create permission
            const session = await checkAuth({ requiredPermission: "charac_create" })

            return await createCharacteristic({
                ...parsedInput,
                description: parsedInput.description || "",
                entityId: session.user.entitySelectedId,
            })
        } catch (error) {
            console.error("Failed to create characteristic:", error)
            return {
                success: false,
                message: "Failed to create characteristic",
            }
        }
    })

// Update an existing characteristic
export const updateCharacteristicAction = actionClient
    .schema(updateCharacteristicSchema)
    .action(async ({ parsedInput: { id, description } }) => {
        try {
            // Check for charac_edit permission
            const session = await checkAuth({ requiredPermission: "charac_edit" })

            return await updateCharacteristic(id, session.user.entitySelectedId, description)
        } catch (error) {
            console.error("Failed to update characteristic:", error)
            return {
                success: false,
                message: "Failed to update characteristic",
            }
        }
    })

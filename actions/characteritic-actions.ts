"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { actionClient } from "@/lib/safe-action"
import { CharacteristicType } from "@prisma/client"
import { Prisma } from "@prisma/client"
import { checkAuth } from "@/lib/auth-guard"

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

        const characteristics = await prisma.characteristic.findMany({
            where: {
                entityId: session.user.entitySelectedId,
            },
            include: {
                _count: {
                    select: { Materials: true },
                },
            },
            orderBy: {
                name: "asc",
            },
        })

        return characteristics
    } catch (error) {
        console.error("Failed to fetch characteristics:", error)
        throw new Error("Failed to fetch characteristics")
    }
}

// Create a new characteristic
export const createCharacteristicAction = actionClient
    .schema(createCharacteristicSchema)
    .action(async ({ parsedInput: { name, description, type, options, units } }) => {
        try {
            // Check for charac_create permission
            const session = await checkAuth({ requiredPermission: "charac_create" })

            const characteristic = await prisma.characteristic.create({
                data: {
                    name,
                    description: description || "",
                    type,
                    options,
                    units,
                    entityId: session.user.entitySelectedId,
                },
            })

            revalidatePath("/configuration/characteristics")
            return {
                success: true,
                data: characteristic,
            }
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

            const characteristic = await prisma.characteristic.update({
                where: {
                    id,
                    entityId: session.user.entitySelectedId,
                },
                data: {
                    description,
                },
            })

            revalidatePath("/configuration/characteristics")
            return {
                success: true,
                data: characteristic,
            }
        } catch (error) {
            console.error("Failed to update characteristic:", error)
            return {
                success: false,
                message: "Failed to update characteristic",
            }
        }
    })

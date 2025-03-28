"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { actionClient } from "@/lib/safe-action"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { CharacteristicType } from "@prisma/client"
import { Prisma } from "@prisma/client"

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
        const session = await auth.api.getSession({
            headers: await headers(),
        })
        if (!session) {
            throw new Error("Unauthorized")
        }

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
            const session = await auth.api.getSession({
                headers: await headers(),
            })
            if (!session) {
                throw new Error("Unauthorized")
            }

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
            const session = await auth.api.getSession({
                headers: await headers(),
            })
            if (!session) {
                throw new Error("Unauthorized")
            }

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

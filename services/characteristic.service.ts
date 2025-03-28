import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { CharacteristicType } from "@prisma/client"

type CharacteristicCreateData = {
    name: string
    description: string
    type: CharacteristicType
    options: any
    units: string | null
    entityId: string
}

// Get all characteristics with material count
export async function getCharacteristics(entityId: string) {
    try {
        const characteristics = await prisma.characteristic.findMany({
            where: {
                entityId,
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
export async function createCharacteristic(data: CharacteristicCreateData) {
    try {
        const characteristic = await prisma.characteristic.create({
            data: {
                name: data.name,
                description: data.description || "",
                type: data.type,
                options: data.options,
                units: data.units,
                entityId: data.entityId,
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
}

// Update an existing characteristic
export async function updateCharacteristic(id: string, entityId: string, description: string) {
    try {
        const characteristic = await prisma.characteristic.update({
            where: {
                id,
                entityId,
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
}

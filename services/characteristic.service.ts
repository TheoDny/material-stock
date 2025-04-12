import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { CharacteristicType } from "@prisma/client"
import {
    addCharacteristicCreateLog,
    addCharacteristicUpdateLog,
    addCharacteristicDeleteLog,
} from "@/services/log.service"

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

        // Add log
        addCharacteristicCreateLog({ id: characteristic.id, name: characteristic.name }, data.entityId)

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
export async function updateCharacteristic(id: string, entityId: string, param: { description: string }) {
    try {
        // First get the characteristic to access its name
        const existingCharacteristic = await prisma.characteristic.findUnique({
            where: { id },
        })

        if (!existingCharacteristic) {
            throw new Error("Characteristic not found")
        }

        const characteristic = await prisma.characteristic.update({
            where: {
                id,
                entityId,
            },
            data: {
                description: param.description,
            },
        })

        // Add log
        addCharacteristicUpdateLog({ id, name: existingCharacteristic.name }, entityId)

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

// Delete a characteristic
export async function deleteCharacteristic(id: string, entityId: string) {
    try {
        // Check if the characteristic is used by any materials
        const materialCount = await prisma.material.count({
            where: {
                Characteristics: {
                    some: {
                        id,
                    },
                },
            },
        })

        if (materialCount > 0) {
            return {
                success: false,
                message: "Cannot delete characteristic that is used by materials",
            }
        }

        // First get the characteristic to access its name
        const existingCharacteristic = await prisma.characteristic.findUnique({
            where: { id },
        })

        if (!existingCharacteristic) {
            throw new Error("Characteristic not found")
        }

        const characteristic = await prisma.characteristic.delete({
            where: {
                id,
                entityId,
            },
        })

        // Add log
        addCharacteristicDeleteLog({ id, name: existingCharacteristic.name }, entityId)

        revalidatePath("/configuration/characteristics")
        return {
            success: true,
            data: characteristic,
        }
    } catch (error) {
        console.error("Failed to delete characteristic:", error)
        return {
            success: false,
            message: "Failed to delete characteristic",
        }
    }
}

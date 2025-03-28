"use server"

import { prisma } from "@/lib/prisma"

// Get material by ID
export async function getMaterialByIdAction(id: string) {
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

// Get material history
export async function getMaterialHistoryAction(materialId: string) {
    try {
        const history = await prisma.material_History.findMany({
            where: {
                materialId,
            },
            orderBy: {
                createdAt: "desc",
            },
        })

        return history
    } catch (error) {
        console.error("Failed to fetch material history:", error)
        throw new Error("Failed to fetch material history")
    }
}

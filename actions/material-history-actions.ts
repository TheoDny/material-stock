"use server"

import { getMaterialById, getMaterialHistory } from "@/services/material-history-details.service"
import { checkAuth } from "@/lib/auth-guard"

// Get material by ID
export async function getMaterialByIdAction(id: string) {
    try {
        // Basic auth check
        await checkAuth()

        return await getMaterialById(id)
    } catch (error) {
        console.error("Failed to fetch material:", error)
        throw new Error("Failed to fetch material")
    }
}

// Get material history
export async function getMaterialHistoryAction(materialId: string) {
    try {
        // Basic auth check
        await checkAuth()

        return await getMaterialHistory(materialId)
    } catch (error) {
        console.error("Failed to fetch material history:", error)
        throw new Error("Failed to fetch material history")
    }
}

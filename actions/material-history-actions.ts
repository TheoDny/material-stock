"use server"

import { z } from "zod"
import { actionClient } from "@/lib/safe-action"
import { getMaterialHistory } from "@/services/material-history.service"
import { checkAuth } from "@/lib/auth-guard"

// Schéma pour la validation des entrées
const getMaterialHistorySchema = z.object({
    materialId: z.string(),
    dateFrom: z.date(),
    dateTo: z.date(),
})

export const getMaterialHistoryAction = actionClient
    .schema(getMaterialHistorySchema)
    .action(async ({ parsedInput }) => {
        try {
            // Basic auth check
            await checkAuth()

            return await getMaterialHistory(parsedInput.materialId, parsedInput.dateFrom, parsedInput.dateTo)
        } catch (error) {
            console.error("Failed to fetch material history:", error)
            throw new Error("Failed to fetch material history")
        }
    })

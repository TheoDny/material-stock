"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { actionClient } from "@/lib/safe-action"
import { checkAuth } from "@/lib/auth-guard"

// Schema for creating a tag
const createTagSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    fontColor: z.string().min(4, "Color text must be a valid color"),
    color: z.string().min(4, "Color must be a valid color"),
})

// Schema for updating a tag
const updateTagSchema = z.object({
    id: z.string(),
    fontColor: z.string().min(4, "Color text must be a valid color"),
    color: z.string().min(4, "Color must be a valid color"),
})

// Get all tags with material count
export async function getTagsAction() {
    try {
        // Auth check for basic session validation
        const session = await checkAuth()

        const tags = await prisma.tag.findMany({
            include: {
                _count: {
                    select: { Materials: true },
                },
            },
            where: {
                entityId: session.user.entitySelectedId,
            },
            orderBy: {
                name: "asc",
            },
        })

        return tags
    } catch (error) {
        console.error("Failed to fetch tags:", error)
        throw new Error("Failed to fetch tags")
    }
}

// Create a new tag
export const createTagAction = actionClient
    .schema(createTagSchema)
    .action(async ({ parsedInput: { name, fontColor, color } }) => {
        try {
            // Check for tag_create permission
            const session = await checkAuth({ requiredPermission: "tag_create" })

            const tag = await prisma.tag.create({
                data: {
                    name,
                    fontColor,
                    color,
                    entityId: session.user.entitySelectedId,
                },
            })

            revalidatePath("/dashboard/tags")
            return {
                success: true,
                data: tag,
            }
        } catch (error) {
            console.error("Failed to create tag:", error)
            throw new Error("Failed to create tag")
        }
    })

// Update an existing tag
export const updateTagAction = actionClient
    .schema(updateTagSchema)
    .action(async ({ parsedInput: { id, fontColor, color } }) => {
        try {
            // Check for tag_edit permission
            const session = await checkAuth({ requiredPermission: "tag_edit" })

            const tag = await prisma.tag.update({
                where: { id, entityId: session.user.entitySelectedId },
                data: {
                    fontColor,
                    color,
                },
            })

            revalidatePath("/configuration/tags")
            return {
                success: true,
                data: tag,
            }
        } catch (error) {
            console.error("Failed to update tag:", error)
            throw new Error("Failed to update tag")
        }
    })

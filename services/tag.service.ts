import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// Get all tags with material count
export async function getTags(entityId: string) {
    try {
        const tags = await prisma.tag.findMany({
            include: {
                _count: {
                    select: { Materials: true },
                },
            },
            where: {
                entityId,
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
export async function createTag(data: { name: string; fontColor: string; color: string; entityId: string }) {
    try {
        const tag = await prisma.tag.create({
            data,
        })

        revalidatePath("/dashboard/tags")
        return tag
    } catch (error) {
        console.error("Failed to create tag:", error)
        throw new Error("Failed to create tag")
    }
}

// Update an existing tag
export async function updateTag(id: string, entityId: string, data: { fontColor: string; color: string }) {
    try {
        const tag = await prisma.tag.update({
            where: { id, entityId },
            data,
        })

        revalidatePath("/configuration/tags")
        return tag
    } catch (error) {
        console.error("Failed to update tag:", error)
        throw new Error("Failed to update tag")
    }
}

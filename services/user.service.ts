import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// Get all users with their roles and entities
export async function getUsers() {
    try {
        const users = await prisma.user.findMany({
            include: {
                Roles: true,
                Entities: true,
            },
            orderBy: {
                name: "asc",
            },
        })

        return users
    } catch (error) {
        console.error("Failed to fetch users:", error)
        throw new Error("Failed to fetch users")
    }
}

// Create a new user
export async function createUser(data: { name: string; email: string; active: boolean; entities: string[] }) {
    try {
        const user = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                active: data.active,
                entitySelectedId: data.entities[0], // Set the first entity as selected
                Entities: {
                    connect: data.entities.map((entityId) => ({ id: entityId })),
                },
            },
            include: {
                Roles: true,
                Entities: true,
            },
        })

        revalidatePath("/administration/users")
        return user
    } catch (error) {
        console.error("Failed to create user:", error)
        throw new Error("Failed to create user")
    }
}

// Update an existing user
export async function updateUser(
    id: string,
    data: {
        name: string
        email: string
        active: boolean
        entities: string[]
    },
) {
    try {
        const user = await prisma.user.update({
            where: { id },
            data: {
                name: data.name,
                email: data.email,
                active: data.active,
                Entities: {
                    set: data.entities.map((entityId) => ({ id: entityId })),
                },
            },
            include: {
                Roles: true,
                Entities: true,
            },
        })

        revalidatePath("/administration/users")
        return user
    } catch (error) {
        console.error("Failed to update user:", error)
        throw new Error("Failed to update user")
    }
}

// Assign roles to a user
export async function assignRolesToUser(userId: string, roleIds: string[]) {
    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                Roles: {
                    set: roleIds.map((id) => ({ id })),
                },
            },
            include: {
                Roles: true,
            },
        })

        revalidatePath("/administration/users")
        return user
    } catch (error) {
        console.error("Failed to assign roles:", error)
        throw new Error("Failed to assign roles")
    }
}

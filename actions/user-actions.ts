"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { actionClient } from "@/lib/safe-action"

// Schema for creating a user
const createUserSchema = z.object({
    name: z.string().min(2, "First name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    active: z.boolean().default(true),
    entities: z.array(z.string()).min(1, "At least one entity must be selected"),
})

// Schema for updating a user
const updateUserSchema = z.object({
    id: z.string(),
    name: z.string().min(2, "First name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    active: z.boolean(),
    entities: z.array(z.string()).default([]),
})

// Schema for assigning roles to a user
const assignRolesSchema = z.object({
    userId: z.string(),
    roleIds: z.array(z.string()),
})

// Get all users with their roles
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
export const createUser = actionClient
    .schema(createUserSchema)
    .action(async ({ parsedInput: { name, email, active, entities } }) => {
        try {
            const user = await prisma.user.create({
                data: {
                    name,
                    email,
                    active,
                    entitySelectedId: entities[0], // Set the first entity as selected
                    Entities: {
                        connect: entities.map((entityId) => ({ id: entityId })),
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
    })

// Update an existing user
export const updateUser = actionClient
    .schema(updateUserSchema)
    .action(async ({ parsedInput: { id, name, email, active, entities } }) => {
        try {
            const user = await prisma.user.update({
                where: { id },
                data: {
                    name,
                    email,
                    active,
                    Entities: {
                        set: entities.map((entityId) => ({ id: entityId })),
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
    })

// Assign roles to a user
export const assignRolesToUser = actionClient
    .schema(assignRolesSchema)
    .action(async ({ parsedInput: { userId, roleIds } }) => {
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
    })

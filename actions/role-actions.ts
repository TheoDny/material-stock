"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { actionClient } from "@/lib/safe-action"

// Schema for creating a role
const createRoleSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().optional(),
})

// Schema for updating a role
const updateRoleSchema = z.object({
    id: z.string(),
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().optional(),
})

// Schema for assigning permissions to a role
const assignPermissionsSchema = z.object({
    roleId: z.string(),
    permissionCodes: z.array(z.string()),
})

// Get all roles with their permissions
export async function getRoles() {
    try {
        const roles = await prisma.role.findMany({
            include: {
                Permissions: true,
            },
            orderBy: {
                name: "asc",
            },
        })

        return roles
    } catch (error) {
        console.error("Failed to fetch roles:", error)
        throw new Error("Failed to fetch roles")
    }
}

// Create a new role
export const createRole = actionClient
    .schema(createRoleSchema)
    .action(async ({ parsedInput: { name, description } }) => {
        try {
            const role = await prisma.role.create({
                data: {
                    name,
                    description: description || "",
                },
                include: {
                    Permissions: true,
                },
            })

            revalidatePath("/administration/roles")
            return role
        } catch (error) {
            console.error("Failed to create role:", error)
            throw new Error("Failed to create role")
        }
    })

// Update an existing role
export const updateRole = actionClient
    .schema(updateRoleSchema)
    .action(async ({ parsedInput: { id, name, description } }) => {
        try {
            const role = await prisma.role.update({
                where: { id },
                data: {
                    name,
                    description: description || "",
                },
                include: {
                    Permissions: true,
                },
            })

            revalidatePath("/administration/roles")
            return role
        } catch (error) {
            console.error("Failed to update role:", error)
            throw new Error("Failed to update role")
        }
    })

// Assign permissions to a role
export const assignPermissionsToRole = actionClient
    .schema(assignPermissionsSchema)
    .action(async ({ parsedInput: { roleId, permissionCodes } }) => {
        try {
            const role = await prisma.role.update({
                where: { id: roleId },
                data: {
                    Permissions: {
                        set: permissionCodes.map((code) => ({ code })),
                    },
                    updatedAt: new Date(),
                },
                include: {
                    Permissions: true,
                },
            })

            revalidatePath("/administration/roles")
            return role
        } catch (error) {
            console.error("Failed to assign permissions:", error)
            throw new Error("Failed to assign permissions")
        }
    })

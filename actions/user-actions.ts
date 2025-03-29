"use server"

import { z } from "zod"
import { actionClient } from "@/lib/safe-action"
import { checkAuth } from "@/lib/auth-guard"
import { getUsers, createUser, updateUser, assignRolesToUser } from "@/services/user.service"

// Schema for creating a user
const createUserSchema = z.object({
    name: z.string().min(2, "First name must be at least 2 characters").trim(),
    email: z.string().email("Invalid email address"),
    active: z.boolean().default(true),
    entities: z.array(z.string()).min(1, "At least one entity must be selected"),
})

// Schema for updating a user
const updateUserSchema = z.object({
    id: z.string(),
    name: z.string().trim().min(2, "First name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    active: z.boolean(),
    entities: z.array(z.string()).default([]),
})

// Schema for assigning roles to a user
const assignRolesSchema = z.object({
    userId: z.string(),
    roleIds: z.array(z.string()),
})

// Schema for updating user roles
const updateUserRolesSchema = z.object({
    userId: z.string().trim(),
    roleIds: z.array(z.string()).default([]),
})

// Get all users with their roles
export async function getUsersAction() {
    try {
        // Auth check without permission requirement for read operations
        await checkAuth()

        return await getUsers()
    } catch (error) {
        console.error("Failed to fetch users:", error)
        throw new Error("Failed to fetch users")
    }
}

// Create a new user
export const createUserAction = actionClient.schema(createUserSchema).action(async ({ parsedInput }) => {
    try {
        // Check for user_create permission
        await checkAuth({ requiredPermission: "user_create" })

        return await createUser(parsedInput)
    } catch (error) {
        console.error("Failed to create user:", error)
        throw new Error("Failed to create user")
    }
})

// Update an existing user
export const updateUserAction = actionClient.schema(updateUserSchema).action(async ({ parsedInput }) => {
    try {
        // Check for user_edit permission
        await checkAuth({ requiredPermission: "user_edit" })

        const { id, ...data } = parsedInput
        return await updateUser(id, data)
    } catch (error) {
        console.error("Failed to update user:", error)
        throw new Error("Failed to update user")
    }
})

// Assign roles to a user
export const assignRolesToUserAction = actionClient
    .schema(assignRolesSchema)
    .action(async ({ parsedInput: { userId, roleIds } }) => {
        try {
            // Check for user_edit permission
            await checkAuth({ requiredPermission: "user_edit" })

            return await assignRolesToUser(userId, roleIds)
        } catch (error) {
            console.error("Failed to assign roles:", error)
            throw new Error("Failed to assign roles")
        }
    })

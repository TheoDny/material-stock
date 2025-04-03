"use server"

import { z } from "zod"
import { actionClient } from "@/lib/safe-action"
import { checkAuth } from "@/lib/auth-guard"
import {
    getUsers,
    createUser,
    updateUser,
    assignRolesToUser,
    updateUserProfile,
    changeEntitySelected,
} from "@/services/user.service"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

// Schema for creating a user
const createUserSchema = z.object({
    name: z.string().trim().min(2, "First name must be at least 2 characters").max(64, "Name must be at most 64 characters"),
    email: z.string().email("Invalid email address"),
    active: z.boolean().default(true),
    entities: z.array(z.string()).min(1, "At least one entity must be selected"),
})

// Schema for updating a user
const updateUserSchema = z.object({
    id: z.string(),
    name: z.string().trim().min(2, "First name must be at least 2 characters").max(64, "Name must be at most 64 characters"),
    email: z.string().email("Invalid email address"),
    active: z.boolean(),
    entitiesToAdd: z.array(z.string()),
    entitiesToRemove: z.array(z.string()),
})

// Schema for assigning roles to a user
const assignRolesSchema = z.object({
    userId: z.string(),
    roleIds: z.array(z.string()),
})

// Schema for profile update
const updateProfileSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(64, "Name must be at most 64 characters"),
    email: z.string().email("Please enter a valid email address"),
    image: z.string().optional(),
})

// Schema for change selected entity
const changeEntitySelectedSchema = z.object({
    entityId: z.string(),
})

// Server action for updating user profile
export const updateProfileAction = actionClient.schema(updateProfileSchema).action(async ({ parsedInput }) => {
    try {
        // Get current session
        const session = await auth.api.getSession({
            headers: await headers(),
        })

        if (!session) {
            throw new Error("You must be logged in to update your profile")
        }

        // Update the user profile
        const updatedUser = await updateUserProfile(session.user.id, {
            name: parsedInput.name,
            email: parsedInput.email,
            image: parsedInput.image,
        })

        // Revalidate the account page
        revalidatePath("/account")

        return updatedUser
    } catch (error) {
        console.error("Failed to update profile:", error)
        throw new Error("Failed to update profile")
    }
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
        const session = await checkAuth({ requiredPermission: "user_edit" })

        if (session.user.id === parsedInput.id) {
            throw new Error("You cannot create a user with the same ID as yourself")
        }

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

export const changeEntitySelectedAction = actionClient
    .schema(changeEntitySelectedSchema)
    .action(async ({ parsedInput }) => {
        try {
            // Get current session
            const session = await auth.api.getSession({
                headers: await headers(),
            })

            if (!session) {
                throw new Error("You must be logged in to change entity")
            }

            // Update the user profile
            const updatedUser = await changeEntitySelected(session.user.id, parsedInput.entityId)

            return updatedUser
        } catch (error) {
            console.error("Failed to change entity:", error)
            throw new Error("Failed to change entity")
        }
    })

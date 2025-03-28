"use server"

import { z } from "zod"
import { actionClient } from "@/lib/safe-action"
import { checkAuth } from "@/lib/auth-guard"
import { getRoles, createRole, updateRole, assignPermissionsToRole } from "@/services/role.service"

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
export async function getRolesAction() {
    try {
        // Auth check without permission requirement for read operations
        await checkAuth()

        return await getRoles()
    } catch (error) {
        console.error("Failed to fetch roles:", error)
        throw new Error("Failed to fetch roles")
    }
}

// Create a new role
export const createRoleAction = actionClient
    .schema(createRoleSchema)
    .action(async ({ parsedInput: { name, description } }) => {
        try {
            // Check for role_create permission
            await checkAuth({ requiredPermission: "role_create" })

            return await createRole({ name, description: description || "" })
        } catch (error) {
            console.error("Failed to create role:", error)
            throw new Error("Failed to create role")
        }
    })

// Update an existing role
export const updateRoleAction = actionClient
    .schema(updateRoleSchema)
    .action(async ({ parsedInput: { id, name, description } }) => {
        try {
            // Check for role_edit permission
            await checkAuth({ requiredPermission: "role_edit" })

            return await updateRole(id, { name, description: description || "" })
        } catch (error) {
            console.error("Failed to update role:", error)
            throw new Error("Failed to update role")
        }
    })

// Assign permissions to a role
export const assignPermissionsToRoleAction = actionClient
    .schema(assignPermissionsSchema)
    .action(async ({ parsedInput: { roleId, permissionCodes } }) => {
        try {
            // Check for role_edit permission
            await checkAuth({ requiredPermission: "role_edit" })

            return await assignPermissionsToRole(roleId, permissionCodes)
        } catch (error) {
            console.error("Failed to assign permissions:", error)
            throw new Error("Failed to assign permissions")
        }
    })

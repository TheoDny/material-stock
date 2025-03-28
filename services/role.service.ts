import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

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
export async function createRole(data: { name: string; description: string }) {
    try {
        const role = await prisma.role.create({
            data: {
                name: data.name,
                description: data.description || "",
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
}

// Update an existing role
export async function updateRole(id: string, data: { name: string; description: string }) {
    try {
        const role = await prisma.role.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description || "",
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
}

// Assign permissions to a role
export async function assignPermissionsToRole(roleId: string, permissionCodes: string[]) {
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
}

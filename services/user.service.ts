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
        entitiesToAdd: string[]
        entitiesToRemove: string[]
    },
) {
    const existingUser = await prisma.user.findFirst({
        where: {
            email: data.email,
            id: {
                not: id,
            },
        },
    })

    if (existingUser) {
        throw new Error("Email is already in use by another account")
    }

    try {
        const user = await prisma.user.update({
            where: { id },
            data: {
                name: data.name,
                email: data.email,
                active: data.active,
                Entities: {
                    connect: data.entitiesToAdd.map((entityId) => ({ id: entityId })),
                    disconnect: data.entitiesToRemove.map((entityId) => ({ id: entityId })),
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

/**
 * Updates a user's email address
 * @param userId The ID of the user to update
 * @param newEmail The new email address
 * @returns The updated user object
 */
export async function updateUserEmail(userId: string, newEmail: string) {
    // Check if the email is already in use by a different user
    const existingUser = await prisma.user.findFirst({
        where: {
            email: newEmail,
            id: {
                not: userId
            }
        }
    });

    if (existingUser) {
        throw new Error("Email is already in use by another account");
    }

    // Update the user's email
    const updatedUser = await prisma.user.update({
        where: {
            id: userId
        },
        data: {
            email: newEmail
        }
    });

    return updatedUser;
}

/**
 * Updates a user's profile information (name, email, and image)
 * @param userId The ID of the user to update
 * @param profileData Object containing the profile data to update
 * @returns The updated user object
 */
export async function updateUserProfile(
    userId: string, 
    profileData: { 
        name: string; 
        email: string; 
        image?: string;
    }
) {
    // Check if the email is already in use by a different user
    if (profileData.email) {
        const existingUser = await prisma.user.findFirst({
            where: {
                email: profileData.email,
                id: {
                    not: userId
                }
            }
        });

        if (existingUser) {
            throw new Error("Email is already in use by another account");
        }
    }

    // Update the user's profile
    const updatedUser = await prisma.user.update({
        where: {
            id: userId
        },
        data: {
            name: profileData.name,
            email: profileData.email,
            image: profileData.image
        }
    });

    return updatedUser;
}

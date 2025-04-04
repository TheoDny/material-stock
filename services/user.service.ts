import { prisma } from "@/lib/prisma"
import { TokenCreateUser } from "@prisma/client"
import { isPast, addDays } from "date-fns"
import { revalidatePath } from "next/cache"

export async function checkToken(token: string, email: string): Promise<boolean> {
    try {
        // Check if the token is present in the model TokenCreateAccount
        const tokenRecord = await prisma.tokenCreateUser.findFirst({
            where: {
                token: token,
                email: email,
            },
        })

        // If token doesn't exist, return false
        if (!tokenRecord) {
            return false
        }

        // Check if the token is expired
        const isExpired = isPast(tokenRecord.expiresAt)

        // If token is expired, return false
        if (isExpired) {
            return false
        }

        // Token exists and is not expired
        return true
    } catch (error) {
        console.error(error)
        return false
    }
}

export async function createTokenUser(email: string, token: string): Promise<TokenCreateUser> {
    const expiresAt = addDays(new Date(), 7)

    const created = await prisma.tokenCreateUser.create({
        data: {
            token,
            email,
            expiresAt,
        },
    })

    return created
}

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
    if (data.entities[0]) {
        throw new Error("Please select at least one entity for the user")
    }
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
 * Updates a user's profile information (name, email, and image)
 * @param userId The ID of the user to update
 * @param profileData Object containing the profile data to update
 * @returns The updated user object
 */
export async function updateUserProfile(
    userId: string,
    profileData: {
        name: string
        email: string
        image?: string
    },
) {
    // Check if the email is already in use by a different user
    if (profileData.email) {
        const existingUser = await prisma.user.findFirst({
            where: {
                email: profileData.email,
                id: {
                    not: userId,
                },
            },
        })

        if (existingUser) {
            throw new Error("Email is already in use by another account")
        }
    }

    // Update the user's profile
    const updatedUser = await prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            name: profileData.name,
            email: profileData.email,
            image: profileData.image,
        },
    })

    return updatedUser
}

export async function changeEntitySelected(userId: string, entityId: string) {
    try {
        //check if user has the new entity in their entities
        let user = await prisma.user.findFirst({
            where: {
                id: userId,
                Entities: {
                    some: {
                        id: entityId,
                    },
                },
            },
        })

        if (!user) {
            throw new Error("User does not have access to the selected entity")
        }

        user = await prisma.user.update({
            where: { id: userId },
            data: {
                entitySelectedId: entityId,
            },
        })

        return user
    } catch (error) {
        console.error("Failed to change entity selected:", error)
        throw new Error("Failed to change entity selected")
    }
}
import { prisma } from "@/lib/prisma"
import { TokenCreateUser } from "@/prisma/generated"
import { addDays, isPast } from "date-fns"

export const getUserRolesPermissionsAndEntities = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            Roles: {
                select: {
                    id: true,
                    name: true,
                    Permissions: {
                        select: {
                            code: true,
                        },
                    },
                },
            },
            Entities: {
                select: {
                    id: true,
                    name: true,
                },
            },
            EntitySelected: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    })

    if (!user) {
        throw new Error("User not found")
    }

    // Create a Set to store unique permission codes
    const uniquePermissions = new Set<string>()
    user.Roles.forEach((role) => {
        role.Permissions.forEach((permission) => {
            uniquePermissions.add(permission.code)
        })
    })

    return {
        email: user.email,
        name: user.name,
        active: user.active,
        Entities: user.Entities,
        Roles: user.Roles.map((role) => ({
            id: role.id,
            name: role.name,
        })),
        Permissions: Array.from(uniquePermissions).map((code) => ({
            code,
        })),
        EntitySelected: user.EntitySelected,
    }
}

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
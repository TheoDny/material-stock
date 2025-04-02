import { prisma } from "@/lib/prisma"

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

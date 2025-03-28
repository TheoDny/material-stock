import { Prisma } from "@prisma/client"

export type RolePermissions = Prisma.RoleGetPayload<{
    include: {
        Permissions: true
    }
}>

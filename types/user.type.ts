import { Prisma } from "@prisma/client"

export type UserRolesAndEntities = Prisma.UserGetPayload<{
    include: {
        Roles: true
        Entities: true
    }
}>

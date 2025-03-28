import { Prisma } from "@prisma/client"

export type TagAndCountMaterial = Prisma.TagGetPayload<{
    include: {
        _count: {
            select: { Materials: true }
        }
    }
}>

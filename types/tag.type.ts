import { Prisma } from "@/prisma/generated"

export type TagAndCountMaterial = Prisma.TagGetPayload<{
    include: {
        _count: {
            select: { Materials: true }
        }
    }
}>

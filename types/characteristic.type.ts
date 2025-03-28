import { Prisma } from "@prisma/client"

export type CharacteristicAndCountMaterial = Prisma.CharacteristicGetPayload<{
    include: {
        _count: {
            select: { Materials: true }
        }
    }
}>

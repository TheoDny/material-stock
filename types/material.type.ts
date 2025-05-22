import { Prisma } from "@/prisma/generated"

export type MaterialWithTag = Prisma.MaterialGetPayload<{
    include: {
        Tags: true
    }
}>

export type MaterialCharacteristicWithFile = Prisma.Material_CharacteristicGetPayload<{
    include: {
        File: true
    }
}>
import { Characteristic, Prisma, FileDb } from "@prisma/client"

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
import { Characteristic, Prisma, FileDb } from "@prisma/client"

export type CharacteristicValue = {
    characteristicId: string
    value: any
    Characteristic: Characteristic
    File?: FileDb[]
}

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

export type ValueFieldCharacteristic =
    | null
    | string[]
    | string
    | boolean
    | { date: Date }
    | { from: Date; to: Date }

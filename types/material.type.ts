import { Characteristic, Prisma } from "@prisma/client"

export type CharacteristicValue = {
    characteristicId: string
    value: any
    Characteristic: Characteristic
}

export type MaterialWithTag = Prisma.MaterialGetPayload<{
    include: {
        Tags: true
    }
}>

export type ValueFieldCharacteristic =
    | null
    | string[]
    | string
    | boolean
    | { date: Date }
    | { from: Date; to: Date }
    | { file: string[] }
import { prisma } from "@/lib/prisma"
import { $Enums, Characteristic, Material_Characteristic, Prisma, Tag } from "@prisma/client"
import { JsonValue } from "@prisma/client/runtime/library"

export const createMaterialHistory = async (materialId: string) => {
    const materialFullInfo = await prisma.material.findUnique({
        where: {
            id: materialId,
        },
        include: {
            Tags: true,
            Characteristics: true,
            Material_Characteristics: true,
        },
    })

    if (!materialFullInfo) {
        console.error(`Material with id ${materialId} not found.`)
        throw new Error(`Material with id ${materialId} not found.`)
    }

    const tagsJson = buildTagsJson(materialFullInfo.Tags)
    const characteristicsJson = buildCharacteristicsJson(
        materialFullInfo.order_Material_Characteristic,
        materialFullInfo.Characteristics,
        materialFullInfo.Material_Characteristics,
    )

    const materialHistory = await prisma.material_History.create({
        data: {
            materialId: materialId,
            name: materialFullInfo.name,
            description: materialFullInfo.description,
            Tags: JSON.stringify(tagsJson),
            Characteristics: JSON.stringify(characteristicsJson),
            createdAt: new Date(),
        },
    })
}

const buildTagsJson = (tags: Tag[]) => {
    return tags.map((tag) => {
        return {
            name: tag.name,
            color: tag.color,
            fontColor: tag.fontColor,
        }
    })
}

const buildCharacteristicsJson = (
    order: string[],
    characteristics: Characteristic[],
    characteristics_value: Material_Characteristic[],
) => {
    const characteristicsJson: {
        name: string
        type: $Enums.CharacteristicType
        units: string | Prisma.NullTypes.JsonNull
        value: JsonValue | Prisma.NullTypes.JsonNull
    }[] = []
    order.forEach((orderItem) => {
        const characteristic = characteristics.find((char) => char.id === orderItem)
        if (!characteristic) {
            console.error(`Characteristic with id ${orderItem} not found, it should not be possible`)
        } else {
            const characteristicValue = characteristics_value.find((char) => char.characteristicId === orderItem)

            characteristicsJson.push({
                name: characteristic.name,
                type: characteristic.type,
                units: characteristic.units ? characteristic.units : Prisma.JsonNull,
                value: characteristicValue?.value ? characteristicValue.value : Prisma.JsonNull,
            })
        }
    })

    return characteristicsJson
}

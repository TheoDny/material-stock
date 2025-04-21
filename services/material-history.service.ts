import { prisma } from "@/lib/prisma"
import { CharacteristicHistory, ValueFieldCharacteristicHistory } from "@/types/material-history.type"
import { MaterialCharacteristicWithFile } from "@/types/material.type"
import { Characteristic, Tag } from "@prisma/client"

export const createMaterialHistory = async (materialId: string) => {
    const materialFullInfo = await prisma.material.findUnique({
        where: {
            id: materialId,
        },
        include: {
            Tags: true,
            Characteristics: true,
            Material_Characteristics: {
                include: {
                    File: true,
                },
            },
        },
    })

    if (!materialFullInfo) {
        console.error(`Material with id ${materialId} not found.`)
        throw new Error(`Material with id ${materialId} not found.`)
    }

    const tagsJson = buildTagsJson(materialFullInfo.Tags)
    const characteristicsJson = await buildCharacteristicsJson(
        materialFullInfo.order_Material_Characteristic,
        materialFullInfo.Characteristics,
        materialFullInfo.Material_Characteristics,
    )

    const materialHistory = await prisma.material_History.create({
        data: {
            materialId: materialId,
            name: materialFullInfo.name,
            description: materialFullInfo.description,
            Tags: tagsJson,
            Characteristics: characteristicsJson,
            createdAt: new Date(),
        },
    })

    return materialHistory
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

const buildCharacteristicsJson = async (
    order: string[],
    characteristics: Characteristic[],
    characteristics_value: MaterialCharacteristicWithFile[],
) => {
    const characteristicsJson: CharacteristicHistory[] = []

    // Use Promise.all with map instead of forEach to properly handle async operations
    await Promise.all(
        order.map(async (orderItem) => {
            const characteristic = characteristics.find((char) => char.id === orderItem)
            if (!characteristic) {
                console.error(`Characteristic with id ${orderItem} not found, it should not be possible`)
                return
            }

            const characteristicValue = characteristics_value.find((char) => char.characteristicId === orderItem)
            let valueToSave: ValueFieldCharacteristicHistory

            if (!characteristicValue) {
                console.error(`Characteristic value with id ${orderItem} not found, it should not be possible`)
                return
            }

            if (
                characteristic.type === "file" &&
                characteristicValue?.File &&
                characteristicValue.File.length > 0
            ) {
                valueToSave = {
                    file: characteristicValue.File.map((f) => {
                        return {
                            type: f.type,
                            name: f.name,
                            path: f.path,
                        }
                    }),
                }
            } else {
                // For non-file types, use the value field directly
                valueToSave = characteristicValue.value as ValueFieldCharacteristicHistory
            }
            // @ts-ignore valueToSave
            characteristicsJson.push({
                name: characteristic.name,
                type: characteristic.type,
                units: characteristic.units ? characteristic.units : null,
                value: valueToSave,
            })
        }),
    )

    return characteristicsJson
}

// Get material history
export async function getMaterialHistory(materialId: string, dateFrom: Date, dateTo: Date) {
    try {
        const history = await prisma.material_History.findMany({
            where: {
                materialId,
                createdAt: {
                    gte: dateFrom,
                    lte: dateTo,
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        })

        return history
    } catch (error) {
        console.error("Failed to fetch material history:", error)
        throw new Error("Failed to fetch material history")
    }
}

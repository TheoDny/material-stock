import {
    CharacteristicBoolean,
    CharacteristicDate,
    CharacteristicDateRange,
    CharacteristicFile,
    CharacteristicMulti,
    CharacteristicMultiText,
    CharacteristicString,
    CharacteristicValueFile,
    CharacteristicValueFileClient,
    MaterialCharacteristic,
    MaterialCharacteristicClient,
} from "@/types/characteristic.type"
import { Characteristic, CharacteristicType } from "@prisma/client"
import { clsx, type ClassValue } from "clsx"
import { format } from "date-fns"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
    const dateObj = typeof date === "string" ? new Date(date) : date
    return format(dateObj, "MMM d, yyyy")
}

export const getTypeColor = (type: CharacteristicType) => {
    const typeColors: Record<CharacteristicType, string> = {
        checkbox: "bg-cyan-100 text-cyan-800",
        select: "bg-green-100 text-green-800",
        radio: "bg-purple-100 text-purple-800",
        multiSelect: "bg-indigo-100 text-indigo-800",
        text: "bg-gray-100 text-gray-800",
        textarea: "bg-stone-100 text-gray-800",
        multiText: "bg-zinc-100 text-gray-800",
        multiTextArea: "bg-slate-100 text-gray-800",
        number: "bg-amber-100 text-amber-800",
        float: "bg-amber-100 text-amber-800",
        email: "bg-pink-100 text-pink-800",
        date: "bg-red-300 text-red-900",
        dateHour: "bg-red-100 text-red-800",
        dateRange: "bg-orange-300 text-orange-900",
        dateHourRange: "bg-orange-100 text-orange-800",
        link: "bg-blue-100 text-blue-800",
        file: "bg-teal-100 text-teal-800",
        boolean: "bg-violet-100 text-violet-800",
    }

    return typeColors[type] || "bg-gray-100 text-gray-800"
}

/**
 * check if an object is empty
 * @param obj
 */
export function isEmpty(obj: Record<string, any>) {
    return Object.keys(obj).length === 0
}

export function generateRandomToken(): string {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    const tokenLength = 64
    let token = ""

    for (let i = 0; i < tokenLength; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length)
        token += characters.charAt(randomIndex)
    }

    return token
}

export async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

export function isCharacteristicValueFile(cv: MaterialCharacteristic): cv is CharacteristicValueFile {
    return cv.Characteristic.type === "file"
}

export function isCharacteristicValueFileClient(
    cv: MaterialCharacteristicClient,
): cv is CharacteristicValueFileClient {
    return cv.Characteristic.type === "file"
}

export function buildCharacteristicDefaultValue(characteristic: Characteristic): MaterialCharacteristicClient {
    switch (characteristic.type) {
        case "text":
        case "textarea":
        case "link":
        case "email":
        case "number":
        case "float":
            return {
                Characteristic: characteristic as CharacteristicString,
                characteristicId: characteristic.id,
                value: "",
            }
        case "multiSelect":
        case "select":
        case "checkbox":
        case "radio":
            return {
                Characteristic: characteristic as CharacteristicMulti,
                characteristicId: characteristic.id,
                value: [],
            }

        case "boolean":
            return {
                Characteristic: characteristic as CharacteristicBoolean,
                characteristicId: characteristic.id,
                value: false,
            }

        case "date":
        case "dateHour":
            return {
                Characteristic: characteristic as CharacteristicDate,
                characteristicId: characteristic.id,
                value: { date: new Date() },
            }

        case "dateRange":
        case "dateHourRange":
            return {
                Characteristic: characteristic as CharacteristicDateRange,
                characteristicId: characteristic.id,
                value: { from: new Date(), to: new Date() },
            }

        case "file":
            return {
                Characteristic: characteristic as CharacteristicFile,
                characteristicId: characteristic.id,
                value: {
                    fileToAdd: [],
                    fileToDelete: [],
                    file: [],
                },
            }
        case "multiText":
        case "multiTextArea":
            return {
                Characteristic: characteristic as CharacteristicMultiText,
                characteristicId: characteristic.id,
                value: {
                    multiText: [
                        { title: "", text: "" },
                        { title: "", text: "" },
                    ],
                },
            }
    }
}
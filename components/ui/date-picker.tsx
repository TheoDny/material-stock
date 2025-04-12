"use client"

import * as React from "react"
import { format, setHours, setMinutes } from "date-fns"
import { Calendar as CalendarIcon, Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { fr } from "date-fns/locale"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Close as PopoverClose } from "@radix-ui/react-popover"

type DatePickerProps = React.HTMLAttributes<HTMLDivElement> & {
    date: Date | undefined
    setDate: (date: Date | undefined) => void
    includeTime?: boolean
    validButton?: boolean
    textHolder?: string
}

export function DatePicker({
    date,
    setDate,
    includeTime = false,
    validButton = false,
    textHolder,
    ...props
}: DatePickerProps) {
    const [hour, setHour] = React.useState("00")
    const [minute, setMinute] = React.useState("00")

    // Mettre à jour l'heure dans la date
    const updateTimeInDate = () => {
        if (!date) return

        const newDate = setMinutes(setHours(date, parseInt(hour) || 0), parseInt(minute) || 0)
        setDate(newDate)
    }

    // Valider et formater l'entrée d'heure
    const validateHourInput = (value: string) => {
        const numValue = parseInt(value) || 0
        if (numValue < 0) {
            setHour("00")
        } else if (numValue > 23) {
            setHour("23")
        } else {
            setHour(numValue.toString().padStart(2, "0"))
        }
    }

    // Valider et formater l'entrée de minute
    const validateMinuteInput = (value: string) => {
        const numValue = parseInt(value) || 0
        if (numValue < 0) {
            setMinute("00")
        } else if (numValue > 59) {
            setMinute("59")
        } else {
            setMinute(numValue.toString().padStart(2, "0"))
        }
    }

    // Formater l'affichage de la date avec l'heure si includeTime est true
    const formatDateDisplay = (dateValue: Date) => {
        if (!includeTime) {
            return format(dateValue, "PPP", { locale: fr })
        }
        return format(dateValue, "PPP", { locale: fr }) + ` ${hour}:${minute}`
    }

    // Initialiser les heures et minutes lors du changement de date
    React.useEffect(() => {
        if (date) {
            setHour(date.getHours().toString().padStart(2, "0"))
            setMinute(date.getMinutes().toString().padStart(2, "0"))
        }
    }, [date])

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-[280px] justify-start text-left font-normal",
                        !date && "text-muted-foreground",
                        props.className,
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? formatDateDisplay(date) : <span>{textHolder ?? "Choisir une date"}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <div>
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        captionLayout={"dropdown"}
                        className={"h-[365px] w-[300px] flex justify-center"}
                        locale={fr}
                    />
                    {includeTime && date && (
                        <div className="p-3 pb-0">
                            <div className="flex flex-col space-y-2">
                                <div className="flex items-center">
                                    <Clock className="mr-2 h-4 w-4" />
                                    <span className="text-sm font-medium">Heure</span>
                                </div>
                                <Separator />
                                <div className="flex justify-center items-center space-x-1">
                                    <Label
                                        htmlFor="hour"
                                        className="sr-only"
                                    >
                                        Heure
                                    </Label>
                                    <Input
                                        id="hour"
                                        type="number"
                                        min={0}
                                        max={23}
                                        value={hour}
                                        onChange={(e) => {
                                            setHour(e.target.value)
                                        }}
                                        onBlur={(e) => {
                                            validateHourInput(e.target.value)
                                            updateTimeInDate()
                                        }}
                                        className="w-14 text-center"
                                    />
                                    <span>:</span>
                                    <Label
                                        htmlFor="minute"
                                        className="sr-only"
                                    >
                                        Minute
                                    </Label>
                                    <Input
                                        id="minute"
                                        type="number"
                                        min={0}
                                        max={59}
                                        value={minute}
                                        onChange={(e) => {
                                            setMinute(e.target.value)
                                        }}
                                        onBlur={(e) => {
                                            validateMinuteInput(e.target.value)
                                            updateTimeInDate()
                                        }}
                                        className="w-14 text-center"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    {validButton && (
                        <PopoverClose className={"w-full p-3 pt-2"}>
                            <Button className={"w-full"}>Valider</Button>
                        </PopoverClose>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}

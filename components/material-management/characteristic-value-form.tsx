"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Characteristic } from "@prisma/client"

interface CharacteristicValueFormProps {
    characteristic: Characteristic
    value: string
    onChange: (value: string) => void
}

export function CharacteristicValueForm({ characteristic, value, onChange }: CharacteristicValueFormProps) {
    const [date, setDate] = useState<Date | undefined>(value ? new Date(value) : undefined)

    const handleDateChange = (date: Date | undefined) => {
        setDate(date)
        if (date) {
            onChange(date.toISOString())
        } else {
            onChange("")
        }
    }

    const renderFormControl = () => {
        const { type, options, units } = characteristic
        const optionsArray = options as string[]

        switch (type) {
            case "text":
                return (
                    <Input
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Enter text value"
                    />
                )

            case "textarea":
                return (
                    <Textarea
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Enter detailed text"
                        className="resize-none"
                    />
                )

            case "number":
                return (
                    <div className="flex items-center space-x-2">
                        <Input
                            type="number"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder="Enter number"
                        />
                        {units && <span className="text-sm text-muted-foreground">{units}</span>}
                    </div>
                )

            case "float":
                return (
                    <div className="flex items-center space-x-2">
                        <Input
                            type="number"
                            step="0.01"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder="Enter decimal number"
                        />
                        {units && <span className="text-sm text-muted-foreground">{units}</span>}
                    </div>
                )
            case "checkbox":
                return (
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            checked={value === "true"}
                            onCheckedChange={(checked) => onChange(checked ? "true" : "false")}
                            id={`checkbox-${characteristic.id}`}
                        />
                        <Label htmlFor={`checkbox-${characteristic.id}`}>{optionsArray?.[0] || "Yes"}</Label>
                    </div>
                )

            case "select":
                return (
                    <Select
                        value={value}
                        onValueChange={onChange}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                            {optionsArray?.map((option) => (
                                <SelectItem
                                    key={option}
                                    value={option}
                                >
                                    {option}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )

            case "radio":
                return (
                    <RadioGroup
                        value={value}
                        onValueChange={onChange}
                        className="flex flex-col space-y-1"
                    >
                        {optionsArray?.map((option) => (
                            <div
                                key={option}
                                className="flex items-center space-x-2"
                            >
                                <RadioGroupItem
                                    value={option}
                                    id={`radio-${characteristic.id}-${option}`}
                                />
                                <Label htmlFor={`radio-${characteristic.id}-${option}`}>{option}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                )

            case "multiSelect":
                const selectedValues = value ? value.split(",") : []
                return (
                    <div className="space-y-2">
                        {optionsArray?.map((option) => (
                            <div
                                key={option}
                                className="flex items-center space-x-2"
                            >
                                <Checkbox
                                    checked={selectedValues.includes(option)}
                                    onCheckedChange={(checked) => {
                                        let newValues
                                        if (checked) {
                                            newValues = [...selectedValues, option]
                                        } else {
                                            newValues = selectedValues.filter((v) => v !== option)
                                        }
                                        onChange(newValues.join(","))
                                    }}
                                    id={`multiselect-${characteristic.id}-${option}`}
                                />
                                <Label htmlFor={`multiselect-${characteristic.id}-${option}`}>{option}</Label>
                            </div>
                        ))}
                    </div>
                )

            case "date":
                return (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={`w-full justify-start text-left font-normal ${!date && "text-muted-foreground"}`}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : "Select a date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={handleDateChange}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                )

            case "email":
                return (
                    <Input
                        type="email"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Enter email address"
                    />
                )

            case "link":
                return (
                    <Input
                        type="url"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Enter URL"
                    />
                )

            default:
                throw new Error(`Unsupported characteristic type: ${type}`)
        }
    }

    return <div className="space-y-2">{renderFormControl()}</div>
}

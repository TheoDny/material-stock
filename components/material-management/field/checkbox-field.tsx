import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useId } from "react";

interface CheckboxFieldProps {
    value: { [key: string]: boolean }[];
    options: string[];
    onChange: (value: { [key: string]: boolean }[]) => void;
    className?: string;
}

export function CheckboxField({ value,options, onChange, className }: CheckboxFieldProps) {
    
    
    return (
        <div className={cn("flex items-center space-x-2", className)}>
            {options?.map((option: string) => (
                <div
                    key={option}
                    className="flex items-center space-x-2"
                >
                    <Checkbox
                        checked={value.find(item => item[option]) ? true : false}
                        onCheckedChange={(checked) => {
                            const newValue = [...value];
                            const existingIndex = newValue.findIndex(item => item[option]);
                            
                            if (existingIndex >= 0) {
                                newValue[existingIndex] = { ...newValue[existingIndex], [option]: checked === true ? true : false };
                            } else {
                                newValue.push({ [option]: checked === true ? true : false });
                            }
                            
                            onChange(newValue);
                        }}

                    />
                    <Label htmlFor={option}>{option}</Label>

                </div>
            ))}
        </div>
    )
} 
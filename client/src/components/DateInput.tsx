import React, { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Control, FieldValues, FieldPath } from "react-hook-form";

interface DateInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  control: Control<TFieldValues>;
  name: TName;
  label: string;
  placeholder?: string;
}

export function DateInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  label,
  placeholder = "DD/MM/AAAA",
}: DateInputProps<TFieldValues, TName>) {
  
  const formatDate = (value: string): string => {
    if (!value) return "";
    
    // Remove non-digits
    let digits = value.replace(/\D/g, "");
    
    // Format according to Brazilian pattern DD/MM/AAAA
    if (digits.length > 2) {
      digits = digits.substring(0, 2) + "/" + digits.substring(2);
    }
    if (digits.length > 5) {
      digits = digits.substring(0, 5) + "/" + digits.substring(5, 9);
    }
    
    return digits.substring(0, 10);
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        // Apply formatting when value changes
        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const formattedValue = formatDate(e.target.value);
          field.onChange(formattedValue);
        };

        // Format initial value on mount
        useEffect(() => {
          if (field.value) {
            field.onChange(formatDate(field.value));
          }
        }, []);

        return (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <Input
                placeholder={placeholder}
                value={field.value || ""}
                onChange={handleInputChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

export default DateInput;

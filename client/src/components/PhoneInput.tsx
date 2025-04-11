import React, { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Control, FieldValues, FieldPath } from "react-hook-form";

interface PhoneInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  control: Control<TFieldValues>;
  name: TName;
  label: string;
  placeholder?: string;
}

export function PhoneInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  label,
  placeholder = "+55 (11) 98765-4321",
}: PhoneInputProps<TFieldValues, TName>) {
  
  const formatPhoneNumber = (value: string): string => {
    if (!value) return "";
    
    // Remove non-digits
    let digits = value.replace(/\D/g, "");
    
    // Format according to Brazilian pattern +55 (DDD) 9XXXX-XXXX
    if (digits.length > 0) {
      digits = "+" + digits;
    }
    if (digits.length > 3) {
      digits = digits.substring(0, 3) + " (" + digits.substring(3);
    }
    if (digits.length > 7) {
      digits = digits.substring(0, 7) + ") " + digits.substring(7);
    }
    if (digits.length > 14) {
      digits = digits.substring(0, 14) + "-" + digits.substring(14, 18);
    }
    
    return digits.substring(0, 19);
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        // Apply formatting when value changes
        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const formattedValue = formatPhoneNumber(e.target.value);
          field.onChange(formattedValue);
        };

        // Format initial value on mount
        useEffect(() => {
          if (field.value) {
            field.onChange(formatPhoneNumber(field.value));
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
                type="tel"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

export default PhoneInput;

"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const EMPTY = "__empty__";

type FormSelectFieldProps = {
  name: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
  id?: string;
};

export function FormSelectField({
  name,
  label,
  value,
  onValueChange,
  options,
  placeholder = "Select…",
  className,
  id,
}: FormSelectFieldProps) {
  const selectValue = value === "" ? EMPTY : value;
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id} className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
        {label}
      </Label>
      <input type="hidden" name={name} value={value} readOnly aria-hidden />
      <Select
        value={selectValue}
        onValueChange={(v) => onValueChange(v === EMPTY ? "" : v)}
      >
        <SelectTrigger id={id} className="h-auto min-h-9 w-full rounded-xl py-2">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={EMPTY}>{placeholder}</SelectItem>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

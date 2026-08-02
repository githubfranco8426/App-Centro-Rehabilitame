"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function LabeledSelect({
  name,
  items,
  defaultValue,
  placeholder,
  className,
}: {
  name: string;
  items: { id: string; nombre: string }[];
  defaultValue?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <Select name={name} defaultValue={defaultValue}>
      <SelectTrigger className={className ?? "w-full"}>
        <SelectValue placeholder={placeholder}>
          {(value: string | null) =>
            value ? (items.find((i) => i.id === value)?.nombre ?? "") : (placeholder ?? "")
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.id} value={item.id}>
            {item.nombre}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

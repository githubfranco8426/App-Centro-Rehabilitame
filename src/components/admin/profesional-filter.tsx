"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ProfesionalFilter({
  profesionales,
}: {
  profesionales: { id: string; nombre: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function onChange(value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "todos") {
      params.delete("profesional");
    } else {
      params.set("profesional", value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Select defaultValue={searchParams.get("profesional") ?? "todos"} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue>
          {(value: string | null) =>
            !value || value === "todos"
              ? "Todos"
              : (profesionales.find((p) => p.id === value)?.nombre ?? "Todos")
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="todos">Todos</SelectItem>
        {profesionales.map((p) => (
          <SelectItem key={p.id} value={p.id}>
            {p.nombre}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

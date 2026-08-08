"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ESTADOS_CITA } from "@/lib/citas/reglas";

export function EstadoFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function onChange(value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "todos") {
      params.delete("estado");
    } else {
      params.set("estado", value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Select defaultValue={searchParams.get("estado") ?? "todos"} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue>
          {(value: string | null) =>
            !value || value === "todos"
              ? "Todos"
              : (ESTADOS_CITA.find((e) => e.id === value)?.nombre ?? "Todos")
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="todos">Todos</SelectItem>
        {ESTADOS_CITA.map((e) => (
          <SelectItem key={e.id} value={e.id}>
            {e.nombre}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

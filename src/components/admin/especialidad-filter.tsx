"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function EspecialidadFilter({
  especialidades,
}: {
  especialidades: { id: string; nombre: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function onChange(value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "todas") {
      params.delete("especialidad");
    } else {
      params.set("especialidad", value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Select defaultValue={searchParams.get("especialidad") ?? "todas"} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue>
          {(value: string | null) =>
            !value || value === "todas"
              ? "Todas"
              : (especialidades.find((e) => e.id === value)?.nombre ?? "Todas")
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="todas">Todas</SelectItem>
        {especialidades.map((e) => (
          <SelectItem key={e.id} value={e.id}>
            {e.nombre}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

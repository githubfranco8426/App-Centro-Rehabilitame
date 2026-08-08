import Link from "next/link";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function buildHref(basePath: string, params: URLSearchParams, updates: Record<string, string>) {
  const next = new URLSearchParams(params.toString());
  for (const [key, value] of Object.entries(updates)) {
    next.set(key, value);
  }
  return `${basePath}?${next.toString()}`;
}

export function MiniCalendario({
  basePath,
  searchParams,
  mesActual,
  fechaSeleccionada,
}: {
  basePath: string;
  searchParams: URLSearchParams;
  mesActual: Date;
  fechaSeleccionada: Date;
}) {
  const inicioMes = startOfMonth(mesActual);
  const finMes = endOfMonth(mesActual);
  const inicioGrilla = startOfWeek(inicioMes, { weekStartsOn: 1 });
  const finGrilla = endOfWeek(finMes, { weekStartsOn: 1 });
  const dias = eachDayOfInterval({ start: inicioGrilla, end: finGrilla });

  const mesAnterior = format(subMonths(mesActual, 1), "yyyy-MM");
  const mesSiguiente = format(addMonths(mesActual, 1), "yyyy-MM");

  return (
    <div className="glass-panel relative overflow-hidden rounded-2xl border border-white/40 p-4 dark:border-white/10">
      <div className="glass-specular pointer-events-none absolute inset-0" />
      <div className="relative">
        <div className="mb-3 flex items-center justify-between">
          <Link
            href={buildHref(basePath, searchParams, { mes: mesAnterior })}
            className="flex size-7 items-center justify-center rounded-full text-sm text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
          >
            ‹
          </Link>
          <span className="text-sm font-medium capitalize">
            {format(mesActual, "MMMM yyyy", { locale: es })}
          </span>
          <Link
            href={buildHref(basePath, searchParams, { mes: mesSiguiente })}
            className="flex size-7 items-center justify-center rounded-full text-sm text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
          >
            ›
          </Link>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-muted-foreground">
          {DIAS.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {dias.map((dia) => {
            const fechaStr = format(dia, "yyyy-MM-dd");
            const esSeleccionado = isSameDay(dia, fechaSeleccionada);
            const esDelMes = isSameMonth(dia, mesActual);
            return (
              <Link
                key={fechaStr}
                href={buildHref(basePath, searchParams, { fecha: fechaStr, mes: format(mesActual, "yyyy-MM") })}
                className={cn(
                  "flex h-8 items-center justify-center rounded-full text-xs transition-all hover:bg-foreground/10",
                  !esDelMes && "text-muted-foreground/40",
                  esSeleccionado &&
                    "bg-primary text-primary-foreground shadow-sm hover:bg-primary hover:text-primary-foreground",
                )}
              >
                {format(dia, "d")}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

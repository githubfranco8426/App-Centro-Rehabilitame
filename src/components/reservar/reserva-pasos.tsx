import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Paso = {
  numero: 1 | 2 | 3 | 4;
  etiqueta: string;
  href?: string;
};

export function ReservaPasos({
  pasoActual,
  titulo,
  especialidadId,
  servicioId,
}: {
  pasoActual: 1 | 2 | 3 | 4;
  titulo?: string;
  especialidadId?: string;
  servicioId?: string;
}) {
  const pasos: Paso[] = [
    {
      numero: 1,
      etiqueta: "Identificación",
      href: especialidadId ? `/reservar/identificacion?especialidad=${especialidadId}` : "/reservar/identificacion",
    },
    { numero: 2, etiqueta: "Servicio", href: especialidadId ? `/reservar?especialidad=${especialidadId}` : "/reservar" },
    { numero: 3, etiqueta: "Fecha y hora", href: servicioId ? `/reservar/${servicioId}` : undefined },
    { numero: 4, etiqueta: "Confirmar" },
  ];

  return (
    <div className="glass-panel animate-in fade-in slide-in-from-bottom-4 w-full rounded-3xl border border-white/40 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] duration-700 sm:p-6 dark:border-white/10 dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)]">
      {titulo && (
        <h1 className="font-heading mb-4 text-lg font-semibold tracking-tight sm:text-xl">{titulo}</h1>
      )}
      <ol aria-label="Progreso de la reserva" className="flex items-center gap-2 sm:gap-4">
        {pasos.map((paso, i) => {
          const activo = paso.numero === pasoActual;
          const completado = paso.numero < pasoActual;
          const puedeNavegar = Boolean(paso.href) && !activo;

          const circulo = (
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors",
                activo && "bg-primary text-primary-foreground",
                completado && "bg-primary/15 text-primary",
                !activo && !completado && "bg-muted text-muted-foreground",
              )}
            >
              {completado ? <Check className="size-3.5" /> : paso.numero}
            </span>
          );

          const etiqueta = (
            <span
              className={cn(
                "hidden text-sm transition-colors sm:inline",
                activo ? "font-semibold text-foreground" : "text-muted-foreground",
                puedeNavegar && "group-hover:text-foreground",
              )}
            >
              {paso.etiqueta}
            </span>
          );

          const contenido = (
            <span className="group flex items-center gap-2">
              {circulo}
              {etiqueta}
            </span>
          );

          return (
            <li key={paso.numero} className="flex flex-1 items-center gap-2 last:flex-none sm:gap-4">
              {puedeNavegar ? <Link href={paso.href!}>{contenido}</Link> : contenido}
              {i < pasos.length - 1 && (
                <span
                  className={cn(
                    "h-px flex-1 rounded-full transition-colors",
                    completado ? "bg-primary/40" : "bg-border",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

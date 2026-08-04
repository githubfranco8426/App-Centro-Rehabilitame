import { Clock, User, Calendar, Wallet } from "lucide-react";
import { formatCLP } from "@/lib/dinero";

export function ReservaResumen({
  servicioNombre,
  duracionMinutos,
  precio,
  profesionalNombre,
  fechaTexto,
}: {
  servicioNombre: string;
  duracionMinutos: number;
  precio?: number | null;
  profesionalNombre?: string | null;
  fechaTexto?: string | null;
}) {
  const filas = [
    precio != null && { icono: Wallet, texto: formatCLP(precio) },
    fechaTexto && { icono: Calendar, texto: fechaTexto },
    { icono: Clock, texto: `${duracionMinutos} min` },
    profesionalNombre && { icono: User, texto: profesionalNombre },
  ].filter(Boolean) as { icono: typeof Clock; texto: string }[];

  return (
    <div className="glass-panel animate-in fade-in slide-in-from-bottom-4 w-full rounded-3xl border border-white/40 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] delay-150 duration-700 dark:border-white/10 dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)]">
      <h2 className="font-heading mb-4 text-sm font-semibold tracking-tight text-muted-foreground uppercase">
        Tu reserva
      </h2>
      <div className="rounded-2xl border border-white/40 bg-white/40 p-4 dark:border-white/10 dark:bg-white/5">
        <p className="font-heading mb-3 text-base font-medium">{servicioNombre}</p>
        <div className="flex flex-col gap-2">
          {filas.map(({ icono: Icono, texto }, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icono className="size-4 shrink-0" />
              <span>{texto}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

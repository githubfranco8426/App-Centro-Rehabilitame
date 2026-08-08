import Link from "next/link";
import { Activity } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { formatCLP } from "@/lib/dinero";
import { iconoEspecialidad, colorEspecialidad } from "@/lib/especialidades-ui";
import { LiquidBackground } from "@/components/liquid-background";
import { ReservaPasos } from "@/components/reservar/reserva-pasos";

type ServicioRow = {
  id: string;
  nombre: string;
  duracion_minutos: number;
  precio: number | null;
  especialidades: { nombre: string } | { nombre: string }[] | null;
};

function nombreEspecialidad(row: ServicioRow) {
  const esp = row.especialidades;
  if (!esp) return "";
  return Array.isArray(esp) ? (esp[0]?.nombre ?? "") : esp.nombre;
}

export default async function ReservarPage({
  searchParams,
}: {
  searchParams: Promise<{ especialidad?: string }>;
}) {
  const { especialidad: especialidadId } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("servicios")
    .select("id, nombre, duracion_minutos, precio, especialidades(nombre)")
    .eq("activo", true)
    .order("nombre");

  if (especialidadId) {
    query = query.eq("especialidad_id", especialidadId);
  }

  const { data } = await query;

  const servicios = (data ?? []) as ServicioRow[];

  let especialidadNombre: string | null = null;
  if (especialidadId) {
    const { data: especialidad } = await supabase
      .from("especialidades")
      .select("nombre")
      .eq("id", especialidadId)
      .maybeSingle();
    especialidadNombre = especialidad?.nombre ?? null;
  }

  const grupos = new Map<string, ServicioRow[]>();
  for (const servicio of servicios) {
    const especialidad = nombreEspecialidad(servicio);
    grupos.set(especialidad, [...(grupos.get(especialidad) ?? []), servicio]);
  }

  return (
    <div className="relative flex flex-1 flex-col items-center overflow-hidden bg-zinc-50 dark:bg-black">
      <LiquidBackground photo />

      <main className="relative flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
        <ReservaPasos
          pasoActual={1}
          titulo={especialidadNombre ? `Reservar hora — ${especialidadNombre}` : "Reservar hora"}
        />

        <div>
          <p className="text-zinc-600 dark:text-zinc-400">
            Cuéntanos qué necesitas y te ayudamos a agendar tu hora.
          </p>
          {especialidadId && (
            <Link href="/" className="mt-1 inline-block text-sm underline text-muted-foreground">
              Ver otras especialidades
            </Link>
          )}
        </div>

        {servicios.length === 0 && (
          <p className="text-sm text-muted-foreground">
            {especialidadNombre
              ? `Todavía no hay servicios disponibles para ${especialidadNombre}.`
              : "Todavía no hay servicios disponibles para reservar."}
          </p>
        )}

        {[...grupos.entries()].map(([especialidad, items]) => {
          const Icono = iconoEspecialidad[especialidad] ?? Activity;
          const colores = colorEspecialidad[especialidad];

          return (
            <div key={especialidad} className="flex flex-col gap-3">
              {!especialidadId && (
                <h2 className={cn("flex items-center gap-2 text-sm font-medium", colores?.text)}>
                  <Icono className="size-4" />
                  {especialidad}
                </h2>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                {items.map((servicio, i) => (
                  <Link
                    key={servicio.id}
                    href={`/reservar/${servicio.id}`}
                    className="animate-in fade-in slide-in-from-bottom-4 group relative block h-full overflow-hidden rounded-2xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgb(0,0,0,0.12)] dark:border-white/10 dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)]"
                    style={{ animationDelay: `${100 + i * 80}ms`, animationDuration: "600ms" }}
                  >
                    <div className="glass-panel absolute inset-0" />
                    <div
                      className={cn(
                        "absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b to-transparent opacity-50",
                        colores?.glow,
                      )}
                    />
                    <div className="glass-specular absolute inset-0" />

                    <div className="relative flex h-full flex-col gap-4 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-heading text-base font-medium">{servicio.nombre}</span>
                        <div
                          className={cn(
                            "flex size-9 shrink-0 items-center justify-center rounded-xl backdrop-blur-sm",
                            colores?.badge ?? "bg-primary/15 text-primary",
                          )}
                        >
                          <Icono className="size-4" />
                        </div>
                      </div>

                      <div className="mt-auto flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {servicio.duracion_minutos} min
                          {servicio.precio != null && ` · ${formatCLP(servicio.precio)}`}
                        </span>
                        <span className="rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background transition-transform group-hover:scale-105">
                          Agendar
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}

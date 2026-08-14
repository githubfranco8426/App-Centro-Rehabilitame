import Link from "next/link";
import { redirect } from "next/navigation";
import { Activity, Stethoscope, User } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { cn, unico } from "@/lib/utils";
import { formatCLP } from "@/lib/dinero";
import { iconoEspecialidad, colorEspecialidad } from "@/lib/especialidades-ui";
import { obtenerContactoCompleto } from "@/lib/citas/borrador-contacto";
import { LiquidBackground } from "@/components/liquid-background";
import { ReservaPasos } from "@/components/reservar/reserva-pasos";

type ServicioRow = {
  id: string;
  nombre: string;
  duracion_minutos: number;
  precio: number | null;
};

export default async function ReservarPage({
  searchParams,
}: {
  searchParams: Promise<{ especialidad?: string; profesional?: string; modo?: string }>;
}) {
  const { especialidad: especialidadId, profesional: profesionalId, modo } = await searchParams;
  const supabase = await createClient();

  // "Buscar por profesional" resuelve a la especialidad de ese profesional
  // y de ahí en más sigue el mismo camino que "buscar por especialidad" —
  // hoy hay un solo profesional activo por especialidad.
  if (profesionalId && !especialidadId) {
    const { data: profesional } = await supabase
      .from("profesionales")
      .select("especialidad_id")
      .eq("id", profesionalId)
      .maybeSingle();
    if (profesional) redirect(`/reservar?especialidad=${profesional.especialidad_id}`);
  }

  // Paso "Servicio" solo se muestra si ya elegiste especialidad Y ya te
  // identificaste (/reservar/identificacion) — si falta cualquiera de las
  // dos cosas, primero hay que resolver eso.
  if (!especialidadId) {
    if (modo === "profesional") {
      const { data: profesionales } = await supabase
        .from("profesionales")
        .select("id, nombre, especialidades(nombre)")
        .eq("activo", true)
        .order("nombre");

      return (
        <div className="relative flex flex-1 flex-col items-center overflow-hidden bg-zinc-50 dark:bg-black">
          <LiquidBackground photo />
          <main className="relative flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
            <div>
              <h1 className="font-heading text-2xl font-semibold tracking-tight">Reservar hora</h1>
              <p className="mt-1 text-zinc-600 dark:text-zinc-400">¿Con quién quieres atenderte?</p>
              <Link href="/reservar" className="mt-1 inline-block text-sm underline text-muted-foreground">
                ‹ Volver
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {(profesionales ?? []).map((profesional, i) => {
                const especialidadNombre = unico(profesional.especialidades)?.nombre ?? "";
                const Icono = iconoEspecialidad[especialidadNombre] ?? Activity;
                const colores = colorEspecialidad[especialidadNombre];
                return (
                  <Link
                    key={profesional.id}
                    href={`/reservar?profesional=${profesional.id}`}
                    className="animate-in fade-in slide-in-from-bottom-4 group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-white/40 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgb(0,0,0,0.12)] dark:border-white/10 dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)]"
                    style={{ animationDelay: `${100 + i * 80}ms`, animationDuration: "600ms" }}
                  >
                    <div className="glass-panel absolute inset-0" />
                    <div className="glass-specular absolute inset-0" />
                    <div
                      className={cn(
                        "relative flex size-11 shrink-0 items-center justify-center rounded-2xl backdrop-blur-sm",
                        colores?.badge ?? "bg-primary/15 text-primary",
                      )}
                    >
                      <Icono className="size-5" />
                    </div>
                    <div className="relative flex flex-col">
                      <span className="font-heading text-base font-medium">{profesional.nombre}</span>
                      <span className={cn("text-sm", colores?.text)}>{especialidadNombre}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </main>
        </div>
      );
    }

    if (modo !== "especialidad") {
      const opciones = [
        {
          href: "/reservar?modo=especialidad",
          titulo: "Por especialidad",
          descripcion: "Kinesiología, fonoaudiología o terapia ocupacional.",
          Icono: Stethoscope,
        },
        {
          href: "/reservar?modo=profesional",
          titulo: "Por profesional",
          descripcion: "Elegí directamente con quién atenderte.",
          Icono: User,
        },
      ];

      return (
        <div className="relative flex flex-1 flex-col items-center overflow-hidden bg-zinc-50 dark:bg-black">
          <LiquidBackground photo />
          <main className="relative flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
            <div>
              <h1 className="font-heading text-2xl font-semibold tracking-tight">Reservar hora</h1>
              <p className="mt-1 text-zinc-600 dark:text-zinc-400">¿Cómo quieres buscar tu hora?</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {opciones.map(({ href, titulo, descripcion, Icono }, i) => (
                <Link
                  key={href}
                  href={href}
                  className="animate-in fade-in slide-in-from-bottom-4 group relative block h-full overflow-hidden rounded-2xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgb(0,0,0,0.12)] dark:border-white/10 dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)]"
                  style={{ animationDelay: `${100 + i * 80}ms`, animationDuration: "600ms" }}
                >
                  <div className="glass-panel absolute inset-0" />
                  <div className="glass-specular absolute inset-0" />
                  <div className="relative flex flex-col items-center gap-3 p-8 text-center">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary backdrop-blur-sm">
                      <Icono className="size-6" />
                    </div>
                    <span className="font-heading text-base font-medium">{titulo}</span>
                    <span className="text-sm text-muted-foreground">{descripcion}</span>
                  </div>
                </Link>
              ))}
            </div>
          </main>
        </div>
      );
    }

    const { data: especialidades } = await supabase
      .from("especialidades")
      .select("id, nombre")
      .order("created_at");

    return (
      <div className="relative flex flex-1 flex-col items-center overflow-hidden bg-zinc-50 dark:bg-black">
        <LiquidBackground photo />
        <main className="relative flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">Reservar hora</h1>
            <p className="mt-1 text-zinc-600 dark:text-zinc-400">
              ¿Qué especialidad necesitas?
            </p>
            <Link href="/reservar" className="mt-1 inline-block text-sm underline text-muted-foreground">
              ‹ Volver
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {(especialidades ?? []).map((especialidad, i) => {
              const Icono = iconoEspecialidad[especialidad.nombre] ?? Activity;
              const colores = colorEspecialidad[especialidad.nombre];
              return (
                <Link
                  key={especialidad.id}
                  href={`/reservar?especialidad=${especialidad.id}`}
                  className="animate-in fade-in slide-in-from-bottom-4 group relative block h-full overflow-hidden rounded-2xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgb(0,0,0,0.12)] dark:border-white/10 dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)]"
                  style={{ animationDelay: `${100 + i * 80}ms`, animationDuration: "600ms" }}
                >
                  <div className="glass-panel absolute inset-0" />
                  <div className="glass-specular absolute inset-0" />
                  <div className="relative flex flex-col items-center gap-3 p-6 text-center">
                    <div
                      className={cn(
                        "flex size-11 items-center justify-center rounded-2xl backdrop-blur-sm",
                        colores?.badge ?? "bg-primary/15 text-primary",
                      )}
                    >
                      <Icono className="size-5" />
                    </div>
                    <span className={cn("font-heading text-base font-medium", colores?.text)}>
                      {especialidad.nombre}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </main>
      </div>
    );
  }

  const contacto = await obtenerContactoCompleto();
  if (!contacto) {
    redirect(`/reservar/identificacion?especialidad=${especialidadId}`);
  }

  const { data } = await supabase
    .from("servicios")
    .select("id, nombre, duracion_minutos, precio")
    .eq("activo", true)
    .eq("especialidad_id", especialidadId)
    .order("nombre");

  const servicios = (data ?? []) as ServicioRow[];

  const { data: especialidad } = await supabase
    .from("especialidades")
    .select("nombre")
    .eq("id", especialidadId)
    .maybeSingle();
  const especialidadNombre = especialidad?.nombre ?? null;

  const Icono = iconoEspecialidad[especialidadNombre ?? ""] ?? Activity;
  const colores = colorEspecialidad[especialidadNombre ?? ""];

  return (
    <div className="relative flex flex-1 flex-col items-center overflow-hidden bg-zinc-50 dark:bg-black">
      <LiquidBackground photo />

      <main className="relative flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
        <ReservaPasos
          pasoActual={2}
          especialidadId={especialidadId}
          titulo={especialidadNombre ? `Reservar hora — ${especialidadNombre}` : "Reservar hora"}
        />

        <div>
          <p className="text-zinc-600 dark:text-zinc-400">
            Cuéntanos qué necesitas y te ayudamos a agendar tu hora.
          </p>
          <Link
            href="/reservar?modo=especialidad"
            className="mt-1 inline-block text-sm underline text-muted-foreground"
          >
            Ver otras especialidades
          </Link>
        </div>

        {servicios.length === 0 && (
          <p className="text-sm text-muted-foreground">
            {especialidadNombre
              ? `Todavía no hay servicios disponibles para ${especialidadNombre}.`
              : "Todavía no hay servicios disponibles para reservar."}
          </p>
        )}

        {servicios.length > 0 && (
          <div className="flex flex-col gap-3">
              <div className="grid gap-4 sm:grid-cols-2">
                {servicios.map((servicio, i) => (
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
        )}
      </main>
    </div>
  );
}

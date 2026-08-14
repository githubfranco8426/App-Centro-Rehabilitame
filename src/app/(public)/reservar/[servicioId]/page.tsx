import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { addDays, format } from "date-fns";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import { es } from "date-fns/locale";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { ZONA_HORARIA } from "@/lib/tiempo";
import { obtenerSlotsDisponibles } from "@/lib/citas/disponibilidad";
import { obtenerContactoCompleto } from "@/lib/citas/borrador-contacto";
import { unico } from "@/lib/utils";
import { LiquidBackground } from "@/components/liquid-background";
import { ReservaPasos } from "@/components/reservar/reserva-pasos";
import { ReservaResumen } from "@/components/reservar/reserva-resumen";
import { ProfesionalBanner } from "@/components/reservar/profesional-banner";

const DIAS_A_MOSTRAR = 14;

function capitalizar(texto: string) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function grupoHorario(slotInicio: string) {
  const hora = Number(formatInTimeZone(new Date(slotInicio), ZONA_HORARIA, "H"));
  if (hora < 12) return "Mañana";
  if (hora < 19) return "Tarde";
  return "Noche";
}

export default async function ElegirHorarioPage({
  params,
  searchParams,
}: {
  params: Promise<{ servicioId: string }>;
  searchParams: Promise<{ fecha?: string }>;
}) {
  const { servicioId } = await params;
  const { fecha: fechaParam } = await searchParams;

  const supabase = await createClient();

  const { data: servicio } = await supabase
    .from("servicios")
    .select("id, nombre, duracion_minutos, precio, especialidad_id, especialidades(nombre)")
    .eq("id", servicioId)
    .single();

  if (!servicio) notFound();

  const contacto = await obtenerContactoCompleto();
  if (!contacto) {
    redirect(`/reservar/identificacion?especialidad=${servicio.especialidad_id}`);
  }

  const especialidadNombre = unico(servicio.especialidades)?.nombre;

  const { data: profesional } = await supabase
    .from("profesionales")
    .select("id, nombre")
    .eq("especialidad_id", servicio.especialidad_id)
    .eq("activo", true)
    .order("nombre")
    .limit(1)
    .maybeSingle();

  const hoy = toZonedTime(new Date(), ZONA_HORARIA);
  const fechaSeleccionada = fechaParam ? new Date(`${fechaParam}T00:00:00`) : hoy;
  const fechaSeleccionadaStr = format(fechaSeleccionada, "yyyy-MM-dd");

  const dias = Array.from({ length: DIAS_A_MOSTRAR }, (_, i) => addDays(hoy, i));

  let slots: { slot_inicio: string; slot_fin: string }[] = [];
  if (profesional) {
    slots = await obtenerSlotsDisponibles(supabase, {
      profesionalId: profesional.id,
      servicioId,
      fecha: fechaSeleccionada,
      fechaStr: fechaSeleccionadaStr,
    });
  }

  const gruposHorario = new Map<string, typeof slots>();
  for (const slot of slots) {
    const grupo = grupoHorario(slot.slot_inicio);
    gruposHorario.set(grupo, [...(gruposHorario.get(grupo) ?? []), slot]);
  }
  const ordenGrupos = ["Mañana", "Tarde", "Noche"] as const;

  return (
    <div className="relative flex flex-1 flex-col items-center overflow-hidden bg-zinc-50 dark:bg-black">
      <LiquidBackground photo />

      <main className="relative grid w-full max-w-4xl flex-1 gap-6 px-6 py-16 lg:grid-cols-[1fr_18rem]">
        <div className="flex flex-col gap-6">
          <ReservaPasos
            pasoActual={3}
            especialidadId={servicio.especialidad_id}
            servicioId={servicioId}
            titulo="Selecciona fecha y hora de tu servicio"
          />

          {profesional && <ProfesionalBanner nombre={profesional.nombre} especialidad={especialidadNombre} />}

          <div className="glass-panel animate-in fade-in slide-in-from-bottom-4 rounded-3xl border border-white/40 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] delay-100 duration-700 sm:p-6 dark:border-white/10 dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)]">
            {!profesional ? (
              <p className="text-sm text-muted-foreground">
                No hay un profesional disponible para este servicio todavía.
              </p>
            ) : (
              <>
                <h2 className="font-heading text-sm font-medium text-muted-foreground">
                  {capitalizar(format(fechaSeleccionada, "MMMM yyyy", { locale: es }))}
                </h2>

                <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                  {dias.map((dia) => {
                    const diaStr = format(dia, "yyyy-MM-dd");
                    const activo = diaStr === fechaSeleccionadaStr;
                    return (
                      <Link
                        key={diaStr}
                        href={`/reservar/${servicioId}?fecha=${diaStr}`}
                        className={cn(
                          "flex shrink-0 flex-col items-center gap-0.5 rounded-2xl border border-transparent px-3 py-2 text-center text-xs transition-all",
                          activo
                            ? "bg-foreground text-background shadow-md"
                            : "text-muted-foreground hover:border-primary/40 hover:bg-white/40 dark:hover:bg-white/5",
                        )}
                      >
                        <span className="capitalize">{format(dia, "EEE", { locale: es })}</span>
                        <span className="text-sm font-semibold">{format(dia, "d")}</span>
                      </Link>
                    );
                  })}
                </div>

                <div className="mt-6 flex flex-col gap-6">
                  {slots.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No hay horarios disponibles este día. Probá otra fecha.
                    </p>
                  ) : (
                    ordenGrupos.map((grupo) => {
                      const items = gruposHorario.get(grupo);
                      if (!items || items.length === 0) return null;
                      return (
                        <div key={grupo} className="flex flex-col gap-3">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium">{grupo}</span>
                            <span className="h-px flex-1 bg-border" />
                          </div>
                          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                            {items.map((slot) => (
                              <Link
                                key={slot.slot_inicio}
                                href={`/reservar/${servicioId}/confirmar?profesional=${profesional.id}&fechaInicio=${encodeURIComponent(slot.slot_inicio)}&fechaFin=${encodeURIComponent(slot.slot_fin)}`}
                                className="rounded-xl border border-white/50 bg-white/40 px-3 py-2 text-center text-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-primary-foreground dark:border-white/10 dark:bg-white/5"
                              >
                                {formatInTimeZone(new Date(slot.slot_inicio), ZONA_HORARIA, "HH:mm")}
                              </Link>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}

                  {slots.length > 0 && (
                    <p className="flex items-center gap-2 rounded-xl bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
                      ⚠️ Las horas disponibles podrían agotarse, ¡agenda lo antes posible!
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <ReservaResumen
            servicioNombre={servicio.nombre}
            duracionMinutos={servicio.duracion_minutos}
            precio={servicio.precio}
            profesionalNombre={profesional?.nombre}
            fechaTexto={capitalizar(format(fechaSeleccionada, "EEEE d 'de' MMMM", { locale: es }))}
          />
        </div>
      </main>
    </div>
  );
}

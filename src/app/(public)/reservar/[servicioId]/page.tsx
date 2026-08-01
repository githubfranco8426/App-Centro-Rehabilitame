import Link from "next/link";
import { notFound } from "next/navigation";
import { addDays, format } from "date-fns";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import { es } from "date-fns/locale";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { ZONA_HORARIA } from "@/lib/tiempo";

const DIAS_A_MOSTRAR = 14;

function capitalizar(texto: string) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
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
    .select("id, nombre, duracion_minutos, especialidad_id")
    .eq("id", servicioId)
    .single();

  if (!servicio) notFound();

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
    const { data } = await supabase.rpc("get_available_slots", {
      p_profesional_id: profesional.id,
      p_servicio_id: servicioId,
      p_fecha: fechaSeleccionadaStr,
    });
    slots = data ?? [];
  }

  return (
    <div className="flex flex-1 flex-col items-center px-6 py-16">
      <div className="w-full max-w-2xl">
        <p className="text-sm text-muted-foreground">
          <Link href="/reservar" className="hover:underline">
            Reservar hora
          </Link>{" "}
          / {servicio.nombre}
        </p>
        <h1 className="mt-1 text-2xl font-semibold">{servicio.nombre}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {servicio.duracion_minutos} min
          {profesional ? ` con ${profesional.nombre}` : ""}
        </p>

        {!profesional ? (
          <p className="mt-8 text-sm text-muted-foreground">
            No hay un profesional disponible para este servicio todavía.
          </p>
        ) : (
          <>
            <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
              {dias.map((dia) => {
                const diaStr = format(dia, "yyyy-MM-dd");
                const activo = diaStr === fechaSeleccionadaStr;
                return (
                  <Link
                    key={diaStr}
                    href={`/reservar/${servicioId}?fecha=${diaStr}`}
                    className={cn(
                      "flex shrink-0 flex-col items-center rounded-lg border px-3 py-2 text-center text-xs hover:border-primary",
                      activo && "border-primary bg-primary text-primary-foreground",
                    )}
                  >
                    <span className="capitalize">{format(dia, "EEE", { locale: es })}</span>
                    <span className="text-sm font-medium">{format(dia, "d")}</span>
                  </Link>
                );
              })}
            </div>

            <h2 className="mt-6 mb-3 text-sm font-medium">
              {capitalizar(format(fechaSeleccionada, "EEEE, d 'de' MMMM", { locale: es }))}
            </h2>

            {slots.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay horarios disponibles este día. Probá otra fecha.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {slots.map((slot) => (
                  <Link
                    key={slot.slot_inicio}
                    href={`/reservar/${servicioId}/confirmar?profesional=${profesional.id}&fechaInicio=${encodeURIComponent(slot.slot_inicio)}&fechaFin=${encodeURIComponent(slot.slot_fin)}`}
                    className="rounded-lg border px-3 py-2 text-center text-sm hover:border-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    {formatInTimeZone(new Date(slot.slot_inicio), ZONA_HORARIA, "HH:mm")}
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

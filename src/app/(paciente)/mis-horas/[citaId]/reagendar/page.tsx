import Link from "next/link";
import { notFound } from "next/navigation";
import { addDays, format } from "date-fns";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import { es } from "date-fns/locale";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { ZONA_HORARIA } from "@/lib/tiempo";
import { puedeGestionarCita } from "@/lib/citas/reglas";
import { reagendarCitaPaciente } from "@/lib/citas/actions";

const DIAS_A_MOSTRAR = 14;

function capitalizar(texto: string) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function unico<T>(valor: T | T[] | null): T | null {
  if (!valor) return null;
  return Array.isArray(valor) ? (valor[0] ?? null) : valor;
}

export default async function ReagendarCitaPage({
  params,
  searchParams,
}: {
  params: Promise<{ citaId: string }>;
  searchParams: Promise<{ fecha?: string; error?: string }>;
}) {
  const { citaId } = await params;
  const { fecha: fechaParam, error } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: cita } = await supabase
    .from("citas")
    .select(
      "id, paciente_id, estado, fecha_inicio, profesional_id, servicio_id, servicios(nombre, duracion_minutos), profesionales(nombre)",
    )
    .eq("id", citaId)
    .single();

  if (!cita || cita.paciente_id !== user.id) notFound();

  const servicio = unico(cita.servicios);
  const profesional = unico(cita.profesionales);
  const gestionable = puedeGestionarCita(cita.fecha_inicio, cita.estado);

  const hoy = toZonedTime(new Date(), ZONA_HORARIA);
  const fechaSeleccionada = fechaParam ? new Date(`${fechaParam}T00:00:00`) : hoy;
  const fechaSeleccionadaStr = format(fechaSeleccionada, "yyyy-MM-dd");
  const dias = Array.from({ length: DIAS_A_MOSTRAR }, (_, i) => addDays(hoy, i));

  let slots: { slot_inicio: string; slot_fin: string }[] = [];
  if (gestionable) {
    const { data } = await supabase.rpc("get_available_slots", {
      p_profesional_id: cita.profesional_id,
      p_servicio_id: cita.servicio_id,
      p_fecha: fechaSeleccionadaStr,
    });
    slots = data ?? [];
  }

  return (
    <div className="flex flex-1 flex-col items-center px-6 py-16">
      <div className="w-full max-w-2xl">
        <p className="text-sm text-muted-foreground">
          <Link href="/mis-horas" className="hover:underline">
            Mis horas
          </Link>{" "}
          / Reagendar
        </p>
        <h1 className="mt-1 text-2xl font-semibold">{servicio?.nombre}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {servicio?.duracion_minutos} min
          {profesional ? ` con ${profesional.nombre}` : ""}
        </p>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        {!gestionable ? (
          <p className="mt-8 text-sm text-muted-foreground">
            Esta cita ya no se puede reagendar (falta poco para la hora agendada, o ya no está
            activa).
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
                    href={`/mis-horas/${citaId}/reagendar?fecha=${diaStr}`}
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
                  <form
                    key={slot.slot_inicio}
                    action={reagendarCitaPaciente.bind(null, citaId, slot.slot_inicio, slot.slot_fin)}
                  >
                    <button
                      type="submit"
                      className="w-full rounded-lg border px-3 py-2 text-center text-sm hover:border-primary hover:bg-primary hover:text-primary-foreground"
                    >
                      {formatInTimeZone(new Date(slot.slot_inicio), ZONA_HORARIA, "HH:mm")}
                    </button>
                  </form>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

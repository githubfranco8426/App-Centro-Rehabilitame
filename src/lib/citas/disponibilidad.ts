import type { SupabaseClient } from "@supabase/supabase-js";
import { addDays, format } from "date-fns";
import { fromZonedTime } from "date-fns-tz";
import { ZONA_HORARIA } from "@/lib/tiempo";
import { obtenerAccessTokenValido } from "@/lib/google/tokens";
import { obtenerCuposConsulta } from "@/lib/google/calendar";

type Slot = { slot_inicio: string; slot_fin: string };

/**
 * Para profesionales conectados a Google Calendar, los horarios disponibles
 * salen de sus eventos "Cupos de consulta" (su disponibilidad real varía por
 * turnos rotativos, no por un horario semanal fijo). Para el resto, se usa
 * la disponibilidad semanal fija configurada en /admin/profesionales.
 */
export async function obtenerSlotsDisponibles(
  supabase: SupabaseClient,
  params: { profesionalId: string; servicioId: string; fecha: Date; fechaStr: string },
): Promise<Slot[]> {
  const { profesionalId, servicioId, fecha, fechaStr } = params;
  const token = await obtenerAccessTokenValido(profesionalId);

  if (token) {
    const inicioDia = fromZonedTime(`${fechaStr}T00:00:00`, ZONA_HORARIA);
    const finDia = fromZonedTime(`${format(addDays(fecha, 1), "yyyy-MM-dd")}T00:00:00`, ZONA_HORARIA);
    const cupos = await obtenerCuposConsulta(profesionalId, inicioDia.toISOString(), finDia.toISOString());

    if (cupos.length === 0) return [];

    const { data } = await supabase.rpc("get_available_slots_from_bloques", {
      p_profesional_id: profesionalId,
      p_servicio_id: servicioId,
      p_bloques: cupos.map((c) => ({ inicio: c.start, fin: c.end })),
    });
    return data ?? [];
  }

  const { data } = await supabase.rpc("get_available_slots", {
    p_profesional_id: profesionalId,
    p_servicio_id: servicioId,
    p_fecha: fechaStr,
  });
  return data ?? [];
}

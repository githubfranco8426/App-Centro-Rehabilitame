import type { SupabaseClient } from "@supabase/supabase-js";
import { unico } from "@/lib/utils";
import { crearEventoGoogle, eliminarEventoGoogle } from "./calendar";

/**
 * Crea el evento en el Google Calendar del profesional para una cita recién
 * confirmada y guarda su id en citas.google_event_id. Nunca tira: un fallo
 * de Google no puede tumbar el flujo de reserva. Usa el cliente por-request
 * (no service-role) para leer/escribir citas, igual que notificarCambioCita
 * — la RLS de citas ya autoriza correctamente al paciente dueño o al admin.
 */
export async function sincronizarCreacion(supabase: SupabaseClient, citaId: string): Promise<void> {
  try {
    const { data: cita } = await supabase
      .from("citas")
      .select(
        "fecha_inicio, fecha_fin, profesional_id, profiles!citas_paciente_id_fkey(nombre), servicios(nombre)",
      )
      .eq("id", citaId)
      .single();

    if (!cita) return;

    const paciente = unico(cita.profiles);
    const servicio = unico(cita.servicios);

    const eventId = await crearEventoGoogle(cita.profesional_id, {
      resumen: `${servicio?.nombre ?? "Cita"} — ${paciente?.nombre ?? ""}`.trim(),
      descripcion: "Reservado desde Centro Rehabilita.me",
      inicioIso: cita.fecha_inicio,
      finIso: cita.fecha_fin,
    });

    if (eventId) {
      await supabase.from("citas").update({ google_event_id: eventId }).eq("id", citaId);
    }
  } catch (err) {
    console.error("sincronizarCreacion (Google Calendar):", err);
  }
}

/**
 * Borra el evento de Google Calendar asociado a una cita cancelada, si
 * existe. Nunca tira.
 */
export async function sincronizarCancelacion(supabase: SupabaseClient, citaId: string): Promise<void> {
  try {
    const { data: cita } = await supabase
      .from("citas")
      .select("profesional_id, google_event_id")
      .eq("id", citaId)
      .single();

    if (!cita?.google_event_id) return;

    await eliminarEventoGoogle(cita.profesional_id, cita.google_event_id);
  } catch (err) {
    console.error("sincronizarCancelacion (Google Calendar):", err);
  }
}

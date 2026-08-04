import type { SupabaseClient } from "@supabase/supabase-js";
import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import { ZONA_HORARIA } from "@/lib/tiempo";
import { resend, EMAIL_FROM } from "./resend";
import { ConfirmacionEmail } from "./plantillas/confirmacion";
import { CancelacionEmail } from "./plantillas/cancelacion";
import { ReagendamientoEmail } from "./plantillas/reagendamiento";

export type TipoNotificacion = "confirmacion" | "cancelacion" | "reagendamiento";

const ASUNTOS: Record<TipoNotificacion, string> = {
  confirmacion: "Confirmamos tu hora — Rehabilita.me",
  cancelacion: "Tu hora fue cancelada — Rehabilita.me",
  reagendamiento: "Tu hora fue reagendada — Rehabilita.me",
};

function unico<T>(valor: T | T[] | null): T | null {
  if (!valor) return null;
  return Array.isArray(valor) ? (valor[0] ?? null) : valor;
}

function formatearFecha(iso: string) {
  return formatInTimeZone(new Date(iso), ZONA_HORARIA, "EEEE d 'de' MMMM, HH:mm 'hs'", { locale: es });
}

/**
 * Manda el email de confirmación/cancelación/reagendamiento para una cita y
 * registra el resultado en notificaciones_log. Nunca lanza — un email que
 * falla no puede tumbar el flujo de reserva/cancelación/reagendamiento.
 */
export async function notificarCambioCita(
  supabase: SupabaseClient,
  citaId: string,
  tipo: TipoNotificacion,
  opts?: { fechaAnteriorIso?: string },
): Promise<void> {
  let exito = false;
  let errorMensaje: string | null = null;

  try {
    const { data: cita } = await supabase
      .from("citas")
      .select(
        "fecha_inicio, profiles!citas_paciente_id_fkey(nombre, email), profesionales(nombre), servicios(nombre)",
      )
      .eq("id", citaId)
      .single();

    if (!cita) throw new Error("No se encontró la cita para notificar.");

    const paciente = unico(cita.profiles);
    const profesional = unico(cita.profesionales);
    const servicio = unico(cita.servicios);

    if (!paciente?.email) throw new Error("El paciente no tiene email registrado.");

    const props = {
      pacienteNombre: paciente.nombre,
      servicioNombre: servicio?.nombre ?? "",
      profesionalNombre: profesional?.nombre ?? "",
      fechaFormateada: formatearFecha(cita.fecha_inicio),
      fechaAnteriorFormateada: opts?.fechaAnteriorIso ? formatearFecha(opts.fechaAnteriorIso) : undefined,
    };

    const react =
      tipo === "confirmacion" ? (
        <ConfirmacionEmail {...props} />
      ) : tipo === "cancelacion" ? (
        <CancelacionEmail {...props} />
      ) : (
        <ReagendamientoEmail {...props} />
      );

    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: paciente.email,
      subject: ASUNTOS[tipo],
      react,
    });

    if (error) throw new Error(error.message);
    exito = true;
  } catch (err) {
    errorMensaje = err instanceof Error ? err.message : "Error desconocido";
  }

  try {
    await supabase
      .from("notificaciones_log")
      .insert({ cita_id: citaId, tipo, exito, error: errorMensaje });
  } catch {
    // Si ni el log se pudo guardar, no hay nada más que hacer acá.
  }
}

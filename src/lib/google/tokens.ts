import { createAdminClient } from "@/lib/supabase/admin";
import { refrescarAccessToken } from "./oauth";

const BUFFER_EXPIRACION_MS = 60_000;

type TokenInfo = { accessToken: string; calendarId: string };

// `conectado` distingue "nunca conectó Google" (su disponibilidad real es el
// horario semanal fijo, comportamiento normal) de "conectó Google pero el
// token está roto ahora mismo" (su disponibilidad real vive en Google y no
// hay forma de saberla — no hay que asumir el horario fijo, que puede no
// reflejar su turno real y ofrecer horas que en verdad no tiene libres).
type ResultadoToken = { conectado: boolean; token: TokenInfo | null };

// Devuelve el access token vigente del profesional (refrescándolo si hace
// falta). Usa el cliente service-role: esta tabla es admin-only por RLS,
// pero acá se llama también desde flujos de paciente (reserva, cancelación)
// que no tienen sesión admin.
export async function obtenerAccessTokenValido(profesionalId: string): Promise<ResultadoToken> {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("profesional_google_tokens")
    .select("refresh_token, access_token, access_token_expira, calendar_id")
    .eq("profesional_id", profesionalId)
    .maybeSingle();

  if (!data) return { conectado: false, token: null };

  const vigente =
    data.access_token &&
    data.access_token_expira &&
    new Date(data.access_token_expira).getTime() - Date.now() > BUFFER_EXPIRACION_MS;

  if (vigente) {
    return { conectado: true, token: { accessToken: data.access_token!, calendarId: data.calendar_id } };
  }

  // Fail-open sobre la PÁGINA (nunca tumbar la pantalla), pero fail-closed
  // sobre la DISPONIBILIDAD: si Google rechaza el refresh (token revocado,
  // credenciales mal configuradas, etc.) el llamador debe tratarlo como "sin
  // horarios" para este profesional, no como "sin Google conectado".
  try {
    const tokens = await refrescarAccessToken(data.refresh_token);
    const expira = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    await supabase
      .from("profesional_google_tokens")
      .update({ access_token: tokens.access_token, access_token_expira: expira })
      .eq("profesional_id", profesionalId);

    return { conectado: true, token: { accessToken: tokens.access_token, calendarId: data.calendar_id } };
  } catch (err) {
    console.error("Google Calendar (refrescar token):", err);
    return { conectado: true, token: null };
  }
}

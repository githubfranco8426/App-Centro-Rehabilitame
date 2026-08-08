import { createAdminClient } from "@/lib/supabase/admin";
import { refrescarAccessToken } from "./oauth";

const BUFFER_EXPIRACION_MS = 60_000;

type TokenInfo = { accessToken: string; calendarId: string };

// Devuelve el access token vigente del profesional (refrescándolo si hace
// falta), o null si nunca conectó Google. Usa el cliente service-role: esta
// tabla es admin-only por RLS, pero acá se llama también desde flujos de
// paciente (reserva, cancelación) que no tienen sesión admin.
export async function obtenerAccessTokenValido(profesionalId: string): Promise<TokenInfo | null> {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("profesional_google_tokens")
    .select("refresh_token, access_token, access_token_expira, calendar_id")
    .eq("profesional_id", profesionalId)
    .maybeSingle();

  if (!data) return null;

  const vigente =
    data.access_token &&
    data.access_token_expira &&
    new Date(data.access_token_expira).getTime() - Date.now() > BUFFER_EXPIRACION_MS;

  if (vigente) {
    return { accessToken: data.access_token!, calendarId: data.calendar_id };
  }

  const tokens = await refrescarAccessToken(data.refresh_token);
  const expira = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

  await supabase
    .from("profesional_google_tokens")
    .update({ access_token: tokens.access_token, access_token_expira: expira })
    .eq("profesional_id", profesionalId);

  return { accessToken: tokens.access_token, calendarId: data.calendar_id };
}

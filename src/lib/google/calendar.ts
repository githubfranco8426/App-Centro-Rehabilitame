import { obtenerAccessTokenValido } from "./tokens";

const API = "https://www.googleapis.com/calendar/v3";

type EventoInput = {
  resumen: string;
  descripcion?: string;
  inicioIso: string;
  finIso: string;
};

// Todas las funciones acá son "fail-open": si Google falla (red, token
// revocado, cuota) se loguea y se sigue sin romper el flujo de reserva. La
// garantía real anti-doble-reserva es el constraint EXCLUDE de Postgres en
// citas; esta sincronización es complementaria, no crítica.

export async function crearEventoGoogle(profesionalId: string, evento: EventoInput): Promise<string | null> {
  try {
    const token = await obtenerAccessTokenValido(profesionalId);
    if (!token) return null;

    const res = await fetch(
      `${API}/calendars/${encodeURIComponent(token.calendarId)}/events`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token.accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          summary: evento.resumen,
          description: evento.descripcion,
          start: { dateTime: evento.inicioIso },
          end: { dateTime: evento.finIso },
        }),
      },
    );
    if (!res.ok) throw new Error(await res.text());

    const data = await res.json();
    return data.id as string;
  } catch (err) {
    console.error("Google Calendar (crear evento):", err);
    return null;
  }
}

export async function eliminarEventoGoogle(profesionalId: string, eventId: string): Promise<void> {
  try {
    const token = await obtenerAccessTokenValido(profesionalId);
    if (!token) return;

    const res = await fetch(
      `${API}/calendars/${encodeURIComponent(token.calendarId)}/events/${eventId}`,
      { method: "DELETE", headers: { Authorization: `Bearer ${token.accessToken}` } },
    );
    // 410/404 = ya estaba borrado en Google; no es un error real acá.
    if (!res.ok && res.status !== 410 && res.status !== 404) {
      throw new Error(await res.text());
    }
  } catch (err) {
    console.error("Google Calendar (eliminar evento):", err);
  }
}

const MARCADOR_CUPOS = "Cupos de consulta";

// Para profesionales con turnos rotativos, su disponibilidad real no sigue
// un horario semanal fijo: la marcan ellos mismos en su Google Calendar con
// eventos cuyo título empieza con "Cupos de consulta" (p. ej. "Cupos de
// consulta (turno noche)"). Esos bloques son la única fuente de horario
// disponible para ese profesional — todo lo demás en su calendario se ignora.
export async function obtenerCuposConsulta(
  profesionalId: string,
  desdeIso: string,
  hastaIso: string,
): Promise<{ start: string; end: string }[]> {
  try {
    const token = await obtenerAccessTokenValido(profesionalId);
    if (!token) return [];

    const params = new URLSearchParams({
      timeMin: desdeIso,
      timeMax: hastaIso,
      singleEvents: "true",
      orderBy: "startTime",
    });
    const res = await fetch(
      `${API}/calendars/${encodeURIComponent(token.calendarId)}/events?${params}`,
      { headers: { Authorization: `Bearer ${token.accessToken}` } },
    );
    if (!res.ok) throw new Error(await res.text());

    const data = await res.json();
    const eventos = (data.items ?? []) as Array<{
      summary?: string;
      start?: { dateTime?: string };
      end?: { dateTime?: string };
    }>;

    return eventos
      .filter((e) => e.summary?.startsWith(MARCADOR_CUPOS) && e.start?.dateTime && e.end?.dateTime)
      .map((e) => ({ start: e.start!.dateTime!, end: e.end!.dateTime! }));
  } catch (err) {
    console.error("Google Calendar (cupos de consulta):", err);
    return [];
  }
}

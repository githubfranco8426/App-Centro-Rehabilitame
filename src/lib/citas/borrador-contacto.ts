import { cookies } from "next/headers";
import type { ContactoReservaInput } from "@/lib/validaciones/auth";

// Los datos de identificación se piden en dos pasos en /reservar/identificacion
// (primero solo RUT, y nombre/teléfono/email solo si es un paciente nuevo) y
// viajan al resto del flujo en una cookie httpOnly de corta duración — nunca
// por la URL (son datos personales) ni por un formulario que se repita en
// cada paso.

export type ContactoBorrador = Partial<ContactoReservaInput> & { rut: string };

const COOKIE_NAME = "reserva_contacto";
const MAX_AGE_SEGUNDOS = 30 * 60; // 30 minutos: alcanza para completar la reserva.

export async function guardarContactoBorrador(datos: ContactoBorrador) {
  const store = await cookies();
  store.set(COOKIE_NAME, JSON.stringify(datos), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/reservar",
    maxAge: MAX_AGE_SEGUNDOS,
  });
}

/** Estado crudo (puede venir con solo el RUT) — lo usa la propia página de identificación. */
export async function obtenerContactoBorrador(): Promise<ContactoBorrador | null> {
  const store = await cookies();
  const crudo = store.get(COOKIE_NAME)?.value;
  if (!crudo) return null;
  try {
    return JSON.parse(crudo) as ContactoBorrador;
  } catch {
    return null;
  }
}

/** Identificación completa (RUT + nombre + teléfono + email) — la usan el resto de los pasos. */
export async function obtenerContactoCompleto(): Promise<ContactoReservaInput | null> {
  const contacto = await obtenerContactoBorrador();
  if (!contacto?.nombre || !contacto.telefono || !contacto.email) return null;
  return contacto as ContactoReservaInput;
}

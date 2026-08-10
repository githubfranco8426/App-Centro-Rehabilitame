import { Resend } from "resend";

// Instanciado recién al llamar getResendClient(), no al importar el módulo:
// el constructor de Resend tira si falta la API key, y este archivo se
// importa desde rutas que Next analiza en build time (aunque no manden
// ningún email ahí) — instanciarlo a nivel de módulo tumbaba el build en
// Vercel cuando RESEND_API_KEY no estaba configurada.
let client: Resend | null = null;

export function getResendClient() {
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

// Dominio verificado en Resend (rehabilitame.cl) — verificado el 10/08/2026.
export const EMAIL_FROM = "Centro Rehabilita.me <reservas@rehabilitame.cl>";

// Correo del centro que recibe aviso cada vez que entra una reserva nueva.
// Actualiza este valor (o muévelo a una env var ADMIN_NOTIFICATION_EMAIL)
// si cambia quién debe recibir las notificaciones.
export const ADMIN_NOTIFICATION_EMAIL = "klgo.ftabilo@gmail.com";

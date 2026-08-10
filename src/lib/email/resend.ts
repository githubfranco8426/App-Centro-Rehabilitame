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

// Dominio de prueba de Resend — cambiar por un dominio propio verificado
// (Domains → Add Domain) antes de lanzar a producción.
export const EMAIL_FROM = "Centro Rehabilita.me <onboarding@resend.dev>";

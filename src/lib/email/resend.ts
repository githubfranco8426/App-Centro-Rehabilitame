import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

// Dominio de prueba de Resend — cambiar por un dominio propio verificado
// (Domains → Add Domain) antes de lanzar a producción.
export const EMAIL_FROM = "Rehabilita.me <onboarding@resend.dev>";

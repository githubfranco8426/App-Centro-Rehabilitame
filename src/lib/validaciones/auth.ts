import { z } from "zod";
import { validarRut } from "@/lib/validaciones/rut";

export const loginSchema = z.object({
  email: z.email("Ingresá un email válido"),
  password: z.string().min(1, "Ingresá tu contraseña"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registroSchema = z.object({
  nombre: z.string().min(2, "Ingresá tu nombre completo"),
  telefono: z.string().min(6, "Ingresá un teléfono válido"),
  email: z.email("Ingresá un email válido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export type RegistroInput = z.infer<typeof registroSchema>;

// Reserva sin contraseña: la cuenta se crea (o reutiliza) automáticamente y
// el paciente entra luego con un link mágico enviado a su email. La
// identificación se pide al principio del flujo en dos pasos — primero solo
// el RUT (/reservar/identificacion busca si ya existe un paciente con ese
// RUT), y solo si es nuevo se piden nombre/teléfono/email — y viaja de
// página en página en una cookie (ver src/lib/citas/borrador-contacto.ts),
// nunca por la URL.
export const rutSchema = z.object({
  rut: z.string().refine(validarRut, "Ingresá un RUT chileno válido"),
});

export type RutInput = z.infer<typeof rutSchema>;

export const datosContactoSchema = z.object({
  nombre: z.string().min(2, "Ingresá tu nombre completo"),
  telefono: z.string().min(6, "Ingresá un teléfono válido"),
  email: z.email("Ingresá un email válido"),
});

export type DatosContactoInput = z.infer<typeof datosContactoSchema>;

export const contactoReservaSchema = rutSchema.extend(datosContactoSchema.shape);

export type ContactoReservaInput = z.infer<typeof contactoReservaSchema>;

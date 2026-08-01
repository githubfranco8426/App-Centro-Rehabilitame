import { z } from "zod";

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

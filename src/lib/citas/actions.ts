"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, registroSchema } from "@/lib/validaciones/auth";
import type { SupabaseClient } from "@supabase/supabase-js";

const reservaSchema = z.object({
  servicioId: z.uuid(),
  profesionalId: z.uuid(),
  fechaInicio: z.string().min(1),
  fechaFin: z.string().min(1),
});

async function crearCita(
  supabase: SupabaseClient,
  pacienteId: string,
  reserva: z.infer<typeof reservaSchema>,
) {
  const { error } = await supabase.from("citas").insert({
    paciente_id: pacienteId,
    profesional_id: reserva.profesionalId,
    servicio_id: reserva.servicioId,
    fecha_inicio: reserva.fechaInicio,
    fecha_fin: reserva.fechaFin,
    estado: "pendiente",
    creada_por: pacienteId,
  });

  if (error) {
    if (error.code === "23P01") {
      return "Ese horario ya no está disponible. Elegí otro.";
    }
    return "No se pudo crear la reserva: " + error.message;
  }
  return null;
}

function parseReserva(formData: FormData) {
  return reservaSchema.safeParse({
    servicioId: formData.get("servicioId"),
    profesionalId: formData.get("profesionalId"),
    fechaInicio: formData.get("fechaInicio"),
    fechaFin: formData.get("fechaFin"),
  });
}

export async function registrarYReservar(formData: FormData) {
  const reserva = parseReserva(formData);
  const registro = registroSchema.safeParse({
    nombre: formData.get("nombre"),
    telefono: formData.get("telefono"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!reserva.success) {
    return { error: "El horario elegido ya no es válido. Volvé a intentar." };
  }
  if (!registro.success) {
    return { error: registro.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: registro.data.email,
    password: registro.data.password,
    options: { data: { nombre: registro.data.nombre, telefono: registro.data.telefono } },
  });

  if (error || !data.user) {
    return { error: "No se pudo crear la cuenta: " + (error?.message ?? "") };
  }

  const citaError = await crearCita(supabase, data.user.id, reserva.data);
  if (citaError) {
    return { error: citaError };
  }

  redirect("/mis-horas");
}

export async function iniciarSesionYReservar(formData: FormData) {
  const reserva = parseReserva(formData);
  const login = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!reserva.success) {
    return { error: "El horario elegido ya no es válido. Volvé a intentar." };
  }
  if (!login.success) {
    return { error: "Datos inválidos. Revisá el email y la contraseña." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(login.data);

  if (error || !data.user) {
    return { error: "Email o contraseña incorrectos." };
  }

  const citaError = await crearCita(supabase, data.user.id, reserva.data);
  if (citaError) {
    return { error: citaError };
  }

  redirect("/mis-horas");
}

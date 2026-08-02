"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { fromZonedTime } from "date-fns-tz";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, registroSchema } from "@/lib/validaciones/auth";
import { ZONA_HORARIA } from "@/lib/tiempo";
import { LEAD_TIME_MINUTOS_PACIENTE, puedeGestionarCita } from "@/lib/citas/reglas";
import type { SupabaseClient } from "@supabase/supabase-js";

function unico<T>(valor: T | T[] | null): T | null {
  if (!valor) return null;
  return Array.isArray(valor) ? (valor[0] ?? null) : valor;
}

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

const ESTADOS_CITA = ["pendiente", "confirmada", "cancelada", "completada", "no_asistio"] as const;

const cambiarEstadoSchema = z.object({
  estado: z.enum(ESTADOS_CITA),
});

export async function cambiarEstadoCita(citaId: string, formData: FormData): Promise<void> {
  const path = `/admin/citas/${citaId}`;
  const parsed = cambiarEstadoSchema.safeParse({ estado: formData.get("estado") });
  if (!parsed.success) {
    redirect(`${path}?error=${encodeURIComponent("Estado inválido.")}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const update: { estado: (typeof ESTADOS_CITA)[number]; cancelada_por?: string } = {
    estado: parsed.data.estado,
  };
  if (parsed.data.estado === "cancelada") {
    update.cancelada_por = user?.id;
  }

  const { error } = await supabase.from("citas").update(update).eq("id", citaId);
  if (error) {
    redirect(`${path}?error=${encodeURIComponent("No se pudo actualizar: " + error.message)}`);
  }

  revalidatePath(path);
  revalidatePath("/admin");
  redirect(path);
}

const reagendarAdminSchema = z.object({
  fechaInicio: z.string().min(1),
});

export async function reagendarCitaAdmin(citaId: string, formData: FormData): Promise<void> {
  const path = `/admin/citas/${citaId}`;
  const parsed = reagendarAdminSchema.safeParse({ fechaInicio: formData.get("fechaInicio") });
  if (!parsed.success) {
    redirect(`${path}?error=${encodeURIComponent("Fecha inválida.")}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: citaOriginal, error: fetchError } = await supabase
    .from("citas")
    .select("paciente_id, profesional_id, servicio_id, servicios(duracion_minutos)")
    .eq("id", citaId)
    .single();

  if (fetchError || !citaOriginal) {
    redirect(`${path}?error=${encodeURIComponent("No se encontró la cita.")}`);
  }

  const servicio = unico(citaOriginal.servicios);
  const duracionMinutos = servicio?.duracion_minutos ?? 30;

  const nuevaFechaInicio = fromZonedTime(parsed.data.fechaInicio, ZONA_HORARIA);
  const nuevaFechaFin = new Date(nuevaFechaInicio.getTime() + duracionMinutos * 60_000);

  // Se crea la nueva cita ANTES de cancelar la original: si el horario elegido
  // choca con el constraint anti-colisión, la original queda intacta.
  const { data: nuevaCita, error: insertError } = await supabase
    .from("citas")
    .insert({
      paciente_id: citaOriginal.paciente_id,
      profesional_id: citaOriginal.profesional_id,
      servicio_id: citaOriginal.servicio_id,
      fecha_inicio: nuevaFechaInicio.toISOString(),
      fecha_fin: nuevaFechaFin.toISOString(),
      estado: "confirmada",
      creada_por: user?.id,
    })
    .select("id")
    .single();

  if (insertError || !nuevaCita) {
    const mensaje =
      insertError?.code === "23P01"
        ? "Ese horario ya está ocupado por otra cita."
        : "No se pudo reagendar: " + (insertError?.message ?? "");
    redirect(`${path}?error=${encodeURIComponent(mensaje)}`);
  }

  await supabase
    .from("citas")
    .update({ estado: "cancelada", cancelada_por: user?.id })
    .eq("id", citaId);

  revalidatePath("/admin");
  redirect(`/admin/citas/${nuevaCita.id}?reagendada=1`);
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

export async function cancelarCitaPaciente(citaId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: cita } = await supabase
    .from("citas")
    .select("paciente_id, fecha_inicio, estado")
    .eq("id", citaId)
    .single();

  if (!cita || cita.paciente_id !== user.id) {
    redirect(`/mis-horas?error=${encodeURIComponent("No se encontró la cita.")}`);
  }

  if (!puedeGestionarCita(cita.fecha_inicio, cita.estado)) {
    redirect(
      `/mis-horas?error=${encodeURIComponent(
        `Para cancelar necesitás avisar con al menos ${LEAD_TIME_MINUTOS_PACIENTE / 60} horas de anticipación.`,
      )}`,
    );
  }

  await supabase.from("citas").update({ estado: "cancelada", cancelada_por: user.id }).eq("id", citaId);

  revalidatePath("/mis-horas");
  redirect("/mis-horas?cancelada=1");
}

export async function reagendarCitaPaciente(
  citaId: string,
  fechaInicio: string,
  fechaFin: string,
): Promise<void> {
  const path = `/mis-horas/${citaId}/reagendar`;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: cita } = await supabase
    .from("citas")
    .select("paciente_id, profesional_id, servicio_id, fecha_inicio, estado")
    .eq("id", citaId)
    .single();

  if (!cita || cita.paciente_id !== user.id) {
    redirect(`/mis-horas?error=${encodeURIComponent("No se encontró la cita.")}`);
  }

  if (!puedeGestionarCita(cita.fecha_inicio, cita.estado)) {
    redirect(
      `/mis-horas?error=${encodeURIComponent(
        `Para reagendar necesitás avisar con al menos ${LEAD_TIME_MINUTOS_PACIENTE / 60} horas de anticipación.`,
      )}`,
    );
  }

  // Se crea la nueva cita ANTES de cancelar la original: si el horario elegido
  // choca con el constraint anti-colisión, la original queda intacta.
  const { data: nuevaCita, error: insertError } = await supabase
    .from("citas")
    .insert({
      paciente_id: user.id,
      profesional_id: cita.profesional_id,
      servicio_id: cita.servicio_id,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      estado: "pendiente",
      creada_por: user.id,
    })
    .select("id")
    .single();

  if (insertError || !nuevaCita) {
    const mensaje =
      insertError?.code === "23P01"
        ? "Ese horario ya no está disponible. Elegí otro."
        : "No se pudo reagendar: " + (insertError?.message ?? "");
    redirect(`${path}?error=${encodeURIComponent(mensaje)}`);
  }

  await supabase.from("citas").update({ estado: "cancelada", cancelada_por: user.id }).eq("id", citaId);

  revalidatePath("/mis-horas");
  redirect("/mis-horas?reagendada=1");
}

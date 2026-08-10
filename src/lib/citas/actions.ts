"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { fromZonedTime } from "date-fns-tz";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { contactoReservaSchema } from "@/lib/validaciones/auth";
import { ZONA_HORARIA } from "@/lib/tiempo";
import { LEAD_TIME_MINUTOS_PACIENTE, puedeGestionarCita } from "@/lib/citas/reglas";
import { notificarCambioCita } from "@/lib/email/notificar";
import { sincronizarCancelacion, sincronizarCreacion } from "@/lib/google/sincronizar";
import { unico } from "@/lib/utils";
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
): Promise<{ error: string } | { citaId: string }> {
  const { data, error } = await supabase
    .from("citas")
    .insert({
      paciente_id: pacienteId,
      profesional_id: reserva.profesionalId,
      servicio_id: reserva.servicioId,
      fecha_inicio: reserva.fechaInicio,
      fecha_fin: reserva.fechaFin,
      estado: "pendiente",
      creada_por: pacienteId,
    })
    .select("id")
    .single();

  if (error || !data) {
    if (error?.code === "23P01") {
      return { error: "Ese horario ya no está disponible. Elegí otro." };
    }
    return { error: "No se pudo crear la reserva: " + (error?.message ?? "") };
  }
  return { citaId: data.id };
}

function parseReserva(formData: FormData) {
  return reservaSchema.safeParse({
    servicioId: formData.get("servicioId"),
    profesionalId: formData.get("profesionalId"),
    fechaInicio: formData.get("fechaInicio"),
    fechaFin: formData.get("fechaFin"),
  });
}

/**
 * Reserva sin contraseña: solo nombre + teléfono + email. Si ya existe una
 * cuenta con ese email la reutiliza; si no, la crea vía admin API (sin
 * contraseña). La cita se inserta con el cliente admin porque en este punto
 * el navegador todavía no tiene sesión — luego se manda un link mágico para
 * que el paciente pueda entrar a "Mis horas" sin necesitar contraseña nunca.
 */
export async function reservarConContacto(formData: FormData) {
  const reserva = parseReserva(formData);
  const contacto = contactoReservaSchema.safeParse({
    nombre: formData.get("nombre"),
    telefono: formData.get("telefono"),
    email: formData.get("email"),
  });

  if (!reserva.success) {
    return { error: "El horario elegido ya no es válido. Volvé a intentar." };
  }
  if (!contacto.success) {
    return { error: contacto.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const admin = createAdminClient();

  const { data: perfilExistente } = await admin
    .from("profiles")
    .select("id")
    .eq("email", contacto.data.email)
    .maybeSingle();

  let pacienteId = perfilExistente?.id as string | undefined;

  if (!pacienteId) {
    const { data: nuevoUsuario, error: crearError } = await admin.auth.admin.createUser({
      email: contacto.data.email,
      email_confirm: true,
      user_metadata: { nombre: contacto.data.nombre, telefono: contacto.data.telefono },
    });
    if (crearError || !nuevoUsuario.user) {
      return { error: "No se pudo crear la cuenta: " + (crearError?.message ?? "") };
    }
    pacienteId = nuevoUsuario.user.id;
  }

  const resultado = await crearCita(admin, pacienteId, reserva.data);
  if ("error" in resultado) {
    return { error: resultado.error };
  }

  await notificarCambioCita(admin, resultado.citaId, "confirmacion");
  await sincronizarCreacion(admin, resultado.citaId);

  const headersList = await headers();
  const origin = headersList.get("origin") ?? `https://${headersList.get("host")}`;
  const supabase = await createClient();
  const { error: otpError } = await supabase.auth.signInWithOtp({
    email: contacto.data.email,
    options: { shouldCreateUser: false, emailRedirectTo: `${origin}/api/auth/callback` },
  });
  // La cita ya quedó creada aunque esto falle (ver notificarCambioCita arriba);
  // solo dejamos rastro en logs para poder ayudar a un paciente que reclame no
  // haber recibido el link mágico.
  if (otpError) {
    console.error(
      `No se pudo enviar el link mágico a ${contacto.data.email} (cita ${resultado.citaId}): ${otpError.message}`,
    );
  }

  return { success: true as const, citaId: resultado.citaId };
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

  if (parsed.data.estado === "cancelada") {
    await notificarCambioCita(supabase, citaId, "cancelacion");
    await sincronizarCancelacion(supabase, citaId);
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
    .select("paciente_id, profesional_id, servicio_id, fecha_inicio, servicios(duracion_minutos)")
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

  await notificarCambioCita(supabase, nuevaCita.id, "reagendamiento", {
    fechaAnteriorIso: citaOriginal.fecha_inicio,
  });
  await sincronizarCreacion(supabase, nuevaCita.id);
  await sincronizarCancelacion(supabase, citaId);

  revalidatePath("/admin");
  redirect(`/admin/citas/${nuevaCita.id}?reagendada=1`);
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
  await notificarCambioCita(supabase, citaId, "cancelacion");
  await sincronizarCancelacion(supabase, citaId);

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
  await notificarCambioCita(supabase, nuevaCita.id, "reagendamiento", {
    fechaAnteriorIso: cita.fecha_inicio,
  });
  await sincronizarCreacion(supabase, nuevaCita.id);
  await sincronizarCancelacion(supabase, citaId);

  revalidatePath("/mis-horas");
  redirect("/mis-horas?reagendada=1");
}

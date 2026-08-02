"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { fromZonedTime } from "date-fns-tz";
import { createClient } from "@/lib/supabase/server";
import { ZONA_HORARIA } from "@/lib/tiempo";

function redirigirConError(path: string, mensaje: string): never {
  redirect(`${path}?error=${encodeURIComponent(mensaje)}`);
}

const profesionalSchema = z.object({
  nombre: z.string().min(2, "Ingresá un nombre válido"),
  especialidadId: z.uuid(),
  sedeId: z.uuid(),
});

export async function crearProfesional(formData: FormData): Promise<void> {
  const parsed = profesionalSchema.safeParse({
    nombre: formData.get("nombre"),
    especialidadId: formData.get("especialidadId"),
    sedeId: formData.get("sedeId"),
  });
  if (!parsed.success) {
    redirigirConError("/admin/profesionales/nuevo", parsed.error.issues[0]?.message ?? "Datos inválidos.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profesionales")
    .insert({
      nombre: parsed.data.nombre,
      especialidad_id: parsed.data.especialidadId,
      sede_id: parsed.data.sedeId,
    })
    .select("id")
    .single();

  if (error || !data) {
    redirigirConError(
      "/admin/profesionales/nuevo",
      "No se pudo crear el profesional: " + (error?.message ?? ""),
    );
  }

  redirect(`/admin/profesionales/${data.id}`);
}

const actualizarSchema = z.object({
  nombre: z.string().min(2, "Ingresá un nombre válido"),
  especialidadId: z.uuid(),
  activo: z.string().optional(),
});

export async function actualizarProfesional(profesionalId: string, formData: FormData): Promise<void> {
  const path = `/admin/profesionales/${profesionalId}`;
  const parsed = actualizarSchema.safeParse({
    nombre: formData.get("nombre"),
    especialidadId: formData.get("especialidadId"),
    activo: formData.get("activo") ?? undefined,
  });
  if (!parsed.success) {
    redirigirConError(path, parsed.error.issues[0]?.message ?? "Datos inválidos.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profesionales")
    .update({
      nombre: parsed.data.nombre,
      especialidad_id: parsed.data.especialidadId,
      activo: parsed.data.activo === "on",
    })
    .eq("id", profesionalId);

  if (error) {
    redirigirConError(path, "No se pudo actualizar: " + error.message);
  }

  revalidatePath(path);
  redirect(path);
}

const disponibilidadSchema = z.object({
  diaSemana: z.coerce.number().min(0).max(6),
  horaInicio: z.string().min(1),
  horaFin: z.string().min(1),
});

export async function agregarDisponibilidad(profesionalId: string, formData: FormData): Promise<void> {
  const path = `/admin/profesionales/${profesionalId}`;
  const parsed = disponibilidadSchema.safeParse({
    diaSemana: formData.get("diaSemana"),
    horaInicio: formData.get("horaInicio"),
    horaFin: formData.get("horaFin"),
  });
  if (!parsed.success) {
    redirigirConError(path, "Datos inválidos.");
  }
  if (parsed.data.horaFin <= parsed.data.horaInicio) {
    redirigirConError(path, "La hora de fin tiene que ser después de la de inicio.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("disponibilidad_semanal").insert({
    profesional_id: profesionalId,
    dia_semana: parsed.data.diaSemana,
    hora_inicio: parsed.data.horaInicio,
    hora_fin: parsed.data.horaFin,
  });

  if (error) {
    redirigirConError(path, "No se pudo agregar: " + error.message);
  }

  revalidatePath(path);
  redirect(path);
}

export async function eliminarDisponibilidad(profesionalId: string, disponibilidadId: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("disponibilidad_semanal").delete().eq("id", disponibilidadId);
  const path = `/admin/profesionales/${profesionalId}`;
  revalidatePath(path);
  redirect(path);
}

const bloqueoSchema = z.object({
  fechaInicio: z.string().min(1),
  fechaFin: z.string().min(1),
  motivo: z.string().optional(),
});

export async function agregarBloqueo(profesionalId: string, formData: FormData): Promise<void> {
  const path = `/admin/profesionales/${profesionalId}`;
  const parsed = bloqueoSchema.safeParse({
    fechaInicio: formData.get("fechaInicio"),
    fechaFin: formData.get("fechaFin"),
    motivo: formData.get("motivo") || undefined,
  });
  if (!parsed.success) {
    redirigirConError(path, "Datos inválidos.");
  }
  if (parsed.data.fechaFin <= parsed.data.fechaInicio) {
    redirigirConError(path, "La fecha de fin tiene que ser después de la de inicio.");
  }

  // Los <input type="datetime-local"> no traen zona horaria — se interpretan
  // siempre como hora de Chile, igual que el resto de la app.
  const supabase = await createClient();
  const { error } = await supabase.from("bloqueos").insert({
    profesional_id: profesionalId,
    fecha_inicio: fromZonedTime(parsed.data.fechaInicio, ZONA_HORARIA).toISOString(),
    fecha_fin: fromZonedTime(parsed.data.fechaFin, ZONA_HORARIA).toISOString(),
    motivo: parsed.data.motivo,
  });

  if (error) {
    redirigirConError(path, "No se pudo agregar: " + error.message);
  }

  revalidatePath(path);
  redirect(path);
}

export async function eliminarBloqueo(profesionalId: string, bloqueoId: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("bloqueos").delete().eq("id", bloqueoId);
  const path = `/admin/profesionales/${profesionalId}`;
  revalidatePath(path);
  redirect(path);
}

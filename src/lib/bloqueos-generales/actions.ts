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

const bloqueoGeneralSchema = z.object({
  fechaInicio: z.string().min(1),
  fechaFin: z.string().min(1),
  motivo: z.string().optional(),
});

export async function agregarBloqueoGeneral(formData: FormData): Promise<void> {
  const path = "/admin/bloqueos";
  const parsed = bloqueoGeneralSchema.safeParse({
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

  // profesional_id null = bloqueo general del centro (feriado/cierre),
  // ya contemplado por la RPC get_available_slots.
  const supabase = await createClient();
  const { error } = await supabase.from("bloqueos").insert({
    profesional_id: null,
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

export async function eliminarBloqueoGeneral(bloqueoId: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("bloqueos").delete().eq("id", bloqueoId).is("profesional_id", null);
  revalidatePath("/admin/bloqueos");
  redirect("/admin/bloqueos");
}

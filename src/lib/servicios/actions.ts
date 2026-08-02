"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

function redirigirConError(path: string, mensaje: string): never {
  redirect(`${path}?error=${encodeURIComponent(mensaje)}`);
}

const servicioSchema = z.object({
  nombre: z.string().min(2, "Ingresá un nombre válido"),
  especialidadId: z.uuid(),
  duracionMinutos: z.coerce.number().int().positive("La duración tiene que ser mayor a 0"),
  precio: z.coerce.number().int().nonnegative("El precio no puede ser negativo"),
});

export async function crearServicio(formData: FormData): Promise<void> {
  const parsed = servicioSchema.safeParse({
    nombre: formData.get("nombre"),
    especialidadId: formData.get("especialidadId"),
    duracionMinutos: formData.get("duracionMinutos"),
    precio: formData.get("precio"),
  });
  if (!parsed.success) {
    redirigirConError("/admin/servicios/nuevo", parsed.error.issues[0]?.message ?? "Datos inválidos.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("servicios")
    .insert({
      nombre: parsed.data.nombre,
      especialidad_id: parsed.data.especialidadId,
      duracion_minutos: parsed.data.duracionMinutos,
      precio: parsed.data.precio,
    })
    .select("id")
    .single();

  if (error || !data) {
    redirigirConError("/admin/servicios/nuevo", "No se pudo crear el servicio: " + (error?.message ?? ""));
  }

  redirect(`/admin/servicios/${data.id}`);
}

const actualizarSchema = z.object({
  nombre: z.string().min(2, "Ingresá un nombre válido"),
  especialidadId: z.uuid(),
  duracionMinutos: z.coerce.number().int().positive("La duración tiene que ser mayor a 0"),
  precio: z.coerce.number().int().nonnegative("El precio no puede ser negativo"),
  activo: z.string().optional(),
});

export async function actualizarServicio(servicioId: string, formData: FormData): Promise<void> {
  const path = `/admin/servicios/${servicioId}`;
  const parsed = actualizarSchema.safeParse({
    nombre: formData.get("nombre"),
    especialidadId: formData.get("especialidadId"),
    duracionMinutos: formData.get("duracionMinutos"),
    precio: formData.get("precio"),
    activo: formData.get("activo") ?? undefined,
  });
  if (!parsed.success) {
    redirigirConError(path, parsed.error.issues[0]?.message ?? "Datos inválidos.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("servicios")
    .update({
      nombre: parsed.data.nombre,
      especialidad_id: parsed.data.especialidadId,
      duracion_minutos: parsed.data.duracionMinutos,
      precio: parsed.data.precio,
      activo: parsed.data.activo === "on",
    })
    .eq("id", servicioId);

  if (error) {
    redirigirConError(path, "No se pudo actualizar: " + error.message);
  }

  revalidatePath(path);
  revalidatePath("/admin/servicios");
  redirect(path);
}

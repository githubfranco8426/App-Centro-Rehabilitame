"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, registroSchema } from "@/lib/validaciones/auth";

export async function login(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Datos inválidos. Revisá el email y la contraseña." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "Email o contraseña incorrectos." };
  }

  redirect("/mis-horas");
}

export async function registrarse(formData: FormData) {
  const parsed = registroSchema.safeParse({
    nombre: formData.get("nombre"),
    telefono: formData.get("telefono"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { nombre, telefono, email, password } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nombre, telefono } },
  });

  if (error) {
    return { error: "No se pudo crear la cuenta: " + error.message };
  }

  redirect("/mis-horas");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

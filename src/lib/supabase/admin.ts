import { createClient } from "@supabase/supabase-js";

// Cliente con service role: ignora RLS. Uso exclusivo de src/lib/google/*
// para leer/escribir profesional_google_tokens, que debe ser accesible
// incluso desde flujos disparados por pacientes (sin sesión admin).
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Adonde llega el paciente al hacer clic en el link mágico que le mandamos
// por email (ver reservarConContacto en src/lib/citas/actions.ts).
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = request.nextUrl.searchParams.get("next") ?? "/mis-horas";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  return NextResponse.redirect(
    new URL(
      "/login?error=" + encodeURIComponent("El link expiró o no es válido. Pedí uno nuevo."),
      request.url,
    ),
  );
}

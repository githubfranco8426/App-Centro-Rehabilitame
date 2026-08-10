import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { exchangeCodeForTokens, obtenerEmailConectado, parseState } from "@/lib/google/oauth";

const NONCE_COOKIE = "g_oauth_nonce";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const nonceCookie = request.cookies.get(NONCE_COOKIE)?.value;

  const irA = (pathname: string) => {
    const response = NextResponse.redirect(new URL(pathname, request.url));
    response.cookies.delete(NONCE_COOKIE);
    return response;
  };

  if (!code || !state || !nonceCookie) {
    return irA("/admin/profesionales?error=" + encodeURIComponent("No se pudo conectar con Google."));
  }

  const profesionalId = parseState(state, nonceCookie);
  if (!profesionalId) {
    return irA("/admin/profesionales?error=" + encodeURIComponent("La conexión con Google expiró o es inválida. Probá de nuevo."));
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    if (!tokens.refresh_token) {
      return irA(
        `/admin/profesionales/${profesionalId}?error=` +
          encodeURIComponent(
            "Google no envió permiso de acceso permanente. Andá a myaccount.google.com/permissions, quitá el acceso de Centro Rehabilita.me y volvé a intentar.",
          ),
      );
    }

    const email = await obtenerEmailConectado(tokens.access_token);

    const supabase = createAdminClient();
    const { error } = await supabase.from("profesional_google_tokens").upsert({
      profesional_id: profesionalId,
      email,
      refresh_token: tokens.refresh_token,
      access_token: tokens.access_token,
      access_token_expira: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      return irA(`/admin/profesionales/${profesionalId}?error=` + encodeURIComponent("No se pudo guardar la conexión: " + error.message));
    }

    return irA(`/admin/profesionales/${profesionalId}?google=conectado`);
  } catch (err) {
    const mensaje = err instanceof Error ? err.message : "Error desconocido";
    return irA(`/admin/profesionales/${profesionalId}?error=` + encodeURIComponent("No se pudo conectar con Google: " + mensaje));
  }
}

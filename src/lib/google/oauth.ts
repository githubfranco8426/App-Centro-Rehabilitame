const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";
const SCOPE = "https://www.googleapis.com/auth/calendar openid email";

export function generarNonce(): string {
  return crypto.randomUUID();
}

export function getGoogleAuthUrl(profesionalId: string, nonce: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
    response_type: "code",
    scope: SCOPE,
    access_type: "offline",
    prompt: "consent",
    state: `${nonce}.${profesionalId}`,
  });
  return `${AUTH_URL}?${params.toString()}`;
}

// El nonce viaja como primer segmento de `state` para evitar OAuth login-CSRF:
// sin esto, un link armado podría linkear la cuenta de Google de un atacante
// al profesional equivocado usando la sesión de un admin ya logueado.
export function parseState(state: string, nonceEsperado: string): string | null {
  const separador = state.indexOf(".");
  if (separador === -1) return null;
  const nonce = state.slice(0, separador);
  const profesionalId = state.slice(separador + 1);
  if (!nonce || !profesionalId || nonce !== nonceEsperado) return null;
  return profesionalId;
}

export async function exchangeCodeForTokens(code: string): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) throw new Error("No se pudo canjear el código de Google: " + (await res.text()));
  return res.json();
}

export async function refrescarAccessToken(
  refreshToken: string,
): Promise<{ access_token: string; expires_in: number }> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error("No se pudo refrescar el token de Google: " + (await res.text()));
  return res.json();
}

export async function obtenerEmailConectado(accessToken: string): Promise<string> {
  const res = await fetch(USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return "";
  const data = await res.json();
  return data.email ?? "";
}

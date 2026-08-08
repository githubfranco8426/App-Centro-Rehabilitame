import { NextResponse, type NextRequest } from "next/server";
import { generarNonce, getGoogleAuthUrl } from "@/lib/google/oauth";

const NONCE_COOKIE = "g_oauth_nonce";

export async function GET(request: NextRequest) {
  const profesionalId = request.nextUrl.searchParams.get("profesionalId");
  if (!profesionalId) {
    return NextResponse.redirect(new URL("/admin/profesionales", request.url));
  }

  const nonce = generarNonce();
  const response = NextResponse.redirect(getGoogleAuthUrl(profesionalId, nonce));
  response.cookies.set(NONCE_COOKIE, nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 900,
    path: "/api/google",
  });
  return response;
}

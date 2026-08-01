import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

function redirectTo(request: NextRequest, response: NextResponse, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  const redirect = NextResponse.redirect(url);
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}

export async function proxy(request: NextRequest) {
  const { response, user, supabase } = await updateSession(request);
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/mis-horas") && !user) {
    return redirectTo(request, response, "/login");
  }

  if (pathname.startsWith("/admin")) {
    if (!user) {
      return redirectTo(request, response, "/login");
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("rol")
      .eq("id", user.id)
      .single();

    if (profile?.rol !== "admin") {
      return redirectTo(request, response, "/");
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

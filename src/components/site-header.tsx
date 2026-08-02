import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="flex items-center justify-between border-b px-6 py-4">
      <Link href="/" className="flex items-center gap-2 font-semibold">
        <Image
          src="/logo.jpg"
          alt="Rehabilita.me"
          width={32}
          height={32}
          className="size-8 rounded-full object-cover"
        />
        Centro de Rehabilitación
      </Link>
      <nav className="flex items-center gap-4 text-sm">
        {user ? (
          <>
            <Link href="/mis-horas" className="hover:underline">
              Mis horas
            </Link>
            <form action={logout}>
              <Button type="submit" variant="outline" size="sm">
                Cerrar sesión
              </Button>
            </form>
          </>
        ) : (
          <>
            <Link href="/login" className="hover:underline">
              Iniciar sesión
            </Link>
            <Link href="/registro" className="hover:underline">
              Registrarse
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

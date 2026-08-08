import Link from "next/link";
import Image from "next/image";
import { Activity } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { iconoEspecialidad, colorEspecialidad } from "@/lib/especialidades-ui";
import { LiquidBackground } from "@/components/liquid-background";

const descripciones: Record<string, string> = {
  Kinesiología: "Respiratorio infantil, respiratorio adulto y maxilofacial.",
  Fonoaudiología: "Frenillo lingual corto, lactancia, respiración oral y neuro-adultos.",
  "Terapia Ocupacional": "Servicios a definir por el equipo del centro.",
};

export default async function Home() {
  const supabase = await createClient();
  const { data: especialidades, error } = await supabase
    .from("especialidades")
    .select("id, nombre")
    .order("created_at");

  if (error) {
    throw new Error(`No se pudo conectar a Supabase: ${error.message}`);
  }

  return (
    <div className="relative flex flex-1 flex-col items-center overflow-hidden bg-zinc-50 dark:bg-black">
      <LiquidBackground photo />

      <main className="relative flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-12 px-6 py-24 sm:items-start">
        <div
          className="glass-panel animate-in fade-in slide-in-from-bottom-4 flex flex-col items-center gap-4 rounded-4xl border border-white/40 p-8 text-center shadow-[0_8px_40px_rgb(0,0,0,0.06)] duration-700 sm:items-start sm:text-left dark:border-white/10 dark:shadow-[0_8px_40px_rgb(0,0,0,0.4)]"
        >
          <div className="relative rounded-full p-1">
            <div className="glass-specular absolute inset-0 rounded-full" />
            <Image
              src="/logo.jpg"
              alt="Rehabilita.me"
              width={96}
              height={96}
              className="relative size-24 rounded-full object-cover ring-1 ring-white/60 dark:ring-white/15"
              priority
            />
          </div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Centro de Rehabilitación
          </h1>
          <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
            Reservá tu hora online con nuestros profesionales.
          </p>
        </div>

        <div className="grid w-full gap-5 sm:grid-cols-3">
          {especialidades.map((especialidad, i) => {
            const Icono = iconoEspecialidad[especialidad.nombre] ?? Activity;
            const colores = colorEspecialidad[especialidad.nombre];

            return (
              <Link
                key={especialidad.id}
                href={`/reservar?especialidad=${especialidad.id}`}
                className="animate-in fade-in slide-in-from-bottom-4 group relative block h-full overflow-hidden rounded-3xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgb(0,0,0,0.12)] dark:border-white/10 dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)]"
                style={{ animationDelay: `${150 + i * 100}ms`, animationDuration: "700ms" }}
              >
                <div className="glass-panel absolute inset-0" />
                <div
                  className={cn(
                    "absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b to-transparent opacity-60",
                    colores?.glow
                  )}
                />
                <div className="glass-specular absolute inset-0" />

                <div className="relative flex h-full flex-col gap-3 p-6">
                  <div
                    className={cn(
                      "flex size-11 items-center justify-center rounded-2xl backdrop-blur-sm",
                      colores?.badge ?? "bg-primary/15 text-primary"
                    )}
                  >
                    <Icono className="size-5" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className={cn("font-heading text-base font-medium", colores?.text)}>
                      {especialidad.nombre}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {descripciones[especialidad.nombre] ?? ""}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}

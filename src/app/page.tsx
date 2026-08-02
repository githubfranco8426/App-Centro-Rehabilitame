import Link from "next/link";
import Image from "next/image";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

const descripciones: Record<string, string> = {
  Kinesiología: "Respiratorio infantil, respiratorio adulto y maxilofacial.",
  Fonoaudiología: "Frenillo lingual corto, lactancia, respiración oral y neuro-adultos.",
  "Terapia Ocupacional": "Servicios a definir por el equipo del centro.",
};

// Kinesiología usa el sky blue y Fonoaudiología el terracota del tema
// (--primary / --accent en globals.css); Terapia Ocupacional suma verde
// esmeralda como tercer color, solo para estas tarjetas.
const coloresEspecialidad: Record<string, string> = {
  Kinesiología: "border-primary/30 hover:border-primary bg-primary/5",
  Fonoaudiología: "border-accent/30 hover:border-accent bg-accent/5",
  "Terapia Ocupacional": "border-emerald-500/30 hover:border-emerald-500 bg-emerald-500/5",
};

const tituloColorEspecialidad: Record<string, string> = {
  Kinesiología: "text-primary",
  Fonoaudiología: "text-accent",
  "Terapia Ocupacional": "text-emerald-600 dark:text-emerald-400",
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
    <div className="flex flex-1 flex-col items-center bg-zinc-50 dark:bg-black">
      <main className="flex w-full max-w-3xl flex-1 flex-col items-center gap-10 px-6 py-24 sm:items-start">
        <div className="flex flex-col items-center gap-3 text-center sm:items-start sm:text-left">
          <Image
            src="/logo.jpg"
            alt="Rehabilita.me"
            width={96}
            height={96}
            className="size-24 rounded-full object-cover"
            priority
          />
          <h1 className="text-3xl font-semibold tracking-tight">
            Centro de Rehabilitación
          </h1>
          <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
            Reservá tu hora online con nuestros profesionales.
          </p>
        </div>

        <div className="grid w-full gap-4 sm:grid-cols-3">
          {especialidades.map((especialidad) => (
            <Link key={especialidad.id} href={`/reservar?especialidad=${especialidad.id}`}>
              <Card
                className={`h-full transition-colors ${coloresEspecialidad[especialidad.nombre] ?? "hover:border-primary"}`}
              >
                <CardHeader>
                  <CardTitle className={tituloColorEspecialidad[especialidad.nombre] ?? ""}>
                    {especialidad.nombre}
                  </CardTitle>
                  <CardDescription>
                    {descripciones[especialidad.nombre] ?? ""}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

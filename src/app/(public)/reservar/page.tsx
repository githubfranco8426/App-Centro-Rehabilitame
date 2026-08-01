import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ServicioRow = {
  id: string;
  nombre: string;
  duracion_minutos: number;
  especialidades: { nombre: string } | { nombre: string }[] | null;
};

function nombreEspecialidad(row: ServicioRow) {
  const esp = row.especialidades;
  if (!esp) return "";
  return Array.isArray(esp) ? (esp[0]?.nombre ?? "") : esp.nombre;
}

export default async function ReservarPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("servicios")
    .select("id, nombre, duracion_minutos, especialidades(nombre)")
    .eq("activo", true)
    .order("nombre");

  const servicios = (data ?? []) as ServicioRow[];

  const grupos = new Map<string, ServicioRow[]>();
  for (const servicio of servicios) {
    const especialidad = nombreEspecialidad(servicio);
    grupos.set(especialidad, [...(grupos.get(especialidad) ?? []), servicio]);
  }

  return (
    <div className="flex flex-1 flex-col items-center px-6 py-16">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-semibold">Reservar hora</h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">Elegí el servicio que necesitás.</p>

        {servicios.length === 0 && (
          <p className="mt-8 text-sm text-muted-foreground">
            Todavía no hay servicios disponibles para reservar.
          </p>
        )}

        {[...grupos.entries()].map(([especialidad, items]) => (
          <div key={especialidad} className="mt-8">
            <h2 className="mb-3 text-sm font-medium text-muted-foreground">{especialidad}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {items.map((servicio) => (
                <Link key={servicio.id} href={`/reservar/${servicio.id}`}>
                  <Card className="transition-colors hover:border-primary">
                    <CardHeader>
                      <CardTitle className="text-base">{servicio.nombre}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      {servicio.duracion_minutos} min
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

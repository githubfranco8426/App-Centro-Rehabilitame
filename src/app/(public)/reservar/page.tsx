import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCLP } from "@/lib/dinero";

type ServicioRow = {
  id: string;
  nombre: string;
  duracion_minutos: number;
  precio: number | null;
  especialidades: { nombre: string } | { nombre: string }[] | null;
};

function nombreEspecialidad(row: ServicioRow) {
  const esp = row.especialidades;
  if (!esp) return "";
  return Array.isArray(esp) ? (esp[0]?.nombre ?? "") : esp.nombre;
}

export default async function ReservarPage({
  searchParams,
}: {
  searchParams: Promise<{ especialidad?: string }>;
}) {
  const { especialidad: especialidadId } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("servicios")
    .select("id, nombre, duracion_minutos, precio, especialidades(nombre)")
    .eq("activo", true)
    .order("nombre");

  if (especialidadId) {
    query = query.eq("especialidad_id", especialidadId);
  }

  const { data } = await query;

  const servicios = (data ?? []) as ServicioRow[];

  let especialidadNombre: string | null = null;
  if (especialidadId) {
    const { data: especialidad } = await supabase
      .from("especialidades")
      .select("nombre")
      .eq("id", especialidadId)
      .maybeSingle();
    especialidadNombre = especialidad?.nombre ?? null;
  }

  const grupos = new Map<string, ServicioRow[]>();
  for (const servicio of servicios) {
    const especialidad = nombreEspecialidad(servicio);
    grupos.set(especialidad, [...(grupos.get(especialidad) ?? []), servicio]);
  }

  return (
    <div className="flex flex-1 flex-col items-center px-6 py-16">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-semibold">
          {especialidadNombre ? `Reservar hora — ${especialidadNombre}` : "Reservar hora"}
        </h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">Elegí el servicio que necesitás.</p>
        {especialidadId && (
          <Link href="/" className="mt-1 inline-block text-sm underline text-muted-foreground">
            Ver otras especialidades
          </Link>
        )}

        {servicios.length === 0 && (
          <p className="mt-8 text-sm text-muted-foreground">
            {especialidadNombre
              ? `Todavía no hay servicios disponibles para ${especialidadNombre}.`
              : "Todavía no hay servicios disponibles para reservar."}
          </p>
        )}

        {[...grupos.entries()].map(([especialidad, items]) => (
          <div key={especialidad} className="mt-8">
            {!especialidadId && (
              <h2 className="mb-3 text-sm font-medium text-muted-foreground">{especialidad}</h2>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              {items.map((servicio) => (
                <Link key={servicio.id} href={`/reservar/${servicio.id}`}>
                  <Card className="transition-colors hover:border-primary">
                    <CardHeader>
                      <CardTitle className="text-base">{servicio.nombre}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{servicio.duracion_minutos} min</span>
                      {servicio.precio != null && (
                        <span className="font-medium text-foreground">
                          {formatCLP(servicio.precio)}
                        </span>
                      )}
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

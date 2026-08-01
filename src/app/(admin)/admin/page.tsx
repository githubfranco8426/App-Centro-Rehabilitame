import Link from "next/link";
import { addDays, format, startOfMonth, subDays } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { es } from "date-fns/locale";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { MiniCalendario } from "@/components/admin/mini-calendario";
import { ProfesionalFilter } from "@/components/admin/profesional-filter";
import { ZONA_HORARIA } from "@/lib/tiempo";

// Franjas de 30 min, 09:00 – 19:00.
const HORAS = Array.from({ length: 21 }, (_, i) => {
  const totalMin = 9 * 60 + i * 30;
  return `${String(Math.floor(totalMin / 60)).padStart(2, "0")}:${String(totalMin % 60).padStart(2, "0")}`;
});
const COLORES_AVATAR = ["bg-primary text-primary-foreground", "bg-accent text-accent-foreground"];
const COLORES_CITA = ["border-primary bg-primary/10", "border-accent bg-accent/10"];

function capitalizar(texto: string) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function iniciales(nombre: string) {
  return nombre
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function unico<T>(valor: T | T[] | null): T | null {
  if (!valor) return null;
  return Array.isArray(valor) ? (valor[0] ?? null) : valor;
}

export default async function AdminAgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ fecha?: string; profesional?: string; mes?: string }>;
}) {
  const params = await searchParams;
  const fecha = params.fecha ? new Date(`${params.fecha}T00:00:00`) : new Date();
  const mesActual = params.mes ? new Date(`${params.mes}-01T00:00:00`) : startOfMonth(fecha);
  const search = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined) as [string, string][],
  );

  const supabase = await createClient();
  let query = supabase
    .from("profesionales")
    .select("id, nombre, especialidades(nombre)")
    .eq("activo", true)
    .order("nombre");

  if (params.profesional) {
    query = query.eq("id", params.profesional);
  }

  const { data: profesionalesFiltrados } = await query;
  const { data: todosProfesionales } = await supabase
    .from("profesionales")
    .select("id, nombre")
    .eq("activo", true)
    .order("nombre");

  const profesionales = profesionalesFiltrados ?? [];

  const fechaStr = format(fecha, "yyyy-MM-dd");
  const inicioDia = fromZonedTime(`${fechaStr}T00:00:00`, ZONA_HORARIA);
  const finDia = fromZonedTime(`${format(addDays(fecha, 1), "yyyy-MM-dd")}T00:00:00`, ZONA_HORARIA);

  const { data: citasData } = await supabase
    .from("citas")
    .select("id, fecha_inicio, profesional_id, servicios(nombre), profiles!citas_paciente_id_fkey(nombre)")
    .gte("fecha_inicio", inicioDia.toISOString())
    .lt("fecha_inicio", finDia.toISOString())
    .neq("estado", "cancelada");

  const citas = citasData ?? [];

  return (
    <div className="flex flex-1">
      <aside className="hidden w-64 shrink-0 border-r p-4 md:block">
        <div className="mb-4 rounded-lg border bg-gradient-to-br from-primary/10 to-accent/10 p-4 text-sm">
          <p className="font-medium">¡Compartí tu link y recibí citas!</p>
        </div>

        <div className="mb-4">
          <p className="mb-2 text-sm font-medium">Profesional</p>
          <ProfesionalFilter profesionales={todosProfesionales ?? []} />
        </div>

        <MiniCalendario
          basePath="/admin"
          searchParams={search}
          mesActual={mesActual}
          fechaSeleccionada={fecha}
        />
      </aside>

      <main className="flex-1 overflow-x-auto">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <Button variant="outline" size="sm">
                Hoy
              </Button>
            </Link>
            <Link
              href={`/admin?${new URLSearchParams({ ...params, fecha: format(subDays(fecha, 1), "yyyy-MM-dd") }).toString()}`}
              className="rounded p-1 hover:bg-muted"
            >
              ‹
            </Link>
            <Link
              href={`/admin?${new URLSearchParams({ ...params, fecha: format(addDays(fecha, 1), "yyyy-MM-dd") }).toString()}`}
              className="rounded p-1 hover:bg-muted"
            >
              ›
            </Link>
            <h1 className="text-lg font-semibold">
              {capitalizar(format(fecha, "EEEE, d 'de' MMMM yyyy", { locale: es }))}
            </h1>
          </div>
          <Button disabled>Nuevo</Button>
        </div>

        {profesionales.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">
            No hay profesionales cargados todavía.
          </div>
        ) : (
          <div className="min-w-max">
            <div
              className="grid border-b"
              style={{ gridTemplateColumns: `4rem repeat(${profesionales.length}, minmax(200px, 1fr))` }}
            >
              <div />
              {profesionales.map((p, i) => {
                const especialidad = Array.isArray(p.especialidades)
                  ? p.especialidades[0]?.nombre
                  : (p.especialidades as { nombre: string } | null)?.nombre;
                return (
                  <div key={p.id} className="flex items-center gap-2 border-l px-4 py-3">
                    <span
                      className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-medium ${COLORES_AVATAR[i % COLORES_AVATAR.length]}`}
                    >
                      {iniciales(p.nombre)}
                    </span>
                    <div>
                      <p className="text-sm font-medium leading-tight">{p.nombre}</p>
                      {especialidad && (
                        <p className="text-xs leading-tight text-muted-foreground">{especialidad}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {HORAS.map((hora) => (
              <div
                key={hora}
                className="grid border-b"
                style={{ gridTemplateColumns: `4rem repeat(${profesionales.length}, minmax(200px, 1fr))` }}
              >
                <div className="px-2 py-3 text-right text-xs text-muted-foreground">{hora}</div>
                {profesionales.map((p, i) => {
                  const cita = citas.find(
                    (c) =>
                      c.profesional_id === p.id &&
                      formatInTimeZone(new Date(c.fecha_inicio), ZONA_HORARIA, "HH:mm") === hora,
                  );
                  const servicio = cita ? unico(cita.servicios) : null;
                  const paciente = cita ? unico(cita.profiles) : null;
                  return (
                    <div key={p.id} className="h-14 border-l p-0.5">
                      {cita && (
                        <div
                          className={`h-full rounded border-l-2 px-2 py-1 text-xs ${COLORES_CITA[i % COLORES_CITA.length]}`}
                        >
                          <p className="font-medium leading-tight">{paciente?.nombre}</p>
                          <p className="leading-tight text-muted-foreground">{servicio?.nombre}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

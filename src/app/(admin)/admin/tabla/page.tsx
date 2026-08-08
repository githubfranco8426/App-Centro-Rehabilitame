import Link from "next/link";
import { addDays, format, startOfMonth, subDays } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { es } from "date-fns/locale";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MiniCalendario } from "@/components/admin/mini-calendario";
import { ProfesionalFilter } from "@/components/admin/profesional-filter";
import { EspecialidadFilter } from "@/components/admin/especialidad-filter";
import { EstadoFilter } from "@/components/admin/estado-filter";
import { ESTADOS_CITA } from "@/lib/citas/reglas";
import { ZONA_HORARIA } from "@/lib/tiempo";

function capitalizar(texto: string) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function unico<T>(valor: T | T[] | null): T | null {
  if (!valor) return null;
  return Array.isArray(valor) ? (valor[0] ?? null) : valor;
}

export default async function AgendaTablaPage({
  searchParams,
}: {
  searchParams: Promise<{ fecha?: string; profesional?: string; especialidad?: string; estado?: string; mes?: string }>;
}) {
  const params = await searchParams;
  const fecha = params.fecha ? new Date(`${params.fecha}T00:00:00`) : new Date();
  const mesActual = params.mes ? new Date(`${params.mes}-01T00:00:00`) : startOfMonth(fecha);
  const search = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined) as [string, string][],
  );

  const supabase = await createClient();
  const [{ data: profesionales }, { data: especialidades }] = await Promise.all([
    supabase.from("profesionales").select("id, nombre").eq("activo", true).order("nombre"),
    supabase.from("especialidades").select("id, nombre").order("nombre"),
  ]);

  const fechaStr = format(fecha, "yyyy-MM-dd");
  const inicioDia = fromZonedTime(`${fechaStr}T00:00:00`, ZONA_HORARIA);
  const finDia = fromZonedTime(`${format(addDays(fecha, 1), "yyyy-MM-dd")}T00:00:00`, ZONA_HORARIA);

  let query = supabase
    .from("citas")
    .select(
      "id, fecha_inicio, estado, profiles!citas_paciente_id_fkey(nombre), servicios(nombre), profesionales!inner(id, nombre, especialidad_id, especialidades(nombre))",
    )
    .gte("fecha_inicio", inicioDia.toISOString())
    .lt("fecha_inicio", finDia.toISOString())
    .order("fecha_inicio");

  if (params.profesional) query = query.eq("profesional_id", params.profesional);
  if (params.especialidad) query = query.eq("profesionales.especialidad_id", params.especialidad);
  if (params.estado) query = query.eq("estado", params.estado);

  const { data: citasData } = await query;
  const citas = citasData ?? [];

  return (
    <div className="flex flex-1">
      <aside className="hidden w-64 shrink-0 border-r p-4 md:block">
        <div className="mb-4">
          <p className="mb-2 text-sm font-medium">Profesional</p>
          <ProfesionalFilter profesionales={profesionales ?? []} />
        </div>

        <div className="mb-4">
          <p className="mb-2 text-sm font-medium">Especialidad</p>
          <EspecialidadFilter especialidades={especialidades ?? []} />
        </div>

        <div className="mb-4">
          <p className="mb-2 text-sm font-medium">Estado</p>
          <EstadoFilter />
        </div>

        <MiniCalendario
          basePath="/admin/tabla"
          searchParams={search}
          mesActual={mesActual}
          fechaSeleccionada={fecha}
        />
      </aside>

      <main className="flex-1 overflow-x-auto">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href={`/admin/tabla?${new URLSearchParams({ ...params, fecha: format(new Date(), "yyyy-MM-dd") }).toString()}`}>
              <Button variant="outline" size="sm">
                Hoy
              </Button>
            </Link>
            <Link
              href={`/admin/tabla?${new URLSearchParams({ ...params, fecha: format(subDays(fecha, 1), "yyyy-MM-dd") }).toString()}`}
              className="rounded p-1 hover:bg-muted"
            >
              ‹
            </Link>
            <Link
              href={`/admin/tabla?${new URLSearchParams({ ...params, fecha: format(addDays(fecha, 1), "yyyy-MM-dd") }).toString()}`}
              className="rounded p-1 hover:bg-muted"
            >
              ›
            </Link>
            <h1 className="text-lg font-semibold">
              {capitalizar(format(fecha, "EEEE, d 'de' MMMM yyyy", { locale: es }))}
            </h1>
          </div>
          <Link href={`/admin?${new URLSearchParams({ fecha: fechaStr, ...(params.profesional ? { profesional: params.profesional } : {}) }).toString()}`}>
            <Button variant="outline" size="sm">
              Ver calendario
            </Button>
          </Link>
        </div>

        {citas.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">
            No hay citas para este día con estos filtros.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hora</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Servicio</TableHead>
                <TableHead>Profesional</TableHead>
                <TableHead>Especialidad</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {citas.map((cita) => {
                const paciente = unico(cita.profiles);
                const servicio = unico(cita.servicios);
                const profesional = unico(cita.profesionales);
                const especialidad = profesional ? unico(profesional.especialidades) : null;
                return (
                  <TableRow key={cita.id} className="cursor-pointer">
                    <TableCell>
                      <Link href={`/admin/citas/${cita.id}`} className="block hover:underline">
                        {formatInTimeZone(new Date(cita.fecha_inicio), ZONA_HORARIA, "HH:mm")}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link href={`/admin/citas/${cita.id}`} className="block hover:underline">
                        {paciente?.nombre ?? "—"}
                      </Link>
                    </TableCell>
                    <TableCell>{servicio?.nombre ?? "—"}</TableCell>
                    <TableCell>{profesional?.nombre ?? "—"}</TableCell>
                    <TableCell>{especialidad?.nombre ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={cita.estado === "cancelada" ? "destructive" : "default"}>
                        {ESTADOS_CITA.find((e) => e.id === cita.estado)?.nombre ?? cita.estado}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </main>
    </div>
  );
}

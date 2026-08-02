import { notFound } from "next/navigation";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import { es } from "date-fns/locale";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LabeledSelect } from "@/components/admin/labeled-select";
import {
  actualizarProfesional,
  agregarBloqueo,
  agregarDisponibilidad,
  eliminarBloqueo,
  eliminarDisponibilidad,
} from "@/lib/profesionales/actions";
import { ZONA_HORARIA } from "@/lib/tiempo";

const DIAS_SEMANA = [
  { valor: 1, nombre: "Lunes" },
  { valor: 2, nombre: "Martes" },
  { valor: 3, nombre: "Miércoles" },
  { valor: 4, nombre: "Jueves" },
  { valor: 5, nombre: "Viernes" },
  { valor: 6, nombre: "Sábado" },
  { valor: 0, nombre: "Domingo" },
];

function nombreDia(valor: number) {
  return DIAS_SEMANA.find((d) => d.valor === valor)?.nombre ?? String(valor);
}

export default async function EditarProfesionalPage({
  params,
  searchParams,
}: {
  params: Promise<{ profesionalId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { profesionalId } = await params;
  const { error: errorParam } = await searchParams;
  const supabase = await createClient();

  const { data: profesional } = await supabase
    .from("profesionales")
    .select("id, nombre, activo, especialidad_id")
    .eq("id", profesionalId)
    .single();

  if (!profesional) notFound();

  const { data: especialidades } = await supabase
    .from("especialidades")
    .select("id, nombre")
    .order("nombre");

  const { data: disponibilidad } = await supabase
    .from("disponibilidad_semanal")
    .select("id, dia_semana, hora_inicio, hora_fin")
    .eq("profesional_id", profesionalId)
    .order("dia_semana")
    .order("hora_inicio");

  const { data: bloqueos } = await supabase
    .from("bloqueos")
    .select("id, fecha_inicio, fecha_fin, motivo")
    .eq("profesional_id", profesionalId)
    .order("fecha_inicio");

  const actualizar = actualizarProfesional.bind(null, profesionalId);
  const agregarDisp = agregarDisponibilidad.bind(null, profesionalId);
  const agregarBloq = agregarBloqueo.bind(null, profesionalId);

  return (
    <div className="w-full max-w-2xl px-6 py-8">
      <h1 className="text-2xl font-semibold">{profesional.nombre}</h1>

      {errorParam && <p className="mt-4 text-sm text-red-600">{errorParam}</p>}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Datos básicos</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={actualizar} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="nombre">Nombre completo</Label>
              <Input id="nombre" name="nombre" defaultValue={profesional.nombre} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="especialidadId">Especialidad</Label>
              <LabeledSelect
                name="especialidadId"
                items={especialidades ?? []}
                defaultValue={profesional.especialidad_id}
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="activo" defaultChecked={profesional.activo} />
              Activo (visible para reservar)
            </label>
            <Button type="submit" className="self-start">
              Guardar
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Disponibilidad semanal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            {(disponibilidad ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">Todavía no hay bloques cargados.</p>
            )}
            {(disponibilidad ?? []).map((d) => (
              <div key={d.id} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
                <span>
                  {nombreDia(d.dia_semana)} — {d.hora_inicio.slice(0, 5)} a {d.hora_fin.slice(0, 5)}
                </span>
                <form action={eliminarDisponibilidad.bind(null, profesionalId, d.id)}>
                  <Button type="submit" variant="ghost" size="sm">
                    Eliminar
                  </Button>
                </form>
              </div>
            ))}
          </div>

          <form action={agregarDisp} className="mt-4 flex flex-wrap items-end gap-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="diaSemana">Día</Label>
              <LabeledSelect
                name="diaSemana"
                items={DIAS_SEMANA.map((d) => ({ id: String(d.valor), nombre: d.nombre }))}
                defaultValue="1"
                className="w-36"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="horaInicio">Desde</Label>
              <Input id="horaInicio" name="horaInicio" type="time" defaultValue="09:00" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="horaFin">Hasta</Label>
              <Input id="horaFin" name="horaFin" type="time" defaultValue="18:00" required />
            </div>
            <Button type="submit">Agregar</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Bloqueos (vacaciones, licencias)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            {(bloqueos ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">Todavía no hay bloqueos cargados.</p>
            )}
            {(bloqueos ?? []).map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
                <span>
                  {formatInTimeZone(new Date(b.fecha_inicio), ZONA_HORARIA, "d MMM HH:mm", { locale: es })} —{" "}
                  {formatInTimeZone(new Date(b.fecha_fin), ZONA_HORARIA, "d MMM HH:mm", { locale: es })}
                  {b.motivo && ` · ${b.motivo}`}
                </span>
                <form action={eliminarBloqueo.bind(null, profesionalId, b.id)}>
                  <Button type="submit" variant="ghost" size="sm">
                    Eliminar
                  </Button>
                </form>
              </div>
            ))}
          </div>

          <form action={agregarBloq} className="mt-4 flex flex-wrap items-end gap-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="fechaInicio">Desde</Label>
              <Input
                id="fechaInicio"
                name="fechaInicio"
                type="datetime-local"
                defaultValue={formatInTimeZone(
                  toZonedTime(new Date(), ZONA_HORARIA),
                  ZONA_HORARIA,
                  "yyyy-MM-dd'T'HH:mm",
                )}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="fechaFin">Hasta</Label>
              <Input id="fechaFin" name="fechaFin" type="datetime-local" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="motivo">Motivo (opcional)</Label>
              <Input id="motivo" name="motivo" placeholder="Vacaciones" />
            </div>
            <Button type="submit">Agregar</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

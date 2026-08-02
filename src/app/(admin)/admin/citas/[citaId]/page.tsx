import { notFound } from "next/navigation";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import { es } from "date-fns/locale";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LabeledSelect } from "@/components/admin/labeled-select";
import { cambiarEstadoCita, reagendarCitaAdmin } from "@/lib/citas/actions";
import { ZONA_HORARIA } from "@/lib/tiempo";

function unico<T>(valor: T | T[] | null): T | null {
  if (!valor) return null;
  return Array.isArray(valor) ? (valor[0] ?? null) : valor;
}

function capitalizar(texto: string) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

const ESTADOS = [
  { id: "pendiente", nombre: "Pendiente" },
  { id: "confirmada", nombre: "Confirmada" },
  { id: "completada", nombre: "Completada" },
  { id: "no_asistio", nombre: "No asistió" },
  { id: "cancelada", nombre: "Cancelada" },
];

export default async function DetalleCitaPage({
  params,
  searchParams,
}: {
  params: Promise<{ citaId: string }>;
  searchParams: Promise<{ error?: string; reagendada?: string }>;
}) {
  const { citaId } = await params;
  const { error: errorParam, reagendada } = await searchParams;
  const supabase = await createClient();

  const { data: cita } = await supabase
    .from("citas")
    .select(
      "id, fecha_inicio, fecha_fin, estado, profiles!citas_paciente_id_fkey(nombre, telefono), profesionales(nombre), servicios(nombre, duracion_minutos)",
    )
    .eq("id", citaId)
    .single();

  if (!cita) notFound();

  const paciente = unico(cita.profiles);
  const profesional = unico(cita.profesionales);
  const servicio = unico(cita.servicios);

  const cambiarEstado = cambiarEstadoCita.bind(null, citaId);
  const reagendar = reagendarCitaAdmin.bind(null, citaId);

  return (
    <div className="w-full max-w-md px-6 py-8">
      <h1 className="text-2xl font-semibold">{servicio?.nombre}</h1>
      <p className="text-sm text-muted-foreground">
        {paciente?.nombre} — con {profesional?.nombre}
      </p>

      {reagendada && <p className="mt-4 text-sm text-green-600">Cita reagendada con éxito.</p>}
      {errorParam && <p className="mt-4 text-sm text-red-600">{errorParam}</p>}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Detalle</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <p>
            {capitalizar(
              formatInTimeZone(new Date(cita.fecha_inicio), ZONA_HORARIA, "EEEE d 'de' MMMM, HH:mm", {
                locale: es,
              }),
            )}{" "}
            — {formatInTimeZone(new Date(cita.fecha_fin), ZONA_HORARIA, "HH:mm")} hs
          </p>
          {paciente?.telefono && <p>Teléfono: {paciente.telefono}</p>}
          <Badge className="w-fit" variant={cita.estado === "cancelada" ? "destructive" : "default"}>
            {ESTADOS.find((e) => e.id === cita.estado)?.nombre ?? cita.estado}
          </Badge>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Cambiar estado</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={cambiarEstado} className="flex items-end gap-2">
            <LabeledSelect name="estado" items={ESTADOS} defaultValue={cita.estado} className="w-48" />
            <Button type="submit">Guardar</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Reagendar</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={reagendar} className="flex flex-wrap items-end gap-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="fechaInicio">Nueva fecha y hora</Label>
              <Input
                id="fechaInicio"
                name="fechaInicio"
                type="datetime-local"
                defaultValue={formatInTimeZone(
                  toZonedTime(new Date(cita.fecha_inicio), ZONA_HORARIA),
                  ZONA_HORARIA,
                  "yyyy-MM-dd'T'HH:mm",
                )}
                required
              />
            </div>
            <Button type="submit">Reagendar</Button>
          </form>
          <p className="mt-2 text-xs text-muted-foreground">
            Cancela esta cita y crea una nueva con el mismo profesional y servicio en el nuevo horario.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

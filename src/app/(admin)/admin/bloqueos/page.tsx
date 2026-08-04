import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import { es } from "date-fns/locale";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { agregarBloqueoGeneral, eliminarBloqueoGeneral } from "@/lib/bloqueos-generales/actions";
import { ZONA_HORARIA } from "@/lib/tiempo";

export default async function BloqueosGeneralesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data: bloqueos } = await supabase
    .from("bloqueos")
    .select("id, fecha_inicio, fecha_fin, motivo")
    .is("profesional_id", null)
    .order("fecha_inicio");

  return (
    <div className="w-full max-w-2xl px-6 py-8">
      <h1 className="text-2xl font-semibold">Bloqueos generales del centro</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Feriados o cierres que bloquean la disponibilidad de todos los profesionales.
      </p>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Bloqueos cargados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            {(bloqueos ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">
                Todavía no hay bloqueos generales cargados.
              </p>
            )}
            {(bloqueos ?? []).map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between rounded border px-3 py-2 text-sm"
              >
                <span>
                  {formatInTimeZone(new Date(b.fecha_inicio), ZONA_HORARIA, "d MMM HH:mm", {
                    locale: es,
                  })}{" "}
                  —{" "}
                  {formatInTimeZone(new Date(b.fecha_fin), ZONA_HORARIA, "d MMM HH:mm", {
                    locale: es,
                  })}
                  {b.motivo && ` · ${b.motivo}`}
                </span>
                <form action={eliminarBloqueoGeneral.bind(null, b.id)}>
                  <Button type="submit" variant="ghost" size="sm">
                    Eliminar
                  </Button>
                </form>
              </div>
            ))}
          </div>

          <form action={agregarBloqueoGeneral} className="mt-4 flex flex-wrap items-end gap-2">
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
              <Input id="motivo" name="motivo" placeholder="Feriado / cierre del centro" />
            </div>
            <Button type="submit">Agregar</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

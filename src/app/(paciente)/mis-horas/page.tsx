import Link from "next/link";
import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ZONA_HORARIA } from "@/lib/tiempo";
import { cancelarCitaPaciente } from "@/lib/citas/actions";
import { puedeGestionarCita } from "@/lib/citas/reglas";

type CitaRow = {
  id: string;
  fecha_inicio: string;
  estado: string;
  servicios: { nombre: string } | { nombre: string }[] | null;
  profesionales: { nombre: string } | { nombre: string }[] | null;
};

function unico<T>(valor: T | T[] | null): T | null {
  if (!valor) return null;
  return Array.isArray(valor) ? (valor[0] ?? null) : valor;
}

function capitalizar(texto: string) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

const ESTADO_LABEL: Record<string, string> = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  cancelada: "Cancelada",
  completada: "Completada",
  no_asistio: "No asistió",
};

export default async function MisHorasPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; cancelada?: string; reagendada?: string }>;
}) {
  const { error, cancelada, reagendada } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("citas")
    .select("id, fecha_inicio, estado, servicios(nombre), profesionales(nombre)")
    .eq("paciente_id", user!.id)
    .order("fecha_inicio", { ascending: false });

  const citas = (data ?? []) as CitaRow[];

  return (
    <div className="flex flex-1 flex-col items-center px-6 py-16">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Mis horas</h1>
          <Link href="/reservar">
            <Button size="sm">Reservar hora</Button>
          </Link>
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        {cancelada && <p className="mt-4 text-sm text-green-600">Cita cancelada.</p>}
        {reagendada && <p className="mt-4 text-sm text-green-600">Cita reagendada con éxito.</p>}

        {citas.length === 0 ? (
          <p className="mt-8 text-sm text-muted-foreground">
            Todavía no tenés horas reservadas.
          </p>
        ) : (
          <div className="mt-6 flex flex-col gap-3">
            {citas.map((cita) => {
              const servicio = unico(cita.servicios);
              const profesional = unico(cita.profesionales);
              const gestionable = puedeGestionarCita(cita.fecha_inicio, cita.estado);
              return (
                <Card key={cita.id}>
                  <CardHeader className="flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-base">{servicio?.nombre}</CardTitle>
                    <Badge variant={cita.estado === "cancelada" ? "destructive" : "default"}>
                      {ESTADO_LABEL[cita.estado] ?? cita.estado}
                    </Badge>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    {capitalizar(
                      formatInTimeZone(
                        new Date(cita.fecha_inicio),
                        ZONA_HORARIA,
                        "EEEE d 'de' MMMM, HH:mm 'hs'",
                        { locale: es },
                      ),
                    )}
                    {profesional && ` — con ${profesional.nombre}`}
                    {gestionable && (
                      <div className="mt-3 flex gap-2">
                        <Link href={`/mis-horas/${cita.id}/reagendar`}>
                          <Button size="sm" variant="outline">
                            Reagendar
                          </Button>
                        </Link>
                        <form action={cancelarCitaPaciente.bind(null, cita.id)}>
                          <Button size="sm" variant="ghost" type="submit">
                            Cancelar
                          </Button>
                        </form>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

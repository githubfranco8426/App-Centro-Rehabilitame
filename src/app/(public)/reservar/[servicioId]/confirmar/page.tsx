import { notFound } from "next/navigation";
import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmarReservaForm } from "@/components/reservar/confirmar-form";
import { ZONA_HORARIA } from "@/lib/tiempo";
import { formatCLP } from "@/lib/dinero";

function capitalizar(texto: string) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export default async function ConfirmarReservaPage({
  params,
  searchParams,
}: {
  params: Promise<{ servicioId: string }>;
  searchParams: Promise<{ profesional?: string; fechaInicio?: string; fechaFin?: string }>;
}) {
  const { servicioId } = await params;
  const { profesional: profesionalId, fechaInicio, fechaFin } = await searchParams;

  if (!profesionalId || !fechaInicio || !fechaFin) notFound();

  const supabase = await createClient();

  const { data: servicio } = await supabase
    .from("servicios")
    .select("nombre, duracion_minutos, precio")
    .eq("id", servicioId)
    .single();

  const { data: profesional } = await supabase
    .from("profesionales")
    .select("nombre")
    .eq("id", profesionalId)
    .single();

  if (!servicio || !profesional) notFound();

  return (
    <div className="flex flex-1 flex-col items-center px-6 py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Confirmar reserva</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 rounded-lg bg-muted p-4 text-sm">
            <p className="font-medium">{servicio.nombre}</p>
            <p className="text-muted-foreground">
              {servicio.duracion_minutos} min con {profesional.nombre}
              {servicio.precio != null && ` — ${formatCLP(servicio.precio)}`}
            </p>
            <p className="mt-1 text-muted-foreground">
              {capitalizar(
                formatInTimeZone(new Date(fechaInicio), ZONA_HORARIA, "EEEE d 'de' MMMM, HH:mm 'hs'", {
                  locale: es,
                }),
              )}
            </p>
          </div>

          <ConfirmarReservaForm
            servicioId={servicioId}
            profesionalId={profesionalId}
            fechaInicio={fechaInicio}
            fechaFin={fechaFin}
          />
        </CardContent>
      </Card>
    </div>
  );
}

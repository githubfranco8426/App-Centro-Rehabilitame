import { notFound } from "next/navigation";
import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import { createClient } from "@/lib/supabase/server";
import { ConfirmarReservaForm } from "@/components/reservar/confirmar-form";
import { ZONA_HORARIA } from "@/lib/tiempo";
import { LiquidBackground } from "@/components/liquid-background";
import { ReservaPasos } from "@/components/reservar/reserva-pasos";
import { ReservaResumen } from "@/components/reservar/reserva-resumen";

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

  const fechaTexto = capitalizar(
    formatInTimeZone(new Date(fechaInicio), ZONA_HORARIA, "EEEE d 'de' MMMM, HH:mm 'hs'", {
      locale: es,
    }),
  );

  return (
    <div className="relative flex flex-1 flex-col items-center overflow-hidden bg-zinc-50 dark:bg-black">
      <LiquidBackground photo />

      <main className="relative grid w-full max-w-4xl flex-1 gap-6 px-6 py-16 lg:grid-cols-[1fr_18rem]">
        <div className="flex flex-col gap-6">
          <ReservaPasos pasoActual={3} servicioId={servicioId} titulo="Creá tu cuenta para confirmar" />

          <div className="glass-panel animate-in fade-in slide-in-from-bottom-4 rounded-3xl border border-white/40 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] delay-100 duration-700 sm:p-6 dark:border-white/10 dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)]">
            <ConfirmarReservaForm
              servicioId={servicioId}
              profesionalId={profesionalId}
              fechaInicio={fechaInicio}
              fechaFin={fechaFin}
            />
          </div>
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <ReservaResumen
            servicioNombre={servicio.nombre}
            duracionMinutos={servicio.duracion_minutos}
            precio={servicio.precio}
            profesionalNombre={profesional.nombre}
            fechaTexto={fechaTexto}
          />
        </div>
      </main>
    </div>
  );
}

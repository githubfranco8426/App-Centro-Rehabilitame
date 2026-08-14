import { createClient } from "@/lib/supabase/server";
import { obtenerContactoBorrador } from "@/lib/citas/borrador-contacto";
import { LiquidBackground } from "@/components/liquid-background";
import { ReservaPasos } from "@/components/reservar/reserva-pasos";
import { RutForm, DatosContactoForm } from "@/components/reservar/identificacion-form";

export default async function IdentificacionPage({
  searchParams,
}: {
  searchParams: Promise<{ especialidad?: string }>;
}) {
  const { especialidad: especialidadId } = await searchParams;

  let especialidadNombre: string | null = null;
  if (especialidadId) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("especialidades")
      .select("nombre")
      .eq("id", especialidadId)
      .maybeSingle();
    especialidadNombre = data?.nombre ?? null;
  }

  // Si ya se guardó un RUT pero todavía faltan nombre/teléfono/email, es un
  // paciente nuevo: paso 1b. Si no hay nada guardado (o expiró), paso 1a.
  const borrador = await obtenerContactoBorrador();
  const faltanDatos = borrador?.rut && (!borrador.nombre || !borrador.telefono || !borrador.email);

  return (
    <div className="relative flex flex-1 flex-col items-center overflow-hidden bg-zinc-50 dark:bg-black">
      <LiquidBackground photo />

      <main className="relative flex w-full max-w-xl flex-1 flex-col gap-6 px-6 py-16">
        <ReservaPasos
          pasoActual={1}
          especialidadId={especialidadId}
          titulo={especialidadNombre ? `Reservar hora — ${especialidadNombre}` : "Reservar hora"}
        />

        <div className="glass-panel animate-in fade-in slide-in-from-bottom-4 rounded-3xl border border-white/40 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] delay-100 duration-700 sm:p-6 dark:border-white/10 dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)]">
          {faltanDatos ? (
            <DatosContactoForm rut={borrador!.rut} especialidadId={especialidadId} />
          ) : (
            <RutForm especialidadId={especialidadId} />
          )}
        </div>
      </main>
    </div>
  );
}

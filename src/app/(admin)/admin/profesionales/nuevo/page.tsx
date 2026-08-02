import { createClient } from "@/lib/supabase/server";
import { crearProfesional } from "@/lib/profesionales/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LabeledSelect } from "@/components/admin/labeled-select";

export default async function NuevoProfesionalPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: especialidades } = await supabase.from("especialidades").select("id, nombre").order("nombre");
  const { data: sedes } = await supabase.from("sedes").select("id, nombre").order("nombre");

  const sedeUnica = sedes && sedes.length === 1 ? sedes[0] : null;

  return (
    <div className="w-full max-w-md px-6 py-8">
      <h1 className="text-2xl font-semibold">Nuevo profesional</h1>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <form action={crearProfesional} className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="nombre">Nombre completo</Label>
          <Input id="nombre" name="nombre" required />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="especialidadId">Especialidad</Label>
          <LabeledSelect
            name="especialidadId"
            items={especialidades ?? []}
            placeholder="Elegí una especialidad"
          />
        </div>

        {sedeUnica ? (
          <input type="hidden" name="sedeId" value={sedeUnica.id} />
        ) : (
          <div className="flex flex-col gap-2">
            <Label htmlFor="sedeId">Sede</Label>
            <LabeledSelect name="sedeId" items={sedes ?? []} placeholder="Elegí una sede" />
          </div>
        )}

        <Button type="submit">Crear profesional</Button>
      </form>
    </div>
  );
}

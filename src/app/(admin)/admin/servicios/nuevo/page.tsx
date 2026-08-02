import { createClient } from "@/lib/supabase/server";
import { crearServicio } from "@/lib/servicios/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LabeledSelect } from "@/components/admin/labeled-select";

export default async function NuevoServicioPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: especialidades } = await supabase.from("especialidades").select("id, nombre").order("nombre");

  return (
    <div className="w-full max-w-md px-6 py-8">
      <h1 className="text-2xl font-semibold">Nuevo servicio</h1>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <form action={crearServicio} className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="nombre">Nombre</Label>
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

        <div className="flex flex-col gap-2">
          <Label htmlFor="duracionMinutos">Duración (minutos)</Label>
          <Input id="duracionMinutos" name="duracionMinutos" type="number" min={1} step={1} defaultValue={30} required />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="precio">Precio (CLP)</Label>
          <Input id="precio" name="precio" type="number" min={0} step={1} required />
        </div>

        <Button type="submit">Crear servicio</Button>
      </form>
    </div>
  );
}

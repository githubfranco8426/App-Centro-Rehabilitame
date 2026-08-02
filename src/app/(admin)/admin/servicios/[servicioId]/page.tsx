import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LabeledSelect } from "@/components/admin/labeled-select";
import { actualizarServicio } from "@/lib/servicios/actions";

export default async function EditarServicioPage({
  params,
  searchParams,
}: {
  params: Promise<{ servicioId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { servicioId } = await params;
  const { error: errorParam } = await searchParams;
  const supabase = await createClient();

  const { data: servicio } = await supabase
    .from("servicios")
    .select("id, nombre, activo, especialidad_id, duracion_minutos, precio")
    .eq("id", servicioId)
    .single();

  if (!servicio) notFound();

  const { data: especialidades } = await supabase
    .from("especialidades")
    .select("id, nombre")
    .order("nombre");

  const actualizar = actualizarServicio.bind(null, servicioId);

  return (
    <div className="w-full max-w-md px-6 py-8">
      <h1 className="text-2xl font-semibold">{servicio.nombre}</h1>

      {errorParam && <p className="mt-4 text-sm text-red-600">{errorParam}</p>}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Datos del servicio</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={actualizar} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" name="nombre" defaultValue={servicio.nombre} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="especialidadId">Especialidad</Label>
              <LabeledSelect
                name="especialidadId"
                items={especialidades ?? []}
                defaultValue={servicio.especialidad_id}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="duracionMinutos">Duración (minutos)</Label>
              <Input
                id="duracionMinutos"
                name="duracionMinutos"
                type="number"
                min={1}
                step={1}
                defaultValue={servicio.duracion_minutos}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="precio">Precio (CLP)</Label>
              <Input
                id="precio"
                name="precio"
                type="number"
                min={0}
                step={1}
                defaultValue={servicio.precio ?? undefined}
                required
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="activo" defaultChecked={servicio.activo} />
              Activo (visible para reservar)
            </label>
            <Button type="submit" className="self-start">
              Guardar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

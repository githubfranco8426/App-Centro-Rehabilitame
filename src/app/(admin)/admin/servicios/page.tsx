import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatCLP } from "@/lib/dinero";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function unico<T>(valor: T | T[] | null): T | null {
  if (!valor) return null;
  return Array.isArray(valor) ? (valor[0] ?? null) : valor;
}

export default async function ServiciosPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("servicios")
    .select("id, nombre, duracion_minutos, precio, activo, especialidades(nombre)")
    .order("nombre");

  const servicios = data ?? [];

  return (
    <div className="w-full px-6 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Servicios</h1>
        <Link href="/admin/servicios/nuevo">
          <Button>Nuevo servicio</Button>
        </Link>
      </div>

      <Table className="mt-6">
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Especialidad</TableHead>
            <TableHead>Duración</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {servicios.map((s) => {
            const especialidad = unico(s.especialidades);
            return (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.nombre}</TableCell>
                <TableCell>{especialidad?.nombre}</TableCell>
                <TableCell>{s.duracion_minutos} min</TableCell>
                <TableCell>{s.precio != null ? formatCLP(s.precio) : "—"}</TableCell>
                <TableCell>
                  <Badge variant={s.activo ? "default" : "outline"}>
                    {s.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/admin/servicios/${s.id}`} className="text-sm underline">
                    Editar
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

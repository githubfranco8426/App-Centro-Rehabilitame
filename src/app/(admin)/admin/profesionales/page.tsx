import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function unico<T>(valor: T | T[] | null): T | null {
  if (!valor) return null;
  return Array.isArray(valor) ? (valor[0] ?? null) : valor;
}

export default async function ProfesionalesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profesionales")
    .select("id, nombre, activo, especialidades(nombre)")
    .order("nombre");

  const profesionales = data ?? [];

  return (
    <div className="w-full px-6 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Profesionales</h1>
        <Link href="/admin/profesionales/nuevo">
          <Button>Nuevo profesional</Button>
        </Link>
      </div>

      <Table className="mt-6">
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Especialidad</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {profesionales.map((p) => {
            const especialidad = unico(p.especialidades);
            return (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.nombre}</TableCell>
                <TableCell>{especialidad?.nombre}</TableCell>
                <TableCell>
                  <Badge variant={p.activo ? "default" : "outline"}>
                    {p.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/admin/profesionales/${p.id}`} className="text-sm underline">
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

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const especialidades = [
  {
    nombre: "Kinesiología",
    descripcion: "Respiratorio infantil, respiratorio adulto y maxilofacial.",
  },
  {
    nombre: "Fonoaudiología",
    descripcion: "Frenillo lingual corto, lactancia, respiración oral y neuro-adultos.",
  },
  {
    nombre: "Terapia Ocupacional",
    descripcion: "Servicios a definir por el equipo del centro.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 dark:bg-black">
      <main className="flex w-full max-w-3xl flex-1 flex-col items-center gap-10 px-6 py-24 sm:items-start">
        <div className="flex flex-col gap-3 text-center sm:text-left">
          <h1 className="text-3xl font-semibold tracking-tight">
            Centro de Rehabilitación
          </h1>
          <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
            Reservá tu hora online con nuestros profesionales.
          </p>
        </div>

        <div className="grid w-full gap-4 sm:grid-cols-3">
          {especialidades.map((especialidad) => (
            <Card key={especialidad.nombre}>
              <CardHeader>
                <CardTitle>{especialidad.nombre}</CardTitle>
                <CardDescription>{especialidad.descripcion}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Button size="lg" disabled>
          Reservar hora (próximamente)
        </Button>
      </main>
    </div>
  );
}

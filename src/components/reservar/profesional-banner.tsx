import Image from "next/image";
import { fotoProfesional } from "@/lib/profesionales-ui";

export function ProfesionalBanner({
  nombre,
  especialidad,
}: {
  nombre: string;
  especialidad?: string;
}) {
  const foto = fotoProfesional[nombre];
  if (!foto) return null;

  return (
    <div className="glass-panel animate-in fade-in slide-in-from-bottom-4 flex items-center gap-4 rounded-3xl border border-white/40 p-4 shadow-[0_8px_30px_rgb(0,0,0,0.06)] duration-700 dark:border-white/10 dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)]">
      <div className="relative shrink-0 rounded-full p-0.5">
        <div className="glass-specular absolute inset-0 rounded-full" />
        <Image
          src={foto}
          alt={nombre}
          width={64}
          height={64}
          className="relative size-16 rounded-full object-cover ring-1 ring-white/60 dark:ring-white/15"
        />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">Te atiende</p>
        <p className="font-heading text-base font-medium">{nombre}</p>
        {especialidad && <p className="text-xs text-muted-foreground">{especialidad}</p>}
      </div>
    </div>
  );
}

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin } from "lucide-react";
import { LiquidBackground } from "@/components/liquid-background";

export default function Home() {
  return (
    <div className="relative flex flex-1 overflow-hidden bg-background">
      <LiquidBackground />

      <main className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-6 pb-16 pt-12 md:px-10 md:py-20 lg:grid-cols-2">
        <div className="max-w-xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/75 px-4 py-2 text-sm font-medium text-primary">
            <MapPin className="size-4" aria-hidden="true" />
            Iquique y Alto Hospicio
          </p>
          <h1 className="font-heading mt-7 text-balance text-4xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Agenda tu atención con rehabilita.me
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-foreground/75">
            Kinesiología y fonoaudiología para ti y tu familia. Elige el área que necesitas y encuentra una hora disponible.
          </p>
          <Link
            href="/reservar"
            className="mt-9 inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/15 transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Agendar una hora
            <ArrowRight className="size-5" aria-hidden="true" />
          </Link>
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
            Atención en consulta, a domicilio y online según el servicio.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4" aria-label="Profesionales del centro">
          <div className="overflow-hidden rounded-[1.75rem] bg-white shadow-[0_20px_50px_-30px_rgba(27,54,93,.4)]">
            <div className="relative h-64 sm:h-80">
              <Image src="/profesionales/franco.png" alt="Franco Tabilo, kinesiólogo" fill priority sizes="(max-width: 1024px) 50vw, 260px" className="object-cover object-top" />
            </div>
            <div className="p-4">
              <p className="font-heading font-semibold text-foreground">Franco Tabilo</p>
              <p className="mt-1 text-sm text-muted-foreground">Kinesiología</p>
            </div>
          </div>
          <div className="mt-9 overflow-hidden rounded-[1.75rem] bg-white shadow-[0_20px_50px_-30px_rgba(27,54,93,.4)]">
            <div className="relative h-64 sm:h-80">
              <Image src="/profesionales/barbara.png" alt="Bárbara Covarrubias, fonoaudióloga" fill priority sizes="(max-width: 1024px) 50vw, 260px" className="object-cover object-top" />
            </div>
            <div className="p-4">
              <p className="font-heading font-semibold text-foreground">Bárbara Covarrubias</p>
              <p className="mt-1 text-sm text-muted-foreground">Fonoaudiología</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

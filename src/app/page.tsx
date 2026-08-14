import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { LiquidBackground } from "@/components/liquid-background";

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col items-center overflow-hidden bg-zinc-50 dark:bg-black">
      <LiquidBackground photo />

      <main className="relative flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-12 px-6 py-24 sm:items-start">
        <div
          className="glass-panel animate-in fade-in slide-in-from-bottom-4 flex flex-col items-center gap-4 rounded-4xl border border-white/40 p-8 text-center shadow-[0_8px_40px_rgb(0,0,0,0.06)] duration-700 sm:items-start sm:text-left dark:border-white/10 dark:shadow-[0_8px_40px_rgb(0,0,0,0.4)]"
        >
          <div className="relative rounded-full p-1">
            <div className="glass-specular absolute inset-0 rounded-full" />
            <Image
              src="/logo.jpg"
              alt="Centro Rehabilita.me"
              width={96}
              height={96}
              className="relative size-24 rounded-full object-cover ring-1 ring-white/60 dark:ring-white/15"
              priority
            />
          </div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Centro Rehabilita.me
          </h1>
          <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
            Reservá tu hora online con nuestros profesionales.
          </p>
        </div>

        <Link
          href="/reservar"
          className="animate-in fade-in slide-in-from-bottom-4 group relative flex items-center gap-3 overflow-hidden rounded-full border border-white/40 px-8 py-4 shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgb(0,0,0,0.12)] dark:border-white/10 dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)]"
          style={{ animationDelay: "150ms", animationDuration: "700ms" }}
        >
          <div className="glass-panel absolute inset-0" />
          <div className="glass-specular absolute inset-0" />
          <span className="relative font-heading text-lg font-medium">Agendar hora</span>
          <ArrowRight className="relative size-5 transition-transform group-hover:translate-x-1" />
        </Link>
      </main>
    </div>
  );
}

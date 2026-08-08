import Image from "next/image";

export function LiquidBackground({ photo = false }: { photo?: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {photo && (
        <>
          <Image
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop"
            alt=""
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-zinc-50/70 dark:bg-black/70" />
        </>
      )}
      <div className="animate-float-slow absolute -top-24 -left-24 size-96 rounded-full bg-primary/25 blur-3xl dark:bg-primary/15" />
      <div className="animate-float-slower absolute top-1/3 -right-32 size-[28rem] rounded-full bg-accent/25 blur-3xl dark:bg-accent/15" />
      <div className="animate-float-slow absolute -bottom-32 left-1/4 size-96 rounded-full bg-emerald-500/20 blur-3xl dark:bg-emerald-500/10" />
    </div>
  );
}

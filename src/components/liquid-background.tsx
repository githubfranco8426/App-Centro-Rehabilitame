export function LiquidBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="animate-float-slow absolute -top-24 -left-24 size-96 rounded-full bg-primary/25 blur-3xl dark:bg-primary/15" />
      <div className="animate-float-slower absolute top-1/3 -right-32 size-[28rem] rounded-full bg-accent/25 blur-3xl dark:bg-accent/15" />
      <div className="animate-float-slow absolute -bottom-32 left-1/4 size-96 rounded-full bg-emerald-500/20 blur-3xl dark:bg-emerald-500/10" />
    </div>
  );
}

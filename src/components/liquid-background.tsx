export function LiquidBackground({ photo = false }: { photo?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{
        background: photo
          ? "linear-gradient(145deg, #f2f6f8 0%, #fbfaf7 55%, #f4efe6 100%)"
          : "linear-gradient(145deg, #f2f6f8 0%, #fbfaf7 65%, #f4efe6 100%)",
      }}
    >
      <div className="absolute -left-24 top-0 size-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -right-20 bottom-0 size-96 rounded-full bg-accent/10 blur-3xl" />
    </div>
  );
}

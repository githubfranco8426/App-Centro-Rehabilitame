import Link from "next/link";
import { LiquidBackground } from "@/components/liquid-background";

const NAV_LINKS = [
  { href: "/admin", label: "Agenda" },
  { href: "/admin/profesionales", label: "Profesionales" },
  { href: "/admin/servicios", label: "Servicios" },
  { href: "/admin/bloqueos", label: "Bloqueos" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-zinc-50 dark:bg-black">
      <LiquidBackground />

      <nav className="glass-panel relative z-10 flex gap-1 border-b border-white/40 px-6 py-3 dark:border-white/10">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="relative z-10 flex flex-1">{children}</div>
    </div>
  );
}

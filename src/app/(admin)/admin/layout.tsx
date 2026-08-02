import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <nav className="flex gap-4 border-b bg-muted/40 px-6 py-2 text-sm">
        <Link href="/admin" className="hover:underline">
          Agenda
        </Link>
        <Link href="/admin/profesionales" className="hover:underline">
          Profesionales
        </Link>
      </nav>
      <div className="flex flex-1">{children}</div>
    </div>
  );
}

import { requireSession } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSession();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-sidebar shrink-0 border-r border-border bg-surface md:block">
        <div className="p-4 font-display text-h3 text-foreground-primary">
          Rehearsal
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

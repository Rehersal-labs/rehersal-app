"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import type { AuthSession } from "@/types";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";

interface AppShellProps {
  session: AuthSession;
  pendingAssignments?: number;
  children: React.ReactNode;
}

export function AppShell({
  session,
  pendingAssignments,
  children,
}: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 mesh-bg opacity-40 -z-10" />
      <div className="pointer-events-none fixed -left-48 top-0 h-96 w-96 rounded-full bg-violet-600/[0.08] blur-[120px] -z-10" />
      <div className="pointer-events-none fixed -right-48 bottom-0 h-96 w-96 rounded-full bg-indigo-500/[0.08] blur-[120px] animate-float-slow -z-10" />
      <div className="pointer-events-none fixed left-1/3 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-blue-500/[0.05] blur-[100px] animate-glow-pulse -z-10" />

      <Sidebar
        session={session}
        pendingAssignments={pendingAssignments}
        className="hidden md:flex"
      />

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-sidebar p-0 bg-surface border-border-subtle">
          <Sidebar
            session={session}
            pendingAssignments={pendingAssignments}
            onNavigate={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-border-subtle bg-surface/90 px-4 py-3 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="h-9 w-9"
          >
            <Menu className="h-5 w-5" strokeWidth={1.5} />
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent/20">
              <span className="text-accent font-display text-caption font-bold">R</span>
            </div>
            <span className="font-display text-h3 text-foreground-primary">Rehearsal</span>
          </div>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

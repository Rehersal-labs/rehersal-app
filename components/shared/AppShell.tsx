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
    <div className="flex min-h-screen">
      {/* Ambient background orbs */}
      <div className="pointer-events-none fixed inset-0 mesh-bg opacity-30 -z-10" />
      <div className="pointer-events-none fixed -left-32 top-20 h-72 w-72 rounded-full bg-amber-500/10 blur-[100px] animate-float -z-10" />
      <div className="pointer-events-none fixed -right-32 bottom-20 h-80 w-80 rounded-full bg-orange-600/10 blur-[120px] animate-float-slow -z-10" />
      <div className="pointer-events-none fixed left-1/2 top-1/3 h-56 w-56 -translate-x-1/2 rounded-full bg-yellow-500/5 blur-[80px] animate-glow-pulse -z-10" />
      <Sidebar
        session={session}
        pendingAssignments={pendingAssignments}
        className="hidden md:flex"
      />

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-sidebar p-0">
          <Sidebar
            session={session}
            pendingAssignments={pendingAssignments}
            onNavigate={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center border-b border-border bg-surface px-4 py-3 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" strokeWidth={1.5} />
          </Button>
          <span className="ml-3 font-display text-h3">Rehearsal</span>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

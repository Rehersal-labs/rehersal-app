"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Library,
  Settings,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { canManageTeam, isTeamMode } from "@/lib/auth-utils";
import type { AuthSession } from "@/types";

const baseNav = [
  { href: "/dashboard",  label: "Dashboard",  icon: LayoutDashboard },
  { href: "/targets",    label: "Targets",    icon: Target },
  { href: "/documents",  label: "Documents",  icon: FileText },
  { href: "/scenarios",  label: "Scenarios",  icon: ClipboardList },
  { href: "/library",    label: "Library",    icon: Library },
  { href: "/progress",   label: "Progress",   icon: TrendingUp },
];

interface SidebarProps {
  session: AuthSession;
  pendingAssignments?: number;
  className?: string;
  onNavigate?: () => void;
}

export function Sidebar({ session, pendingAssignments = 0, className, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const team  = isTeamMode(session.organization);
  const coach = canManageTeam(session.membership.role);

  const nav = [...baseNav];
  if (team) nav.push({ href: "/assignments", label: "Assignments", icon: BookOpen });
  if (team && coach) nav.push({ href: "/admin", label: "Admin", icon: Users });

  const initials =
    session.user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? session.user.email[0]?.toUpperCase() ?? "?";

  const roleColor =
    session.membership.role === "owner"  ? "bg-violet-500/20 text-violet-300" :
    session.membership.role === "coach"  ? "bg-blue-500/20 text-blue-300" :
    "bg-surface-elevated text-foreground-tertiary";

  return (
    <aside
      className={cn(
        "flex h-full w-sidebar flex-col",
        "border-r border-border-subtle bg-surface",
        className
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border-subtle">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20 ring-1 ring-accent/30">
          <span className="text-accent font-display text-small font-bold">R</span>
        </div>
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="font-display text-h3 text-foreground-primary tracking-tight"
        >
          Rehearsal
        </Link>
      </div>

      {/* Workspace chip */}
      <div className="px-4 py-3 border-b border-border-subtle">
        <p className="truncate text-caption font-mono uppercase text-foreground-tertiary tracking-wider">
          {session.organization.name}
        </p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 space-y-0.5 p-3 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          const showBadge = href === "/assignments" && pendingAssignments > 0;

          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-small transition-all duration-150",
                active
                  ? "bg-accent/15 text-foreground-primary"
                  : "text-foreground-secondary hover:bg-surface-elevated hover:text-foreground-primary"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  active ? "text-accent" : "text-foreground-tertiary group-hover:text-foreground-secondary"
                )}
                strokeWidth={active ? 2 : 1.5}
              />
              <span className="flex-1 font-medium">{label}</span>
              {active && (
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              )}
              {showBadge && (
                <span className="rounded-full bg-accent px-1.5 py-0.5 text-caption font-bold text-white">
                  {pendingAssignments}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-border-subtle p-3 space-y-1">
        <Link
          href="/settings"
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-small text-foreground-secondary transition-colors hover:bg-surface-elevated hover:text-foreground-primary",
            pathname === "/settings" && "bg-surface-elevated text-foreground-primary"
          )}
        >
          <Settings className="h-4 w-4 text-foreground-tertiary" strokeWidth={1.5} />
          <span>Settings</span>
        </Link>

        <div className="flex items-center gap-3 px-3 py-2">
          {/* Avatar */}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/20 ring-1 ring-accent/30">
            <span className="text-caption font-bold text-accent">{initials}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-small font-medium text-foreground-primary leading-tight">
              {session.user.name ?? session.user.email}
            </p>
            <span className={cn(
              "mt-0.5 inline-block rounded px-1.5 py-0.5 text-caption font-mono uppercase tracking-wider",
              roleColor
            )}>
              {session.membership.role}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

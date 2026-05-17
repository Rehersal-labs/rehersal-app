"use client";

import Link from "next/link";
import { ArrowRight, FileText, Plus, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { TeamPulseBand } from "@/components/admin/TeamPulseBand";
import { TargetCard } from "@/components/targets/TargetCard";
import { ScenarioCard } from "@/components/scenarios/ScenarioCard";
import { useScenarios, useSessions, useTargets } from "@/lib/hooks/use-api";
import { CONVERSATION_TYPES } from "@/lib/constants";
import { WeekHeatmap } from "@/components/dashboard/WeekHeatmap";
import { StreakTracker } from "@/components/progress/StreakTracker";
import {
  computeStreak,
  formatDate,
  getGreeting,
  scoreDescriptor,
  weekSessionCounts,
} from "@/lib/utils";
import { cn } from "@/lib/utils";

const QUICK_ACTIONS = [
  {
    href: "/scenarios/new",
    icon: Zap,
    label: "Start a rehearsal",
    desc: "Jump into a live session",
    primary: true,
  },
  {
    href: "/targets/new",
    icon: Target,
    label: "Build a target",
    desc: "Add a person to practise with",
    primary: false,
  },
  {
    href: "/documents",
    icon: FileText,
    label: "Add context",
    desc: "Upload docs the avatar uses",
    primary: false,
  },
];

export function DashboardContent({
  userName,
  isCoach,
  isTeam,
}: {
  userName: string;
  isCoach: boolean;
  isTeam: boolean;
}) {
  const { data: targetsData, isLoading: targetsLoading } = useTargets({ status: "complete" });
  const { data: sessionsData, isLoading: sessionsLoading } = useSessions({ limit: 8 });
  const { data: scenariosData } = useScenarios();

  const targets   = targetsData?.targets ?? [];
  const sessions  = sessionsData?.sessions ?? [];
  const scenarios = scenariosData?.scenarios ?? [];
  const isNewUser = sessions.length === 0 && targets.length === 0;

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekSessions = sessions.filter((s) => new Date(s.session.created_at) >= weekAgo);
  const withEval = weekSessions.filter((s) => s.evaluation);
  const avgScore =
    withEval.length > 0
      ? Math.round(withEval.reduce((a, s) => a + s.evaluation!.overall_score, 0) / withEval.length)
      : null;

  /* ── New user onboarding ── */
  if (isNewUser) {
    return (
      <div className="mx-auto max-w-app space-y-10 p-4 sm:p-8 animate-fade-in-up">
        <div>
          <p className="font-mono text-caption uppercase tracking-widest text-accent mb-2">
            Getting started
          </p>
          <h1 className="font-display text-display-2 text-foreground-primary">
            Welcome, {userName}.
          </h1>
          <p className="mt-2 text-body-lg text-foreground-secondary">
            Your first rehearsal is three steps away.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              step: "01",
              title: "Pick a target",
              desc: "Browse the library and clone a personality profile.",
              href: "/library",
              cta: "Open Library →",
            },
            {
              step: "02",
              title: "Add your context",
              desc: "Upload meeting notes or background docs.",
              href: "/documents",
              cta: "Upload docs →",
            },
            {
              step: "03",
              title: "Run a rehearsal",
              desc: "Choose a scenario and go live with the avatar.",
              href: "/scenarios/new",
              cta: "Start session →",
            },
          ].map((item) => (
            <Link key={item.step} href={item.href} className="group block">
              <Card className="card-hover h-full border border-border-subtle bg-surface p-6 shadow-card">
                <span className="font-mono text-caption text-accent">{item.step}</span>
                <h2 className="mt-3 font-display text-h3 text-foreground-primary">{item.title}</h2>
                <p className="mt-1 text-small text-foreground-secondary">{item.desc}</p>
                <p className="mt-4 text-small font-medium text-accent">{item.cta}</p>
              </Card>
            </Link>
          ))}
        </div>

        <p className="text-small text-foreground-tertiary">
          Want a quick demo?{" "}
          <Link href="/library" className="text-accent hover:underline">
            Browse the library
          </Link>{" "}
          and clone any profile to get started instantly.
        </p>
      </div>
    );
  }

  /* ── Returning user dashboard ── */
  return (
    <div className="mx-auto max-w-app space-y-10 p-4 sm:p-8 animate-fade-in-up">
      {isTeam && isCoach && <TeamPulseBand />}

      {/* Header */}
      <div>
        <h1 className="font-display text-display-2 text-foreground-primary">
          {getGreeting()}, {userName}
        </h1>
        <p className="mt-2 text-body text-foreground-secondary">
          {weekSessions.length > 0
            ? <>
                {weekSessions.length} rehearsal{weekSessions.length === 1 ? "" : "s"} this week
                {avgScore != null && (
                  <span className="ml-2 inline-flex items-center gap-1 rounded-md bg-accent/15 px-2 py-0.5 font-mono text-caption text-accent">
                    avg {avgScore} — {scoreDescriptor(avgScore)}
                  </span>
                )}
              </>
            : "No rehearsals yet this week — let's change that."}
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid gap-3 sm:grid-cols-3">
        {QUICK_ACTIONS.map(({ href, icon: Icon, label, desc, primary }) => (
          <Link key={href} href={href} className="group block">
            <Card className={cn(
              "card-hover flex flex-col gap-3 border p-5 h-full",
              primary
                ? "border-accent/30 bg-accent/10 shadow-accent-glow"
                : "border-border-subtle bg-surface shadow-card"
            )}>
              <div className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg",
                primary ? "bg-accent/20" : "bg-surface-elevated"
              )}>
                <Icon className={cn("h-4 w-4", primary ? "text-accent" : "text-foreground-secondary")} strokeWidth={1.5} />
              </div>
              <div>
                <p className={cn("font-display text-h3", primary ? "text-accent" : "text-foreground-primary")}>
                  {label}
                </p>
                <p className="mt-0.5 text-small text-foreground-tertiary">{desc}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent sessions */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-h2 text-foreground-primary">Recent sessions</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/progress">View all <ArrowRight className="ml-1 h-3 w-3" /></Link>
          </Button>
        </div>
        {sessionsLoading ? (
          <LoadingSkeleton rows={2} />
        ) : sessions.length === 0 ? (
          <p className="text-small text-foreground-secondary">No sessions yet.</p>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {sessions.slice(0, 6).map(({ session: s, scenario, target, evaluation }) => {
              const typeLabel =
                CONVERSATION_TYPES.find((c) => c.id === scenario?.conversation_type)?.label ?? "Session";
              const score = evaluation?.overall_score;
              const scoreClass =
                score == null ? "" :
                score >= 75 ? "text-emerald-400" :
                score >= 50 ? "text-amber-400" : "text-rose-400";

              return (
                <Card
                  key={s.id}
                  className="card-hover min-w-[220px] shrink-0 border border-border-subtle bg-surface p-4 shadow-card"
                >
                  <p className="font-mono text-caption uppercase text-foreground-tertiary">{typeLabel}</p>
                  <p className="mt-1 font-display text-h3 text-foreground-primary line-clamp-1">
                    {target?.name ?? "Rehearsal"}
                  </p>
                  <p className="mt-0.5 font-mono text-caption text-foreground-tertiary">
                    {formatDate(s.created_at)}
                  </p>
                  {score != null && (
                    <p className={cn("mt-2 font-display text-h2 font-bold", scoreClass)}>
                      {score}
                      <span className="ml-1 font-sans text-caption text-foreground-tertiary">/ 100</span>
                    </p>
                  )}
                  <Button variant="ghost" size="sm" className="mt-3 h-7 px-2 text-accent hover:bg-accent/10" asChild>
                    <Link href={`/sessions/${s.id}`}>
                      Open report <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Targets */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-h2 text-foreground-primary">Your targets</h2>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/targets">View all <ArrowRight className="ml-1 h-3 w-3" /></Link>
            </Button>
          </div>
        </div>
        {targetsLoading ? (
          <LoadingSkeleton rows={3} />
        ) : targets.length === 0 ? (
          <p className="text-small text-foreground-secondary">
            No targets yet.{" "}
            <Link href="/library" className="text-accent hover:underline">Browse the library</Link> to add one.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {targets.slice(0, 6).map((t) => (
              <TargetCard key={t.id} target={t} />
            ))}
          </div>
        )}
        <Button variant="outline" size="sm" className="mt-4 border-border text-foreground-secondary hover:border-accent/40" asChild>
          <Link href="/targets/new">
            <Plus className="mr-2 h-4 w-4" /> New target
          </Link>
        </Button>
      </section>

      {/* Upcoming scenarios */}
      {scenarios.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-h2 text-foreground-primary">Ready to practice</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/scenarios">View all <ArrowRight className="ml-1 h-3 w-3" /></Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {scenarios.slice(0, 3).map((sc) => (
              <ScenarioCard
                key={sc.id}
                scenario={sc}
                target={targets.find((t) => t.id === sc.target_profile_id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Activity this week */}
      <section>
        <h2 className="font-display text-h2 text-foreground-primary mb-4">This week</h2>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
          <Card className="flex-1 border border-border-subtle bg-surface p-6 shadow-card">
            <p className="mb-3 text-small font-medium text-foreground-secondary">Session activity</p>
            <WeekHeatmap counts={weekSessionCounts(sessions.map((s) => s.session.created_at))} />
          </Card>
          <div className="sm:w-52">
            <StreakTracker streak={computeStreak(sessions.map((s) => s.session.created_at))} />
          </div>
        </div>
      </section>
    </div>
  );
}

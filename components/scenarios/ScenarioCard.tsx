"use client";

import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CONVERSATION_TYPES, DIFFICULTY_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { Scenario, TargetProfile } from "@/types";

const DIFFICULTY_COLORS = [
  "text-emerald-400",
  "text-blue-400",
  "text-amber-400",
  "text-orange-400",
  "text-rose-400",
];

export function ScenarioCard({
  scenario,
  target,
}: {
  scenario: Scenario;
  target?: TargetProfile;
}) {
  const typeLabel =
    CONVERSATION_TYPES.find((c) => c.id === scenario.conversation_type)?.label ??
    scenario.conversation_type;

  const difficultyColor = DIFFICULTY_COLORS[(scenario.difficulty ?? 3) - 1] ?? "text-foreground-tertiary";

  return (
    <Card className="card-hover flex flex-col border border-border-subtle bg-surface p-5 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <Badge
          variant="outline"
          className="border-indigo-500/30 bg-indigo-500/10 font-mono text-caption uppercase text-indigo-400"
        >
          {typeLabel}
        </Badge>
        <span className={`font-mono text-caption ${difficultyColor}`}>
          {DIFFICULTY_LABELS[(scenario.difficulty ?? 3) - 1]}
        </span>
      </div>

      <h2 className="mt-3 font-display text-h3 text-foreground-primary leading-snug">
        {scenario.title}
      </h2>
      <p className="mt-0.5 text-small text-foreground-secondary line-clamp-1">
        {target?.name ?? "No target assigned"}
      </p>

      <p className="mt-2 line-clamp-2 text-small text-foreground-tertiary leading-relaxed">
        {scenario.goal}
      </p>

      <div className="mt-4 flex items-center justify-between border-t border-border-subtle pt-4">
        <span className="flex items-center gap-1 font-mono text-caption text-foreground-tertiary">
          <Clock className="h-3 w-3" /> {scenario.duration_minutes} min · {formatDate(scenario.updated_at)}
        </span>
        <Button
          size="sm"
          className="bg-accent text-white hover:bg-accent/90"
          asChild
        >
          <Link href={`/scenarios/${scenario.id}`}>
            Open <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}

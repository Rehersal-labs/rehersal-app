"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import type { TargetProfile } from "@/types";

export function TargetCard({
  target,
  onLaunch,
}: {
  target: TargetProfile;
  onLaunch?: (id: string) => void;
}) {
  const isComplete = target.status === "complete";

  return (
    <Card className="card-hover flex flex-col border border-border-subtle bg-surface p-5 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <Badge
          variant="outline"
          className="border-border bg-surface-elevated font-mono text-caption uppercase text-foreground-tertiary"
        >
          {target.domain}
        </Badge>
        <span className={`flex items-center gap-1 text-caption font-mono ${isComplete ? "text-emerald-400" : "text-amber-400"}`}>
          {isComplete
            ? <><CheckCircle2 className="h-3 w-3" /> ready</>
            : <><Clock className="h-3 w-3" /> {target.status}</>
          }
        </span>
      </div>

      <h2 className="mt-3 font-display text-h3 text-foreground-primary leading-snug">
        {target.name}
      </h2>
      <p className="mt-0.5 text-small text-foreground-secondary line-clamp-1">
        {[target.title, target.company].filter(Boolean).join(" · ") || "—"}
      </p>

      <div className="mt-3 flex flex-wrap gap-3 text-caption font-mono text-foreground-tertiary">
        <span>{target.session_count} sessions</span>
        {target.accuracy_rating != null && (
          <span className="text-amber-400">★ {target.accuracy_rating.toFixed(1)}</span>
        )}
        <span>{formatDate(target.updated_at)}</span>
      </div>

      <div className="mt-4 flex gap-2 border-t border-border-subtle pt-4">
        <Button
          variant="outline"
          size="sm"
          className="border-border text-foreground-secondary hover:border-accent/40 hover:text-foreground-primary"
          asChild
        >
          <Link href={`/targets/${target.id}`}>View</Link>
        </Button>
        {onLaunch && isComplete && (
          <Button
            size="sm"
            className="flex-1 bg-accent text-white hover:bg-accent/90"
            onClick={() => onLaunch(target.id)}
          >
            Rehearse <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        )}
      </div>
    </Card>
  );
}

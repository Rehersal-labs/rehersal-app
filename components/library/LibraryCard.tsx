"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DOMAIN_LABELS } from "@/lib/constants";
import type { LibraryProfile } from "@/types";

export function LibraryCard({
  profile,
  onPreview,
  onClone,
  cloning,
}: {
  profile: LibraryProfile;
  onPreview: () => void;
  onClone: () => void;
  cloning?: boolean;
}) {
  return (
    <Card className="card-hover flex flex-col border border-border-subtle bg-surface p-5 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <Badge
          variant="outline"
          className="border-accent/30 bg-accent/10 font-mono text-caption uppercase text-accent"
        >
          {DOMAIN_LABELS[profile.domain]}
        </Badge>
        {profile.accuracy_rating != null && (
          <span className="font-mono text-caption text-amber-400">
            ★ {profile.accuracy_rating.toFixed(1)}
          </span>
        )}
      </div>

      <h2 className="mt-3 font-display text-h3 text-foreground-primary leading-snug">
        {profile.name}
      </h2>
      <p className="mt-0.5 text-small text-foreground-secondary line-clamp-1">
        {[profile.title, profile.company].filter(Boolean).join(" · ") || "—"}
      </p>

      <p className="mt-3 font-mono text-caption text-foreground-tertiary">
        {profile.usage_count} clones
      </p>

      <div className="mt-4 flex gap-2 border-t border-border-subtle pt-4">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 border-border text-foreground-secondary hover:border-accent/40 hover:text-foreground-primary"
          onClick={onPreview}
        >
          Preview
        </Button>
        <Button
          size="sm"
          className="flex-1 bg-accent text-white hover:bg-accent/90"
          disabled={cloning}
          onClick={onClone}
        >
          {cloning ? "Cloning…" : "Clone →"}
        </Button>
      </div>
    </Card>
  );
}

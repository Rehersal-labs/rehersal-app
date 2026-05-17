"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function QueryError({
  message = "Something went wrong.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-critical/30 bg-critical/5 p-8 text-center">
      <AlertTriangle className="h-8 w-8 text-critical mb-3" strokeWidth={1.5} />
      <p className="font-display text-h3 text-foreground-primary">Failed to load</p>
      <p className="mt-1 text-small text-foreground-secondary">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

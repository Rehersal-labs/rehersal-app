"use client";
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="mx-auto max-w-app flex flex-col items-center justify-center p-4 sm:p-8 py-24 text-center">
      <h2 className="font-display text-h1 text-foreground-primary">Could not load target</h2>
      <p className="mt-2 text-body text-foreground-secondary">{error.message || "An unexpected error occurred."}</p>
      <div className="mt-6 flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" asChild><Link href="/targets">Back to targets</Link></Button>
      </div>
    </div>
  );
}

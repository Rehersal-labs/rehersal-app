"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-app flex flex-col items-center justify-center p-4 sm:p-8 py-24 text-center">
      <h2 className="font-display text-h1 text-foreground-primary">
        Session unavailable
      </h2>
      <p className="mt-2 text-body text-foreground-secondary">
        {error.message || "This session could not be loaded."}
      </p>
      <div className="mt-6 flex gap-3">
        <Button variant="outline" onClick={() => router.push("/scenarios")}>
          Back to scenarios
        </Button>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}

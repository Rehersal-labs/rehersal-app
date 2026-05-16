import { Suspense } from "react";
import { SessionPageClient } from "@/components/sessions/SessionPageClient";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";

export default function SessionPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-app p-4 sm:p-8">
          <LoadingSkeleton rows={6} />
        </div>
      }
    >
      <SessionPageClient sessionId={params.id} />
    </Suspense>
  );
}

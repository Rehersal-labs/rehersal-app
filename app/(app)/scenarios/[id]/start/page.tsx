"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PreSessionChecklist } from "@/components/sessions/PreSessionChecklist";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { useDocuments, useScenario, useTarget } from "@/lib/hooks/use-api";

export default function ScenarioStartPage() {
  const params = useParams();
  const scenarioId = params.id as string;
  const { data, isLoading } = useScenario(scenarioId);
  const scenario = data?.scenario;
  const { data: targetData } = useTarget(scenario?.target_profile_id ?? "");
  const { data: docsData } = useDocuments();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-app p-4 sm:p-8">
        <LoadingSkeleton rows={6} />
      </div>
    );
  }

  if (!scenario || !targetData?.target) {
    return (
      <div className="mx-auto max-w-app p-4 sm:p-8">
        <p className="text-critical">Scenario or target not found.</p>
        <Button variant="ghost" className="mt-4" asChild>
          <Link href="/scenarios">Back to scenarios</Link>
        </Button>
      </div>
    );
  }

  if (targetData.target.status !== "complete") {
    return (
      <div className="mx-auto max-w-app space-y-4 p-4 sm:p-8">
        <p className="text-body text-foreground-secondary">
          Complete target reconstruction before starting a session.
        </p>
        <Button asChild>
          <Link href={`/targets/${targetData.target.id}`}>Open target</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-app p-4 sm:p-8">
      <PreSessionChecklist
        scenario={scenario}
        target={targetData.target}
        documents={docsData?.documents ?? []}
        onSessionReady={() => {
          /* navigation handled inside checklist */
        }}
      />
    </div>
  );
}

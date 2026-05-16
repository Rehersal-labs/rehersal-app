"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

/** Routes to pre-session checklist (consent + media) before creating a BP call. */
export function ScenarioStartButton({ scenarioId }: { scenarioId: string }) {
  return (
    <Button asChild>
      <Link href={`/scenarios/${scenarioId}/start`}>Start rehearsal</Link>
    </Button>
  );
}

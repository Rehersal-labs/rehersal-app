import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { createServiceSupabaseClient } from "@/lib/db";
import { RubricBuilder } from "@/components/admin/RubricBuilder";

export default async function RubricsPage() {
  const session = await requireSession();

  if (!["owner", "coach"].includes(session.membership.role)) {
    redirect("/dashboard");
  }

  const supabase = createServiceSupabaseClient();
  const { data } = await supabase
    .from("rubric_templates")
    .select("*")
    .eq("org_id", session.organization.id)
    .order("created_at", { ascending: true });

  return (
    <div className="mx-auto max-w-app space-y-8 p-4 sm:p-8 animate-fade-in-up">
      <div>
        <p className="font-mono text-caption uppercase tracking-widest text-accent mb-2">
          Admin
        </p>
        <h1 className="font-display text-display-2 text-foreground-primary">
          Scoring rubrics
        </h1>
        <p className="mt-2 text-body text-foreground-secondary">
          Define custom evaluation dimensions that override the AI defaults.
          Sessions will be scored against whichever rubric matches their conversation type.
        </p>
      </div>

      <RubricBuilder initialRubrics={data ?? []} />
    </div>
  );
}

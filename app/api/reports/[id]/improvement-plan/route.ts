import { requireAuth, requireCoach } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/http";
import { createServiceSupabaseClient } from "@/lib/db";

interface PlanItem {
  goal: string;
  actions: string[];
  target_date?: string;
  status: "pending" | "done";
}

/** GET /api/reports/[id]/improvement-plan */
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const supabase = createServiceSupabaseClient();
  const { data: report } = await supabase
    .from("feedback_reports")
    .select("improvement_plan, session_id")
    .eq("id", params.id)
    .single();

  if (!report) return jsonError("Report not found", 404);

  // Verify org access via session
  const { data: session } = await supabase
    .from("sessions")
    .select("org_id, user_id")
    .eq("id", report.session_id)
    .single();

  if (!session || session.org_id !== auth.session.organization.id) {
    return jsonError("Forbidden", 403);
  }

  return jsonOk({ plan: report.improvement_plan ?? [] });
}

/** PUT /api/reports/[id]/improvement-plan — coach sets improvement plan */
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const forbidden = requireCoach(auth.session);
  if (forbidden) return forbidden;

  const body = await req.json().catch(() => ({}));
  const { plan } = body as { plan?: PlanItem[] };

  if (!Array.isArray(plan)) return jsonError("plan must be an array", 400);

  const supabase = createServiceSupabaseClient();
  const { data: report } = await supabase
    .from("feedback_reports")
    .select("session_id")
    .eq("id", params.id)
    .single();

  if (!report) return jsonError("Report not found", 404);

  const { data: session } = await supabase
    .from("sessions")
    .select("org_id")
    .eq("id", report.session_id)
    .single();

  if (!session || session.org_id !== auth.session.organization.id) {
    return jsonError("Forbidden", 403);
  }

  const { error } = await supabase
    .from("feedback_reports")
    .update({ improvement_plan: plan })
    .eq("id", params.id);

  if (error) return jsonError(error.message, 500);
  return jsonOk({ ok: true, plan });
}

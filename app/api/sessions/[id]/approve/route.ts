import { requireAuth, requireCoach } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/http";
import { createServiceSupabaseClient } from "@/lib/db";

/** POST /api/sessions/[id]/approve — coach marks session as reviewed/approved */
export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const forbidden = requireCoach(auth.session);
  if (forbidden) return forbidden;

  const supabase = createServiceSupabaseClient();

  // Verify session belongs to this org
  const { data: session } = await supabase
    .from("sessions")
    .select("id, org_id, coach_approved")
    .eq("id", params.id)
    .single();

  if (!session) return jsonError("Session not found", 404);
  if (session.org_id !== auth.session.organization.id) return jsonError("Forbidden", 403);

  const nowApproved = !session.coach_approved;

  const { error } = await supabase
    .from("sessions")
    .update({
      coach_approved: nowApproved,
      coach_reviewed_at: new Date().toISOString(),
      coach_reviewer_id: auth.session.user.id,
    })
    .eq("id", params.id);

  if (error) return jsonError(error.message, 500);

  return jsonOk({ approved: nowApproved });
}

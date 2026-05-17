import { requireAuth, requireOwner } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/http";
import { createServiceSupabaseClient } from "@/lib/db";

/** Change a member's role — owner only. */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const forbidden = requireOwner(auth.session);
  if (forbidden) return forbidden;

  const body = await req.json().catch(() => ({}));
  const { role } = body as { role?: string };

  const validRoles = ["owner", "coach", "learner", "reviewer"];
  if (!role || !validRoles.includes(role)) {
    return jsonError("role must be one of: owner, coach, learner, reviewer", 400);
  }

  // Prevent owner from changing their own role
  const supabase = createServiceSupabaseClient();
  const { data: membership } = await supabase
    .from("memberships")
    .select("user_id, org_id")
    .eq("id", params.id)
    .single();

  if (!membership) return jsonError("Membership not found", 404);
  if (membership.org_id !== auth.session.organization.id) {
    return jsonError("Forbidden", 403);
  }
  if (membership.user_id === auth.session.user.id) {
    return jsonError("Cannot change your own role", 400);
  }

  const { error } = await supabase
    .from("memberships")
    .update({ role })
    .eq("id", params.id)
    .eq("org_id", auth.session.organization.id);

  if (error) return jsonError(error.message, 500);

  return jsonOk({ ok: true, role });
}

/** Remove a member from the org — owner only. */
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const forbidden = requireOwner(auth.session);
  if (forbidden) return forbidden;

  const supabase = createServiceSupabaseClient();
  const { data: membership } = await supabase
    .from("memberships")
    .select("user_id, org_id")
    .eq("id", params.id)
    .single();

  if (!membership) return jsonError("Membership not found", 404);
  if (membership.org_id !== auth.session.organization.id) {
    return jsonError("Forbidden", 403);
  }
  if (membership.user_id === auth.session.user.id) {
    return jsonError("Cannot remove yourself from the workspace", 400);
  }

  const { error } = await supabase
    .from("memberships")
    .delete()
    .eq("id", params.id)
    .eq("org_id", auth.session.organization.id);

  if (error) return jsonError(error.message, 500);

  return jsonOk({ ok: true });
}

import { requireAuth, requireCoach } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/http";
import { createServiceSupabaseClient } from "@/lib/db";

/** PATCH /api/rubrics/[id] — update a rubric template */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const forbidden = requireCoach(auth.session);
  if (forbidden) return forbidden;

  const body = await req.json().catch(() => ({}));
  const { name, conversation_type, dimensions, is_default } = body as {
    name?: string;
    conversation_type?: string;
    dimensions?: { name: string; description: string; weight: number }[];
    is_default?: boolean;
  };

  if (dimensions !== undefined) {
    const totalWeight = dimensions.reduce((s, d) => s + (d.weight ?? 0), 0);
    if (totalWeight !== 100) {
      return jsonError(`dimension weights must sum to 100 (got ${totalWeight})`, 400);
    }
  }

  const supabase = createServiceSupabaseClient();

  if (is_default) {
    await supabase
      .from("rubric_templates")
      .update({ is_default: false })
      .eq("org_id", auth.session.organization.id)
      .eq("conversation_type", conversation_type ?? null)
      .neq("id", params.id);
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (name !== undefined) updates.name = name.trim();
  if (conversation_type !== undefined) updates.conversation_type = conversation_type;
  if (dimensions !== undefined) updates.dimensions = dimensions;
  if (is_default !== undefined) updates.is_default = is_default;

  const { data, error } = await supabase
    .from("rubric_templates")
    .update(updates)
    .eq("id", params.id)
    .eq("org_id", auth.session.organization.id)
    .select()
    .single();

  if (error) return jsonError(error.message, 500);
  return jsonOk({ rubric: data });
}

/** DELETE /api/rubrics/[id] — delete a rubric template */
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const forbidden = requireCoach(auth.session);
  if (forbidden) return forbidden;

  const supabase = createServiceSupabaseClient();
  const { error } = await supabase
    .from("rubric_templates")
    .delete()
    .eq("id", params.id)
    .eq("org_id", auth.session.organization.id);

  if (error) return jsonError(error.message, 500);
  return jsonOk({ ok: true });
}

import { requireAuth, requireCoach } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/http";
import { createServiceSupabaseClient } from "@/lib/db";

/** GET /api/rubrics — list org rubric templates (coach/owner) */
export async function GET() {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const forbidden = requireCoach(auth.session);
  if (forbidden) return forbidden;

  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("rubric_templates")
    .select("*")
    .eq("org_id", auth.session.organization.id)
    .order("created_at", { ascending: true });

  if (error) return jsonError(error.message, 500);
  return jsonOk({ rubrics: data ?? [] });
}

/** POST /api/rubrics — create a rubric template (coach/owner) */
export async function POST(req: Request) {
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

  if (!name?.trim()) return jsonError("name is required", 400);
  if (!Array.isArray(dimensions) || dimensions.length === 0) {
    return jsonError("at least one dimension is required", 400);
  }

  const totalWeight = dimensions.reduce((s, d) => s + (d.weight ?? 0), 0);
  if (totalWeight !== 100) {
    return jsonError(`dimension weights must sum to 100 (got ${totalWeight})`, 400);
  }

  const supabase = createServiceSupabaseClient();

  // If this is set as default, clear other defaults for same type
  if (is_default) {
    await supabase
      .from("rubric_templates")
      .update({ is_default: false })
      .eq("org_id", auth.session.organization.id)
      .eq("conversation_type", conversation_type ?? null);
  }

  const { data, error } = await supabase
    .from("rubric_templates")
    .insert({
      org_id: auth.session.organization.id,
      created_by: auth.session.user.id,
      name: name.trim(),
      conversation_type: conversation_type ?? null,
      dimensions,
      is_default: is_default ?? false,
    })
    .select()
    .single();

  if (error) return jsonError(error.message, 500);
  return jsonOk({ rubric: data }, 201);
}

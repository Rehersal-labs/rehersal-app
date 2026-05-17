import { requireAuth } from "@/lib/api/auth";
import { jsonError, jsonOk, parseJsonBody } from "@/lib/api/http";
import { createServiceSupabaseClient } from "@/lib/db";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { ScenarioConfigSchema } from "@/lib/schemas";

export async function GET() {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("scenarios")
    .select("*, target_profiles(name)")
    .eq("org_id", auth.session.organization.id)
    .order("updated_at", { ascending: false });

  if (error) return jsonError(error.message, 500);

  return jsonOk({ scenarios: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const rl = checkRateLimit(`create-scenario:${auth.session.user.id}`, {
    maxRequests: 20,
    windowMs: 60_000,
  });
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  const parsed = await parseJsonBody(request, ScenarioConfigSchema);
  if ("error" in parsed) return parsed.error;

  const supabase = createServiceSupabaseClient();

  const { data: target } = await supabase
    .from("target_profiles")
    .select("id")
    .eq("id", parsed.data.target_profile_id)
    .eq("org_id", auth.session.organization.id)
    .maybeSingle();

  if (!target) return jsonError("Target not found", 404);

  const { data, error } = await supabase
    .from("scenarios")
    .insert({
      org_id: auth.session.organization.id,
      created_by: auth.session.user.id,
      title: parsed.data.title,
      conversation_type: parsed.data.conversation_type,
      target_profile_id: parsed.data.target_profile_id,
      duration_minutes: parsed.data.duration_minutes,
      difficulty: parsed.data.difficulty,
      goal: parsed.data.goal,
      included_document_ids: parsed.data.included_document_ids ?? [],
      is_template: parsed.data.is_template ?? false,
    })
    .select()
    .single();

  if (error || !data) {
    return jsonError(error?.message ?? "Failed to create scenario", 500);
  }

  return jsonOk({ scenario: data }, 201);
}

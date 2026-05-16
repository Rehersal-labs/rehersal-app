import { requireAuth } from "@/lib/api/auth";
import { jsonError, jsonOk, parseJsonBody } from "@/lib/api/http";
import { createServiceSupabaseClient } from "@/lib/db";
import { CreateSessionSchema } from "@/lib/schemas";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import type {
  Scenario,
  SessionHistoryItem,
  SessionStatus,
  TargetProfile,
} from "@/types";

// BP call is started in POST /api/sessions/[id]/start after consent checklist.

export async function GET(request: Request) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as SessionStatus | null;
  const limit = Math.min(
    parseInt(searchParams.get("limit") ?? "20", 10) || 20,
    100
  );
  const userIdFilter = searchParams.get("user_id");
  const isCoach =
    auth.session.membership.role === "owner" ||
    auth.session.membership.role === "coach";

  const supabase = createServiceSupabaseClient();
  let query = supabase
    .from("sessions")
    .select(
      "*, scenarios(*), target_profiles(*), evaluations(overall_score, target_fit_score)"
    )
    .eq("org_id", auth.session.organization.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (status) query = query.eq("status", status);

  if (userIdFilter && isCoach) {
    query = query.eq("user_id", userIdFilter);
  } else if (!isCoach) {
    query = query.eq("user_id", auth.session.user.id);
  }

  const { data, error } = await query;
  if (error) return jsonError(error.message, 500);

  const sessions: SessionHistoryItem[] = (data ?? []).map((row) => {
    const { scenarios, target_profiles, evaluations, ...session } = row as Record<
      string,
      unknown
    >;
    const evalRow = Array.isArray(evaluations)
      ? evaluations[0]
      : evaluations;
    return {
      session: session as unknown as SessionHistoryItem["session"],
      scenario: scenarios as Scenario | undefined,
      target: target_profiles as TargetProfile | undefined,
      evaluation: evalRow as SessionHistoryItem["evaluation"],
    };
  });

  return jsonOk({ sessions });
}

export async function POST(request: Request) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const limit = checkRateLimit(`session:${auth.session.user.id}`, {
    maxRequests: 10,
    windowMs: 60_000,
  });
  if (!limit.allowed) return rateLimitResponse(limit.resetAt);

  const parsed = await parseJsonBody(request, CreateSessionSchema);
  if ("error" in parsed) return parsed.error;

  const supabase = createServiceSupabaseClient();

  const { data: scenario, error: scenarioError } = await supabase
    .from("scenarios")
    .select("id, target_profile_id")
    .eq("id", parsed.data.scenario_id)
    .eq("org_id", auth.session.organization.id)
    .single();

  if (scenarioError || !scenario) {
    return jsonError("Scenario not found", 404);
  }

  const { data: target, error: targetError } = await supabase
    .from("target_profiles")
    .select("id, status")
    .eq("id", scenario.target_profile_id)
    .single();

  if (targetError || !target) {
    return jsonError("Target not found", 404);
  }

  if (target.status !== "complete") {
    return jsonError("Target profile must be complete before starting a session", 400);
  }

  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .insert({
      org_id: auth.session.organization.id,
      user_id: auth.session.user.id,
      scenario_id: scenario.id,
      target_profile_id: target.id,
      assignment_id: parsed.data.assignment_id ?? null,
      status: "created",
    })
    .select()
    .single();

  if (sessionError || !session) {
    return jsonError(sessionError?.message ?? "Failed to create session", 500);
  }

  return jsonOk(
    {
      session,
      message:
        "Session created. Complete the pre-session checklist, then POST /api/sessions/:id/start.",
    },
    201
  );
}

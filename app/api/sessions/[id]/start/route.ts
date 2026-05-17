import { requireAuth } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/http";
import { createCall } from "@/lib/beyondPresence";
import { retrieveContext } from "@/lib/contextRetriever";
import { createServiceSupabaseClient } from "@/lib/db";
import { buildAvatarSystemPrompt } from "@/lib/prompts";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import type { ConversationType, PersonalityJSON, Scenario, TargetProfile } from "@/types";

type RouteContext = { params: { id: string } };

/** Start Beyond Presence call after pre-session checklist (consent + media). */
export async function POST(_request: Request, { params }: RouteContext) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const limit = checkRateLimit(`session-start:${auth.session.user.id}`, {
    maxRequests: 10,
    windowMs: 60_000,
  });
  if (!limit.allowed) return rateLimitResponse(limit.resetAt);

  const supabase = createServiceSupabaseClient();
  const { data: session, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", params.id)
    .eq("org_id", auth.session.organization.id)
    .single();

  if (error || !session) return jsonError("Session not found", 404);
  if (session.user_id !== auth.session.user.id) {
    return jsonError("Forbidden", 403);
  }

  if (session.join_url && session.status === "ready") {
    return jsonOk({
      session_id: session.id,
      join_url: session.join_url,
      status: "ready" as const,
    });
  }

  if (session.status !== "created" && session.status !== "ready") {
    return jsonError(`Cannot start session in status: ${session.status}`, 400);
  }

  const { data: scenario, error: scenarioError } = await supabase
    .from("scenarios")
    .select("*")
    .eq("id", session.scenario_id)
    .single();

  if (scenarioError || !scenario) {
    return jsonError("Scenario not found", 404);
  }

  const { data: target, error: targetError } = await supabase
    .from("target_profiles")
    .select("*")
    .eq("id", session.target_profile_id)
    .single();

  if (targetError || !target) {
    return jsonError("Target not found", 404);
  }

  if (target.status !== "complete") {
    return jsonError("Target profile must be complete before starting a session", 400);
  }

  const userContext = await retrieveContext({
    orgId: auth.session.organization.id,
    userId: auth.session.user.id,
    goal: scenario.goal,
    includeCompany: auth.session.organization.mode === "team",
  });

  const typedTarget = target as TargetProfile;
  const typedScenario = scenario as Scenario;
  const personaBlock =
    typedTarget.avatar_brief_template ??
    "You are simulating the target person in a high-stakes conversation.";
  const personality = typedTarget.personality_json as PersonalityJSON | null;
  const personaWithProfile = personality
    ? `${personaBlock}\n\nPERSONALITY PROFILE:\n${JSON.stringify(personality, null, 2)}`
    : personaBlock;
  const systemPrompt = buildAvatarSystemPrompt({
    personaBlock: personaWithProfile,
    userContextBlock: userContext,
    conversationType: typedScenario.conversation_type as ConversationType,
    difficulty: typedScenario.difficulty ?? 3,
    goal: typedScenario.goal,
    durationMinutes: typedScenario.duration_minutes,
  });

  try {
    const call = await createCall({
      userName: auth.session.user.name ?? auth.session.user.email,
      systemPromptOverride: systemPrompt,
      tags: {
        source: "rehearsal",
        session_id: session.id,
      },
    });

    const { data: readySession, error: updateError } = await supabase
      .from("sessions")
      .update({
        bey_call_id: call.id,
        bey_agent_id: call.agent_id,
        join_url: call.join_url,
        system_prompt_used: systemPrompt,
        status: "ready",
        started_at: new Date().toISOString(),
      })
      .eq("id", session.id)
      .select()
      .single();

    if (updateError || !readySession) {
      throw updateError ?? new Error("Failed to update session");
    }

    const { system_prompt_used: _prompt, ...safeSession } = readySession;

    return jsonOk({
      session: safeSession,
      join_url: call.join_url,
    });
  } catch (e) {
    await supabase
      .from("sessions")
      .update({
        status: "failed",
        error_message: e instanceof Error ? e.message : "Failed to start call",
      })
      .eq("id", session.id);

    return jsonError(
      e instanceof Error ? e.message : "Failed to create Beyond Presence call",
      500
    );
  }
}

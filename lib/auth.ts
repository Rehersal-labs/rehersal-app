import { redirect } from "next/navigation";
import type { AuthSession, Role } from "@/types";
import { getDevSession, isAuthDisabled } from "@/lib/dev-auth";
import { createServerSupabaseClient, createServiceSupabaseClient } from "./db";

export type { AuthSession };
export { canManageTeam, isAdmin, isTeamMode } from "./auth-utils";

export async function getSession(): Promise<AuthSession | null> {
  if (isAuthDisabled()) {
    return getDevSession();
  }

  const supabase = createServerSupabaseClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .single();

  if (!user) return null;

  let orgId = user.default_org_id as string | null | undefined;
  let membershipQuery = supabase
    .from("memberships")
    .select("*")
    .eq("user_id", authUser.id);

  if (orgId) membershipQuery = membershipQuery.eq("org_id", orgId);

  const { data: membership } = await membershipQuery
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  orgId = orgId ?? membership?.org_id;
  if (!orgId || !membership) return null;

  const { data: organization } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", orgId)
    .single();

  if (!organization) return null;

  return { user, membership, organization };
}

export async function requireSession(): Promise<AuthSession> {
  const session = await getSession();
  if (!session) redirect("/signin");
  return session;
}

export async function requireRole(roles: Role[]): Promise<AuthSession> {
  const session = await requireSession();
  if (!roles.includes(session.membership.role)) {
    redirect("/dashboard");
  }
  return session;
}

/** Create user profile + org on first sign-in (called from callback) */
export async function provisionNewUser(params: {
  userId: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  intent?: "solo" | "team";
  workspaceName?: string;
}): Promise<{ orgId: string }> {
  const supabase = createServiceSupabaseClient();
  const intent = params.intent ?? "solo";
  const workspaceName =
    params.workspaceName ?? (intent === "team" ? "My Team" : "My Workspace");
  const slug = workspaceName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) + "-" + params.userId.slice(0, 8);

  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({
      name: workspaceName,
      slug,
      mode: intent,
    })
    .select()
    .single();

  if (orgError || !org) throw orgError ?? new Error("Failed to create org");

  await supabase.from("users").upsert({
    id: params.userId,
    email: params.email,
    name: params.name ?? null,
    avatar_url: params.avatarUrl ?? null,
    default_org_id: org.id,
  });

  await supabase.from("memberships").insert({
    org_id: org.id,
    user_id: params.userId,
    role: "owner",
  });

  return { orgId: org.id };
}

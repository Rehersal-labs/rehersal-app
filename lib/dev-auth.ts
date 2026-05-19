import type { AuthSession } from "@/types";
import { createServiceSupabaseClient } from "@/lib/db";

const DEV_EMAIL = "dev@rehearsal.local";
const MOCK_ORG_ID = "00000000-0000-4000-a000-000000000001";
const MOCK_USER_ID = "00000000-0000-4000-a000-000000000002";
const MOCK_MEMBERSHIP_ID = "00000000-0000-4000-a000-000000000003";

export function isAuthDisabled(): boolean {
  return process.env.DISABLE_AUTH === "true";
}

let cachedSession: AuthSession | null = null;

async function loadSessionForUserId(userId: string): Promise<AuthSession | null> {
  const supabase = createServiceSupabaseClient();

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (!user) return null;

  let orgId = user.default_org_id as string | null | undefined;
  let membershipQuery = supabase
    .from("memberships")
    .select("*")
    .eq("user_id", userId);

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

async function resolveDevUserId(): Promise<string> {
  const configured = process.env.DEV_USER_ID?.trim();
  if (configured) return configured;

  const supabase = createServiceSupabaseClient();

  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .not("default_org_id", "is", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existing?.id) return existing.id;

  let userId: string | undefined;

  const { data: created, error: createError } =
    await supabase.auth.admin.createUser({
      email: DEV_EMAIL,
      email_confirm: true,
      user_metadata: { name: "Dev User" },
    });

  if (created?.user) {
    userId = created.user.id;
  } else if (createError?.message?.includes("already been registered")) {
    const { data: listed } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    userId = listed?.users.find(
      (u) => u.email?.toLowerCase() === DEV_EMAIL
    )?.id;
  } else if (createError) {
    throw createError;
  }

  if (!userId) {
    throw new Error("Could not resolve dev auth user");
  }

  const session = await loadSessionForUserId(userId);
  if (!session) {
    try {
      const { provisionNewUser } = await import("@/lib/auth");
      await provisionNewUser({
        userId,
        email: DEV_EMAIL,
        name: "Dev User",
        intent: "solo",
        workspaceName: "Dev Workspace",
      });
    } catch {
      // Schema may be incomplete — mock session still unlocks the UI
    }
  }

  return userId;
}

function createMockDevSession(userId: string): AuthSession {
  const now = new Date().toISOString();
  return {
    user: {
      id: userId,
      email: DEV_EMAIL,
      name: "Dev User",
      avatar_url: null,
      default_org_id: MOCK_ORG_ID,
      created_at: now,
      updated_at: now,
    },
    organization: {
      id: MOCK_ORG_ID,
      name: "Dev Workspace",
      slug: "dev-workspace",
      mode: "solo",
      avatar_minutes_used: 0,
      created_at: now,
      updated_at: now,
    },
    membership: {
      id: MOCK_MEMBERSHIP_ID,
      org_id: MOCK_ORG_ID,
      user_id: userId,
      role: "owner",
      created_at: now,
    },
  };
}

/** Server-only dev session when DISABLE_AUTH=true */
export async function getDevSession(): Promise<AuthSession> {
  if (cachedSession) return cachedSession;

  const userId = await resolveDevUserId();
  const session =
    (await loadSessionForUserId(userId)) ?? createMockDevSession(userId);

  cachedSession = session;
  return session;
}

import { requireAuth } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/http";
import { createServiceSupabaseClient } from "@/lib/db";
import { getLibraryProfileById } from "@/lib/libraryApi";
import { isLibraryDbSeedable } from "@/lib/libraryDbReady";

type RouteContext = { params: { id: string } };

const MISSING_COLUMN_RE = /'([^']+)' column|column [^.]+\."?([^"\s]+)"? does not exist/i;

async function insertTargetProfile(
  supabase: ReturnType<typeof createServiceSupabaseClient>,
  row: Record<string, unknown>
) {
  const candidate = { ...row };

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const result = await supabase
      .from("target_profiles")
      .insert(candidate)
      .select()
      .single();

    if (!result.error) return result;

    const missing = result.error.message.match(MISSING_COLUMN_RE)?.[1]
      ?? result.error.message.match(MISSING_COLUMN_RE)?.[2];
    if (!missing || !(missing in candidate)) return result;

    delete candidate[missing];
  }

  return supabase.from("target_profiles").insert(candidate).select().single();
}

export async function POST(_request: Request, { params }: RouteContext) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const profile = await getLibraryProfileById(params.id);
  if (!profile) return jsonError("Profile not found", 404);

  const supabase = createServiceSupabaseClient();

  const { data: target, error: insertError } = await insertTargetProfile(
    supabase,
    {
      org_id: auth.session.organization.id,
      created_by: auth.session.user.id,
      name: profile.name,
      title: profile.title,
      company: profile.company,
      domain: profile.domain,
      tags: profile.tags,
      personality_json: profile.profile_json,
      avatar_brief_template: profile.avatar_brief_template,
      is_library: true,
      is_public_figure: profile.category === "real_figure",
      status: "complete",
    }
  );

  if (insertError || !target) {
    return jsonError(insertError?.message ?? "Failed to clone profile", 500);
  }

  if (await isLibraryDbSeedable()) {
    await supabase
      .from("public_figure_library")
      .update({ usage_count: (profile.usage_count ?? 0) + 1 })
      .eq("id", params.id);
  }

  return jsonOk({ target }, 201);
}

import { requireAuth } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/http";
import { createServiceSupabaseClient } from "@/lib/db";
import { loadLibraryFromFiles } from "@/lib/loadLibraryProfiles";
import { isLibraryDbReady } from "@/lib/libraryDbReady";

type RouteContext = { params: { id: string } };

export async function GET(_request: Request, { params }: RouteContext) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  if (!(await isLibraryDbReady())) {
    const profile = (await loadLibraryFromFiles()).find((p) => p.id === params.id);
    if (!profile) return jsonError("Profile not found", 404);
    return jsonOk({ profile });
  }

  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("public_figure_library")
    .select("*")
    .eq("id", params.id)
    .eq("moderation_status", "approved")
    .single();

  if (error || !data) {
    const profile = (await loadLibraryFromFiles()).find((p) => p.id === params.id);
    if (!profile) return jsonError("Profile not found", 404);
    return jsonOk({ profile });
  }

  return jsonOk({ profile: data });
}

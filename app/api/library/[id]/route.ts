import { requireAuth } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/http";
import { createServiceSupabaseClient } from "@/lib/db";

type RouteContext = { params: { id: string } };

export async function GET(_request: Request, { params }: RouteContext) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("public_figure_library")
    .select("*")
    .eq("id", params.id)
    .eq("moderation_status", "approved")
    .single();

  if (error || !data) return jsonError("Profile not found", 404);

  return jsonOk({ profile: data });
}

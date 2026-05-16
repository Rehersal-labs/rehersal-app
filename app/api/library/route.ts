import { requireAuth } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/http";
import { createServiceSupabaseClient } from "@/lib/db";
import {
  filterLibraryProfiles,
  loadLibraryFromFiles,
} from "@/lib/loadLibraryProfiles";
import { isLibraryDbReady } from "@/lib/libraryDbReady";
import type { Domain, LibraryCategory } from "@/types";

export async function GET(request: Request) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") as LibraryCategory | null;
  const domain = searchParams.get("domain") as Domain | null;
  const search = searchParams.get("search");
  const sort = searchParams.get("sort") ?? "most_used";
  const featured = searchParams.get("featured") === "true";

  const filterParams = { category, domain, search, featured, sort };

  if (!(await isLibraryDbReady())) {
    const profiles = filterLibraryProfiles(
      await loadLibraryFromFiles(),
      filterParams
    );
    return jsonOk({ profiles, total: profiles.length, source: "files" as const });
  }

  const supabase = createServiceSupabaseClient();
  let query = supabase
    .from("public_figure_library")
    .select("*", { count: "exact" })
    .eq("moderation_status", "approved");

  if (category) query = query.eq("category", category);
  if (domain) query = query.eq("domain", domain);
  if (featured) query = query.eq("is_featured", true);
  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  switch (sort) {
    case "highest_rated":
      query = query.order("accuracy_rating", {
        ascending: false,
        nullsFirst: false,
      });
      break;
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    case "most_used":
    default:
      query = query.order("usage_count", { ascending: false });
  }

  const { data, error, count } = await query;
  if (error) {
    const profiles = filterLibraryProfiles(
      await loadLibraryFromFiles(),
      filterParams
    );
    return jsonOk({ profiles, total: profiles.length, source: "files" as const });
  }

  return jsonOk({ profiles: data ?? [], total: count ?? 0 });
}

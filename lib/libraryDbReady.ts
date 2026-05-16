import { createServiceSupabaseClient } from "@/lib/db";

let cached: boolean | null = null;

/** True when public_figure_library has category + is_featured (migration 007). */
export async function isLibraryDbReady(): Promise<boolean> {
  if (cached !== null) return cached;

  const supabase = createServiceSupabaseClient();
  const { error } = await supabase
    .from("public_figure_library")
    .select("id, category, is_featured")
    .limit(1);

  cached = !error;
  return cached;
}

export function resetLibraryDbReadyCache(): void {
  cached = null;
}

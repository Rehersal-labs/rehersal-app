import { jsonError, jsonOk } from "@/lib/api/http";
import { getLLMProvider, isLLMConfigured } from "@/lib/llm";
import { isLibraryDbReady } from "@/lib/libraryDbReady";
import { createServiceSupabaseClient } from "@/lib/db";

/** Internal health check — requires a secret token so it isn't publicly readable. */
export async function GET(request: Request) {
  const token = request.headers.get("x-health-token");
  const expectedToken = process.env.HEALTH_CHECK_TOKEN;

  // If a token is configured, enforce it. If not configured, restrict to localhost only.
  if (expectedToken) {
    if (token !== expectedToken) {
      return jsonError("Unauthorized", 401);
    }
  } else {
    // No token configured — allow only from localhost (Vercel health probes, etc.)
    const host = request.headers.get("host") ?? "";
    const isLocal =
      host.startsWith("localhost") ||
      host.startsWith("127.0.0.1") ||
      request.headers.get("x-forwarded-for") === null;
    if (!isLocal) {
      return jsonError("Unauthorized", 401);
    }
  }

  let dbOk = false;
  let libraryDb = false;
  try {
    const supabase = createServiceSupabaseClient();
    const { error } = await supabase
      .from("organizations")
      .select("id", { count: "exact", head: true });
    dbOk = !error;
    libraryDb = await isLibraryDbReady().catch(() => false);
  } catch {
    dbOk = false;
  }

  return jsonOk({
    status: dbOk ? "ok" : "degraded",
    service: "rehearsal-api",
    checks: {
      db: dbOk,
      llm_configured: isLLMConfigured(),
      llm_provider: getLLMProvider(),
      bey_configured: Boolean(
        process.env.BEY_API_KEY?.trim() && process.env.BEY_AGENT_ID?.trim()
      ),
      library_db_ready: libraryDb,
    },
  });
}

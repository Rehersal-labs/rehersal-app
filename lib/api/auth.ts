import type { AuthSession } from "@/lib/auth";
import { getSession } from "@/lib/auth";
import { jsonError } from "./http";

export async function requireAuth():
  Promise<{ session: AuthSession } | { error: Response }> {
  const session = await getSession();
  if (!session) {
    return { error: jsonError("Unauthorized", 401, "UNAUTHORIZED") };
  }
  return { session };
}

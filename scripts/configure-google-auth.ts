/**
 * Enable Google OAuth on hosted Supabase via Management API.
 * Requires SUPABASE_ACCESS_TOKEN in .env.local (Dashboard → Account → Access Tokens).
 *
 * Usage: npm run configure:google-auth
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const ENV_PATH = resolve(process.cwd(), ".env.local");
const PROJECT_REF = "jjgzodakytbioxifmdaf";

function parseEnv(content: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

async function main() {
  if (!existsSync(ENV_PATH)) {
    console.error("Missing .env.local");
    process.exit(1);
  }

  const env = parseEnv(readFileSync(ENV_PATH, "utf-8"));
  const token = env.SUPABASE_ACCESS_TOKEN?.trim();
  const clientId = env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = env.GOOGLE_CLIENT_SECRET?.trim();
  const siteUrl = env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";

  if (!token) {
    console.error(`
Missing SUPABASE_ACCESS_TOKEN in .env.local

1. Open https://supabase.com/dashboard/account/tokens
2. Generate token (name: rehearsal-cli)
3. Add to .env.local:
   SUPABASE_ACCESS_TOKEN=sbp_xxxx

4. Re-run: npm run configure:google-auth
`);
    process.exit(1);
  }

  if (!clientId || !clientSecret) {
    console.error("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in .env.local");
    process.exit(1);
  }

  const body = {
    external_google_enabled: true,
    external_google_client_id: clientId,
    external_google_secret: clientSecret,
    site_url: siteUrl,
    uri_allow_list: `${siteUrl}/callback,${siteUrl}/api/auth/callback`,
  };

  console.log("Configuring Google auth on Supabase project", PROJECT_REF, "...\n");

  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  const text = await res.text();
  if (!res.ok) {
    console.error("Failed:", res.status, text);
    process.exit(1);
  }

  console.log("Google provider enabled.");
  console.log("Site URL:", siteUrl);
  console.log("Redirect URLs:", body.uri_allow_list);
  // Verify provider enabled
  const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (anon) {
    const check = await fetch(
      `https://${PROJECT_REF}.supabase.co/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(`${siteUrl}/callback`)}`,
      { headers: { apikey: anon, Authorization: `Bearer ${anon}` }, redirect: "manual" }
    );
    if (check.status === 302 || check.status === 303) {
      console.log("\nVerified: Google OAuth redirect is active.");
    } else {
      const err = await check.text();
      console.warn("\nWarning: authorize still returned", check.status, err.slice(0, 200));
    }
  }

  console.log("\nNext: npm run dev → http://localhost:3000/signin");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

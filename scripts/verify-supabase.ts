/**
 * Verify Supabase connection and migration state.
 * Usage: npm run verify:supabase
 */
import { createAdminClient, getSupabaseProjectUrl } from "../lib/supabaseAdmin";

const REQUIRED_LIBRARY_COLUMNS = [
  "category",
  "is_featured",
  "profile_json",
  "avatar_brief_template",
  "domain",
  "tags",
];

async function getLibraryColumns(url: string, key: string): Promise<string[]> {
  const res = await fetch(`${url}/rest/v1/`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  const spec = (await res.json()) as {
    definitions?: Record<string, { properties?: Record<string, unknown> }>;
  };
  return Object.keys(spec.definitions?.public_figure_library?.properties ?? {});
}

async function main() {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const url = getSupabaseProjectUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (url !== raw.replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "")) {
    console.log("Note: use project URL only (no /rest/v1) in .env.local\n");
  }

  const supabase = createAdminClient();
  let failed = false;

  const tables = [
    "organizations",
    "users",
    "target_profiles",
    "public_figure_library",
    "document_chunks",
    "audit_logs",
  ];

  console.log("Supabase URL:", url);
  console.log("Checking tables...\n");

  for (const table of tables) {
    const { error } = await supabase.from(table).select("id").limit(1);
    if (error) {
      console.log(`  ✗ ${table}: ${error.message}`);
      failed = true;
    } else {
      console.log(`  ✓ ${table}`);
    }
  }

  const libraryCols = await getLibraryColumns(url, key);
  console.log("\nLibrary columns check:");
  for (const col of REQUIRED_LIBRARY_COLUMNS) {
    if (libraryCols.includes(col)) {
      console.log(`  ✓ ${col}`);
    } else {
      console.log(`  ✗ ${col} — run supabase/migrations/007_fix_public_figure_library.sql`);
      failed = true;
    }
  }

  const { error: rpcError } = await supabase.rpc("match_document_chunks", {
    query_embedding: Array(1536).fill(0),
    match_count: 1,
    filter_org_id: null,
    filter_user_id: null,
    include_company: false,
  });

  if (rpcError?.message?.includes("Could not find the function")) {
    console.log("\n  ✗ match_document_chunks RPC — run migration 006");
    failed = true;
  } else if (rpcError) {
    console.log(`\n  ~ match_document_chunks: ${rpcError.message}`);
  } else {
    console.log("\n  ✓ match_document_chunks RPC");
  }

  if (failed) {
    console.log("\nFix failed checks in Supabase SQL Editor, then re-run verify.");
    process.exit(1);
  }

  console.log("\nAll checks passed. Run: npm run seed:library");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

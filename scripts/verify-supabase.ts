/**
 * Verify Supabase connection and migration state.
 * Usage: npx tsx --env-file=.env.local scripts/verify-supabase.ts
 */
import { createAdminClient, getSupabaseProjectUrl } from "../lib/supabaseAdmin";

async function main() {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const url = getSupabaseProjectUrl();
  if (url !== raw.replace(/\/+$/, "")) {
    console.log("Note: use project URL only (no /rest/v1) in .env.local\n");
  }

  const supabase = createAdminClient();

  const tables = [
    "organizations",
    "users",
    "target_profiles",
    "public_figure_library",
    "document_chunks",
    "audit_logs",
  ];

  console.log("Supabase URL:", url.replace(/\/\/.*@/, "//***@"));
  console.log("Checking tables...\n");

  for (const table of tables) {
    const { error } = await supabase.from(table).select("id").limit(1);
    if (error) {
      console.log(`  ✗ ${table}: ${error.message}`);
    } else {
      console.log(`  ✓ ${table}`);
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
    console.log("\n  ✗ match_document_chunks RPC — run migration 003");
  } else if (rpcError) {
    console.log(`\n  ~ match_document_chunks: ${rpcError.message} (may be ok if no data)`);
  } else {
    console.log("\n  ✓ match_document_chunks RPC");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

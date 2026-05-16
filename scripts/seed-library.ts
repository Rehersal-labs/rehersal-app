/**
 * Seeds public_figure_library from public/library/*.json
 * Usage: npm run seed:library
 */
import { readdir, readFile } from "fs/promises";
import path from "path";
import { LibraryProfileSchema } from "../lib/schemas";
import { createAdminClient } from "../lib/supabaseAdmin";

async function main() {
  const supabase = createAdminClient();
  const libraryDir = path.join(process.cwd(), "public", "library");
  const files = (await readdir(libraryDir)).filter((f) => f.endsWith(".json"));

  for (const file of files) {
    const raw = await readFile(path.join(libraryDir, file), "utf-8");
    const parsed = LibraryProfileSchema.parse(JSON.parse(raw));

    const { error } = await supabase.from("public_figure_library").upsert(
      {
        id: parsed.id,
        name: parsed.name,
        title: parsed.title ?? null,
        company: parsed.company ?? null,
        domain: parsed.domain,
        category: parsed.category,
        tags: parsed.tags,
        profile_json: parsed.profile_json,
        avatar_brief_template: parsed.avatar_brief_template,
        source_urls: parsed.source_urls,
        is_featured: parsed.is_featured ?? false,
        moderation_status: "approved",
      },
      { onConflict: "id" }
    );

    if (error) {
      console.error(`Failed to seed ${file}:`, error.message);
    } else {
      console.log(`Seeded ${parsed.id}`);
    }
  }

  console.log(`Done. Processed ${files.length} library file(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

/**
 * Pre-flight checks before a manual E2E test run.
 * Usage: npm run wire:check
 */
import { execSync } from "child_process";

const steps: { name: string; cmd: string; optional?: boolean }[] = [
  { name: "Environment variables", cmd: "npm run setup:check" },
  { name: "Supabase schema", cmd: "npm run verify:supabase" },
  { name: "LLM (Gemini/OpenAI)", cmd: "npm run test:llm" },
  { name: "Beyond Presence", cmd: "npm run test:bp", optional: true },
  { name: "Storage buckets", cmd: "npm run storage:setup", optional: true },
];

async function main() {
  console.log("Rehearsal — wire check (run before E2E test)\n");

  let failed = 0;
  let warned = 0;

  for (const step of steps) {
    console.log(`▶ ${step.name}…`);
    try {
      execSync(step.cmd, { stdio: "inherit", env: process.env });
      console.log(`  ✓ ${step.name}\n`);
    } catch {
      if (step.optional) {
        console.log(`  ⚠ ${step.name} (optional — live sessions need BP)\n`);
        warned++;
      } else {
        console.log(`  ✗ ${step.name}\n`);
        failed++;
      }
    }
  }

  console.log("---\n");
  if (failed > 0) {
    console.log(`${failed} required check(s) failed. Fix before E2E.`);
    console.log("If library schema fails: npm run db:pending (needs DATABASE_URL)");
    process.exit(1);
  }

  console.log("Wire check passed" + (warned ? ` (${warned} optional warning(s))` : "") + ".");
  console.log("\nNext: npm run dev");
  console.log("Follow: docs/E2E_TEST_RUN.md\n");
}

main();

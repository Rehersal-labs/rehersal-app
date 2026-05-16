/**
 * Verify LLM integration (Gemini or OpenAI per LLM_PROVIDER).
 * Usage: npm run test:llm
 */
import {
  embed,
  getLLMProvider,
  isLLMConfigured,
  completionJSON,
} from "../lib/llm";
import { buildReconstructionPrompt } from "../lib/prompts";
import { PersonalityJSONSchema, validateAISafety } from "../lib/schemas";

const SAMPLE_SOURCES = `=== SOURCE: Manual notes ===
Alex is a direct seed VC who asks "why now" in the first five minutes.
Skeptical of large TAM slides without wedge strategy. Impressed by specific metrics.`;

async function main() {
  const provider = getLLMProvider();
  console.log(`Rehearsal — LLM integration test (${provider})\n`);

  if (!isLLMConfigured()) {
    console.error("✗ LLM not configured.");
    console.error("  Gemini: GEMINI_API_KEY + LLM_PROVIDER=gemini");
    console.error("  OpenAI: OPENAI_API_KEY + LLM_PROVIDER=openai\n");
    process.exit(1);
  }

  console.log(`✓ Provider: ${provider}\n`);

  console.log("▶ Embedding…");
  const vector = await embed("Rehearsal practice session goal: fundraising pitch");
  if (vector.length !== 1536) {
    throw new Error(`Expected 1536 dimensions, got ${vector.length}`);
  }
  console.log(`  ✓ Vector length ${vector.length}\n`);

  console.log("▶ Reconstruction JSON (sample sources)…");
  const personality = await completionJSON(
    buildReconstructionPrompt(SAMPLE_SOURCES),
    PersonalityJSONSchema
  );
  if (!personality.communication_style?.directness) {
    throw new Error("PersonalityJSON missing communication_style");
  }
  const safety = validateAISafety(JSON.stringify(personality));
  if (!safety.safe) {
    throw new Error(`Safety check failed: ${safety.matches.join(", ")}`);
  }
  console.log(`  ✓ Personality parsed (${personality.core_values?.length ?? 0} values)`);
  console.log(`  ✓ Safety check passed\n`);

  console.log("---");
  console.log(`LLM integration OK (${provider}).`);
  console.log("Next: npm run dev → test reconstruct / embed / evaluate via API.\n");
}

main().catch((err) => {
  console.error("\n✗", err instanceof Error ? err.message : err);
  process.exit(1);
});

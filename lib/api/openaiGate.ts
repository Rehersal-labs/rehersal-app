import { getLLMProvider, isLLMConfigured } from "@/lib/llm";
import { jsonError } from "./http";

/** Returns 503 when no LLM key is configured (Gemini or OpenAI). */
export function requireOpenAIConfigured(): Response | null {
  if (!isLLMConfigured()) {
    const provider = getLLMProvider();
    const hint =
      provider === "gemini"
        ? "Add GEMINI_API_KEY and set LLM_PROVIDER=gemini in .env.local."
        : "Add OPENAI_API_KEY or switch LLM_PROVIDER=gemini with GEMINI_API_KEY.";
    return jsonError(`LLM is not configured. ${hint}`, 503, "LLM_NOT_CONFIGURED");
  }
  return null;
}

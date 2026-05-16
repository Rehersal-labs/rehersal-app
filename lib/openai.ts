/**
 * LLM entrypoint — routes to Gemini or OpenAI via lib/llm.ts (LLM_PROVIDER env).
 * Imports from here stay stable for reconstruction, embeddings, evaluator, etc.
 */
export {
  completion,
  completionJSON,
  embed,
  embedBatch,
  getLLMProvider,
  isLLMConfigured,
  isOpenAIConfigured,
  resolveLLMProvider,
  type LLMProvider,
} from "./llm";

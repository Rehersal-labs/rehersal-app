import OpenAI from "openai";
import { GoogleGenerativeAI, TaskType } from "@google/generative-ai";
import type { ZodSchema } from "zod";
import { coercePersonalityJson, validateAISafety } from "./schemas";

export type LLMProvider = "gemini" | "openai";

const OPENAI_CHAT_MODEL = "gpt-4o";
const OPENAI_EMBEDDING_MODEL = "text-embedding-3-small";
const GEMINI_EMBEDDING_MODEL = "gemini-embedding-001";
const EMBEDDING_DIMENSIONS = 1536;

function geminiApiKey(): string | undefined {
  return process.env.GEMINI_API_KEY?.trim() || undefined;
}

function openaiApiKey(): string | undefined {
  return process.env.OPENAI_API_KEY?.trim() || undefined;
}

/** Active provider from LLM_PROVIDER env (defaults to gemini when key present). */
export function resolveLLMProvider(): LLMProvider {
  const pref = process.env.LLM_PROVIDER?.trim().toLowerCase();
  if (pref === "openai" && openaiApiKey()) return "openai";
  if (pref === "gemini" && geminiApiKey()) return "gemini";
  if (geminiApiKey()) return "gemini";
  if (openaiApiKey()) return "openai";
  return pref === "openai" ? "openai" : "gemini";
}

export function isLLMConfigured(): boolean {
  const provider = resolveLLMProvider();
  return provider === "gemini" ? Boolean(geminiApiKey()) : Boolean(openaiApiKey());
}

/** @deprecated Use isLLMConfigured — kept for existing imports */
export function isOpenAIConfigured(): boolean {
  return isLLMConfigured();
}

export function getLLMProvider(): LLMProvider {
  return resolveLLMProvider();
}

function notConfiguredError(): Error {
  const provider = resolveLLMProvider();
  if (provider === "gemini") {
    return new Error("GEMINI_NOT_CONFIGURED");
  }
  return new Error("OPENAI_NOT_CONFIGURED");
}

function getOpenAIClient(): OpenAI {
  const apiKey = openaiApiKey();
  if (!apiKey) throw notConfiguredError();
  return new OpenAI({ apiKey });
}

function getGeminiClient(): GoogleGenerativeAI {
  const apiKey = geminiApiKey();
  if (!apiKey) throw notConfiguredError();
  return new GoogleGenerativeAI(apiKey);
}

function geminiModelName(): string {
  return process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
}

function extractJson(raw: string): string {
  const trimmed = raw.trim();
  const fence = /^```(?:json)?\s*([\s\S]*?)```$/i.exec(trimmed);
  return fence ? fence[1].trim() : trimmed;
}

async function geminiCompletion(
  prompt: string,
  options?: { temperature?: number; maxTokens?: number; json?: boolean }
): Promise<string> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({
    model: geminiModelName(),
    systemInstruction: options?.json
      ? "You are a structured data extractor. Respond with valid JSON only. No markdown, no preamble."
      : undefined,
    generationConfig: {
      temperature: options?.temperature ?? (options?.json ? 0.2 : 0.3),
      maxOutputTokens: options?.maxTokens ?? 4096,
      ...(options?.json ? { responseMimeType: "application/json" } : {}),
    },
  });

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const safety = validateAISafety(text);
  if (!safety.safe) {
    throw new Error("AI output blocked: forbidden language detected");
  }
  return text;
}

async function openaiCompletion(
  prompt: string,
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const client = getOpenAIClient();
  const response = await client.chat.completions.create({
    model: OPENAI_CHAT_MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: options?.temperature ?? 0.3,
    max_tokens: options?.maxTokens ?? 4096,
  });
  const text = response.choices[0]?.message?.content ?? "";
  const safety = validateAISafety(text);
  if (!safety.safe) {
    throw new Error("AI output blocked: forbidden language detected");
  }
  return text;
}

export async function completion(
  prompt: string,
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  if (!isLLMConfigured()) throw notConfiguredError();
  if (resolveLLMProvider() === "gemini") {
    return geminiCompletion(prompt, options);
  }
  return openaiCompletion(prompt, options);
}

export async function completionJSON<T>(
  prompt: string,
  schema: ZodSchema<T>,
  options?: { temperature?: number }
): Promise<T> {
  if (!isLLMConfigured()) throw notConfiguredError();

  let raw: string;
  if (resolveLLMProvider() === "gemini") {
    raw = await geminiCompletion(prompt, {
      temperature: options?.temperature ?? 0.2,
      json: true,
    });
    raw = extractJson(raw);
  } else {
    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: OPENAI_CHAT_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a structured data extractor. Respond with valid JSON only. No markdown, no preamble.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: options?.temperature ?? 0.2,
    });
    raw = response.choices[0]?.message?.content ?? "{}";
  }

  const safety = validateAISafety(raw);
  if (!safety.safe) {
    throw new Error("AI output blocked: forbidden language detected");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Failed to parse AI JSON response");
  }

  const toParse =
    parsed &&
    typeof parsed === "object" &&
    "communication_style" in (parsed as object)
      ? coercePersonalityJson(parsed)
      : parsed;
  return schema.parse(toParse) as T;
}

async function geminiEmbed(text: string): Promise<number[]> {
  const apiKey = geminiApiKey();
  if (!apiKey) throw notConfiguredError();

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_EMBEDDING_MODEL}:embedContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: { parts: [{ text }] },
        taskType: TaskType.RETRIEVAL_DOCUMENT,
        outputDimensionality: EMBEDDING_DIMENSIONS,
      }),
    }
  );

  const data = (await res.json()) as {
    embedding?: { values?: number[] };
    error?: { message?: string };
  };

  if (!res.ok) {
    throw new Error(data.error?.message ?? `Gemini embed failed (${res.status})`);
  }

  const values = data.embedding?.values ?? [];
  if (values.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(
      `Gemini embedding expected ${EMBEDDING_DIMENSIONS} dimensions, got ${values.length}`
    );
  }
  return values;
}

export async function embed(text: string): Promise<number[]> {
  if (!isLLMConfigured()) throw notConfiguredError();

  if (resolveLLMProvider() === "gemini") {
    return geminiEmbed(text);
  }

  const client = getOpenAIClient();
  const response = await client.embeddings.create({
    model: OPENAI_EMBEDDING_MODEL,
    input: text,
  });
  return response.data[0].embedding;
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  if (!isLLMConfigured()) throw notConfiguredError();

  if (resolveLLMProvider() === "gemini") {
    const vectors: number[][] = [];
    for (const text of texts) {
      vectors.push(await geminiEmbed(text));
    }
    return vectors;
  }

  const client = getOpenAIClient();
  const response = await client.embeddings.create({
    model: OPENAI_EMBEDDING_MODEL,
    input: texts,
  });
  return response.data.map((d) => d.embedding);
}

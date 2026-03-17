import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";
import { keys } from "../keys";

// ─── Provider Factories ─────────────────────────────────────

const openai = createOpenAI({
  apiKey: keys().OPENAI_API_KEY ?? "",
});

const anthropic = createAnthropic({
  apiKey: keys().ANTHROPIC_API_KEY ?? "",
});

const google = createGoogleGenerativeAI({
  apiKey: keys().GOOGLE_GENERATIVE_AI_API_KEY ?? "",
});

// Ollama uses OpenAI-compatible API
const ollama = createOpenAI({
  baseURL: keys().OLLAMA_BASE_URL ?? "http://localhost:11434/v1",
  apiKey: "ollama", // Ollama doesn't need a real key
});

// ─── Model Registry ─────────────────────────────────────────

export interface ChatModel {
  id: string;
  model: LanguageModel;
  name: string;
  provider: string;
}

export const chatModels: ChatModel[] = [
  // Anthropic
  {
    id: "claude-sonnet-4-6",
    name: "Claude Sonnet 4.6",
    provider: "anthropic",
    model: anthropic("claude-sonnet-4-6"),
  },
  {
    id: "claude-haiku-4-5",
    name: "Claude Haiku 4.5",
    provider: "anthropic",
    model: anthropic("claude-haiku-4-5-20251001"),
  },

  // OpenAI
  {
    id: "gpt-4.1-mini",
    name: "GPT-4.1 Mini",
    provider: "openai",
    model: openai("gpt-4.1-mini"),
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "openai",
    model: openai("gpt-4o-mini"),
  },
  {
    id: "o3-mini",
    name: "o3-mini",
    provider: "openai",
    model: openai("o3-mini"),
  },

  // Google
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "google",
    model: google("gemini-2.5-flash-preview-05-20"),
  },

  // Ollama (local)
  {
    id: "ollama-llama3",
    name: "Llama 3 (Local)",
    provider: "ollama",
    model: ollama("llama3"),
  },
];

export const DEFAULT_CHAT_MODEL = "claude-sonnet-4-6";

export function getModel(modelId: string): LanguageModel {
  const found = chatModels.find((m) => m.id === modelId);
  if (!found) {
    throw new Error(`Model not found: ${modelId}`);
  }
  return found.model;
}

// ─── Embeddings ─────────────────────────────────────────────

export const embeddingModel: ReturnType<typeof openai.embedding> =
  openai.embedding("text-embedding-3-small");

// ─── Convenience re-exports ─────────────────────────────────

export const models: {
  chat: LanguageModel;
  embeddings: ReturnType<typeof openai.embedding>;
} = {
  chat: anthropic("claude-sonnet-4-6"),
  embeddings: openai.embedding("text-embedding-3-small"),
};

export { anthropic, google, ollama, openai };

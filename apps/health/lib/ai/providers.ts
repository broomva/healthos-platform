import { anthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";
import { isTestEnvironment } from "../constants";

// OpenAI provider (uses OPENAI_API_KEY env var)
const openai = createOpenAI({});

// Ollama provider (OpenAI-compatible API on localhost)
const ollama = createOpenAI({
  baseURL: process.env.OLLAMA_BASE_URL || "http://localhost:11434/v1",
  apiKey: "ollama", // Ollama doesn't need a real key
});

// Provider prefix → model constructor mapping
const PROVIDER_MAP: Record<
  string,
  (modelId: string) => ReturnType<typeof anthropic>
> = {
  "anthropic:": (id) => anthropic(id.slice("anthropic:".length)),
  "openai:": (id) => openai(id.slice("openai:".length)) as any,
  "ollama:": (id) => ollama(id.slice("ollama:".length)) as any,
};

export const myProvider = isTestEnvironment
  ? (() => {
      const {
        artifactModel,
        chatModel,
        reasoningModel,
        titleModel,
      } = require("./models.mock");
      return customProvider({
        languageModels: {
          "chat-model": chatModel,
          "chat-model-reasoning": reasoningModel,
          "title-model": titleModel,
          "artifact-model": artifactModel,
        },
      });
    })()
  : null;

function resolveModel(modelId: string) {
  for (const [prefix, factory] of Object.entries(PROVIDER_MAP)) {
    if (modelId.startsWith(prefix)) {
      return factory(modelId);
    }
  }
  // Default: treat as Anthropic model ID for backward compatibility
  return anthropic(modelId);
}

export function getLanguageModel(modelId: string) {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel(modelId);
  }

  const isReasoningModel =
    modelId.includes("reasoning") || modelId.endsWith("-thinking");

  if (isReasoningModel) {
    return wrapLanguageModel({
      model: resolveModel(modelId),
      middleware: extractReasoningMiddleware({ tagName: "thinking" }),
    });
  }

  return resolveModel(modelId);
}

export function getTitleModel() {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel("title-model");
  }
  return resolveModel("anthropic:claude-haiku-4-5-20251001");
}

export function getArtifactModel() {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel("artifact-model");
  }
  return resolveModel("anthropic:claude-haiku-4-5-20251001");
}

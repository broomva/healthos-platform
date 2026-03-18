export const DEFAULT_CHAT_MODEL = "anthropic:claude-haiku-4-5-20251001";

export type ChatModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
};

export const chatModels: ChatModel[] = [
  // Anthropic
  {
    id: "anthropic:claude-haiku-4-5-20251001",
    name: "Claude Haiku 4.5",
    provider: "anthropic",
    description: "Fast and affordable, great for everyday tasks",
  },
  {
    id: "anthropic:claude-sonnet-4-5-20250929",
    name: "Claude Sonnet 4.5",
    provider: "anthropic",
    description: "Best balance of speed, intelligence, and cost",
  },
  {
    id: "anthropic:claude-opus-4-6",
    name: "Claude Opus 4.6",
    provider: "anthropic",
    description: "Most capable model for complex analysis",
  },
  // OpenAI
  {
    id: "openai:gpt-5.2",
    name: "GPT-5.2 Chat",
    provider: "openai",
    description: "Flagship model for advanced reasoning and logic",
  },
  {
    id: "openai:gpt-5-mini",
    name: "GPT-5 Mini",
    provider: "openai",
    description: "Fast, cost-efficient reasoning model",
  },
  {
    id: "openai:gpt-4.1-mini",
    name: "GPT-4.1 Mini",
    provider: "openai",
    description: "Fast and cost-effective for simple tasks",
  },
  {
    id: "openai:gpt-4.1",
    name: "GPT-4.1",
    provider: "openai",
    description: "Strong general-purpose model",
  },
  {
    id: "openai:o3-mini",
    name: "o3 Mini",
    provider: "openai",
    description: "Reasoning model, great for complex problems",
  },
  // Ollama (local)
  {
    id: "ollama:gpt-oss:120b",
    name: "GPT-OSS 120B",
    provider: "ollama",
    description: "Local — Powerful open weight GPT alternative",
  },
  {
    id: "ollama:gpt-oss:20b",
    name: "GPT-OSS 20B",
    provider: "ollama",
    description: "Local — Open source GPT alternative",
  },
  {
    id: "ollama:llama3.3",
    name: "Llama 3.3 70B",
    provider: "ollama",
    description: "Local — Meta's strongest open model",
  },
  {
    id: "ollama:qwen3:32b",
    name: "Qwen 3 32B",
    provider: "ollama",
    description: "Local — Strong multilingual reasoning",
  },
  {
    id: "ollama:deepseek-r1:14b",
    name: "DeepSeek R1 14B",
    provider: "ollama",
    description: "Local — Reasoning-focused open model",
  },
  {
    id: "ollama:mistral",
    name: "Mistral 7B",
    provider: "ollama",
    description: "Local — Fast and lightweight",
  },
];

// Group models by provider for UI
export const modelsByProvider = chatModels.reduce(
  (acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  },
  {} as Record<string, ChatModel[]>
);

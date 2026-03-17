import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const keys = () =>
  createEnv({
    server: {
      OPENAI_API_KEY: z.string().optional(),
      ANTHROPIC_API_KEY: z.string().optional(),
      GOOGLE_GENERATIVE_AI_API_KEY: z.string().optional(),
      AI_GATEWAY_API_KEY: z.string().optional(),
      OLLAMA_BASE_URL: z.string().url().optional(),
    },
    emptyStringAsUndefined: true,
    runtimeEnv: {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
      GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      AI_GATEWAY_API_KEY: process.env.AI_GATEWAY_API_KEY,
      OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL,
    },
  });

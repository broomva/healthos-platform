import type { ToolName } from "../ai/types";
import { config } from "../config";

export interface AnonymousSession {
  createdAt: Date;
  id: string;
  remainingCredits: number;
}

const anonConfig = config.anonymous;

export const ANONYMOUS_LIMITS = {
  CREDITS: anonConfig.credits,
  AVAILABLE_MODELS: config.ai.anonymousModels,
  AVAILABLE_TOOLS: anonConfig.availableTools as ToolName[],
  SESSION_DURATION: 2_147_483_647, // Max session time
  RATE_LIMIT: {
    REQUESTS_PER_MINUTE: anonConfig.rateLimit.requestsPerMinute,
    REQUESTS_PER_MONTH: anonConfig.rateLimit.requestsPerMonth,
  },
} as const;

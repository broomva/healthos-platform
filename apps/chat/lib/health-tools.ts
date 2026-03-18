/**
 * Health tools bridge — imports @repo/health-tools for use in chat agent.
 * Enable "Health Mode" to register these tools in the chat ToolLoopAgent.
 */
import {
  garminQuery,
  getHealthSnapshot,
  getRawData,
  getSleepAnalysis,
  getTrainingStatus,
  getVitals,
} from "@repo/health-tools";

export const healthTools = {
  garminQuery,
  getHealthSnapshot,
  getRawData,
  getSleepAnalysis,
  getTrainingStatus,
  getVitals,
};

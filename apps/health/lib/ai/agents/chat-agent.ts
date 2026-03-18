import { stepCountIs, ToolLoopAgent, type UIMessageStreamWriter } from "ai";
import type { Session } from "next-auth";
import { isProductionEnvironment } from "@/lib/constants";
import type { ChatMessage } from "@/lib/types";
import { type RequestHints, systemPrompt } from "../prompts";
import { getLanguageModel } from "../providers";
import { createDocument } from "../tools/create-document";
import { garminQuery } from "../tools/garmin-query";
import { getHealthSnapshot } from "../tools/get-health-snapshot";
import { getRawData } from "../tools/get-raw-data";
import { getSleepAnalysis } from "../tools/get-sleep-analysis";
import { getTrainingStatus } from "../tools/get-training-status";
import { getVitals } from "../tools/get-vitals";
import { getWeather } from "../tools/get-weather";
import { renderHealthUI } from "../tools/render-health-ui";
import { requestSuggestions } from "../tools/request-suggestions";
import { shellExecute } from "../tools/shell-execute";
import { skillManager } from "../tools/skill-manager";
import { updateDocument } from "../tools/update-document";

type CreateChatAgentParams = {
  selectedChatModel: string;
  requestHints: RequestHints;
  session: Session;
  dataStream: UIMessageStreamWriter<ChatMessage>;
};

export function createChatAgent({
  selectedChatModel,
  requestHints,
  session,
  dataStream,
}: CreateChatAgentParams) {
  return new ToolLoopAgent({
    id: "chat-agent",
    model: getLanguageModel(selectedChatModel),
    instructions: systemPrompt({ selectedChatModel, requestHints }),
    stopWhen: stepCountIs(10),
    tools: {
      getWeather,
      getHealthSnapshot,
      getSleepAnalysis,
      getTrainingStatus,
      getVitals,
      getRawData,
      garminQuery,
      shellExecute,
      skillManager,
      renderHealthUI,
      createDocument: createDocument({ session, dataStream }),
      updateDocument: updateDocument({ session, dataStream }),
      requestSuggestions: requestSuggestions({ session, dataStream }),
    },
    experimental_telemetry: {
      isEnabled: isProductionEnvironment,
      functionId: "chat-agent",
    },
  });
}

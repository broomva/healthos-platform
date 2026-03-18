import type { InferUITool, UIMessage } from "ai";
import { z } from "zod";
import type { ArtifactKind } from "@/components/artifact";
import type { createDocument } from "./ai/tools/create-document";
import type { garminQuery } from "./ai/tools/garmin-query";
import type { getHealthSnapshot } from "./ai/tools/get-health-snapshot";
import type { getRawData } from "./ai/tools/get-raw-data";
import type { getSleepAnalysis } from "./ai/tools/get-sleep-analysis";
import type { getTrainingStatus } from "./ai/tools/get-training-status";
import type { getVitals } from "./ai/tools/get-vitals";
import type { getWeather } from "./ai/tools/get-weather";
import type { renderHealthUI } from "./ai/tools/render-health-ui";
import type { requestSuggestions } from "./ai/tools/request-suggestions";
import type { shellExecute } from "./ai/tools/shell-execute";
import type { skillManager } from "./ai/tools/skill-manager";
import type { updateDocument } from "./ai/tools/update-document";
import type { Suggestion } from "./db/schema";

export type DataPart = { type: "append-message"; message: string };

export const messageMetadataSchema = z.object({
  createdAt: z.string(),
});

export type MessageMetadata = z.infer<typeof messageMetadataSchema>;

type weatherTool = InferUITool<typeof getWeather>;
type healthSnapshotTool = InferUITool<typeof getHealthSnapshot>;
type sleepAnalysisTool = InferUITool<typeof getSleepAnalysis>;
type trainingStatusTool = InferUITool<typeof getTrainingStatus>;
type vitalsTool = InferUITool<typeof getVitals>;
type rawDataTool = InferUITool<typeof getRawData>;
type garminQueryTool = InferUITool<typeof garminQuery>;
type shellExecuteTool = InferUITool<typeof shellExecute>;
type skillManagerTool = InferUITool<typeof skillManager>;
type renderHealthUITool = InferUITool<typeof renderHealthUI>;
type createDocumentTool = InferUITool<ReturnType<typeof createDocument>>;
type updateDocumentTool = InferUITool<ReturnType<typeof updateDocument>>;
type requestSuggestionsTool = InferUITool<
  ReturnType<typeof requestSuggestions>
>;

export type ChatTools = {
  getWeather: weatherTool;
  getHealthSnapshot: healthSnapshotTool;
  getSleepAnalysis: sleepAnalysisTool;
  getTrainingStatus: trainingStatusTool;
  getVitals: vitalsTool;
  getRawData: rawDataTool;
  garminQuery: garminQueryTool;
  shellExecute: shellExecuteTool;
  skillManager: skillManagerTool;
  renderHealthUI: renderHealthUITool;
  createDocument: createDocumentTool;
  updateDocument: updateDocumentTool;
  requestSuggestions: requestSuggestionsTool;
};

export type CustomUIDataTypes = {
  textDelta: string;
  imageDelta: string;
  sheetDelta: string;
  codeDelta: string;
  suggestion: Suggestion;
  appendMessage: string;
  id: string;
  title: string;
  kind: ArtifactKind;
  clear: null;
  finish: null;
  "chat-title": string;
};

export type ChatMessage = UIMessage<
  MessageMetadata,
  CustomUIDataTypes,
  ChatTools
>;

export type Attachment = {
  name: string;
  url: string;
  contentType: string;
};

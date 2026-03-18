import type { Experimental_VideoModelV3 } from "@ai-sdk/provider";
import type { ImageModel, LanguageModel } from "ai";
import type { AiGatewayModel } from "../ai-gateway-models-schemas";

export interface GatewayProvider<
  TGateway extends string = string,
  TModelId extends string = string,
  TImageModelId extends string = string,
  TVideoModelId extends string = string,
> {
  /** Create a dedicated image model instance, or null if unsupported */
  createImageModel(modelId: TImageModelId): ImageModel | null;

  /** Create a language model instance from a model ID like "openai/gpt-5-nano" */
  createLanguageModel(modelId: TModelId): LanguageModel;

  /** Create a video model instance, or null if unsupported */
  createVideoModel(modelId: TVideoModelId): Experimental_VideoModelV3 | null;

  /** Fetch the list of available models from the gateway's API */
  fetchModels(): Promise<AiGatewayModel[]>;
  readonly type: TGateway;
}

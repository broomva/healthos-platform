import type { UseChatHelpers } from "@ai-sdk/react";
import type { useChatStoreApi } from "@ai-sdk-tools/store";
import type { QueryClient } from "@tanstack/react-query";
import type { DataUIPart } from "ai";
import type { ComponentType, Dispatch, ReactNode, SetStateAction } from "react";
import type { ChatMessage, CustomUIDataTypes } from "@/lib/ai/types";
import type { useTRPC } from "@/trpc/react";
import type { UIArtifact } from "./artifact-panel";

export interface ArtifactActionContext<M = any> {
  content: string;
  currentVersionIndex: number;
  handleVersionChange: (type: "next" | "prev" | "toggle" | "latest") => void;
  isCurrentVersion: boolean;
  isReadonly?: boolean;
  metadata: M;
  mode: "edit" | "diff";
  setMetadata: Dispatch<SetStateAction<M>>;
}

interface ArtifactAction<M = any> {
  description: string;
  icon: ReactNode;
  isDisabled?: (context: ArtifactActionContext<M>) => boolean;
  label?: string;
  onClick: (context: ArtifactActionContext<M>) => Promise<void> | void;
}

export interface ArtifactToolbarContext {
  sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
  storeApi: ReturnType<typeof useChatStoreApi<ChatMessage>>;
}

export interface ArtifactToolbarItem {
  description: string;
  icon: ReactNode;
  onClick: (context: ArtifactToolbarContext) => void;
}

interface ArtifactContent<M = any> {
  content: string;
  currentVersionIndex: number;
  getDocumentContentById: (index: number) => string;
  isCurrentVersion: boolean;
  isInline: boolean;
  isLoading: boolean;
  isReadonly?: boolean;
  metadata: M;
  mode: "edit" | "diff";
  onSaveContent: (updatedContent: string, debounce: boolean) => void;
  setMetadata: Dispatch<SetStateAction<M>>;
  status: "streaming" | "idle";
  title: string;
}

interface ArtifactConfig<T extends string, M = any> {
  actions: ArtifactAction<M>[];
  content: ComponentType<ArtifactContent<M>>;
  description: string;
  footer?: ComponentType<ArtifactContent<M>>;
  initialize?: ({
    documentId,
    setMetadata,
    trpc,
    queryClient,
    isAuthenticated,
  }: {
    documentId: string;
    setMetadata: Dispatch<SetStateAction<M>>;
    trpc: ReturnType<typeof useTRPC>;
    queryClient: QueryClient;
    isAuthenticated: boolean;
  }) => void;
  kind: T;
  onStreamPart?: (args: {
    setMetadata: Dispatch<SetStateAction<M>>;
    setArtifact: Dispatch<SetStateAction<UIArtifact>>;
    streamPart: DataUIPart<CustomUIDataTypes>;
  }) => void;
  toolbar: ArtifactToolbarItem[];
}

export class Artifact<T extends string, M = any> {
  readonly kind: T;
  readonly description: string;
  readonly content: ComponentType<ArtifactContent<M>>;
  readonly footer?: ComponentType<ArtifactContent<M>>;

  readonly actions: ArtifactAction<M>[];
  readonly toolbar: ArtifactToolbarItem[];
  readonly initialize?: ({
    documentId,
    setMetadata,
    trpc,
    queryClient,
    isAuthenticated,
  }: {
    documentId: string;
    setMetadata: Dispatch<SetStateAction<M>>;
    trpc: ReturnType<typeof import("@/trpc/react").useTRPC>;
    queryClient: QueryClient;
    isAuthenticated: boolean;
  }) => void;
  readonly onStreamPart?: (args: {
    setMetadata: Dispatch<SetStateAction<M>>;
    setArtifact: Dispatch<SetStateAction<UIArtifact>>;
    streamPart: DataUIPart<CustomUIDataTypes>;
  }) => void;

  constructor(config: ArtifactConfig<T, M>) {
    this.kind = config.kind;
    this.description = config.description;
    this.content = config.content;
    this.footer = config.footer;
    this.actions = config.actions || [];
    this.toolbar = config.toolbar || [];
    this.initialize = config.initialize || (async () => ({}));
    this.onStreamPart = config.onStreamPart;
  }
}

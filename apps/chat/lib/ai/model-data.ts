export interface ModelData {
  context_window: number;
  description: string;
  id: string;
  input: {
    image: boolean;
    text: boolean;
    pdf: boolean;
    video: boolean;
    audio: boolean;
  };
  max_tokens: number;
  name: string;
  object: string;
  output: {
    image: boolean;
    text: boolean;
    audio: boolean;
    video: boolean;
  };
  owned_by: string;
  pricing: {
    input?: string;
    output?: string;
    input_cache_read?: string;
    input_cache_write?: string;
    web_search?: string;
    image?: string;
  };
  reasoning: boolean;
  tags?: string[];
  toolCall: boolean;
  type: "language" | "embedding" | "image" | "video";
}

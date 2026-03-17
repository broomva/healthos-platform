// Layer system types for Symphony Forge

export interface ProjectConfig {
  description: string;
  layers: string[];
  name: string;
  packageManager: "bun" | "npm" | "yarn" | "pnpm";
}

export interface FileEntry {
  content: string;
  executable?: boolean;
  path: string;
}

export interface Layer {
  dependsOn?: string[];
  description: string;
  generate: (config: ProjectConfig) => FileEntry[];
  name: string;
  postInstall?: (config: ProjectConfig, projectDir: string) => Promise<void>;
}

export interface ForgeManifest {
  createdAt: string;
  installedLayers: string[];
  packageManager: string;
  updatedAt: string;
  version: string;
}

export const LAYER_NAMES = [
  "control",
  "harness",
  "knowledge",
  "consciousness",
  "autoany",
] as const;

export type LayerName = (typeof LAYER_NAMES)[number];

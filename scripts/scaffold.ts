// scaffold.ts — Full init orchestration: next-forge clone + metalayer layers

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { log, spinner } from "@clack/prompts";
import { ALL_LAYER_NAMES, getOrderedLayers } from "./layers/index.js";
import type {
  FileEntry,
  ForgeManifest,
  ProjectConfig,
} from "./layers/types.js";

/**
 * Write generated files to disk, creating directories as needed.
 * Returns the list of paths written.
 */
export const writeLayerFiles = async (
  projectDir: string,
  files: FileEntry[]
): Promise<string[]> => {
  const written: string[] = [];
  for (const file of files) {
    const fullPath = join(projectDir, file.path);
    await mkdir(dirname(fullPath), { recursive: true });
    await writeFile(fullPath, file.content, {
      mode: file.executable ? 0o755 : 0o644,
    });
    written.push(file.path);
  }
  return written;
};

/**
 * Write or update the .symphony-forge.json manifest.
 */
export const writeManifest = async (
  projectDir: string,
  config: ProjectConfig
) => {
  const manifestPath = join(projectDir, ".symphony-forge.json");
  let manifest: ForgeManifest;

  try {
    const existing = await readFile(manifestPath, "utf-8");
    const parsed = JSON.parse(existing) as ForgeManifest;
    manifest = {
      ...parsed,
      installedLayers: [
        ...new Set([...parsed.installedLayers, ...config.layers]),
      ],
      updatedAt: new Date().toISOString(),
    };
  } catch {
    manifest = {
      version: "1.0.0",
      installedLayers: config.layers,
      packageManager: config.packageManager,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
};

/**
 * Scaffold metalayer layers into a project directory.
 * Called by both `init` (after next-forge clone) and `layer` command.
 */
export const scaffoldLayers = async (
  projectDir: string,
  config: ProjectConfig
): Promise<string[]> => {
  const orderedLayers = getOrderedLayers(config.layers);
  const allFiles: FileEntry[] = [];

  for (const layer of orderedLayers) {
    const files = layer.generate(config);
    allFiles.push(...files);
  }

  const written = await writeLayerFiles(projectDir, allFiles);

  // Run postInstall hooks
  for (const layer of orderedLayers) {
    if (layer.postInstall) {
      await layer.postInstall(config, projectDir);
    }
  }

  // Write manifest
  await writeManifest(projectDir, config);

  return written;
};

/**
 * Enhanced init that adds metalayer on top of the standard next-forge init.
 * Called after initialize() completes.
 */
export const scaffoldAfterInit = async (
  projectDir: string,
  config: ProjectConfig,
  noLayers: boolean
) => {
  if (noLayers) {
    log.info("Skipping metalayer (--no-layers). Pure next-forge project.");
    return;
  }

  const s = spinner();
  s.start("Scaffolding metalayer...");

  const layerNames = config.layers.length > 0 ? config.layers : ALL_LAYER_NAMES;
  const fullConfig = { ...config, layers: layerNames };

  const written = await scaffoldLayers(projectDir, fullConfig);

  s.stop(
    `Metalayer scaffolded (${written.length} files across ${layerNames.length} layers)`
  );
};

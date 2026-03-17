// layer-cmd.ts — `layer` subcommand handler

import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  cancel,
  confirm,
  intro,
  isCancel,
  log,
  outro,
  select,
  spinner,
} from "@clack/prompts";
import { detectPackageManager } from "nypm";
import { ALL_LAYER_NAMES, getOrderedLayers, layers } from "./layers/index.js";
import type { ForgeManifest, ProjectConfig } from "./layers/types.js";
import { scaffoldLayers } from "./scaffold.js";

/**
 * Detect project config from existing manifest or cwd.
 */
const detectConfig = async (
  cwd: string
): Promise<{
  packageManager: ProjectConfig["packageManager"];
  installedLayers: string[];
}> => {
  const manifestPath = join(cwd, ".symphony-forge.json");

  // Try reading existing manifest
  try {
    const raw = await readFile(manifestPath, "utf-8");
    const manifest = JSON.parse(raw) as ForgeManifest;
    return {
      packageManager:
        manifest.packageManager as ProjectConfig["packageManager"],
      installedLayers: manifest.installedLayers,
    };
  } catch {
    // No manifest — detect from environment
  }

  // Detect package manager
  const detected = await detectPackageManager(cwd);
  const pm = (detected?.name ?? "npm") as ProjectConfig["packageManager"];

  return { packageManager: pm, installedLayers: [] };
};

/**
 * Check which files would conflict.
 */
const findConflicts = (
  cwd: string,
  layerNames: string[],
  config: ProjectConfig
): string[] => {
  const orderedLayers = getOrderedLayers(layerNames);
  const conflicts: string[] = [];

  for (const layer of orderedLayers) {
    const files = layer.generate(config);
    for (const file of files) {
      if (existsSync(join(cwd, file.path))) {
        conflicts.push(file.path);
      }
    }
  }

  return conflicts;
};

const resolveTargetLayers = async (
  layerName: string | undefined
): Promise<string[]> => {
  if (layerName === "all") {
    return [...ALL_LAYER_NAMES];
  }
  if (layerName && layerName in layers) {
    return [layerName];
  }
  if (layerName) {
    log.error(
      `Unknown layer: ${layerName}\nAvailable layers: ${ALL_LAYER_NAMES.join(", ")}, all`
    );
    process.exit(1);
  }

  const value = await select({
    message: "Which layer would you like to add?",
    options: [
      { value: "all", label: "all — Install all layers" },
      ...ALL_LAYER_NAMES.map((n) => ({
        value: n,
        label: `${n} — ${layers[n].description}`,
      })),
    ],
  });

  if (isCancel(value)) {
    cancel("Operation cancelled.");
    process.exit(0);
  }

  return value === "all" ? [...ALL_LAYER_NAMES] : [value as string];
};

export const layerCommand = async (options: {
  name?: string;
  force?: boolean;
}) => {
  try {
    intro("Symphony Forge — Layer Manager");

    const cwd = process.cwd();
    const targetLayers = await resolveTargetLayers(options.name);

    // Detect project config
    const detected = await detectConfig(cwd);

    // Build project config
    const pkgJsonPath = join(cwd, "package.json");
    let projectName = "my-project";
    try {
      const pkgRaw = await readFile(pkgJsonPath, "utf-8");
      const pkg = JSON.parse(pkgRaw);
      projectName = pkg.name || projectName;
    } catch {
      // Use default
    }

    const config: ProjectConfig = {
      name: projectName,
      description: "",
      packageManager: detected.packageManager,
      layers: [...new Set([...detected.installedLayers, ...targetLayers])],
    };

    // Check for file conflicts
    if (!options.force) {
      const conflicts = findConflicts(cwd, targetLayers, config);
      if (conflicts.length > 0) {
        log.warn(
          `The following files already exist:\n${conflicts.map((f) => `  - ${f}`).join("\n")}`
        );
        const shouldOverwrite = await confirm({
          message: "Overwrite existing files?",
          initialValue: false,
        });

        if (isCancel(shouldOverwrite) || !shouldOverwrite) {
          cancel("Operation cancelled. Use --force to overwrite.");
          process.exit(0);
        }
      }
    }

    // Scaffold
    const s = spinner();
    s.start(`Installing layer(s): ${targetLayers.join(", ")}...`);

    const written = await scaffoldLayers(cwd, config);

    s.stop(`Installed ${written.length} files.`);

    log.info(`Layers installed: ${targetLayers.join(", ")}`);
    log.info("Files written:");
    for (const file of written) {
      log.message(`  ${file}`);
    }

    outro("Layer installation complete.");
  } catch (error) {
    const message =
      error instanceof Error ? error.message : `Layer command failed: ${error}`;
    log.error(message);
    process.exit(1);
  }
};

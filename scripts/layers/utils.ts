// Template helpers for layer generators

import type { ProjectConfig } from "./types.js";

/** Bash script header with strict mode */
export const bashHeader = (
  description: string,
  usage: string,
  timeout?: string
) => {
  const lines = [
    "#!/usr/bin/env bash",
    "set -euo pipefail",
    "",
    `# ${description}`,
    `# Usage: ${usage}`,
  ];
  if (timeout) {
    lines.push(`# Timeout: ${timeout}`);
  }
  lines.push(
    "",
    // biome-ignore lint/suspicious/noTemplateCurlyInString: bash variable syntax
    'REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"',
    'cd "$REPO_ROOT"',
    ""
  );
  return lines.join("\n");
};

/** Package manager run command */
export const pmRun = (config: ProjectConfig, script: string) => {
  switch (config.packageManager) {
    case "bun":
      return `bun run ${script}`;
    case "yarn":
      return `yarn ${script}`;
    case "pnpm":
      return `pnpm run ${script}`;
    default:
      return `npm run ${script}`;
  }
};

/** Package manager exec command */
export const pmExec = (config: ProjectConfig, cmd: string) => {
  switch (config.packageManager) {
    case "bun":
      return `bunx ${cmd}`;
    case "yarn":
      return `yarn dlx ${cmd}`;
    case "pnpm":
      return `pnpm dlx ${cmd}`;
    default:
      return `npx ${cmd}`;
  }
};

/** Package manager install command */
export const pmInstall = (config: ProjectConfig, frozen = false) => {
  switch (config.packageManager) {
    case "bun":
      return frozen ? "bun install --frozen-lockfile" : "bun install";
    case "yarn":
      return frozen ? "yarn install --frozen-lockfile" : "yarn install";
    case "pnpm":
      return frozen ? "pnpm install --frozen-lockfile" : "pnpm install";
    default:
      return frozen ? "npm ci" : "npm install";
  }
};

/** Lock file name for the package manager */
export const lockFileName = (config: ProjectConfig) => {
  switch (config.packageManager) {
    case "bun":
      return "bun.lock";
    case "yarn":
      return "yarn.lock";
    case "pnpm":
      return "pnpm-lock.yaml";
    default:
      return "package-lock.json";
  }
};

/** Filter flag for turborepo commands */
export const turboFilter = (config: ProjectConfig) => {
  return config.packageManager === "npm" ? "--workspace" : "--filter";
};

/** Whether a layer is installed in this config */
export const hasLayer = (config: ProjectConfig, layer: string) =>
  config.layers.includes(layer);

/** Generate a YAML-safe string (basic) */
export const yamlString = (s: string) =>
  s.includes(":") || s.includes("#") || s.includes('"')
    ? `"${s.replace(/"/g, '\\"')}"`
    : s;

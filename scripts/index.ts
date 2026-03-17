#!/usr/bin/env node

import { program } from "commander";
import { auditCommand } from "./audit-cmd.js";
import { initialize } from "./initialize.js";
import { layerCommand } from "./layer-cmd.js";
import { ALL_LAYER_NAMES } from "./layers/index.js";
import type { ProjectConfig } from "./layers/types.js";
import { scaffoldAfterInit } from "./scaffold.js";
import { update } from "./update.js";

program
  .name("symphony-forge")
  .description(
    "Scaffold next-forge projects with a composable control metalayer"
  )
  .version("0.1.0");

program
  .command("init")
  .description("Initialize a new next-forge project with metalayer")
  .option("--name <name>", "Name of the project")
  .option(
    "--package-manager <manager>",
    "Package manager to use (bun, npm, yarn, pnpm)"
  )
  .option("--disable-git", "Disable git initialization")
  .option("--branch <branch>", "Git branch to clone from")
  .option("--no-layers", "Skip metalayer scaffolding (pure next-forge)")
  .option(
    "--layers <layers>",
    "Comma-separated list of layers to install (default: all)"
  )
  .action(async (options) => {
    // Run the standard next-forge init
    await initialize(options);

    // Scaffold metalayer on top
    const projectDir = process.cwd();
    const layerList = options.layers
      ? (options.layers as string).split(",").map((s: string) => s.trim())
      : ALL_LAYER_NAMES;

    const config: ProjectConfig = {
      name: options.name || projectDir.split("/").pop() || "my-project",
      description: "",
      packageManager: options.packageManager || "bun",
      layers: layerList,
    };

    await scaffoldAfterInit(projectDir, config, options.layers === false);
  });

program
  .command("layer [name]")
  .description(
    `Add a layer to an existing project. Available: ${ALL_LAYER_NAMES.join(", ")}, all`
  )
  .option("--force", "Overwrite existing files without prompting")
  .action(async (name: string | undefined, options: { force?: boolean }) => {
    await layerCommand({ name, force: options.force });
  });

program
  .command("audit")
  .description("Run entropy audit on the current project")
  .action(async () => {
    await auditCommand();
  });

program
  .command("update")
  .description("Update the project from one version to another")
  .option("--from <version>", "Version to update from e.g. 1.0.0")
  .option("--to <version>", "Version to update to e.g. 2.0.0")
  .action(update);

program.parse(process.argv);

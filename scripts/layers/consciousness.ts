// Consciousness layer — generates CLAUDE.md and AGENTS.md (metalayer-aware)

import type { FileEntry, Layer, ProjectConfig } from "./types.js";
import { hasLayer, pmInstall, pmRun } from "./utils.js";

const generateClaudeMd = (config: ProjectConfig): string => {
  const pm = config.packageManager;
  const pmInstallCmd = pmInstall(config);

  const controlSection = hasLayer(config, "control")
    ? `## Control Harness

Policy gates and automation scripts live alongside the code:

- **\`.control/policy.yaml\`** — Risk gates for database migrations, dependency updates, env changes, new packages, deploys
- **\`.control/commands.yaml\`** — Canonical command definitions (smoke, check, test, build, ci, docs-check, deploy)
- **\`.control/topology.yaml\`** — Full repo map: all apps, packages, knowledge entry points
`
    : `## Control Harness

> [!warning]
> The \`control\` layer is not installed. Run \`npx symphony-forge layer control\` to add governance gates.
`;

  const harnessSection = hasLayer(config, "harness")
    ? `- **\`scripts/harness/\`** — Executable bash scripts for each command
- **\`Makefile.control\`** — \`make -f Makefile.control <target>\` to run any harness command

Key commands:
- \`make -f Makefile.control smoke\` — quick validation (~120s)
- \`make -f Makefile.control check\` — lint + typecheck (~60s)
- \`make -f Makefile.control ci\` — full pipeline: check + test + build (~600s)
- \`make -f Makefile.control audit\` — entropy audit: topology coverage, stale docs, broken links
`
    : `> [!warning]
> The \`harness\` layer is not installed. Run \`npx symphony-forge layer harness\` to add build automation.
`;

  const knowledgeSection = hasLayer(config, "knowledge")
    ? `## Knowledge Graph

The knowledge graph lives in \`docs/\` using Obsidian-flavored Markdown with frontmatter tags.

- **Entry point**: \`docs/_index.md\` — full graph map, tag taxonomy, traversal instructions
- **Architecture**: \`docs/architecture/\` — system diagrams, app descriptions
- **Decisions**: \`docs/decisions/\` — Architecture Decision Records (ADRs)
- **Runbooks**: \`docs/runbooks/\` — step-by-step operational procedures
- **Templates**: \`docs/_templates/\` — templates for new docs

Linking conventions: \`[[architecture/overview]]\` for wikilinks, Mermaid for diagrams, \`> [!decision]\` / \`> [!warning]\` for callouts.
`
    : `## Knowledge Graph

> [!warning]
> The \`knowledge\` layer is not installed. Run \`npx symphony-forge layer knowledge\` to add the documentation skeleton.
`;

  const depSection = `## Dependency Management

Library updates and dependency hygiene are a first-class concern:

- **Batch updates by type** — prefer updating at the workspace root rather than individual packages.
- **Risk tiers**:
  - **Patch versions**: Low risk — batch and merge freely after build passes.
  - **Minor versions**: Medium risk — review changelogs, run full test suite.
  - **Major versions**: High risk — review migration guides, test thoroughly.
  - **Type-only updates** (\`@types/*\`): Low risk — update freely, just ensure typecheck passes.
- **After updating**: Always run \`${pmInstallCmd}\`, then \`make -f Makefile.control check\` and \`make -f Makefile.control test\` at minimum.
`;

  const autoanySection = hasLayer(config, "autoany")
    ? `## Self-Improvement (EGRI)

The EGRI (Evaluate → Generate → Rank → Integrate) loop is configured in \`.control/egri.yaml\`.

- **Mutable surfaces**: Things the system can change (scripts, docs, config)
- **Immutable evaluators**: Metrics that judge changes (build pass, test pass, lint clean)
- **Promotion criteria**: When to accept a change into the main branch
`
    : "";

  const workingProtocol = `## Working Protocol

Follow this protocol for every task:

1. **Read \`AGENTS.md\`** — understand commands, constraints, and knowledge graph structure
${hasLayer(config, "knowledge") ? "2. **Traverse `docs/`** — start at `docs/_index.md`, navigate to domain-specific docs\n" : ""}${hasLayer(config, "control") ? "3. **Check policy** — run `make -f Makefile.control policy-check` to see if changes trigger risk gates\n" : ""}4. **Implement** — follow the constraints in AGENTS.md
${hasLayer(config, "knowledge") ? "5. **Update docs** — any schema, API, or env var change must have a corresponding doc update in `docs/`\n" : ""}${hasLayer(config, "harness") ? "6. **Run checks** — `make -f Makefile.control check` before committing; `make -f Makefile.control ci` before pushing\n" : ""}`;

  return `# CLAUDE.md — ${config.name}

## Project
${config.name}${config.description ? ` — ${config.description}` : ""}

## Stack
- next-forge (Turborepo + Next.js 15)
- ${pm === "bun" ? "Bun" : pm} as package manager

## Commands
- \`${pmInstallCmd}\` — install dependencies
- \`${pmRun(config, "dev")}\` — start all apps in dev mode
- \`${pmRun(config, "build")}\` — build all apps
- \`${pmRun(config, "check")}\` — lint all packages

## Conventions
- App Router (Next.js) — no pages/ directory
- Server Components by default, 'use client' only when needed
- Shared UI components in packages/design-system
- Database schema in packages/database (Prisma)

${knowledgeSection}
${controlSection}
${harnessSection}
${depSection}
${autoanySection}
${workingProtocol}
`;
};

const generateAgentsMd = (config: ProjectConfig): string => {
  const pm = config.packageManager;

  const commandsTable = hasLayer(config, "harness")
    ? `## Commands

All commands are defined in \`.control/commands.yaml\` and accessible via \`Makefile.control\`:

| Command | What it does | When to use |
|---------|-------------|-------------|
| \`make -f Makefile.control smoke\` | Install + check + build app | After pulling changes |
| \`make -f Makefile.control check\` | Lint + typecheck | Before every commit |
| \`make -f Makefile.control test\` | Run test suite | Before pushing |
| \`make -f Makefile.control build\` | Full build | Before deploy |
| \`make -f Makefile.control ci\` | check + test + build | Full local CI simulation |
| \`make -f Makefile.control docs-check\` | Verify docs freshness | After docs/ changes |
| \`make -f Makefile.control policy-check\` | Policy gate warnings | Before committing |
| \`make -f Makefile.control audit\` | Full entropy audit | Periodic health check |

Direct ${pm} commands also work:
- \`${pmInstall(config)}\` — install dependencies
- \`${pmRun(config, "dev")}\` — start all apps in dev mode
- \`${pmRun(config, "build")}\` — build all apps
- \`${pmRun(config, "test")}\` — run tests
- \`${pmRun(config, "check")}\` — lint
`
    : `## Commands

- \`${pmInstall(config)}\` — install dependencies
- \`${pmRun(config, "dev")}\` — start all apps in dev mode
- \`${pmRun(config, "build")}\` — build all apps
- \`${pmRun(config, "test")}\` — run tests

> [!warning]
> The \`harness\` layer is not installed. Run \`npx symphony-forge layer harness\` for build automation via \`Makefile.control\`.
`;

  const knowledgeTraversal = hasLayer(config, "knowledge")
    ? `## Knowledge Graph Traversal

The knowledge graph lives in \`docs/\` using Obsidian-flavored Markdown:

### Entry Point
Start at \`docs/_index.md\`. It contains:
- The full graph map (every document listed)
- Tag taxonomy for filtering
- Traversal instructions for different tasks

### Loading Order
When starting a task:
1. Read \`docs/_index.md\` to orient
2. Read the domain-specific architecture doc
3. Read related ADRs in \`docs/decisions/\`
4. Read the relevant runbook if performing an operational task

### Linking Conventions
- Wikilinks: \`[[architecture/overview]]\` links to \`docs/architecture/overview.md\`
- Callouts: \`> [!decision]\`, \`> [!warning]\`, \`> [!context]\`
- Diagrams: Mermaid code blocks for system diagrams
`
    : "";

  const prePushChecklist = `## Pre-Push Checklist

Before pushing any branch:

${hasLayer(config, "knowledge") ? "- [ ] Documentation updated for any schema, API, or env var changes\n" : ""}${
  hasLayer(config, "harness")
    ? `- [ ] \`make -f Makefile.control check\` passes (lint + typecheck)
- [ ] \`make -f Makefile.control test\` passes
`
    : `- [ ] Lint passes
- [ ] Tests pass
`
}${hasLayer(config, "control") ? "- [ ] `make -f Makefile.control policy-check` reviewed\n" : ""}${hasLayer(config, "knowledge") ? "- [ ] `docs/_index.md` updated if new docs were added\n- [ ] No broken `[[wikilinks]]`\n" : ""}- [ ] Commit messages are clear and reference relevant context
`;

  return `# AGENTS.md — ${config.name} Agent Guide

This is the entry point for AI coding agents working on ${config.name}.
Read this file first. Follow the protocols exactly.

## Quick Start

1. **Read this file** completely before doing any work.
${hasLayer(config, "knowledge") ? "2. **Traverse the knowledge graph** starting at `docs/_index.md`.\n" : ""}${hasLayer(config, "control") ? "3. **Check policy gates** — run `bash scripts/harness/check-policy.sh` to see if your changes trigger any policies.\n" : ""}4. **Implement changes** following the constraints below.
${hasLayer(config, "knowledge") ? "5. **Update documentation** — any code change that affects architecture, APIs, schemas, or env vars must have a corresponding doc update.\n" : ""}${hasLayer(config, "harness") ? "6. **Run checks** — `make -f Makefile.control check` before committing.\n" : ""}

## Repository Structure

| Path | Type | Description |
|------|------|-------------|
| \`apps/app\` | Next.js | Main application (port 3000) |
| \`apps/api\` | Next.js | API server (port 3002) |
| \`apps/web\` | Next.js | Marketing site (port 3001) |
| \`apps/docs\` | Docs | Public documentation |
| \`apps/email\` | React Email | Email templates |
| \`apps/storybook\` | Storybook | Component explorer |
| \`packages/database\` | Prisma | ORM + schema |
| \`packages/design-system\` | shadcn/ui | Shared UI components |
| \`packages/auth\` | Auth | Authentication |
${hasLayer(config, "control") ? "| `.control/` | YAML | Policy gates, commands, topology |\n" : ""}${hasLayer(config, "knowledge") ? "| `docs/` | Markdown | Knowledge graph (Obsidian-flavored) |\n" : ""}${hasLayer(config, "harness") ? "| `scripts/harness/` | Bash | Automation scripts |\n" : ""}

${commandsTable}

## Constraints

These are hard rules. Violations will be caught by CI or pre-commit hooks.

1. **App Router only** — No \`pages/\` directory. All routes use Next.js App Router.
2. **Server Components by default** — Only add \`'use client'\` when the component needs browser APIs, hooks, or event handlers.
3. **Prisma for database** — All schema changes go through the Prisma schema.
4. **No secrets in code** — Environment variables go in \`.env.local\` (gitignored).
5. **Workspace imports** — Use \`@repo/<package>\` imports. Never use relative paths across package boundaries.
${hasLayer(config, "knowledge") ? "6. **Update docs on schema changes** — Any change to the database schema, API contracts, or environment variables requires a documentation update.\n7. **ADR for architectural decisions** — Major changes need an Architecture Decision Record in `docs/decisions/`.\n" : ""}${hasLayer(config, "control") ? "8. **Policy compliance** — Check `.control/policy.yaml` for risk gates before committing high-risk changes.\n" : ""}9. **TypeScript strict mode** — \`noEmit\` typecheck must pass. No \`any\` types without justification.

${knowledgeTraversal}
${prePushChecklist}
`;
};

export const consciousnessLayer: Layer = {
  name: "consciousness",
  description:
    "Metalayer-aware CLAUDE.md and AGENTS.md for AI agent governance",
  dependsOn: ["control", "harness", "knowledge"],
  generate: (config: ProjectConfig): FileEntry[] => [
    { path: "CLAUDE.md", content: generateClaudeMd(config) },
    { path: "AGENTS.md", content: generateAgentsMd(config) },
  ],
};

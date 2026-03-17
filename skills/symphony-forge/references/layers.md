# Layer System — Complete Reference

## Architecture

Each layer is a TypeScript module implementing the `Layer` interface:

```typescript
interface Layer {
  name: string;
  description: string;
  dependsOn?: string[];  // soft dependencies — adjusts content, not required
  generate: (config: ProjectConfig) => FileEntry[];
  postInstall?: (config: ProjectConfig, projectDir: string) => Promise<void>;
}
```

Templates are **inline TypeScript template literals** — no separate template files. This ensures tsup bundles everything into a single `dist/index.js`.

## ProjectConfig

```typescript
interface ProjectConfig {
  name: string;
  description: string;
  packageManager: "bun" | "npm" | "yarn" | "pnpm";
  layers: string[];
}
```

The `layers` array determines which layers are active. The consciousness layer reads this to conditionally generate content — sections for uninstalled layers include callout warnings.

## Layer Dependency Graph

```
control ──→ harness
   │           │
   └──→ knowledge
   │           │
   └──→ autoany
            │
consciousness (reads all)
```

Dependencies are **soft** — installing `consciousness` alone works, but the generated CLAUDE.md will include "install X layer" callouts for missing layers.

## File Generation

Each layer's `generate()` method returns `FileEntry[]`:

```typescript
interface FileEntry {
  path: string;      // relative to project root
  content: string;   // file content
  executable?: boolean;  // chmod +x (for bash scripts)
}
```

The scaffold system writes these files, creates directories as needed, and records installed layers in `.symphony-forge.json`.

## Control Layer — Generated Files

### .control/policy.yaml
Risk gates with:
- `triggers`: file glob patterns that activate the policy
- `requires`: checks that must pass
- `risk`: low | medium | high | critical
- `rollback`: how to undo

### .control/commands.yaml
Command registry mapping harness scripts:
- `script`: path to executable
- `timeout`: max seconds
- `usage`: make command
- `when`: recommended context

### .control/topology.yaml
Repository map:
- Apps with ports, risk levels, domains, dependencies
- Packages with paths and domains
- Knowledge entry points

## Harness Layer — Generated Files

9 bash scripts following these conventions:
- `#!/usr/bin/env bash` + `set -euo pipefail`
- `REPO_ROOT` resolution via `BASH_SOURCE`
- Package-manager-agnostic commands via template helpers
- Consistent echo format: `[step/total] Description...`

Plus:
- `Makefile.control` with `.PHONY` targets and help text
- `.github/workflows/ci.yml` for GitHub Actions

## Knowledge Layer — Generated Files

Obsidian-flavored Markdown with:
- YAML frontmatter (title, type, domain, status, tags)
- Wikilinks: `[[path/to/doc]]` → `docs/path/to/doc.md`
- Callouts: `> [!decision]`, `> [!warning]`, `> [!context]`
- Mermaid diagrams in fenced code blocks

## Consciousness Layer — Generated Files

CLAUDE.md and AGENTS.md that:
- Reference the correct package manager throughout
- Include/exclude sections based on installed layers
- Follow the metalayer pattern (read policy → traverse docs → check → implement → update docs → run checks)

## AutoAny Layer — Generated Files

EGRI config with:
- Evaluators (blocking: build, typecheck, tests; non-blocking: audit)
- Mutable surfaces with constraints
- Immutable surfaces (protected files)
- Ranking strategy and promotion criteria

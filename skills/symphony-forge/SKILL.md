---
name: symphony-forge
description: Expert assistance for symphony-forge — a CLI that scaffolds next-forge projects with a composable control metalayer for AI agent governance. Triggers on questions about initializing projects with symphony-forge, adding metalayer layers (control, harness, knowledge, consciousness, autoany), running entropy audits, configuring EGRI self-improvement loops, and setting up AI-agent-ready development workflows. Also serves as a skill creator — use this to bootstrap new projects with built-in agent skills.
---

# symphony-forge

symphony-forge is a CLI tool that extends next-forge (the production-grade Turborepo template) with a **composable control metalayer** — governance gates, build automation, knowledge graphs, and AI agent instructions that make projects autonomous-agent-ready from day one.

## Quick Start

### Initialize a new project (next-forge + all layers)

```bash
npx symphony-forge init my-project
```

### Add layers to an existing project

```bash
npx symphony-forge layer all        # Add all 5 layers
npx symphony-forge layer control    # Just governance gates
npx symphony-forge layer harness    # Just build automation
npx symphony-forge layer knowledge  # Just docs skeleton
npx symphony-forge layer consciousness  # Just CLAUDE.md + AGENTS.md
npx symphony-forge layer autoany    # Just EGRI config
```

### Run entropy audit

```bash
npx symphony-forge audit
```

## Layer System

symphony-forge uses a **composable layer architecture**. Each layer generates files into your project. Layers have soft dependencies — they adjust content based on what's installed but work independently.

| Layer | Files Generated | Purpose |
|-------|----------------|---------|
| **control** | `.control/policy.yaml`, `commands.yaml`, `topology.yaml` | Governance gates, command registry, repo topology |
| **harness** | `scripts/harness/*.sh` (9 scripts), `Makefile.control`, `.github/workflows/ci.yml` | Build automation, git hooks, CI |
| **knowledge** | `docs/_index.md`, `docs/_templates/` (5), `docs/glossary.md`, architecture docs, ADRs, runbooks | Obsidian knowledge graph skeleton |
| **consciousness** | `CLAUDE.md`, `AGENTS.md` | AI agent instructions — metalayer-aware, safety-guardrailed |
| **autoany** | `.control/egri.yaml` | EGRI self-improvement loop config |

## What Each Layer Does

### Control Layer

The control layer creates `.control/` YAML files that define your project's governance:

- **policy.yaml** — Risk gates for database migrations (HIGH), dependency updates (MEDIUM), env variable changes (HIGH), new packages (MEDIUM), production deploys (CRITICAL). Each policy specifies triggers (file patterns), required checks, and rollback procedures.
- **commands.yaml** — Canonical command definitions mapping to harness scripts. Each command has a description, script path, timeout, usage pattern, and recommended context.
- **topology.yaml** — Full repo map listing all apps and packages with paths, descriptions, ports, risk levels, domains, and dependencies.

### Harness Layer

Generates 9 executable bash scripts + Makefile + CI workflow:

| Script | Purpose | Timeout |
|--------|---------|---------|
| `smoke.sh` | Install + check + build main app | ~120s |
| `check.sh` | Lint + typecheck | ~60s |
| `ci.sh` | Full pipeline: check + test + build | ~600s |
| `check-policy.sh` | Advisory policy gate warnings for staged files | — |
| `check-docs-freshness.sh` | Verify all docs referenced in `_index.md` | ~10s |
| `check-wikilinks.sh` | Validate `[[wikilinks]]` resolve to real files | ~10s |
| `audit.sh` | Entropy audit: topology, stale docs, wikilinks | — |
| `install-hooks.sh` | Install pre-commit git hook | — |
| `pre-commit.sh` | Fast hook: lint staged TS + docs check | <10s |

All scripts use `set -euo pipefail`, `REPO_ROOT` resolution, and are parameterized for your package manager (bun/npm/yarn/pnpm).

The `Makefile.control` provides `make -f Makefile.control <target>` for all commands. The CI workflow runs check → test → build on push/PR.

### Knowledge Layer

Creates an Obsidian-flavored Markdown knowledge graph:

- `docs/_index.md` — Entry point with Mermaid graph map, tag taxonomy, traversal instructions
- `docs/glossary.md` — Key terminology definitions
- `docs/architecture/overview.md` — System architecture with Mermaid diagrams
- `docs/decisions/adr-001-metalayer.md` — ADR explaining the control metalayer choice
- `docs/runbooks/local-dev-setup.md` — Getting started runbook
- `docs/_templates/` — 5 templates (ADR, architecture, runbook, API contract, schema)

Documents use frontmatter tags (`domain/`, `status/`, `type/`) and wikilinks (`[[architecture/overview]]`).

### Consciousness Layer (Key Differentiator)

Generates `CLAUDE.md` and `AGENTS.md` that are **metalayer-aware**:

- Content is **conditional on installed layers** — sections for uninstalled layers include callout warnings suggesting installation
- References correct package manager commands throughout
- Includes working protocol, constraints, knowledge graph traversal, and pre-push checklists
- Instructions tell agents to read policy.yaml, traverse docs/_index.md, run Makefile.control checks, and follow EGRI loops

### AutoAny Layer (EGRI)

Generates `.control/egri.yaml` defining the Evaluate → Generate → Rank → Integrate self-improvement loop:

- **Mutable surfaces** — What the system can change (scripts, docs, control config, agent instructions) with constraints
- **Immutable surfaces** — Protected files (schema, env, lockfile)
- **Evaluators** — Blocking (build, typecheck, tests) and non-blocking (audit) checks
- **Ranking** — Strategy for comparing before/after states
- **Promotion** — Criteria and method for accepting changes

## Manifest Tracking

symphony-forge creates `.symphony-forge.json` in your project root, tracking:
- Which layers are installed
- Package manager
- Creation and update timestamps

This enables smart `layer` additions (detects conflicts) and future `update --layers` support.

## Creating Skills for Your Project

symphony-forge projects are **skill-ready**. To create a custom skill for your project:

### 1. Create the skill directory

```bash
mkdir -p skills/my-skill/references
```

### 2. Write SKILL.md

```markdown
---
name: my-skill
description: Expert assistance for [your domain]. Triggers on [what activates it].
---

# my-skill

[Instructions for the agent when this skill activates]

## Key concepts
[Domain knowledge the agent needs]

## Common tasks
[Step-by-step procedures]
```

### 3. Add references (optional)

Place detailed documentation in `references/` — agents load these on-demand without bloating the initial context.

### 4. Register with skills.sh

```bash
npx skills init my-skill     # Initialize metadata
npx skills publish            # Publish to skills.sh registry
```

For detailed layer contents and architecture, see:

- `references/layers.md` — Complete layer system documentation
- `references/metalayer-pattern.md` — The control metalayer design pattern
- `references/skill-creation.md` — Full guide to creating and publishing agent skills

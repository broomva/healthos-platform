# symphony-forge

Scaffold [next-forge](https://github.com/vercel/next-forge) projects with a composable **control metalayer** for AI agent governance.

[![npm version](https://img.shields.io/npm/v/symphony-forge.svg)](https://www.npmjs.com/package/symphony-forge)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![skills.sh](https://img.shields.io/badge/skills.sh-symphony--forge-purple)](https://skills.sh)

## What is this?

symphony-forge extends next-forge with 5 composable layers that make your project autonomous-agent-ready:

| Layer | What it generates | Purpose |
|-------|------------------|---------|
| **control** | `.control/{policy,commands,topology}.yaml` | Governance gates, command registry, repo topology |
| **harness** | `scripts/harness/*.sh`, `Makefile.control`, CI workflow | Build automation, git hooks, CI/CD |
| **knowledge** | `docs/` skeleton (index, glossary, ADRs, runbooks, templates) | Obsidian knowledge graph |
| **consciousness** | `CLAUDE.md`, `AGENTS.md` | AI agent instructions (metalayer-aware) |
| **autoany** | `.control/egri.yaml` | EGRI self-improvement loop config |

## Quick Start

### New project (next-forge + all layers)

```bash
npx symphony-forge init my-project
```

### Add layers to an existing project

```bash
npx symphony-forge layer all          # All 5 layers
npx symphony-forge layer control      # Just governance
npx symphony-forge layer consciousness # Just agent instructions
```

### Run entropy audit

```bash
npx symphony-forge audit
```

## Install as a skill

```bash
npx skills add broomva/symphony-forge@symphony-forge
```

## CLI Commands

```
symphony-forge init <name>              # next-forge clone + metalayer
symphony-forge init <name> --no-layers  # Pure next-forge (no metalayer)
symphony-forge init <name> --layers control,harness  # Specific layers
symphony-forge layer <name>             # Add single layer to existing project
symphony-forge layer all                # Add all layers
symphony-forge audit                    # Entropy audit (topology, docs, wikilinks)
symphony-forge update                   # Update from upstream next-forge
```

## The Control Metalayer Pattern

The metalayer maps to control theory:

- **Sensors** — Policy gates detect high-risk changes
- **Actuators** — Harness scripts enforce standards
- **Model** — Knowledge graph is the system's self-description
- **Controller** — Agent instructions (CLAUDE.md/AGENTS.md) close the loop
- **Feedback** — EGRI cycle + audit measure and reduce entropy

## How Layers Work

Layers are **composable** — each works independently but adjusts content based on what else is installed. Installing `consciousness` alone generates CLAUDE.md with callout warnings for missing layers:

```
> [!warning]
> The `control` layer is not installed. Run `npx symphony-forge layer control` to add governance gates.
```

A `.symphony-forge.json` manifest tracks installed layers and package manager.

## Package Manager Support

All generated scripts are parameterized for your package manager:

```bash
npx symphony-forge init my-project --package-manager pnpm
```

Supports: `bun` (default), `npm`, `yarn`, `pnpm`.

## Generated File Tree (all layers)

```
.control/
  policy.yaml           # Risk gates (6 policies)
  commands.yaml         # Command registry (8 commands)
  topology.yaml         # Repo map (apps + packages)
  egri.yaml             # EGRI self-improvement loop
scripts/harness/
  smoke.sh              # Quick validation (~120s)
  check.sh              # Lint + typecheck (~60s)
  ci.sh                 # Full pipeline (~600s)
  check-policy.sh       # Advisory policy warnings
  check-docs-freshness.sh
  check-wikilinks.sh
  audit.sh              # Entropy audit
  install-hooks.sh      # Git hook installer
  pre-commit.sh         # Fast pre-commit hook
docs/
  _index.md             # Knowledge graph entry point
  glossary.md           # Terminology
  architecture/overview.md
  decisions/adr-001-metalayer.md
  runbooks/local-dev-setup.md
  _templates/           # 5 doc templates
.github/workflows/ci.yml
Makefile.control
CLAUDE.md
AGENTS.md
.symphony-forge.json
```

## Development

```bash
bun install
npx tsup                # Build CLI
node dist/index.js --help
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

## License

[Apache 2.0](LICENSE)

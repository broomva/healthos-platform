---
title: "ADR-005: Control Harness & Metalayer"
type: decision
domain: infra
phase: 1
status: active
tags:
  - domain/infra
  - phase/1
  - status/active
  - type/decision
last_validated: "2026-03-18"
---

# ADR-005: Control Harness & Metalayer

## Status

**Accepted** -- 2026-03. Updated 2026-03-18 with sensors/setpoints from local dev validation.

## Context

healthOS Platform is built by human developers and AI coding agents working together. Without guardrails, agents can:

1. Make changes without understanding the broader architecture
2. Skip tests or linting before committing
3. Introduce breaking changes to API contracts without updating docs
4. Ignore existing Architecture Decision Records

We need a **control metalayer** -- a set of policies, scripts, and automation that ensures quality and consistency regardless of who (or what) is making changes.

## Options Considered

### Option A: Harness scripts + policy files + CI workflows

- Shell scripts in `scripts/harness/` for common operations (smoke test, check, CI)
- YAML policy files in `.control/` defining gates and constraints
- GitHub Actions workflows enforcing policies on PR/push
- Makefile for human-friendly command interface
- Lightweight, transparent, versionable

### Option B: Custom CLI tool

- TypeScript CLI with commands for check, test, build
- More powerful but requires maintenance of the CLI itself
- Adds complexity to the development setup
- Harder for agents to understand and modify

### Option C: GitHub Actions only

- All enforcement happens in CI
- No local enforcement (catch issues only after push)
- Slower feedback loop
- No protection against pushing broken code

## Decision

> [!decision]
> Implement a **three-layer control harness**: (1) `.control/` YAML configuration, (2) `scripts/harness/` shell scripts, and (3) GitHub Actions workflows. This provides both local and CI enforcement with minimal tooling overhead.

## Rationale

- **Local-first**: Developers and agents get immediate feedback via harness scripts before pushing
- **Policy-as-code**: `.control/policy.yaml` makes quality gates explicit and reviewable
- **Composable**: Scripts can be combined (e.g., `ci.sh` = `check.sh` + test + build)
- **Agent-friendly**: Shell scripts are universally understood by coding agents
- **Progressive enforcement**: Pre-commit hooks catch issues early, CI enforces on PR

## Architecture

### Layer 1: Configuration (`.control/`)

```yaml
# .control/policy.yaml
policies:
  database-migration:
    triggers: ["packages/database/schema.ts", "packages/database/migrations/**"]
    requires: [adr, test, review]
  auth-change:
    triggers: ["packages/auth/**", "**/middleware.ts"]
    requires: [proxy-check, test]
  env-variable-change:
    triggers: ["**/keys.ts", "**/.env.example"]
    requires: [docs-update, validation]

# .control/commands.yaml
commands:
  smoke: scripts/harness/smoke.sh
  check: scripts/harness/check.sh
  ci: scripts/harness/ci.sh
  migrate: "cd packages/database && bunx drizzle-kit push"

# .control/topology.yaml — full app/package map with health status
apps:
  health: { port: 3011, status: healthy }
  chat:   { port: 3010, status: healthy }
  api:    { port: 3002, status: healthy }
  app:    { port: 3000, status: healthy }
  web:    { port: 3001, status: degraded }  # needs BASEHUB_TOKEN
  docs:   { port: 3004, status: healthy }
  email:  { port: 3003, status: healthy }
  storybook: { port: 6006, status: healthy }
  studio: { port: 5555, status: stale }     # Prisma leftover

# .control/policy.yaml also includes sensors and setpoints
sensors:
  env-setup: { status: partial }
  app-health: { measured_at: "2026-03-18" }
  database: { status: healthy }
  known-issues: { items: [...] }
```

### Layer 2: Scripts (`scripts/harness/`)

| Script | Purpose | Runs |
|--------|---------|------|
| `smoke.sh` | Quick validation: install + lint + build | Manual, pre-commit |
| `check.sh` | Full lint (Biome) + typecheck (tsc) | Manual, CI |
| `ci.sh` | check + test + build | CI |
| `pre-commit.sh` | Lint staged + typecheck + docs freshness | Git hook |
| `check-docs-freshness.sh` | Verify all docs are indexed in `_index.md` | Pre-commit, CI |
| `check-wikilinks.sh` | Validate no broken `[[wikilinks]]` | Pre-commit, CI |
| `check-policy.sh` | Policy compliance for staged changes | Pre-commit |
| `audit.sh` | Entropy audit (stale docs, unused deps) | Manual, weekly |
| `install-hooks.sh` | Copy pre-commit to `.git/hooks/` | Setup |

### Layer 3: CI (`.github/workflows/`)

| Workflow | Trigger | Steps |
|----------|---------|-------|
| `ci.yml` | PR, push to main | check -> test -> build |
| `docs-sync.yml` | Changes to `docs/` | check-docs-freshness + check-wikilinks |

## Sensors & Setpoints (added 2026-03-18)

The control metalayer now includes **sensors** (observable system state) and **setpoints** (target values) in `.control/policy.yaml`. This extends the control-loop metaphor:

| Sensor | What It Measures | Current Value | Setpoint |
|--------|-----------------|---------------|----------|
| `env-setup` | Environment variable completeness | partial | complete |
| `app-health` | Dev server status per app | 7/9 healthy, 1 degraded, 1 stale | all healthy |
| `database` | Neon PostgreSQL connectivity | healthy | healthy |
| `known-issues` | Outstanding dev setup issues | 4 items | 0 items |

Sensors are updated manually after dev sessions or automatically by CI. They provide a snapshot-in-time view of system health, making it easy for agents to understand what is working and what needs attention.

### Known Issues (setpoint: 0)

| ID | Severity | Summary |
|----|----------|---------|
| BASEHUB | low | `@repo/cms` needs BASEHUB_TOKEN for apps/web |
| STUDIO-PRISMA | low | `apps/studio` expects Prisma but project uses Drizzle |
| STRIPE-CLI | low | Stripe CLI not installed (webhook testing blocked) |
| DOCS-STALE | medium | Some docs still reference Prisma/Clerk instead of Drizzle/Better Auth |

## Agent Integration

Agents must:

1. Start every session by reading `docs/_index.md`
2. Run `make -f Makefile.control check` before committing
3. Check `.control/policy.yaml` sensors for current system health
4. Update relevant docs when changing architecture
5. Create an ADR before making significant technical decisions
6. Follow runbooks for operational tasks

The `AGENTS.md` file at the repo root provides the canonical agent protocol. See [[decisions/adr-004-knowledge-system]] for the knowledge system design.

## Consequences

### Positive
- Quality gates are explicit, reviewable, and versionable
- Local and CI enforcement prevents broken code from landing
- Agents have clear constraints and procedures
- Sensors provide observable system health for both humans and agents
- Pre-commit hooks provide immediate feedback
- Policy changes go through PR review

### Negative
- Additional files to maintain (`.control/`, `scripts/harness/`, workflows)
- Pre-commit hooks add latency to commits
- Shell scripts may have cross-platform issues (macOS vs Linux)
- Sensors require manual updates until CI automation is built
- Overhead for small changes (e.g., README typo fix still runs checks)

### Mitigations
- `Makefile.control` provides a simple interface
- Scripts target <10s execution time for pre-commit
- Shell scripts tested in CI on both macOS and Linux runners
- Sensor updates can be triggered by harness scripts in the future

## Related

- [[decisions/adr-004-knowledge-system]] -- Knowledge graph design
- [[runbooks/local-dev-setup]] -- Setup instructions including hook installation
- [[architecture/monorepo-topology]] -- Repository structure

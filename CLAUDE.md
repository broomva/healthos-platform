# CLAUDE.md - healthOS Platform

## Project
healthOS is an AI-powered health intelligence platform built as a next-forge turborepo monorepo.
It combines a general-purpose AI chat system (chat-js) with health-specific intelligence (Garmin integration, biometric analysis, training optimization).

## Stack
- next-forge (Turborepo + Next.js 16)
- Bun as package manager
- Better Auth for authentication (Google, GitHub, anonymous)
- Stripe for billing
- Drizzle ORM + Neon PostgreSQL
- AI SDK v6 (Anthropic, OpenAI, Google, Ollama)
- shadcn/ui + Tailwind CSS v4
- Sentry for observability
- Symphony for agent orchestration

## Apps
- `apps/chat` — AI chat platform (from chat-js) with multi-provider, MCP, branching, deep research
- `apps/health` — Health intelligence dashboard with Garmin tools, biometric analysis
- `apps/web` — Marketing site
- `apps/api` — API server + Stripe webhooks

## Key Shared Packages
- `@repo/database` — Drizzle ORM schema (user, chat, message, document)
- `@repo/auth` — Better Auth (social + anonymous sessions)
- `@repo/ai` — AI SDK v6 multi-provider gateway + ToolLoopAgent
- `@repo/health-tools` — Garmin query, health snapshot, sleep, training, vitals
- `@repo/design-system` — shadcn/ui + AI elements + health components

## Commands
- `bun install` — install dependencies
- `bun dev` — start all apps in dev mode
- `bun build` — build all apps
- `make -f Makefile.control smoke` — quick validation (typecheck + lint + build)
- `make -f Makefile.control check` — lint + typecheck
- `make -f Makefile.control ci` — full pipeline

## Conventions
- App Router (Next.js) — no pages/ directory
- Server Components by default, 'use client' only when needed
- Shared UI components in packages/design-system
- Database schema in packages/database (Drizzle ORM, NOT Prisma)
- Health tools in packages/health-tools
- Bun for all package operations (not npm/yarn)

## Linear Project
- Workspace: Broomva (BRO)
- Project: healthOS
- API: Use Linear GraphQL API with $LINEAR_API_KEY (NOT MCP Linear tools — those target Stimulus)
- Tickets: BRO-6 to BRO-20 (features), BRO-21 to BRO-31 (monorepo revamp)

## Knowledge Graph
Entry point: `docs/_index.md`. Architecture in `docs/architecture/`. Decisions in `docs/decisions/`.

## Control Harness
- `.control/policy.yaml` — Risk gates
- `.control/commands.yaml` — Command registry
- `.control/topology.yaml` — Repo map
- `scripts/harness/` — Executable bash scripts
- `Makefile.control` — `make -f Makefile.control <target>`

## Working Protocol
1. Read AGENTS.md — understand constraints
2. Traverse docs/ — start at docs/_index.md
3. Check policy — `make -f Makefile.control policy-check`
4. Implement — follow constraints
5. Update docs — any schema/API/env change needs doc update
6. Run checks — `make -f Makefile.control check` before commit

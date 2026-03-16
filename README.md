# Symphony Cloud

Managed service platform for [Symphony](https://github.com/broomva/symphony) — the open-source coding agent orchestrator.

## Architecture

```
symphony-cloud/
├── apps/
│   ├── web/          → Marketing site (Next.js)
│   ├── app/          → Dashboard (Next.js + Clerk + Stripe)
│   ├── api/          → Control plane API (Next.js API routes)
│   └── desktop/      → Tauri desktop app (future)
├── packages/
│   ├── ui/           → Shared design system (shadcn/ui + Tailwind)
│   ├── db/           → Database schema (Drizzle/Prisma)
│   ├── symphony-client/ → TypeScript SDK for Symphony HTTP API
│   ├── auth/         → Clerk auth helpers
│   ├── billing/      → Stripe integration
│   └── analytics/    → Usage metering
└── infra/            → Terraform + K8s configs
```

## Relationship to Symphony (open source)

| Layer | Repo | License |
|-------|------|---------|
| Orchestration engine | [symphony](https://github.com/broomva/symphony) | Apache 2.0 |
| CLI + basic dashboard | [symphony](https://github.com/broomva/symphony) | Apache 2.0 |
| Managed platform | symphony-cloud (this repo) | Proprietary |

## Getting Started

```bash
# Prerequisites: Node.js 20+, Bun
bun install
bun dev        # Start all apps in dev mode
```

## Stack

- **Framework**: Next.js 15 (App Router)
- **Monorepo**: Turborepo
- **Auth**: Clerk
- **Payments**: Stripe
- **Database**: PostgreSQL (Neon) + Drizzle ORM
- **UI**: shadcn/ui + Tailwind CSS v4
- **Observability**: Sentry
- **Deployment**: Vercel (web/app/api) + Railway/Fly (Symphony instances)

## Scaffold

This repo will be initialized with [next-forge](https://github.com/vercel/next-forge).

```bash
npx next-forge init symphony-cloud
```

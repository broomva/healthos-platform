# CLAUDE.md - Symphony Cloud

## Project
Symphony Cloud is the managed service platform for Symphony (the open-source coding agent orchestrator).
This is a next-forge monorepo with Next.js, Clerk auth, Stripe billing, and a control plane API.

## Relationship to Symphony
- The open-source engine lives at /Users/broomva/symphony (Rust, Apache 2.0)
- This repo is the proprietary SaaS layer (TypeScript, Proprietary)
- The dashboard connects to Symphony's HTTP API (/api/v1/state, /api/v1/refresh)

## Stack
- next-forge (Turborepo + Next.js 15)
- Bun as package manager
- Clerk for auth
- Stripe for billing
- Drizzle ORM + Neon PostgreSQL
- shadcn/ui + Tailwind CSS v4
- Sentry for observability

## Commands
- `bun install` — install dependencies
- `bun dev` — start all apps in dev mode
- `bun build` — build all apps
- `bun lint` — lint all packages

## Conventions
- App Router (Next.js) — no pages/ directory
- Server Components by default, 'use client' only when needed
- Shared UI components in packages/ui
- Database schema in packages/db
- Symphony API client in packages/symphony-client

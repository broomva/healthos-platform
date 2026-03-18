---
title: "Environment Variables Catalog"
type: schema
domain: all
phase: 1
status: active
tags:
  - domain/all
  - phase/1
  - status/active
  - type/schema
last_validated: "2026-03-18"
---

# Environment Variables Catalog

> [!context]
> This catalogs all environment variables used across healthOS Platform. Variables are validated at runtime using `@t3-oss/env-nextjs` with Zod schemas in each package's `keys.ts` file.
> Last validated: 2026-03-18 against actual `.env.local` files and `keys.ts` sources.

## Configuration Pattern

Each package defines its env vars in a `keys.ts` file:

```typescript
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const keys = () =>
  createEnv({
    server: {
      MY_VAR: z.string().optional(),
    },
    client: {
      NEXT_PUBLIC_MY_VAR: z.string().optional(),
    },
    emptyStringAsUndefined: true,
    runtimeEnv: {
      MY_VAR: process.env.MY_VAR,
      NEXT_PUBLIC_MY_VAR: process.env.NEXT_PUBLIC_MY_VAR,
    },
  });
```

Apps compose these in their `env.ts`:

```typescript
import { keys as authKeys } from "@repo/auth/keys";
import { keys as databaseKeys } from "@repo/database/keys";

export const env = createEnv({
  extends: [authKeys(), databaseKeys()],
  // app-specific vars...
});
```

## Variable Catalog

### Authentication (`@repo/auth`) — Better Auth

> [!important]
> Auth uses **Better Auth** (NOT Clerk). The variables below are the actual ones validated in `packages/auth/keys.ts`.

| Variable | Type | Required | Scope | Description |
|----------|------|----------|-------|-------------|
| `BETTER_AUTH_SECRET` | string | Yes | Server | Better Auth session signing secret (generate: `openssl rand -base64 32`) |
| `BETTER_AUTH_URL` | url | Yes | Server | Better Auth base URL (e.g., `http://localhost:3011`) |
| `GOOGLE_CLIENT_ID` | string | For Google OAuth | Server | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | string | For Google OAuth | Server | Google OAuth client secret |
| `GITHUB_CLIENT_ID` | string | For GitHub OAuth | Server | GitHub OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | string | For GitHub OAuth | Server | GitHub OAuth app client secret |

### Secrets (generated during setup)

| Variable | Type | Required | Scope | Description |
|----------|------|----------|-------|-------------|
| `AUTH_SECRET` | string | Yes | Server | General auth secret (generate: `openssl rand -base64 32`) |
| `CRON_SECRET` | string | For monitoring | Server | Bearer token to protect cron endpoints |
| `MCP_ENCRYPTION_KEY` | string | For MCP | Server | Encryption key for MCP tool communication |

### Database (`@repo/database`)

| Variable | Type | Required | Scope | Description |
|----------|------|----------|-------|-------------|
| `DATABASE_URL` | string | Yes | Server | Neon PostgreSQL connection string (format: `postgresql://...@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require`) |

### Payments (`@repo/payments`)

| Variable | Type | Required | Scope | Description |
|----------|------|----------|-------|-------------|
| `STRIPE_SECRET_KEY` | string | For billing | Server | Stripe API secret key |
| `STRIPE_WEBHOOK_SECRET` | string | For webhooks | Server | Stripe webhook signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | string | For billing | Client | Stripe publishable key |

### Observability (`@repo/observability`)

| Variable | Type | Required | Scope | Description |
|----------|------|----------|-------|-------------|
| `SENTRY_DSN` | string | No | Server | Sentry Data Source Name |
| `NEXT_PUBLIC_SENTRY_DSN` | string | No | Client | Sentry DSN for browser |
| `SENTRY_AUTH_TOKEN` | string | No | Server | Sentry auth for source maps |
| `SENTRY_ORG` | string | No | Server | Sentry organization slug |
| `SENTRY_PROJECT` | string | No | Server | Sentry project slug |
| `LOGTAIL_SOURCE_TOKEN` | string | No | Server | Logtail/Better Stack token |

### Analytics (`@repo/analytics`)

| Variable | Type | Required | Scope | Description |
|----------|------|----------|-------|-------------|
| `NEXT_PUBLIC_POSTHOG_KEY` | string | No | Client | PostHog project API key |
| `NEXT_PUBLIC_POSTHOG_HOST` | string | No | Client | PostHog API host |

### Collaboration (`@repo/collaboration`)

| Variable | Type | Required | Scope | Description |
|----------|------|----------|-------|-------------|
| `LIVEBLOCKS_SECRET` | string | No | Server | Liveblocks secret key |

### CMS (`@repo/cms`)

| Variable | Type | Required | Scope | Description |
|----------|------|----------|-------|-------------|
| `BASEHUB_TOKEN` | string | For apps/web | Server | BaseHub CMS token (required for marketing site layout) |

### Email (`@repo/email`)

| Variable | Type | Required | Scope | Description |
|----------|------|----------|-------|-------------|
| `RESEND_API_KEY` | string | No | Server | Resend API key for transactional email |

### Feature Flags (`@repo/feature-flags`)

| Variable | Type | Required | Scope | Description |
|----------|------|----------|-------|-------------|
| `FLAGS_SECRET` | string | No | Server | Feature flag secret for Vercel flags |

### Rate Limiting (`@repo/rate-limit`)

| Variable | Type | Required | Scope | Description |
|----------|------|----------|-------|-------------|
| `UPSTASH_REDIS_REST_URL` | string | No | Server | Upstash Redis URL |
| `UPSTASH_REDIS_REST_TOKEN` | string | No | Server | Upstash Redis token |

### Storage (`@repo/storage`)

| Variable | Type | Required | Scope | Description |
|----------|------|----------|-------|-------------|
| `BLOB_READ_WRITE_TOKEN` | string | No | Server | Vercel Blob storage token |

### AI (`@repo/ai`)

| Variable | Type | Required | Scope | Description |
|----------|------|----------|-------|-------------|
| `ANTHROPIC_API_KEY` | string | For Claude models | Server | Anthropic API key |
| `OPENAI_API_KEY` | string | For GPT models | Server | OpenAI API key |
| `GOOGLE_GENERATIVE_AI_API_KEY` | string | For Gemini models | Server | Google AI API key |

## App-Level Variables

### Core URLs (`@repo/next-config`)

| Variable | Type | Required | Scope | Description |
|----------|------|----------|-------|-------------|
| `NEXT_PUBLIC_APP_URL` | url | Yes | Client | Dashboard URL (e.g., https://app.healthos.dev) |
| `NEXT_PUBLIC_WEB_URL` | url | Yes | Client | Marketing site URL (e.g., https://healthos.dev) |
| `NEXT_PUBLIC_API_URL` | url | No | Client | API URL (e.g., https://api.healthos.dev) |
| `NEXT_PUBLIC_DOCS_URL` | url | No | Client | Docs URL (e.g., https://docs.healthos.dev) |

## .env.local File Locations (validated 2026-03-18)

Environment files created during local setup:

| Location | Purpose |
|----------|---------|
| `packages/database/.env.local` | DATABASE_URL |
| `apps/health/.env.local` | Auth, DB, AI keys |
| `apps/chat/.env.local` | Auth, DB, AI keys |
| `apps/api/.env.local` | Auth, DB, CRON_SECRET |
| `apps/app/.env.local` | Auth, DB |
| `apps/web/.env.local` | BASEHUB_TOKEN |

## Security Notes

> [!warning]
> - **Never commit `.env.local` files** -- they are gitignored
> - **Server-only variables** (no `NEXT_PUBLIC_` prefix) are never exposed to the browser
> - **`emptyStringAsUndefined: true`** means empty strings are treated as missing values
> - API keys and secrets should be rotated regularly
> - Use different keys for development and production
> - Secrets generated via `openssl rand -base64 32` during setup: AUTH_SECRET, BETTER_AUTH_SECRET, CRON_SECRET, MCP_ENCRYPTION_KEY

## Related

- [[runbooks/local-dev-setup]] -- Setting up env vars for development
- [[architecture/package-map]] -- Which packages use which env vars

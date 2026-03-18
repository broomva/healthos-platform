---
title: "Runbook: Local Development Setup"
type: runbook
domain: infra
phase: 1
status: active
tags:
  - domain/infra
  - phase/1
  - status/active
  - type/runbook
last_validated: "2026-03-18"
---

# Runbook: Local Development Setup

> [!context]
> This runbook covers setting up healthOS Platform for local development from scratch.
> Last validated: 2026-03-18 via agent-browser session with all apps verified.

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | >= 18 | `brew install node` or [nvm](https://github.com/nvm-sh/nvm) |
| Bun | 1.3.10+ | `curl -fsSL https://bun.sh/install \| bash` |
| Git | Latest | `brew install git` |

### External Service Accounts

You will need accounts and API keys for:

| Service | Required | Purpose | Docs |
|---------|----------|---------|------|
| Neon | Yes | PostgreSQL database | https://neon.tech |
| Better Auth | Yes (built-in) | Authentication (Google, GitHub, anonymous) | https://www.better-auth.com |
| Google Cloud | For Google OAuth | OAuth client credentials | https://console.cloud.google.com |
| GitHub | For GitHub OAuth | OAuth app credentials | https://github.com/settings/developers |
| Stripe | For billing | Payment processing | https://stripe.com |
| Sentry | For observability | Error tracking | https://sentry.io |
| BaseHub | For apps/web CMS | Content management | https://basehub.com |

> [!important]
> The auth provider is **Better Auth** (NOT Clerk). Some file names may still reference Clerk due to next-forge scaffolding, but the actual auth logic uses Better Auth with Google, GitHub, and anonymous session support.

## Steps

### 1. Clone the Repository

```bash
git clone <repository-url> healthos-platform
cd healthos-platform
```

### 2. Install Dependencies

```bash
bun install
```

> [!tip]
> Bun is the required package manager (`packageManager: "bun@1.3.10"` in `package.json`). Do not use npm or yarn.

### 3. Create Neon Database

1. Create a Neon Serverless PostgreSQL project (e.g., "healthos-platform")
2. Note the connection string (format: `postgresql://...@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require`)

### 4. Generate Secrets

Generate cryptographic secrets for auth and encryption:

```bash
# Generate each secret
openssl rand -base64 32  # AUTH_SECRET
openssl rand -base64 32  # BETTER_AUTH_SECRET
openssl rand -base64 32  # CRON_SECRET
openssl rand -base64 32  # MCP_ENCRYPTION_KEY
```

### 5. Configure Environment Variables

Create `.env.local` files for the following locations:

| Location | Key Variables |
|----------|-------------|
| `packages/database/.env.local` | `DATABASE_URL` |
| `apps/health/.env.local` | `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL=http://localhost:3011` |
| `apps/chat/.env.local` | `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL=http://localhost:3010` |
| `apps/api/.env.local` | `DATABASE_URL`, `CRON_SECRET`, auth secrets |
| `apps/app/.env.local` | `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL=http://localhost:3000` |
| `apps/web/.env.local` | `BASEHUB_TOKEN` (required for CMS layout) |

**Minimum required variables**:

```env
# Database (all apps that use @repo/database)
DATABASE_URL=postgresql://...@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require

# Better Auth
BETTER_AUTH_SECRET=<generated-secret>
BETTER_AUTH_URL=http://localhost:<app-port>

# Optional: OAuth providers
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

See [[schemas/env-variables]] for the complete catalog.

### 6. Push Database Schema

The project uses **Drizzle ORM** (NOT Prisma). Push the schema to Neon:

```bash
cd packages/database && bunx drizzle-kit push
```

This applies the schema from `packages/database/schema.ts` directly. No migration files are created (use `drizzle-kit generate` for versioned migrations).

### 7. Start Development Servers

Start all apps simultaneously:

```bash
bun dev
```

Or start individual apps:

```bash
# Health dashboard only
cd apps/health && bun dev

# Chat only
cd apps/chat && bun dev
```

### 8. Verify Setup

| App | URL | Expected | Status (2026-03-18) |
|-----|-----|----------|---------------------|
| health | http://localhost:3011 | Health AI chat with Claude Haiku | Working |
| chat | http://localhost:3010 | AI chat (GPT-5 nano), sign-in page | Working |
| api | http://localhost:3002 | 404 on root (expected, endpoints on sub-paths) | Working |
| app | http://localhost:3000 | 404 on root (no root page in next-forge default) | Working |
| web | http://localhost:3001 | Marketing site (requires BASEHUB_TOKEN) | Needs token |
| email | http://localhost:3003 | React Email preview | Working |
| storybook | http://localhost:6006 | Storybook 10 component library | Working |
| docs | http://localhost:3004 | Mintlify documentation | Working |

### 9. Install Git Hooks (Optional)

```bash
# If scripts/harness/install-hooks.sh exists:
bash scripts/harness/install-hooks.sh
```

## Common Tasks

### Running Tests

```bash
bun test
```

### Linting

```bash
bun check        # Check for lint errors
bun run fix      # Auto-fix lint errors
```

### Building

```bash
bun build
```

> [!important]
> `bun build` runs tests first (configured in `turbo.json`). If tests fail, the build will not proceed.

### Database Inspection

Use Drizzle Kit Studio (NOT Prisma Studio):

```bash
cd packages/database && bunx drizzle-kit studio
```

> [!warning]
> `apps/studio` is a next-forge leftover that expects Prisma. It does not work with the Drizzle-based schema. Use `drizzle-kit studio` instead.

## Troubleshooting

### "DATABASE_URL is not set"

Ensure your `.env.local` file exists in `packages/database/` and the consuming app's directory, and contains a valid `DATABASE_URL`. The `@repo/database` package validates this via `@t3-oss/env-nextjs`.

### Auth Proxy Middleware Error

If Next.js middleware crashes with an undefined return, check `packages/auth/proxy.ts`. The `authMiddleware` function must wrap callbacks properly:

```typescript
// Correct (fixed 2026-03-18):
export const authMiddleware =
  (callback: (...args: any[]) => any) =>
  (request: any, event: any) =>
    callback({}, request, event);

// WRONG (original, caused crashes):
// export const authMiddleware = () => undefined;
```

### apps/web Fails to Start

The marketing site requires `BASEHUB_TOKEN` for the CMS layout component. Without it, the layout throws. Either:
- Add a valid BaseHub token to `apps/web/.env.local`
- Or skip this app during development

### apps/studio Does Not Work

`apps/studio` is a next-forge leftover that expects Prisma. This project uses Drizzle ORM. Use `cd packages/database && bunx drizzle-kit studio` for database inspection.

### Port Already in Use

The default ports are 3000-3004, 3010-3011, and 6006. If a port is occupied, Next.js will auto-increment to the next available port.

## Related

- [[architecture/monorepo-topology]] -- Workspace structure
- [[schemas/env-variables]] -- All environment variables
- [[runbooks/database-migration]] -- Schema change workflow (Drizzle)
- [[decisions/adr-001-next-forge]] -- Why next-forge

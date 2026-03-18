# Sentry Integration Status

> Audit date: 2026-03-17 | Linear: BRO-18

## Current State

The `@repo/observability` package has a **complete Sentry SDK setup** via `@sentry/nextjs ^10.42.0`. The package provides:

| File                 | Purpose                                       |
|----------------------|-----------------------------------------------|
| `client.ts`          | Browser-side `Sentry.init()` with Replay, console logging integration |
| `server.ts`          | Node server-side `Sentry.init()` with local variables capture         |
| `edge.ts`            | Edge runtime `Sentry.init()`                                          |
| `instrumentation.ts` | Runtime-aware initializer + `captureRequestError` export              |
| `next-config.ts`     | `withSentry()` wrapper for Next.js config (source maps, tunnel route) |
| `error.ts`           | `parseError()` utility that calls `Sentry.captureException()`         |
| `keys.ts`            | Env validation via `@t3-oss/env-nextjs` for `SENTRY_ORG`, `SENTRY_PROJECT`, `NEXT_PUBLIC_SENTRY_DSN` |

## Per-App Integration

### Fully integrated (reference apps)

These apps wire up all four Sentry hooks — matching the next-forge convention:

| App        | `instrumentation.ts` | `instrumentation-client.ts` | `sentry.server.config.ts` | `sentry.edge.config.ts` | `global-error.tsx` | `next.config` `withSentry()` |
|------------|:--------------------:|:---------------------------:|:-------------------------:|:-----------------------:|:------------------:|:---------------------------:|
| `apps/app` | Yes                  | Yes                         | Yes                       | Yes                     | Yes                | Yes                         |
| `apps/api` | Yes                  | Yes                         | Yes                       | Yes                     | Yes                | Yes                         |
| `apps/web` | Yes                  | Yes                         | Yes                       | Yes                     | Yes                | Yes                         |

### Not integrated (healthOS apps)

| App          | `instrumentation.ts`       | `instrumentation-client.ts` | `sentry.server.config.ts` | `sentry.edge.config.ts` | `global-error.tsx` | `next.config` `withSentry()` |
|--------------|:--------------------------:|:---------------------------:|:-------------------------:|:-----------------------:|:------------------:|:---------------------------:|
| `apps/chat`  | Exists (OTel/Langfuse only) | Missing                     | Missing                   | Missing                 | Missing            | No                          |
| `apps/health`| Exists (OTel only)          | Missing                     | Missing                   | Missing                 | Missing            | No                          |

**Neither `apps/chat` nor `apps/health` depend on `@repo/observability`** — they are not listed in their `package.json` dependencies.

## Environment Variables Required

```
NEXT_PUBLIC_SENTRY_DSN=https://<key>@<org>.ingest.us.sentry.io/<project-id>
SENTRY_ORG=<org-slug>
SENTRY_PROJECT=<project-slug>
```

All three are validated as optional in `keys.ts`, so builds will not break if they are unset — Sentry simply stays inactive.

## Steps to Fully Enable Sentry for `apps/chat` and `apps/health`

### 1. Add `@repo/observability` dependency

In each app's `package.json`, add:

```json
"@repo/observability": "workspace:*"
```

### 2. Replace `instrumentation.ts`

Replace the current OTel-only file with the Sentry-aware version:

```ts
import { initializeSentry } from "@repo/observability/instrumentation";

export const register = initializeSentry;
export { onRequestError } from "@repo/observability/instrumentation";
```

> If the app also needs Langfuse/OTel, compose both in a custom `register()`.

### 3. Create `instrumentation-client.ts`

```ts
import { initializeSentry } from "@repo/observability/client";

initializeSentry();

export { onRouterTransitionStart } from "@repo/observability/client";
```

### 4. Create `sentry.server.config.ts`

```ts
import { initializeSentry } from "@repo/observability/server";

initializeSentry();
```

### 5. Create `sentry.edge.config.ts`

```ts
import { initializeSentry } from "@repo/observability/edge";

initializeSentry();
```

### 6. Wrap `next.config.ts` with `withSentry()`

```ts
import { withLogging, withSentry } from "@repo/observability/next-config";

let nextConfig: NextConfig = withLogging({ /* existing config */ });
nextConfig = withSentry(nextConfig);

export default nextConfig;
```

### 7. Add `global-error.tsx` in the app directory

Copy from `apps/app/app/global-error.tsx` — it calls `captureException` on unhandled errors.

### 8. Set environment variables

Ensure `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, and `SENTRY_PROJECT` are set in `.env.local` (or Vercel project settings) for each app.

## Notes

- The `@sentry/nextjs` version in the observability package is `^10.42.0` — keep this aligned across the monorepo.
- `withSentry()` in `next-config.ts` adds `transpilePackages: ["@sentry/nextjs"]` automatically.
- The tunnel route `/monitoring` is configured to bypass ad-blockers — ensure it does not conflict with Next.js middleware.
- Source map upload is silent outside CI (`silent: !process.env.CI`).

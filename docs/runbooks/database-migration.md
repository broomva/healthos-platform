---
title: "Runbook: Database Migration"
type: runbook
domain: database
phase: 1
status: active
tags:
  - domain/database
  - phase/1
  - status/active
  - type/runbook
last_validated: "2026-03-18"
---

# Runbook: Database Migration

> [!context]
> This runbook covers the database schema change workflow using **Drizzle ORM** migrations against Neon PostgreSQL. All schema changes go through `packages/database/schema.ts`.
>
> **Important**: The ORM is Drizzle (NOT Prisma). Earlier documentation referenced Prisma; that was stale.

## When to Use This Runbook

- Adding a new table (pgTable)
- Modifying existing table columns
- Adding or modifying indexes
- Any change to `packages/database/schema.ts`

> [!decision]
> Per [[decisions/adr-005-control-harness]], database migrations require an ADR for significant schema changes. Minor additive changes (e.g., adding an optional column) may skip the ADR if they are backward-compatible.

## Pre-Flight Checklist

- [ ] Read the current schema: `packages/database/schema.ts`
- [ ] Review [[schemas/database-schema]] for context
- [ ] Check if an ADR is needed (significant changes)
- [ ] Ensure `DATABASE_URL` is set in `packages/database/.env.local`

## Steps

### 1. Edit the Schema

Modify `packages/database/schema.ts`:

```typescript
import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

// Example: adding a new table
export const workflowVersion = pgTable("workflow_version", {
  id: uuid("id").primaryKey().defaultRandom(),
  workflowId: uuid("workflow_id").notNull(),
  version: integer("version").notNull(),
  content: text("content").notNull(),
  changeNote: text("change_note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
```

### 2. Push Schema (Development)

For rapid prototyping — applies schema changes directly without migration files:

```bash
cd packages/database && bunx drizzle-kit push
```

> [!warning]
> `drizzle-kit push` can be destructive. It will drop data if you remove columns or tables. Only use this for development databases.

### 3. Generate Migration Files (Production)

For creating versioned migration SQL files:

```bash
cd packages/database && bunx drizzle-kit generate
```

Migration files are created in:
```
packages/database/migrations/{timestamp}_{name}.sql
```

### 4. Apply Migration Files

```bash
cd packages/database && bunx drizzle-kit migrate
```

### 5. Verify Schema

Open Drizzle Kit Studio to inspect the database:

```bash
cd packages/database && bunx drizzle-kit studio
```

> [!important]
> Do NOT use `apps/studio` (Prisma Studio) -- it is a next-forge leftover that does not work with Drizzle.

### 6. Update Documentation

- Update [[schemas/database-schema]] with the new table/column documentation
- If the change is significant, create an ADR in `docs/decisions/`

### 7. Test

```bash
bun test
```

Ensure all existing tests pass and add tests for the new schema functionality.

## Rollback

Drizzle migrations are plain SQL files. To reverse a migration:

1. Create a new migration that undoes the change (e.g., `ALTER TABLE ... DROP COLUMN ...`)
2. Apply with `bunx drizzle-kit migrate`

For emergencies, you can execute SQL directly against the Neon database.

## Neon Branch Strategy

Neon supports database branching for safe schema development:

1. Create a branch from production in the Neon dashboard
2. Point `DATABASE_URL` to the branch
3. Develop and test the migration
4. Merge the branch (or apply the migration to production)

## Conventions

| Convention | Rule |
|------------|------|
| Table naming | Snake_case in PostgreSQL (e.g., `"user_preference"`) |
| ID format | `uuid("id").primaryKey().defaultRandom()` for most tables |
| User ID refs | `varchar("user_id", { length: 36 }).references(() => user.id, { onDelete: "cascade" })` |
| Timestamps | `timestamp("created_at").notNull().defaultNow()` |
| Soft deletes | Use a `deletedAt` timestamp column when needed |
| Schema file | Single file: `packages/database/schema.ts` |
| Config file | `packages/database/drizzle.config.ts` |

## Current Schema (16 tables, validated 2026-03-18)

| Table | Purpose |
|-------|---------|
| `user` | Auth users (Better Auth) |
| `session` | Auth sessions |
| `account` | OAuth accounts |
| `verification` | Email verification tokens |
| `chat` | Chat conversations |
| `message` | Chat messages (role + parts JSON) |
| `vote` | Message upvotes/downvotes |
| `document` | User documents |
| `suggestion` | Document edit suggestions |
| `stream` | Streaming state |
| `project` | User projects (from chat-js) |
| `user_credit` | User credit balances |
| `user_preference` | Key-value user preferences |
| `health_baseline` | Health metric baselines (mean, stddev) |
| `subscription` | Stripe subscription tracking |
| `conversation_memory` | Agent memory facts per user |
| `team` | Team workspaces |
| `team_member` | Team membership |
| `document_share` | Document sharing/permissions |

## Related

- [[schemas/database-schema]] -- Full schema documentation
- [[runbooks/local-dev-setup]] -- Development environment setup
- [[architecture/data-flow]] -- Database access patterns

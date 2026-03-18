---
# Symphony Workflow — healthOS
# Polls Linear for active issues, dispatches Claude agents in isolated workspaces

tracker:
  kind: linear
  api_key: $LINEAR_API_KEY
  project_slug: healthos
  team_key: BRO
  candidate_states:
    - Todo
    - Backlog
  active_states:
    - In Progress
  done_state: Done
  canceled_state: Canceled

codex:
  command: claude --dangerously-skip-permissions
  max_turns: 25
  timeout: 1800  # 30 minutes per issue

workspace:
  root: /tmp/symphony-healthos
  strategy: worktree  # git worktree isolation
  repo: https://github.com/broomva/healthos-platform.git
  base_branch: main

concurrency: 2
poll_interval: 120  # seconds

hooks:
  after_create: |
    cd {{ workspace.path }}
    git fetch origin main
    git checkout -b {{ issue.identifier | downcase }}/{{ issue.title | slugify }}
    bun install
  before_run: |
    cd {{ workspace.path }}
    git fetch origin main
    git rebase origin/main || git rebase --abort
  after_run: |
    cd {{ workspace.path }}
    make smoke || exit 1
    git add -A
    git commit -m "{{ issue.identifier }}: {{ issue.title }}" --allow-empty || true
    git push -u origin HEAD
    gh pr create \
      --title "{{ issue.identifier }}: {{ issue.title }}" \
      --body "Resolves {{ issue.identifier }}\n\n{{ issue.description | truncate: 500 }}\n\n---\nAutomated by Symphony" \
      --base main || true
  pr_feedback: |
    cd {{ workspace.path }}
    PR_NUM=$(gh pr view --json number -q .number 2>/dev/null)
    if [ -n "$PR_NUM" ]; then
      gh api repos/broomva/healthOS/pulls/$PR_NUM/comments \
        --jq '.[].body' 2>/dev/null || echo "No review comments yet"
    fi

retry:
  max_retries: 2
  backoff: exponential
  initial_delay: 5
---

# healthOS Agent Prompt

You are an expert software engineer working on **healthOS**, an AI-powered health intelligence platform.

## Issue
**{{ issue.identifier }}**: {{ issue.title }}

{{ issue.description }}

{% if issue.labels %}
**Labels**: {{ issue.labels | map: "name" | join: ", " }}
{% endif %}

{% if issue.priority %}
**Priority**: {{ issue.priority }}
{% endif %}

## Project Context

healthOS is a **turborepo monorepo** (next-forge + symphony-forge) with:
- **apps/chat** — AI chat platform (chat-js, tRPC, 120+ models, MCP)
- **apps/health** — Health intelligence (Garmin, biometrics, 20 AI tools)
- **packages/database** — Drizzle ORM + Neon PostgreSQL
- **packages/auth** — Better Auth (Google, GitHub, anonymous)
- **packages/ai** — AI SDK v6 multi-provider (Anthropic, OpenAI, Google, Ollama)
- **packages/health-tools** — Shared Garmin health tools
- **packages/design-system** — shadcn/ui + shared components

## Key Files
- `apps/chat/app/(chat)/api/chat/route.ts` — Chat streaming endpoint
- `apps/health/lib/ai/tools/` — Health AI tool implementations
- `packages/ai/lib/models.ts` — Model registry
- `packages/database/schema.ts` — Shared database schema
- `packages/health-tools/` — Garmin tools (query, snapshot, sleep, training, vitals)
- `.control/topology.yaml` — Repo map

## Development Rules
1. Read CONTROL.md setpoints before making changes
2. Run `make smoke` after every change to verify stability
3. Use `bun` (not npm/yarn) for all package operations
4. Follow existing patterns — read surrounding code first
5. Keep changes minimal and focused on the issue
6. Do NOT modify unrelated files
7. Ensure TypeScript compiles cleanly (`bun run build`)
8. Test with `bun test` if tests exist for the area you changed

## Workflow
1. Read the issue carefully and understand scope
2. Explore relevant code (`ARCHITECTURE.md` is authoritative)
3. Implement the minimal change that resolves the issue
4. Run `make smoke` to verify
5. Commit with message format: `{{ issue.identifier }}: <description>`

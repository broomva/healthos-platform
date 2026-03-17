# Autoany — Evaluator-Governed Recursive Improvement (EGRI)
# healthOS Continuous Improvement Framework

> Turns "make healthOS better" into a safe, measurable, rollback-capable recursive improvement loop.

---

## Problem Spec

| Field | Value |
|-------|-------|
| **Domain** | AI health intelligence platform |
| **Mutable Artifact** | healthOS codebase (`github.com/broomva/healthOS`) |
| **Immutable Evaluator** | `make smoke` + Playwright E2E + CONTROL.md setpoints |
| **Optimization Goal** | Maximize health insight quality, minimize latency, expand capability surface |
| **Safety Envelope** | CONTROL.md setpoints must never regress |

---

## Architecture

```
                    ┌─────────────────────┐
                    │   Issue Tracker      │
                    │   (Linear/STI)       │
                    └──────────┬──────────┘
                               │ candidate issues
                               ▼
                    ┌─────────────────────┐
                    │   Symphony Daemon    │
                    │   (Orchestrator)     │
                    └──────────┬──────────┘
                               │ dispatch
                               ▼
              ┌────────────────────────────────┐
              │        Mutation Engine          │
              │   (Claude Agent in worktree)    │
              │                                 │
              │  1. Read issue                  │
              │  2. Read CONTROL.md             │
              │  3. Implement change            │
              │  4. Self-evaluate (make smoke)  │
              └────────────────┬───────────────┘
                               │ commit + PR
                               ▼
              ┌────────────────────────────────┐
              │        Evaluator Gate           │
              │   (Immutable — never changes)   │
              │                                 │
              │  - make smoke (S1+S2+S4)        │
              │  - make test (S3, on PR)        │
              │  - make secrets-check (S5)      │
              │  - Bundle size check (S6)       │
              │  - CONTROL.md setpoint audit    │
              └────────────────┬───────────────┘
                               │ pass/fail
                               ▼
              ┌────────────────────────────────┐
              │       Promotion Policy          │
              │                                 │
              │  IF all evaluators pass:        │
              │    → Merge PR to main           │
              │    → Close Linear issue         │
              │    → Log success to episodic    │
              │                                 │
              │  IF any evaluator fails:        │
              │    → Retry (max 2x)             │
              │    → If still failing → block   │
              │    → Log failure + root cause   │
              └────────────────────────────────┘
```

---

## Mutation Surface

What the recursive improvement loop is allowed to change:

| Layer | Mutable | Immutable |
|-------|---------|-----------|
| AI Tools | Add new tools, enhance existing | Remove tools, change wire protocol |
| UI Components | Add/modify components | Delete shared interfaces |
| DB Schema | Add tables/columns (forward-only) | Drop/rename existing |
| Models | Add providers/models | Remove provider support |
| Artifacts | Add kinds, enhance handlers | Change streaming protocol |
| Health Data | Add data sources, improve parsing | Remove existing integrations |
| Auth | Enhance (add roles, tiers) | Weaken (remove checks) |

---

## Evaluator Definition (Immutable)

The evaluator NEVER changes during an improvement cycle. It can only be updated between cycles via explicit human approval.

```yaml
evaluator:
  name: healthos-gate
  version: 1.0.0

  checks:
    - name: typecheck
      command: make typecheck
      weight: 1.0        # hard gate — must pass

    - name: lint
      command: make lint
      weight: 1.0        # hard gate

    - name: build
      command: make build
      weight: 1.0        # hard gate

    - name: e2e-tests
      command: make test
      weight: 0.8        # soft gate — new tests may be needed
      on: pr_only

    - name: secrets
      command: make secrets-check
      weight: 1.0        # hard gate

    - name: bundle-size
      command: make bundle-check
      weight: 0.5        # advisory — flag but don't block

    - name: blast-radius
      max_files: 10
      max_lines_added: 500
      weight: 0.7        # soft gate — flag if exceeded

  promotion:
    require_all_hard_gates: true
    min_soft_score: 0.6   # at least 60% of soft gates
    max_retries: 2
    human_review: optional  # can be made required per-issue
```

---

## Improvement Cycles

### Cycle 0: Monorepo Revamp (Current — BRO-21 to BRO-31)
**Focus**: Migrate from single app to symphony-forge turborepo with chat-js + healthOS
**Dependency graph**:
```
BRO-21 (scaffold)
  ├→ BRO-22 (database: Prisma→Drizzle)
  │    ├→ BRO-23 (auth: Clerk→Better Auth)
  │    │    ├→ BRO-25 (chat-js → apps/chat)
  │    │    └→ BRO-26 (healthOS → apps/health)
  │    ├→ BRO-25
  │    └→ BRO-26
  └→ BRO-24 (ai: multi-provider gateway)
       ├→ BRO-25
       └→ BRO-26
              ├→ BRO-27 (extract @repo/health-tools)
              │    └→ BRO-29 (wire health into chat)
              └→ BRO-28 (unify design-system)
                   └→ BRO-29
                        └→ BRO-30 (update control metalayer)
                             └→ BRO-31 (CI/CD with turbo cache)
```
**Success Metric**: Both apps run, health tools work in chat, `turbo run build` passes

### Cycle 1: Infrastructure (Post-Revamp)
**Focus**: CI/CD, observability, error monitoring
**Issues**: BRO-6, BRO-18, BRO-19
**Success Metric**: All `make smoke` checks pass in CI, Sentry captures errors

### Cycle 2: Health Intelligence
**Focus**: Analytics dashboard, anomaly detection, training recommendations
**Issues**: BRO-9, BRO-12, BRO-13
**Success Metric**: Dashboard renders, anomalies detected with < 10% FPR

### Cycle 3: Platform Capabilities
**Focus**: Image artifacts, agent memory, data export
**Issues**: BRO-7, BRO-11, BRO-16
**Success Metric**: All artifact types functional, memory persists across sessions

### Cycle 4: Scale & Collaboration
**Focus**: Premium tier, multi-user, document sharing, scheduled reports
**Issues**: BRO-8, BRO-10, BRO-14, BRO-15
**Success Metric**: Multi-user auth works, Stripe billing functional

### Cycle 5: Advanced Health
**Focus**: Nutrition correlation, PWA, training optimization
**Issues**: BRO-17, BRO-20, BRO-13
**Success Metric**: PWA installable, nutrition correlations surface in chat

---

## Harness Configuration

```yaml
harness:
  orchestrator: symphony
  workflow: WORKFLOW.md
  control: CONTROL.md
  consciousness: CONSCIOUSNESS.md

  loop:
    poll_interval: 120s
    concurrency: 2
    max_turns_per_issue: 25
    timeout_per_issue: 1800s

  feedback:
    on_success:
      - close Linear issue (done_state)
      - log to episodic memory
      - update cycle progress
    on_failure:
      - retry with continuation prompt
      - if max_retries exceeded → mark blocked
      - log failure root cause
    on_cycle_complete:
      - review evaluator — does it need updating?
      - review CONTROL.md — any new setpoints?
      - review CONSCIOUSNESS.md — any new heuristics?
      - plan next cycle
```

---

## Running the Loop

```bash
# Validate everything is wired correctly
symphony validate WORKFLOW.md

# Start the daemon — begins polling Linear for Todo issues
symphony start WORKFLOW.md

# Monitor progress
symphony status
symphony issues

# Run a single issue for testing
symphony run STI-880 --workflow-path WORKFLOW.md

# Check after a cycle
symphony audit
```

---

## Meta-Rule: Evaluator Evolution

The evaluator itself improves, but only between cycles and only with human approval:

1. After each cycle, review which issues passed/failed
2. If tests are missing for a new area → add tests (grows evaluator)
3. If a setpoint was too loose → tighten it (never loosen)
4. If blast radius limits were too tight → discuss with human
5. Document evaluator version bump in this file

**Current evaluator version**: 1.0.0
**Last reviewed**: 2026-03-17

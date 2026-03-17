# Control Metalayer — healthOS

> Agentic control-kernel grounding all autonomous development on this repo.
> Every agent session must: CHECK setpoints -> IMPLEMENT -> MEASURE -> VERIFY -> DOCUMENT -> FEEDBACK

---

## Setpoints (Desired State)

| ID | Setpoint | Threshold | Sensor |
|----|----------|-----------|--------|
| S1 | TypeScript compiles cleanly | 0 errors | `make typecheck` |
| S2 | Biome lint passes | 0 errors, 0 warnings | `make lint` |
| S3 | Unit/E2E tests pass | 100% pass rate | `make test` |
| S4 | Build succeeds | exit 0 | `make build` |
| S5 | No secrets in codebase | 0 matches | `make secrets-check` |
| S6 | Bundle size < 500KB first-load JS | < 500KB | `make bundle-check` |
| S7 | DB migrations are forward-compatible | no destructive changes | manual review |
| S8 | All AI tools have error handling | no unhandled throws | code review |
| S9 | Smoke test passes | exit 0 | `make smoke` |

## Sensors (Measurement)

All sensors are defined in `Makefile` targets. Agents must run `make smoke` (which aggregates S1, S2, S4) before committing.

```
make typecheck    → S1 (tsc --noEmit)
make lint         → S2 (biome check)
make test         → S3 (playwright test)
make build        → S4 (next build)
make secrets-check → S5 (grep for API keys/tokens)
make bundle-check → S6 (analyze next build output)
make smoke        → S1 + S2 + S4 (fast gate)
```

## Controller Policy

```
LOOP:
  1. READ issue/task description
  2. CHECK all setpoints (make smoke)
  3. If any setpoint violated BEFORE work → STOP, report, do not mask existing failures
  4. IMPLEMENT minimal change for the issue
  5. MEASURE (make smoke)
  6. If setpoint regressed → ROLLBACK change, retry with different approach (max 3 attempts)
  7. VERIFY manually — read the diff, confirm it matches issue intent
  8. COMMIT with structured message
  9. FEEDBACK — if issue revealed a missing setpoint, add it to this file
```

## Actuators (What Agents Can Change)

| Scope | Allowed | Forbidden |
|-------|---------|-----------|
| `app/` | Add/modify routes, pages, API handlers | Delete existing public API routes |
| `lib/ai/tools/` | Add new tools, modify existing | Remove tools without issue approval |
| `lib/ai/models.ts` | Add models, change defaults | Remove provider support |
| `lib/db/schema.ts` | Add tables/columns (additive) | Drop tables, rename columns |
| `lib/db/migrations/` | Add new migration files | Modify existing migrations |
| `components/` | Add/modify components | Delete shared components |
| `artifacts/` | Add kinds, modify handlers | Change artifact wire protocol |
| `package.json` | Add dependencies | Remove deps without justification |
| `CONTROL.md` | Add setpoints/sensors | Weaken thresholds |
| `.env*` | Never modify | Never commit secrets |

## Stability & Entropy Controls

### Pre-commit Gate
Every commit must pass `make smoke`. No exceptions, no `--no-verify`.

### Blast Radius Limits
- Max 10 files changed per issue (flag if exceeded)
- Max 500 lines added per issue (flag if exceeded)
- No changes to auth flow without explicit approval
- No DB schema changes without migration file

### Rollback Protocol
If `make smoke` fails after a change:
1. `git stash` the change
2. Verify `make smoke` passes on clean state
3. Re-apply with smaller scope
4. If 3 attempts fail → mark issue as blocked, report

## Feedback Loop

After each completed issue:
1. Record which setpoints were tested
2. Note any gaps discovered (new setpoints needed)
3. Update this file if the control surface expanded
4. Log entropy delta: did the change increase or decrease system complexity?

## Multi-Rate Loop Hierarchy

| Loop | Rate | Purpose |
|------|------|---------|
| Inner (per-change) | Every file save | `make typecheck` |
| Middle (per-commit) | Every commit | `make smoke` |
| Outer (per-PR) | Every PR | `make test` (full Playwright suite) |
| Meta (per-sprint) | Weekly | Review CONTROL.md, update setpoints |

---

## Plant Interface

The "plant" is the healthOS codebase. State is observed through:

| Signal | Source | Meaning |
|--------|--------|---------|
| TypeScript errors | `tsc --noEmit` | Type safety regression |
| Lint violations | `biome check` | Code quality regression |
| Test failures | `playwright test` | Behavioral regression |
| Build failure | `next build` | Compilation regression |
| Bundle size | Build output | Performance regression |
| Migration diff | `drizzle-kit generate` | Schema drift |

## World Model

The agent's world model for healthOS:
- **Users**: Athletes tracking health metrics via AI chat
- **Core loop**: User asks question → AI selects tools → fetches Garmin data → streams response
- **Risk surfaces**: Auth bypass, data leaks, tool execution errors, model hallucination
- **Growth vector**: More tools, more artifact types, more data sources, multi-user

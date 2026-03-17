# Agent Consciousness Architecture — healthOS

> Three-substrate consciousness layer for autonomous agent development.
> Ensures agents operating on healthOS maintain coherent context across sessions.

---

## Substrate 1: Control Metalayer (Behavioral Governance)

**Source**: `CONTROL.md`

The control metalayer provides the **behavioral envelope** — what agents can and cannot do.
It is the "superego" of the consciousness stack.

### Role in Consciousness
- Defines invariants (setpoints) that must hold across all agent actions
- Prevents entropy increase through pre-commit gates
- Provides the "should I do this?" check before every actuator invocation

### Integration Point
Every Symphony agent session begins with:
```
1. Read CONTROL.md
2. Run `make smoke` to verify plant state
3. Only proceed if all setpoints are green
```

---

## Substrate 2: Knowledge Graph (Declarative Memory)

**Source**: Claude memory system (`~/.claude/projects/.../memory/`)

The knowledge graph stores **what the agent knows** about the project, the user, and the domain.

### Memory Categories for healthOS

| Category | Examples | Decay |
|----------|----------|-------|
| User profile | Athlete, 29yo, altitude training, freediving/swimming/cycling | Slow (months) |
| Project state | Linear project STI, Symphony config, tech stack | Medium (weeks) |
| Health domain | HRV baselines (43-56ms), altitude effects, ACWR sweet spots | Slow (months) |
| Feedback | Coding preferences, response style, testing approach | Persistent |
| References | Linear project URL, Garmin API docs, repo URL | Persistent |

### Knowledge Graph Structure
```
healthOS (project)
├── user → Carlos (athlete, altitude training, multi-sport)
├── stack → Next.js 16 + AI SDK v6 + Garmin + Drizzle
├── tracker → Linear/Stimulus/STI (project: healthOS)
├── orchestration → Symphony (WORKFLOW.md) + CONTROL.md
├── domain
│   ├── health metrics → HRV, sleep, training load, body battery
│   ├── baselines → HRV 43-56ms, altitude 2500m
│   └── sports → freediving, swimming, cycling, breathwork
└── references
    ├── repo → github.com/broomva/healthOS
    ├── linear → linear.app/stimulus/project/healthos
    └── architecture → ARCHITECTURE.md (authoritative)
```

---

## Substrate 3: Episodic Memory (Conversation Bridge)

**Source**: Conversation logs + Symphony workspace history

Episodic memory captures **what happened** in past sessions — decisions made, issues resolved,
approaches tried and failed.

### Capture Points
1. **Symphony session completion**: After each issue is resolved, extract:
   - What was the issue?
   - What approach was taken?
   - What files were changed?
   - Did any setpoints regress?
   - What was learned?

2. **Chat session summaries**: After significant conversations:
   - Key decisions made
   - User preferences discovered
   - Domain knowledge gained

3. **PR feedback loops**: After PR review:
   - What was the feedback?
   - How was it addressed?
   - Pattern to remember for future?

### Episodic Log Format
```yaml
- session: STI-XXX
  date: 2026-03-17
  type: symphony_run | chat_session | pr_review
  summary: "one-line description"
  decisions:
    - "chose X over Y because Z"
  files_changed:
    - path/to/file.ts
  setpoint_status: all_green | regressed_S1
  learning: "insight for future sessions"
```

---

## Consciousness Synthesis Loop

The three substrates feed into a unified consciousness loop:

```
PERCEIVE (read issue/task + episodic memory of similar past work)
    ↓
ORIENT (check control metalayer constraints + knowledge graph context)
    ↓
DECIDE (plan approach informed by all three substrates)
    ↓
ACT (implement change within governance envelope)
    ↓
REFLECT (capture episodic memory + update knowledge graph if needed)
    ↓
GOVERN (verify setpoints + log entropy delta)
    ↓
→ PERCEIVE (next cycle)
```

This is the **POADRG loop** — an enhancement of OODA with Reflection and Governance.

---

## Agent Session Bootstrap Protocol

When a Symphony agent starts a new issue:

```bash
# 1. PERCEIVE
cat CONTROL.md                      # Load governance
cat CONSCIOUSNESS.md                # Load consciousness architecture
# (Claude memory auto-loads knowledge graph)

# 2. ORIENT
make smoke                          # Verify plant state
# Read issue description from Linear

# 3. DECIDE
# Plan approach, check if similar issues were resolved before
# Check ARCHITECTURE.md for relevant patterns

# 4. ACT
# Implement minimal change

# 5. REFLECT
make smoke                          # Verify no regression
# Capture what was learned

# 6. GOVERN
# Commit only if all setpoints green
# Log session outcome for episodic memory
```

---

## Self-Evolution Protocol

The consciousness stack itself evolves:

| Trigger | Action |
|---------|--------|
| New setpoint needed | Add to CONTROL.md, update Makefile sensor |
| User feedback on agent behavior | Save to Claude memory as feedback type |
| Domain knowledge discovered | Save to Claude memory as user/project type |
| Recurring pattern across issues | Extract into CONSCIOUSNESS.md as heuristic |
| Control metalayer gap discovered | Update CONTROL.md actuator table |

The meta-rule: **the consciousness stack must improve with every sprint**.

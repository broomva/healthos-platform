# The Control Metalayer Pattern

## What Is It?

The control metalayer is a **governance layer for software development** — a set of declarative YAML files, automation scripts, interconnected documentation, and agent instructions that together form a control system applied to the development process itself.

## Control Systems Analogy

The metalayer maps directly to control theory:

| Control Concept | Metalayer Component | Purpose |
|----------------|---------------------|---------|
| **Sensors** | Policy gates, PR review comments | Detect high-risk changes, code quality deviations |
| **Setpoint** | Policy requirements, constraints | Desired state (all tests pass, docs current, no secrets) |
| **Actuators** | Harness scripts, CI workflow, pre-commit hooks | Enforce standards, automate checks |
| **Model** | Knowledge graph, topology map | System's understanding of itself |
| **Controller** | Agent instructions (CLAUDE.md, AGENTS.md) | Decision logic that reads sensors, consults model, triggers actuators |
| **Feedback loop** | EGRI cycle, audit, PR feedback loop | Measure → act → verify → iterate |

## Why It Works

1. **Declarative governance** — Policies are data (YAML), not code. Easy to read, modify, and audit.
2. **Self-describing** — The topology map and knowledge graph mean agents (human or AI) can discover conventions without tribal knowledge.
3. **Measurable entropy** — The audit script quantifies drift: uncovered topology, stale docs, broken links. Entropy is a number you can trend.
4. **Composable** — Each layer works independently. You can start with just `control` and add layers as the project matures.
5. **Agent-native** — The consciousness layer generates instructions that teach AI agents to operate within the governance framework, creating a closed loop between human intent and autonomous execution.

## The Five Layers

```
┌─────────────────────────────────────────────┐
│  consciousness (CLAUDE.md, AGENTS.md)       │ ← Agent interface
├─────────────────────────────────────────────┤
│  autoany (.control/egri.yaml)               │ ← Self-improvement
├─────────────────────────────────────────────┤
│  knowledge (docs/)                          │ ← System model
├─────────────────────────────────────────────┤
│  harness (scripts/harness/, Makefile)       │ ← Actuators
├─────────────────────────────────────────────┤
│  control (.control/*.yaml)                  │ ← Sensors + setpoints
└─────────────────────────────────────────────┘
```

## Adoption Path

1. **Start small** — `npx symphony-forge layer control` to add governance gates
2. **Automate** — `npx symphony-forge layer harness` for scripts and CI
3. **Document** — `npx symphony-forge layer knowledge` for the docs skeleton
4. **Enable agents** — `npx symphony-forge layer consciousness` for CLAUDE.md/AGENTS.md
5. **Self-improve** — `npx symphony-forge layer autoany` for EGRI loops

## Anti-Patterns

- **Don't over-govern** — Start with policies for genuinely high-risk operations. Add more as needed.
- **Don't let docs rot** — The audit script catches stale docs. Run it regularly.
- **Don't skip the audit** — If the audit fails, fix it before shipping. Entropy compounds.
- **Don't fight the layers** — If a generated file doesn't fit, modify it. The metalayer is a starting point, not a straitjacket.

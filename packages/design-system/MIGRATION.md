# Design System Unification Plan

## Current State

| Location | Component Count | Type |
|----------|----------------|------|
| `@repo/design-system` | 53 | shadcn/ui base (next-forge default) |
| `apps/chat/components/ui/` | 39 | shadcn/ui (chat-js fork) |
| `apps/health/components/ui/` | 25 | shadcn/ui (healthOS fork) |
| `apps/chat/components/ai-elements/` | ~30 | AI-specific components |
| `apps/health/components/ai-elements/` | ~29 | AI-specific components |
| `apps/health/components/` (root) | ~40 | Health-specific feature components |

## Migration Strategy

### Phase 1: Deduplicate base UI (safe, no behavioral changes)
Replace apps/chat and apps/health `components/ui/` with imports from `@repo/design-system`.
Both apps currently have their own copies of shadcn/ui primitives (Button, Card, Dialog, etc.).

**Overlap estimate**: ~20 components are identical across all three locations.

### Phase 2: Promote AI elements
Move shared AI components from apps/chat to @repo/design-system:
- `message.tsx`, `conversation.tsx` — message containers
- `code-block.tsx`, `reasoning.tsx` — content renderers
- `tool.tsx`, `task.tsx` — agent step tracking
- `model-selector.tsx` — model picker

### Phase 3: Promote health components
Move health visualization components from apps/health:
- `health-snapshot.tsx` — aggregated health card
- `sleep-overview.tsx` — sleep chart
- `training-overview.tsx` — training load visualization

### Migration Order
1. Base UI dedup (Button, Card, Dialog, Input, etc.)
2. AI message components (shared between chat and health)
3. Health visualization components (used by both when health mode is active)

### Risks
- Tailwind class differences between shadcn/ui versions
- Component API differences (props, variants)
- Import path changes will touch many files per app

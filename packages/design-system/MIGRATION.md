# Design System Unification Plan

> BRO-28: Scope and document a migration plan for unifying `@repo/design-system` with UI
> components duplicated across `apps/chat` and `apps/health`.

## 1. Current state of `@repo/design-system`

The package lives at `packages/design-system/` and exposes a `DesignSystemProvider`
(theme + auth + tooltip + sonner toaster). It contains **53 UI primitives** from
shadcn/ui plus a handful of extras.

### UI primitives (`components/ui/`)

| Component | File |
|---|---|
| accordion | accordion.tsx |
| alert | alert.tsx |
| alert-dialog | alert-dialog.tsx |
| aspect-ratio | aspect-ratio.tsx |
| avatar | avatar.tsx |
| badge | badge.tsx |
| breadcrumb | breadcrumb.tsx |
| button | button.tsx |
| button-group | button-group.tsx |
| calendar | calendar.tsx |
| card | card.tsx |
| carousel | carousel.tsx |
| chart | chart.tsx |
| checkbox | checkbox.tsx |
| collapsible | collapsible.tsx |
| command | command.tsx |
| context-menu | context-menu.tsx |
| dialog | dialog.tsx |
| drawer | drawer.tsx |
| dropdown-menu | dropdown-menu.tsx |
| empty | empty.tsx |
| field | field.tsx |
| form | form.tsx |
| hover-card | hover-card.tsx |
| input | input.tsx |
| input-group | input-group.tsx |
| input-otp | input-otp.tsx |
| item | item.tsx |
| kbd | kbd.tsx |
| label | label.tsx |
| menubar | menubar.tsx |
| navigation-menu | navigation-menu.tsx |
| pagination | pagination.tsx |
| popover | popover.tsx |
| progress | progress.tsx |
| radio-group | radio-group.tsx |
| resizable | resizable.tsx |
| scroll-area | scroll-area.tsx |
| select | select.tsx |
| separator | separator.tsx |
| sheet | sheet.tsx |
| sidebar | sidebar.tsx |
| skeleton | skeleton.tsx |
| slider | slider.tsx |
| sonner | sonner.tsx |
| spinner | spinner.tsx |
| switch | switch.tsx |
| table | table.tsx |
| tabs | tabs.tsx |
| textarea | textarea.tsx |
| toggle | toggle.tsx |
| toggle-group | toggle-group.tsx |
| tooltip | tooltip.tsx |

### Other exports

| Path | Description |
|---|---|
| `components/mode-toggle.tsx` | Dark/light mode toggle |
| `hooks/use-mobile.ts` | Mobile breakpoint hook |
| `lib/fonts.ts` | Font configuration |
| `lib/utils.ts` | `cn()` tailwind-merge utility |
| `providers/theme.tsx` | next-themes ThemeProvider wrapper |
| `styles/globals.css` | Global CSS and design tokens |
| `index.tsx` | `DesignSystemProvider` composition root |

### Known issues

- **TypeScript error in `index.tsx`**: `AuthProvider` (from `@repo/auth/provider`)
  accepts only `{ children }`, but `DesignSystemProvider` passes `helpUrl`,
  `privacyUrl`, and `termsUrl`. This needs to be fixed before the package can
  pass `tsc --noEmit`.

---

## 2. Components in `apps/chat/components/ui/` that overlap with design-system

All 38 base UI components in `apps/chat/components/ui/` have exact counterparts
in `@repo/design-system`. These are direct duplicates and should be replaced by
imports from the shared package.

**Duplicated (38 files):**
accordion, alert, alert-dialog, avatar, badge, breadcrumb, button, button-group,
card, checkbox, collapsible, command, dialog, drawer, dropdown-menu, empty, form,
hover-card, input, input-group, label, popover, progress, resizable, scroll-area,
select, separator, sheet, sidebar, skeleton, slider, spinner, switch, table, tabs,
textarea, toggle, tooltip

**Chat-only extras (not in design-system, worth adding):**
- `ui/extra/action-container.tsx` -- Styled link container for action items
- `ui/extra/scroll-area-viewport-ref.tsx` -- ScrollArea variant with forwarded viewport ref

---

## 3. Components in `apps/health/components/ui/` that overlap with design-system

All 25 UI components in `apps/health/components/ui/` have exact counterparts in
`@repo/design-system`. These are direct duplicates.

**Duplicated (25 files):**
alert, alert-dialog, avatar, badge, button, button-group, card, carousel,
collapsible, command, dialog, dropdown-menu, hover-card, input, input-group,
label, progress, scroll-area, select, separator, sheet, sidebar, skeleton,
textarea, tooltip

**Components in design-system but NOT duplicated in health (not used or imported differently):**
accordion, aspect-ratio, breadcrumb, calendar, chart, checkbox, context-menu,
drawer, empty, field, form, input-otp, item, kbd, menubar, navigation-menu,
pagination, popover, radio-group, resizable, slider, sonner, spinner, switch,
table, tabs, toggle, toggle-group

---

## 4. AI elements worth sharing across apps

### `apps/chat/components/ai-elements/` (16 files)

| Component | Shareable? | Notes |
|---|---|---|
| `actions.tsx` | Yes | Generic AI action buttons |
| `artifact.tsx` | Yes | Artifact display wrapper |
| `code-block.tsx` | Yes | Syntax-highlighted code with copy |
| `context.tsx` | Maybe | Chat-specific context provider |
| `conversation.tsx` | Yes | Conversation layout container |
| `message.tsx` | Yes | Base message bubble |
| `parseIncompleteMarkdown.tsx` | Yes | Streaming markdown parser utility |
| `prompt-input.tsx` | Yes | AI prompt textarea with submit |
| `reasoning.tsx` | Yes | Thinking/reasoning collapsible |
| `response.tsx` | Yes | AI response wrapper |
| `sandbox.tsx` | No | Code sandbox, chat-specific |
| `shimmer.tsx` | Yes | Loading shimmer animation |
| `suggestion.tsx` | Yes | Clickable suggestion chip |
| `tool.tsx` | Yes | Tool invocation card |
| `extra/conversation-content-scroll-area.tsx` | Maybe | Chat-specific scroll area |
| `extra/mcp-tool-header.tsx` | No | MCP-specific header |

### `apps/health/components/ai-elements/` (29 files)

| Component | Shareable? | Notes |
|---|---|---|
| `artifact.tsx` | Yes | Artifact display (likely similar to chat's) |
| `canvas.tsx` | Maybe | Health-specific canvas |
| `chain-of-thought.tsx` | Yes | Step-by-step reasoning display |
| `checkpoint.tsx` | Maybe | Workflow checkpoint |
| `code-block.tsx` | Yes | Duplicate of chat's code-block |
| `confirmation.tsx` | Yes | User confirmation dialog for AI actions |
| `connection.tsx` | Maybe | Data connection status |
| `controls.tsx` | Maybe | AI interaction controls |
| `conversation.tsx` | Yes | Likely duplicate of chat's |
| `edge.tsx` | No | Graph/workflow edge (health-specific) |
| `image.tsx` | Yes | AI-generated image display |
| `inline-citation.tsx` | Yes | Source citation inline |
| `loader.tsx` | Yes | AI loading state |
| `message.tsx` | Yes | Base message bubble |
| `model-selector.tsx` | Yes | Model picker dropdown |
| `node.tsx` | No | Graph/workflow node (health-specific) |
| `open-in-chat.tsx` | Maybe | Cross-app navigation |
| `panel.tsx` | Yes | Side panel layout |
| `plan.tsx` | Maybe | Health plan display |
| `prompt-input.tsx` | Yes | Likely duplicate of chat's |
| `queue.tsx` | Maybe | Task queue display |
| `reasoning.tsx` | Yes | Likely duplicate of chat's |
| `shimmer.tsx` | Yes | Likely duplicate of chat's |
| `sources.tsx` | Yes | Source list display |
| `suggestion.tsx` | Yes | Likely duplicate of chat's |
| `task.tsx` | Maybe | Task card |
| `tool.tsx` | Yes | Likely duplicate of chat's |
| `toolbar.tsx` | Maybe | AI toolbar |
| `web-preview.tsx` | Maybe | Web content preview |

### Shared AI element candidates (high confidence)

These components exist in both apps and should be deduplicated into a shared
`@repo/ai-elements` or `@repo/design-system/ai-elements` package:

- **message** -- base message bubble
- **conversation** -- conversation container
- **prompt-input** -- AI prompt textarea
- **reasoning** -- thinking/reasoning collapsible
- **shimmer** -- loading animation
- **suggestion** -- suggestion chips
- **tool** -- tool invocation display
- **code-block** -- syntax-highlighted code
- **artifact** -- artifact display
- **loader** -- loading states

---

## 5. Health-specific components worth sharing

### Domain components in `apps/health/components/`

| Component | Reusable? | Notes |
|---|---|---|
| `health-snapshot.tsx` | Health-only | Rich health metrics dashboard card |
| `health-ui-renderer.tsx` | Health-only | json-render based dynamic UI renderer |
| `sleep-overview.tsx` | Health-only | Detailed sleep analysis visualization |
| `training-overview.tsx` | Health-only | Training load/readiness visualization |
| `weather.tsx` | Cross-app | Weather display widget |

### Shared infrastructure components (exist in both apps)

| Component | In chat? | In health? | Notes |
|---|---|---|---|
| `app-sidebar.tsx` | Yes | Yes | App-specific but same pattern |
| `chat-header.tsx` | Yes | Yes | Layout component |
| `chat.tsx` | Yes | Yes | Main chat view |
| `code-editor.tsx` | Yes | Yes | Code editing panel |
| `console.tsx` | Yes | Yes | Debug/output console |
| `create-artifact.tsx` | Yes | Yes | Artifact creation flow |
| `data-stream-handler.tsx` | Yes | Yes | AI SDK stream handler |
| `data-stream-provider.tsx` | Yes | Yes | Stream context provider |
| `diffview.tsx` | Yes | Yes | Diff display |
| `document-skeleton.tsx` | Yes | Yes | Document loading skeleton |
| `greeting.tsx` | Yes | Yes | Welcome/greeting display |
| `icons.tsx` | Yes | Yes | Icon set |
| `image-editor.tsx` | Yes | Yes | Image editing panel |
| `message-actions.tsx` | Yes | Yes | Copy/retry/vote actions |
| `message-editor.tsx` | Yes | Yes | Edit message UI |
| `message.tsx` | Yes | Yes | Message component |
| `messages.tsx` | Yes | Yes | Message list |
| `multimodal-input.tsx` | Yes | Yes | Text + file input |
| `sheet-editor.tsx` | Yes | Yes | Sheet/spreadsheet editor |
| `sidebar-history.tsx` | Yes | Yes | Chat history sidebar |
| `sidebar-toggle.tsx` | Yes | Yes | Sidebar open/close |
| `sidebar-user-nav.tsx` | Yes | Yes | User avatar/menu |
| `suggested-actions.tsx` | Yes | Yes | Quick action suggestions |
| `text-editor.tsx` | Yes | Yes | Text editing panel |
| `theme-provider.tsx` | Yes | Yes | Already in design-system |
| `toolbar.tsx` | Yes | Yes | Main toolbar |

---

## 6. Recommended migration order

### Phase 0: Fix existing issues (prerequisite)
1. Fix the `AuthProvider` type mismatch in `packages/design-system/index.tsx`
2. Ensure `@repo/design-system` passes `tsc --noEmit`
3. Verify all design-system components export correctly

### Phase 1: Replace duplicated UI primitives (low risk, high impact)
1. Update `apps/chat` to import UI primitives from `@repo/design-system` instead
   of local `components/ui/`
2. Update `apps/health` to import UI primitives from `@repo/design-system` instead
   of local `components/ui/`
3. Move chat's `ui/extra/` components into design-system if they prove useful
   across apps
4. Delete local `components/ui/` directories from both apps once imports are
   migrated

### Phase 2: Extract shared AI elements (medium risk)
1. Create `@repo/ai-elements` package (or `@repo/design-system/ai-elements`)
2. Consolidate the 10 high-confidence shared AI components (message, conversation,
   prompt-input, reasoning, shimmer, suggestion, tool, code-block, artifact, loader)
3. Update both apps to import from the shared package
4. Keep app-specific AI elements in their respective apps

### Phase 3: Extract shared infrastructure components (higher risk)
1. Evaluate which infrastructure components (data-stream-handler, multimodal-input,
   sidebar, etc.) are truly identical vs. diverged
2. Extract identical ones into a shared package
3. For diverged components, either reconcile differences or keep separate

### Phase 4: Health domain components
1. Keep health-specific visualizations (health-snapshot, sleep-overview,
   training-overview, health-ui-renderer) in `apps/health`
2. If other apps need health data display, create `@repo/health-components` later

### General guidelines
- Migrate one component at a time; run both apps' test suites after each change
- Use barrel exports (`index.ts`) in the design-system for clean import paths
- Preserve any app-specific style overrides via CSS variables or component props
- Do NOT move components that import app-specific context, hooks, or server actions
  without first extracting those dependencies

---

## Summary

| Location | Component Count | Type |
|----------|----------------|------|
| `@repo/design-system` | 53 | shadcn/ui base (next-forge default) |
| `apps/chat/components/ui/` | 38 + 2 extras | shadcn/ui (chat-js fork) |
| `apps/health/components/ui/` | 25 | shadcn/ui (healthOS fork) |
| `apps/chat/components/ai-elements/` | 16 | AI-specific components |
| `apps/health/components/ai-elements/` | 29 | AI-specific components |
| `apps/health/components/` (root) | ~40 | Health-specific feature components |

### Risks
- Tailwind class differences between shadcn/ui versions in each app
- Component API differences (props, variants) that evolved independently
- Import path changes will touch many files per app
- `@repo/design-system` currently fails typecheck (AuthProvider signature mismatch)

# PLANS.md - Symphony Cloud Roadmap

## Phase 1: Scaffold and Dashboard MVP
**Depends on**: Symphony engine running (Phase 7 in symphony repo)
**Gate**: Dashboard connects to local Symphony instance and shows live state

### Tasks

**1.1 — Initialize next-forge monorepo**
- Run `npx next-forge init`
- Strip CMS, Storybook (add back later if needed)
- Configure Turborepo pipeline
- AC: `bun dev` starts web + app + api

**1.2 — Symphony TypeScript Client SDK**
- Package: `packages/symphony-client`
- Methods: `getState()`, `getIssue(id)`, `triggerRefresh()`
- Auto-polling with configurable interval
- TypeScript types matching Symphony's JSON API
- AC: Client can fetch state from running Symphony instance

**1.3 — Dashboard: Live Agent View**
- Running agents list with status, duration, token usage
- Retrying agents with next retry time and attempt count
- Auto-refresh via polling or WebSocket
- AC: Dashboard shows live data from Symphony

**1.4 — Dashboard: Issue Detail View**
- Click into an issue to see: current state, logs, token usage, retry history
- Link back to Linear issue
- AC: Single-issue view loads with all available data

**1.5 — Dashboard: Workflow Editor**
- Visual WORKFLOW.md editor with YAML + Liquid template sections
- Syntax highlighting, validation
- Save and deploy to Symphony instance
- AC: User can edit and save a workflow from the UI

---

## Phase 2: Auth and Multi-tenancy
**Depends on**: Phase 1
**Gate**: Two tenants can use the platform without seeing each other's data

### Tasks

**2.1 — Clerk Integration**
- Sign up / sign in / sign out
- Team/organization support
- Role-based access: admin, member, viewer
- AC: User can create account and access dashboard

**2.2 — Tenant Database Schema**
- Tenants table: id, name, created_at, plan
- Workflows table: id, tenant_id, content, active
- Runs table: id, tenant_id, issue_id, started_at, completed_at, tokens, status
- API keys table: id, tenant_id, service (linear/github), encrypted_key
- AC: Schema migrations run cleanly

**2.3 — Tenant Isolation**
- All queries scoped by tenant_id
- Middleware validates tenant access on every request
- Symphony instances namespaced per tenant
- AC: Tenant A cannot query Tenant B's data

---

## Phase 3: Control Plane
**Depends on**: Phase 2
**Gate**: API can provision and manage Symphony instances per tenant

### Tasks

**3.1 — Instance Provisioning API**
- POST /api/tenants/:id/instances — create Symphony instance
- GET /api/tenants/:id/instances — list instances
- DELETE /api/tenants/:id/instances/:iid — stop and remove
- AC: API creates a running Symphony process for a tenant

**3.2 — Workflow Deployment**
- Store WORKFLOW.md in database per tenant
- Deploy to Symphony instance (write file + trigger reload)
- Version history with rollback
- AC: Workflow change takes effect within 30s

**3.3 — Secret Management**
- Encrypted storage for Linear API keys, GitHub tokens
- Injected as env vars into tenant's Symphony instance
- Rotation support
- AC: Secrets never appear in logs or API responses

---

## Phase 4: Billing
**Depends on**: Phase 2
**Gate**: Paying customer can upgrade plan and usage is metered

### Tasks

**4.1 — Stripe Integration**
- Subscription plans: Starter ($49), Team ($199), Enterprise (custom)
- Checkout flow, customer portal, webhook handling
- AC: User can subscribe to a plan

**4.2 — Usage Metering**
- Track: agent-hours, token consumption, concurrent agent slots
- Report to Stripe for usage-based billing
- Dashboard usage charts
- AC: Usage visible in dashboard and Stripe

**4.3 — Plan Enforcement**
- Starter: max 3 concurrent agents
- Team: max 10 concurrent agents
- Enterprise: unlimited
- Enforce via control plane before provisioning
- AC: Starter user cannot run 4 agents simultaneously

---

## Phase 5: Desktop App (Tauri)
**Depends on**: Phase 1 (shares packages/ui)
**Gate**: Desktop app shows dashboard connected to cloud or local instance

### Tasks

**5.1 — Tauri v2 Setup**
- Add `apps/desktop` with Tauri v2 + React
- Share `packages/ui` components
- AC: `bun tauri dev` opens native window with dashboard

**5.2 — Connection Modes**
- Cloud mode: connect to symphony-cloud API with auth
- Local mode: connect directly to local Symphony HTTP API
- AC: User can switch between cloud and local

**5.3 — Distribution**
- Build: DMG (macOS), MSI (Windows), AppImage (Linux)
- Auto-updater via Tauri's built-in updater
- AC: Built binaries install and run on all 3 platforms

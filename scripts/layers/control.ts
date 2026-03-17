// Control layer — generates .control/*.yaml governance files

import type { FileEntry, Layer, ProjectConfig } from "./types.js";
import { lockFileName } from "./utils.js";

const generatePolicyYaml = (
  config: ProjectConfig
): string => `# .control/policy.yaml — Policy gates for ${config.name}
# Each policy defines risk level, required checks, and approval conditions.

policies:
  database-migration:
    description: "Any change to the database schema"
    risk: high
    triggers:
      - "packages/database/prisma/schema.prisma"
      - "packages/database/prisma/migrations/**"
    requires:
      - adr: "Must have an ADR in docs/decisions/ explaining the schema change"
      - tests: "Migration must include or update relevant tests"
      - backup: "Ensure a database backup exists before applying to production"
      - review: "Requires at least one reviewer with database domain knowledge"
    rollback: "Use prisma migrate resolve to mark failed migrations"

  dependency-update:
    description: "Adding or updating dependencies in any package.json"
    risk: medium
    triggers:
      - "**/package.json"
      - "${lockFileName(config)}"
    requires:
      - audit: "Run audit to check for vulnerabilities"
      - build: "Full build must pass after dependency change"
      - test: "All tests must pass"
    notes: "Prefer exact versions. Document why new dependencies are needed."

  env-variable-change:
    description: "Adding or modifying environment variables"
    risk: high
    triggers:
      - "**/.env.example"
      - "**/.env.local.example"
      - "**/env.ts"
      - "**/keys.ts"
    requires:
      - docs: "Update docs/schemas/env-variables.md with the new variable"
      - secrets: "Never commit actual secret values"
      - validation: "Add Zod validation in the relevant env.ts file"
    notes: "All env vars must be documented and validated at startup."

  new-package:
    description: "Creating a new workspace package under packages/ or apps/"
    risk: medium
    triggers:
      - "packages/*/package.json"
      - "apps/*/package.json"
    requires:
      - topology: "Update .control/topology.yaml with the new package"
      - docs: "Add architecture doc in docs/architecture/"
      - index: "Update docs/_index.md to reference the new doc"
    notes: "Follow existing package conventions. Use @repo/ scope."

  pr-feedback-loop:
    description: "PR review comments must be resolved before merge"
    risk: medium
    triggers:
      - manual
    requires:
      - triage: "Every review comment must be triaged: accept, fix, or reject with rationale"
      - commit: "Fixes must be committed and pushed (not amended into prior commits)"
      - ci: "All CI checks must pass after fixes are applied"
      - reply: "Each resolved comment must have a reply confirming the resolution"
    notes: "PR comments are sensors in the control loop. Unresolved comments are entropy — reduce them to zero before merge."

  production-deploy:
    description: "Deploying to production"
    risk: critical
    triggers:
      - manual
    requires:
      - ci: "All CI checks must pass (lint, typecheck, test, build)"
      - review: "At least one approved review on the PR"
      - docs: "All documentation must be up to date"
      - policy: "All policy gates for included changes must be satisfied"
      - staging: "Changes should be verified in preview deployment first"
    rollback: "Use hosting provider's rollback to previous deployment"
`;

const generateCommandsYaml = (config: ProjectConfig): string => {
  const pm = config.packageManager;
  return `# .control/commands.yaml — Canonical commands for ${config.name}
# Each command maps to a harness script in scripts/harness/.

commands:
  smoke:
    description: "Quick validation: install, check, build the main app"
    script: "scripts/harness/smoke.sh"
    timeout: 120
    usage: "make -f Makefile.control smoke"
    when: "Before starting work, after pulling changes"

  check:
    description: "Lint + typecheck"
    script: "scripts/harness/check.sh"
    timeout: 60
    usage: "make -f Makefile.control check"
    when: "Before committing, after any code change"

  test:
    description: "Run test suite"
    script: "${pm} run test"
    timeout: 180
    usage: "make -f Makefile.control test"
    when: "Before pushing, after logic changes"

  build:
    description: "Full build"
    script: "${pm} run build"
    timeout: 300
    usage: "make -f Makefile.control build"
    when: "Before deploy, to verify everything compiles"

  ci:
    description: "Full CI pipeline: check + test + build"
    script: "scripts/harness/ci.sh"
    timeout: 600
    usage: "make -f Makefile.control ci"
    when: "Simulating the full CI pipeline locally"

  docs-check:
    description: "Verify documentation freshness and index coverage"
    script: "scripts/harness/check-docs-freshness.sh"
    timeout: 10
    usage: "make -f Makefile.control docs-check"
    when: "After modifying any file in docs/"

  deploy:
    description: "Deploy to production"
    script: "vercel --prod"
    timeout: 300
    usage: "make -f Makefile.control deploy"
    when: "After all CI checks pass and PR is approved"
`;
};

const generateTopologyYaml = (
  config: ProjectConfig
): string => `# .control/topology.yaml — Repository topology map for ${config.name}
# Describes all apps, packages, and their relationships.

apps:
  app:
    path: "apps/app"
    description: "Main application (Next.js App Router)"
    port: 3000
    risk: high
    domain: dashboard
    dependencies:
      - "@repo/auth"
      - "@repo/database"
      - "@repo/design-system"
      - "@repo/observability"

  api:
    path: "apps/api"
    description: "API server (Next.js Route Handlers)"
    port: 3002
    risk: high
    domain: api
    dependencies:
      - "@repo/auth"
      - "@repo/database"
      - "@repo/observability"

  web:
    path: "apps/web"
    description: "Marketing website (Next.js)"
    port: 3001
    risk: low
    domain: marketing
    dependencies:
      - "@repo/design-system"

  docs:
    path: "apps/docs"
    description: "Public documentation site"
    port: 3004
    risk: low
    domain: docs
    dependencies: []

  email:
    path: "apps/email"
    description: "Email templates (React Email)"
    port: 3003
    risk: low
    domain: email
    dependencies:
      - "@repo/email"

  storybook:
    path: "apps/storybook"
    description: "Component library explorer (Storybook)"
    port: 6006
    risk: low
    domain: design
    dependencies:
      - "@repo/design-system"

packages:
  auth:
    path: "packages/auth"
    description: "Authentication"
    domain: auth

  database:
    path: "packages/database"
    description: "Database ORM"
    domain: database
    risk: high

  design-system:
    path: "packages/design-system"
    description: "UI components"
    domain: design

  email:
    path: "packages/email"
    description: "Email sending"
    domain: email

  observability:
    path: "packages/observability"
    description: "Logging, error tracking, monitoring"
    domain: observability

  typescript-config:
    path: "packages/typescript-config"
    description: "Shared TypeScript configuration"
    domain: infra

knowledge:
  entry_point: "docs/_index.md"
  architecture: "docs/architecture/"
  decisions: "docs/decisions/"
  runbooks: "docs/runbooks/"
  schemas: "docs/schemas/"
`;

export const controlLayer: Layer = {
  name: "control",
  description:
    "Governance gates, command registry, and repo topology (.control/*.yaml)",
  generate: (config: ProjectConfig): FileEntry[] => [
    {
      path: ".control/policy.yaml",
      content: generatePolicyYaml(config),
    },
    {
      path: ".control/commands.yaml",
      content: generateCommandsYaml(config),
    },
    {
      path: ".control/topology.yaml",
      content: generateTopologyYaml(config),
    },
  ],
};

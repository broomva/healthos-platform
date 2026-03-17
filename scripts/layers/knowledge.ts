// Knowledge layer — generates docs/ skeleton with Obsidian knowledge graph

import type { FileEntry, Layer, ProjectConfig } from "./types.js";
import { pmInstall, pmRun } from "./utils.js";

const pmLabel = (pm: string): string => {
  switch (pm) {
    case "bun":
      return "Bun";
    case "pnpm":
      return "pnpm";
    case "yarn":
      return "Yarn";
    default:
      return "npm";
  }
};

const generateIndex = (config: ProjectConfig): string => `---
title: "${config.name} Knowledge Graph"
type: index
domain: all
status: active
tags:
  - domain/all
  - status/active
  - type/index
---

# ${config.name} Knowledge Graph

> [!context]
> This is the entry point for the ${config.name} knowledge system. Every agent session should start here to understand the codebase topology, conventions, and decision history before making changes.

## Graph Map

\`\`\`mermaid
graph TD
    INDEX["_index.md<br/>(you are here)"]
    GLOSS["glossary.md"]

    subgraph Architecture
        ARCH_OV["architecture/overview.md"]
    end

    subgraph Decisions
        ADR1["decisions/adr-001-metalayer.md"]
    end

    subgraph Runbooks
        RB_DEV["runbooks/local-dev-setup.md"]
    end

    INDEX --> GLOSS
    INDEX --> ARCH_OV
    INDEX --> ADR1
    INDEX --> RB_DEV

    ARCH_OV --> GLOSS
\`\`\`

## Tag Taxonomy

| Prefix | Values | Purpose |
|--------|--------|---------|
| \`domain/\` | project-specific domains | Which subsystem the note covers |
| \`status/\` | \`draft\`, \`active\`, \`deprecated\` | Note lifecycle |
| \`type/\` | \`architecture\`, \`api-contract\`, \`decision\`, \`runbook\`, \`schema\`, \`index\`, \`glossary\`, \`template\` | Document type |

## Traversal Instructions

1. **Start here** — read this index to orient yourself in the knowledge graph
2. **Understand the system** — read [[architecture/overview]] and [[glossary]]
3. **Find the relevant subsystem** — follow links to specific architecture notes
4. **Check for decisions** — before proposing alternatives, read relevant ADRs
5. **Follow runbooks** — for operational tasks, use the runbook for that workflow
6. **Use templates** — when creating new docs, copy from the \`_templates/\` directory

## Document Registry

### Architecture
- [[architecture/overview]] — System architecture overview

### Decisions
- [[decisions/adr-001-metalayer]] — Why the control metalayer pattern

### Runbooks
- [[runbooks/local-dev-setup]] — Getting started from scratch

### Glossary
- [[glossary]] — Key terms and definitions
`;

const generateGlossary = (_config: ProjectConfig): string => `---
title: "Glossary"
type: glossary
domain: all
status: active
tags:
  - domain/all
  - status/active
  - type/glossary
---

# Glossary

## Control Metalayer
The governance layer (\`.control/\`) that defines policies, commands, and topology for the project. Acts as a declarative control system for development practices.

## Entropy Audit
A check that measures "drift" in the repository: uncovered topology, stale docs, broken wikilinks. Run via \`make -f Makefile.control audit\`.

## Harness
The collection of bash scripts in \`scripts/harness/\` that automate common development tasks (check, test, build, audit).

## Knowledge Graph
The interconnected documentation in \`docs/\` using Obsidian-flavored Markdown with wikilinks (\`[[target]]\`) and frontmatter tags.

## Policy Gate
A rule in \`.control/policy.yaml\` that identifies high-risk changes and their required checks before proceeding.

## Topology
The map of all apps and packages in \`.control/topology.yaml\`, including their paths, dependencies, risk levels, and domains.

## Wikilink
An Obsidian-style internal link: \`[[path/to/doc]]\` resolves to \`docs/path/to/doc.md\`.
`;

const generateArchitectureOverview = (config: ProjectConfig): string => `---
title: "Architecture Overview"
type: architecture
domain: all
status: active
tags:
  - domain/all
  - status/active
  - type/architecture
---

# Architecture Overview

> [!context]
> High-level architecture of ${config.name}. This document describes the system topology, key components, and how they interact.

## System Diagram

\`\`\`mermaid
graph TD
    subgraph Apps
        APP["app (dashboard)"]
        API["api (server)"]
        WEB["web (marketing)"]
    end

    subgraph Packages
        AUTH["auth"]
        DB["database"]
        UI["design-system"]
        OBS["observability"]
    end

    APP --> AUTH
    APP --> DB
    APP --> UI
    APP --> OBS
    API --> AUTH
    API --> DB
    API --> OBS
    WEB --> UI
\`\`\`

## Apps

| App | Port | Description |
|-----|------|-------------|
| \`apps/app\` | 3000 | Main dashboard application |
| \`apps/api\` | 3002 | API server |
| \`apps/web\` | 3001 | Marketing website |
| \`apps/docs\` | 3004 | Public documentation |
| \`apps/email\` | 3003 | Email templates |
| \`apps/storybook\` | 6006 | Component explorer |

## Packages

See \`.control/topology.yaml\` for the full package map with dependencies.

## Related

- [[glossary]]
`;

const generateAdr001 = (config: ProjectConfig): string => `---
title: "ADR-001: Control Metalayer Pattern"
type: decision
domain: all
status: active
tags:
  - domain/all
  - status/active
  - type/decision
---

# ADR-001: Control Metalayer Pattern

## Status

**Accepted** — scaffolded by symphony-forge

## Context

${config.name} needs a governance layer that:
- Defines risk policies for high-impact changes (database migrations, env vars, deploys)
- Provides a canonical command registry for build automation
- Maps the full repository topology for discoverability
- Enables AI agents to operate autonomously with safety guardrails

## Decision

> [!decision]
> We adopt the **control metalayer** pattern: \`.control/\` YAML for governance, \`scripts/harness/\` for automation, \`docs/\` for knowledge, and metalayer-aware agent instructions.

## Rationale

The metalayer is a **control system** applied to development:
- **Policy gates** are sensors that detect high-risk changes
- **Harness scripts** are actuators that enforce standards
- **Knowledge graph** is the system's model of itself
- **Agent instructions** close the loop between measurement and action

## Consequences

### Positive
- Agents can operate autonomously with clear guardrails
- New contributors discover conventions via docs, not tribal knowledge
- Entropy is measurable and auditable

### Negative
- Additional files to maintain (mitigated by audit scripts)
- Learning curve for the metalayer conventions

## Related

- [[architecture/overview]]
- [[glossary]]
`;

const generateLocalDevRunbook = (config: ProjectConfig): string => {
  const pm = config.packageManager;
  return `---
title: "Runbook: Local Development Setup"
type: runbook
domain: all
status: active
tags:
  - domain/all
  - status/active
  - type/runbook
---

# Runbook: Local Development Setup

> [!context]
> How to set up ${config.name} for local development from scratch.

## Pre-Flight Checklist

- [ ] Node.js >= 18 installed
- [ ] ${pmLabel(pm)} installed
- [ ] Git installed

## Steps

### 1. Clone the repository

\`\`\`bash
git clone <repository-url>
cd ${config.name}
\`\`\`

### 2. Install dependencies

\`\`\`bash
${pmInstall(config)}
\`\`\`

### 3. Set up environment variables

\`\`\`bash
# Copy example env files
cp apps/app/.env.example apps/app/.env.local
cp apps/api/.env.example apps/api/.env.local
cp apps/web/.env.example apps/web/.env.local
\`\`\`

### 4. Start development server

\`\`\`bash
${pmRun(config, "dev")}
\`\`\`

### 5. Verify setup

\`\`\`bash
make -f Makefile.control smoke
\`\`\`

## Verification

| Check | Expected Result |
|-------|-----------------|
| \`make -f Makefile.control check\` | Lint + typecheck pass |
| \`localhost:3000\` | Dashboard loads |
| \`localhost:3001\` | Marketing site loads |

## Related

- [[architecture/overview]]
- [[glossary]]
`;
};

const generateAdrTemplate = (): string => `---
title: "ADR-NNN: [Decision Title]"
type: decision
domain: # specify domain
status: draft
tags:
  - domain/{area}
  - status/draft
  - type/decision
---

# ADR-NNN: [Decision Title]

## Status

**Proposed** — YYYY-MM

## Context

<!-- What is the issue that motivates this decision? -->

## Options Considered

### Option A: [Name]

<!-- Description, pros, cons -->

### Option B: [Name]

<!-- Description, pros, cons -->

## Decision

> [!decision]
> We will use **[chosen option]** because [one-line rationale].

## Rationale

<!-- Detailed reasoning -->

## Consequences

### Positive
<!-- What becomes easier? -->

### Negative
<!-- What becomes harder? -->

## Related

- [[architecture/overview]]
`;

const generateArchitectureTemplate = (): string => `---
title: "[Component/System Name]"
type: architecture
domain: # specify domain
status: draft
tags:
  - domain/{area}
  - status/draft
  - type/architecture
---

# [Component/System Name]

> [!context]
> Brief description of what this component/system does and why it exists.

## Overview

<!-- High-level description -->

## Architecture Diagram

\`\`\`mermaid
graph TD
    A["Component A"] --> B["Component B"]
\`\`\`

## Key Components

| Component | File/Path | Purpose |
|-----------|-----------|---------|
| | | |

## Dependencies

| Dependency | Usage |
|------------|-------|
| | |

## Related

- [[architecture/overview]]
`;

const generateRunbookTemplate = (): string => `---
title: "Runbook: [Task Name]"
type: runbook
domain: # specify domain
status: draft
tags:
  - domain/{area}
  - status/draft
  - type/runbook
---

# Runbook: [Task Name]

> [!context]
> Brief description of what this runbook covers and when to use it.

## Pre-Flight Checklist

- [ ] Prerequisite 1
- [ ] Prerequisite 2

## Steps

### 1. [First Step]

\`\`\`bash
# Command
\`\`\`

### 2. [Second Step]

\`\`\`bash
# Command
\`\`\`

## Verification

| Check | Expected Result |
|-------|-----------------|
| | |

## Rollback

> [!warning]
> Describe any destructive steps and their rollback procedures.

## Related

- [[runbooks/local-dev-setup]]
`;

const generateApiContractTemplate = (): string => `---
title: "[API Name]"
type: api-contract
domain: # specify domain
status: draft
tags:
  - domain/{area}
  - status/draft
  - type/api-contract
---

# [API Name]

> [!context]
> Brief description of this API.

## Base URL

<!-- Protocol, host, port, base path -->

## Authentication

<!-- How are requests authenticated? -->

## Endpoints

### [METHOD] /path

**Description**: What this endpoint does.

**Request Body**:

\`\`\`typescript
interface RequestBody {
  field: string;
}
\`\`\`

**Response**: \`200 OK\`

\`\`\`typescript
interface Response {
  field: string;
}
\`\`\`

## Related

- [[architecture/overview]]
`;

const generateSchemaTemplate = (): string => `---
title: "[Schema Name]"
type: schema
domain: # specify domain
status: draft
tags:
  - domain/{area}
  - status/draft
  - type/schema
---

# [Schema Name]

> [!context]
> Brief description of what this schema defines.

## Schema Definition

\`\`\`
# Schema definition here
\`\`\`

## Field Reference

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| | | | |

## Related

- [[architecture/overview]]
`;

export const knowledgeLayer: Layer = {
  name: "knowledge",
  description:
    "Obsidian knowledge graph skeleton (docs/, templates, glossary, ADR)",
  dependsOn: ["control"],
  generate: (config: ProjectConfig): FileEntry[] => [
    { path: "docs/_index.md", content: generateIndex(config) },
    { path: "docs/glossary.md", content: generateGlossary(config) },
    {
      path: "docs/architecture/overview.md",
      content: generateArchitectureOverview(config),
    },
    {
      path: "docs/decisions/adr-001-metalayer.md",
      content: generateAdr001(config),
    },
    {
      path: "docs/runbooks/local-dev-setup.md",
      content: generateLocalDevRunbook(config),
    },
    { path: "docs/_templates/adr.md", content: generateAdrTemplate() },
    {
      path: "docs/_templates/architecture-note.md",
      content: generateArchitectureTemplate(),
    },
    { path: "docs/_templates/runbook.md", content: generateRunbookTemplate() },
    {
      path: "docs/_templates/api-contract.md",
      content: generateApiContractTemplate(),
    },
    {
      path: "docs/_templates/schema-note.md",
      content: generateSchemaTemplate(),
    },
  ],
};

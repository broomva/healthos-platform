# Creating and Publishing Agent Skills

## What Is a Skill?

A skill is a reusable package of domain knowledge and instructions for AI coding agents. Skills follow the Agent Skills specification and can be installed via the skills.sh registry.

## Skill Structure

```
my-skill/
  SKILL.md              # Required — YAML frontmatter + markdown instructions
  references/           # Optional — detailed docs loaded on-demand
    setup.md
    api.md
  scripts/              # Optional — executable automation
    validate.sh
  assets/               # Optional — templates, images
    template.tsx
```

## Writing SKILL.md

### Frontmatter (Required)

```yaml
---
name: my-skill
description: Expert assistance for [domain]. Triggers on [activation context].
---
```

The `description` field is the **primary triggering mechanism** — Claude reads descriptions to decide when to activate a skill. Make it specific about what triggers the skill.

### Body (Required)

The markdown body contains:
1. **Overview** — What the skill does, in 2-3 sentences
2. **Quick Start** — Most common commands/workflows
3. **Key Concepts** — Domain knowledge the agent needs
4. **Common Tasks** — Step-by-step procedures
5. **Reference pointers** — `See references/setup.md` for on-demand loading

### Size Guidelines

- SKILL.md body: **< 5,000 words** (loaded when skill triggers)
- Reference files: **unlimited** (loaded on-demand)
- Keep SKILL.md focused on the 80% case; put detailed docs in references

## Progressive Disclosure

Skills use three-level loading:

1. **Metadata** (~100 words) — Name + description, always in context
2. **SKILL.md body** (<5k words) — Loaded when skill triggers
3. **References** (unlimited) — Loaded as-needed by the agent

This means you can include extensive documentation without bloating every conversation.

## Publishing to skills.sh

### 1. Initialize

```bash
npx skills init my-skill
```

This creates the skill directory structure and metadata.

### 2. Write your skill

Follow the SKILL.md format above. Add references as needed.

### 3. Test locally

Place the skill in your project's `skills/` directory or in `~/.claude/skills/` for global access. Test by asking Claude questions that should trigger the skill.

### 4. Publish

Skills live in GitHub repositories. The skills.sh registry indexes them:

```bash
# Users install your skill via:
npx skills add your-github-user/your-repo@my-skill
```

## Best Practices

1. **Be specific in descriptions** — "Expert assistance for Next.js App Router migration from pages/" is better than "Helps with Next.js"
2. **Include code examples** — Agents learn from examples more than abstract descriptions
3. **Use references for depth** — Keep SKILL.md scannable, put details in references
4. **Test trigger accuracy** — Verify the skill activates when expected and doesn't activate spuriously
5. **Version your references** — Update references when your tool/API changes
6. **Include common errors** — Agents benefit from knowing what goes wrong and how to fix it

## Symphony Forge + Skills

Projects scaffolded with symphony-forge are skill-ready:

- The `skills/` directory is gitignored by default for user-specific skills
- Project-level skills can be committed for team-shared knowledge
- The consciousness layer generates CLAUDE.md that instructs agents to check for available skills
- The knowledge layer's `docs/` directory can serve as reference material for project-specific skills

## Example: Creating a Skill for Your API

```markdown
---
name: my-api
description: Expert assistance for the MyProject REST API. Triggers on questions about API endpoints, authentication, request/response schemas, error handling, and webhook integration.
---

# MyProject API

## Authentication
All requests require a Bearer token in the Authorization header.

## Endpoints

### POST /api/v1/users
Create a new user.

\`\`\`typescript
const response = await fetch('/api/v1/users', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({ email, name })
});
\`\`\`

## Common Errors

| Code | Meaning | Fix |
|------|---------|-----|
| 401 | Invalid token | Regenerate API key |
| 429 | Rate limited | Wait 60s, implement backoff |
```

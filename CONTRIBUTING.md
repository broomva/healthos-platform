# Contributing to symphony-forge

Thank you for your interest in contributing! This guide will help you get started.

## Development Setup

```bash
# Clone the repository
git clone https://github.com/broomva/symphony-forge.git
cd symphony-forge

# Install dependencies
bun install

# Build the CLI
npx tsup

# Test locally
node dist/index.js --help
```

## Project Structure

```
scripts/
  index.ts              # CLI entry point (Commander.js)
  initialize.ts         # next-forge clone + setup
  update.ts             # Version update handler
  scaffold.ts           # Layer orchestration
  layer-cmd.ts          # `layer` subcommand
  audit-cmd.ts          # `audit` subcommand
  layers/
    types.ts            # Interfaces (Layer, ProjectConfig, FileEntry)
    utils.ts            # Template helpers (bash headers, PM commands)
    index.ts            # Layer registry
    control.ts          # .control/*.yaml generators
    harness.ts          # scripts/harness/*.sh generators
    knowledge.ts        # docs/ skeleton generators
    consciousness.ts    # CLAUDE.md + AGENTS.md generators
    autoany.ts          # EGRI config generator
skills/
  symphony-forge/       # Agent skill definition
```

## Adding a New Layer

1. Create `scripts/layers/my-layer.ts` implementing the `Layer` interface
2. Register it in `scripts/layers/index.ts`
3. Add it to `LAYER_NAMES` in `scripts/layers/types.ts`
4. Update the consciousness layer to handle the new layer conditionally
5. Add tests

## Guidelines

- **Templates are inline** — All generated content uses TypeScript template literals, not separate files. This ensures tsup bundles everything into a single `dist/index.js`.
- **Package manager agnostic** — Use helpers from `scripts/layers/utils.ts` (`pmRun`, `pmExec`, `pmInstall`) instead of hardcoding `bun`/`npm` commands.
- **Soft dependencies** — Layers reference each other in content but don't require each other.
- **Bash strict mode** — All generated scripts use `set -euo pipefail`.
- **Test locally** — Build with `npx tsup`, then test `layer` and `audit` commands in a temp directory.

## Testing

```bash
# Build
npx tsup

# Test in a temp directory
TMPDIR=$(mktemp -d) && cd "$TMPDIR"
git init && echo '{"name":"test"}' > package.json
mkdir -p apps/app packages/database
node /path/to/symphony-forge/dist/index.js layer all --force
node /path/to/symphony-forge/dist/index.js audit
```

## Commit Messages

Follow conventional commits:
- `feat:` new features
- `fix:` bug fixes
- `docs:` documentation changes
- `refactor:` code changes that neither fix bugs nor add features
- `test:` adding or updating tests

## Pull Requests

1. Fork the repository
2. Create a feature branch from `main`
3. Make your changes
4. Run `npx tsup` to verify the build
5. Test the CLI commands locally
6. Open a PR with a clear description

## License

By contributing, you agree that your contributions will be licensed under the Apache License 2.0.

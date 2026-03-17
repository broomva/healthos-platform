// Harness layer — generates scripts/harness/*.sh, Makefile.control, CI workflow

import type { FileEntry, Layer, ProjectConfig } from "./types.js";
import { bashHeader, lockFileName, pmExec, pmInstall, pmRun } from "./utils.js";

const getCiSetupStep = (pm: string): string => {
  if (pm === "bun") {
    return `      - name: Setup Bun
        uses: oven-sh/setup-bun@v2`;
  }
  if (pm === "pnpm") {
    return `      - name: Setup pnpm
        uses: pnpm/action-setup@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm`;
  }
  return `      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: ${pm}`;
};

const generateSmokeScript = (config: ProjectConfig): string =>
  `${bashHeader("smoke.sh — Quick validation: install, check, build the main app", "make -f Makefile.control smoke", "~120s")}
echo "=== Smoke Test ==="
echo ""

echo "[1/3] Installing dependencies (frozen lockfile)..."
${pmInstall(config, true)}
echo ""

echo "[2/3] Running checks (lint + typecheck)..."
${pmRun(config, "check")}
echo ""

echo "[3/3] Building main app..."
${pmRun(config, "build")} ${config.packageManager === "npm" ? "--workspace app" : "--filter app"}
echo ""

echo "=== Smoke test passed ==="
`;

const generateCheckScript = (config: ProjectConfig): string =>
  `${bashHeader("check.sh — Lint + typecheck", "make -f Makefile.control check", "~60s")}
echo "=== Check: Lint + Typecheck ==="
echo ""

echo "[1/2] Running lint..."
${pmRun(config, "check")}
echo ""

echo "[2/2] Running TypeScript typecheck..."
${pmExec(config, "tsc --noEmit")}
echo ""

echo "=== All checks passed ==="
`;

const generateCiScript = (config: ProjectConfig): string =>
  `${bashHeader("ci.sh — Full CI pipeline: check + test + build", "make -f Makefile.control ci", "~600s")}
echo "=== CI Pipeline ==="
echo ""

echo "[1/3] Running checks (lint + typecheck)..."
bash scripts/harness/check.sh
echo ""

echo "[2/3] Running tests..."
${pmRun(config, "test")}
echo ""

echo "[3/3] Running full build..."
${pmRun(config, "build")}
echo ""

echo "=== CI pipeline passed ==="
`;

const generatePolicyCheckScript = (config: ProjectConfig): string =>
  `${bashHeader("check-policy.sh — Policy compliance checker for staged changes", "make -f Makefile.control policy-check")}
echo "=== Policy Compliance Check ==="

# Get staged files (or all changed files if not in a git context)
if git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
  STAGED=$(git diff --cached --name-only 2>/dev/null || git diff --name-only HEAD 2>/dev/null || true)
else
  echo "  Not in a git repository. Skipping policy check."
  exit 0
fi

if [ -z "$STAGED" ]; then
  echo "  No staged files. Nothing to check."
  exit 0
fi

WARNINGS=0

# Policy: database-migration
if echo "$STAGED" | grep -q "packages/database/prisma/schema.prisma\\|packages/database/prisma/migrations"; then
  echo ""
  echo "  [HIGH RISK] Database migration detected!"
  echo "    - Required: ADR in docs/decisions/ explaining the change"
  echo "    - Required: Tests covering the migration"
  echo "    - Required: Database backup before production apply"
  WARNINGS=$((WARNINGS + 1))
fi

# Policy: dependency-update
if echo "$STAGED" | grep -q "package.json\\|${lockFileName(config)}"; then
  echo ""
  echo "  [MEDIUM RISK] Dependency change detected!"
  echo "    - Recommended: Run audit"
  echo "    - Required: Full build and test pass"
  WARNINGS=$((WARNINGS + 1))
fi

# Policy: env-variable-change
if echo "$STAGED" | grep -qE "\\.env\\.example|\\.env\\.local\\.example|env\\.ts|keys\\.ts"; then
  echo ""
  echo "  [HIGH RISK] Environment variable change detected!"
  echo "    - Required: Update docs/schemas/env-variables.md"
  echo "    - Required: Add Zod validation in env.ts"
  echo "    - WARNING: Never commit actual secret values"
  WARNINGS=$((WARNINGS + 1))
fi

# Policy: new-package
if echo "$STAGED" | grep -qE "^(packages|apps)/[^/]+/package\\.json$"; then
  NEW_PKGS=$(echo "$STAGED" | grep -E "^(packages|apps)/[^/]+/package\\.json$" || true)
  for pkg in $NEW_PKGS; do
    if ! git show HEAD:"$pkg" > /dev/null 2>&1; then
      echo ""
      echo "  [MEDIUM RISK] New package detected: $pkg"
      echo "    - Required: Update .control/topology.yaml"
      echo "    - Required: Add architecture doc in docs/architecture/"
      echo "    - Required: Update docs/_index.md"
      WARNINGS=$((WARNINGS + 1))
    fi
  done
fi

echo ""
if [ "$WARNINGS" -gt 0 ]; then
  echo "  Found $WARNINGS policy warning(s). Review before proceeding."
  echo "  (Policy checks are advisory — they do not block commits.)"
else
  echo "  No policy warnings."
fi

echo "=== Policy check complete ==="
`;

const generateDocsFreshnessScript = (): string =>
  `${bashHeader("check-docs-freshness.sh — Verify documentation index coverage", "make -f Makefile.control docs-check")}
DOCS_DIR="$REPO_ROOT/docs"
INDEX_FILE="$DOCS_DIR/_index.md"

echo "=== Docs Freshness Check ==="

if [ ! -d "$DOCS_DIR" ]; then
  echo "  WARN: docs/ directory does not exist yet. Skipping."
  exit 0
fi

if [ ! -f "$INDEX_FILE" ]; then
  echo "  WARN: docs/_index.md does not exist yet. Skipping."
  exit 0
fi

MISSING=()

while IFS= read -r -d '' doc; do
  rel_path="\${doc#"$DOCS_DIR"/}"

  if [[ "$rel_path" == _templates/* ]]; then
    continue
  fi

  if [[ "$rel_path" == "_index.md" ]]; then
    continue
  fi

  basename_no_ext="\${rel_path%.md}"
  if ! grep -q "$basename_no_ext" "$INDEX_FILE" && ! grep -q "$rel_path" "$INDEX_FILE"; then
    MISSING+=("$rel_path")
  fi
done < <(find "$DOCS_DIR" -name '*.md' -print0 | sort -z)

if [ \${#MISSING[@]} -gt 0 ]; then
  echo "  ERROR: The following docs are NOT referenced in docs/_index.md:"
  for m in "\${MISSING[@]}"; do
    echo "    - $m"
  done
  echo ""
  echo "  Add references to these files in docs/_index.md."
  exit 1
fi

echo "  All docs are referenced in _index.md."
echo "=== Docs freshness check passed ==="
`;

const generateWikilinksScript = (): string =>
  `${bashHeader("check-wikilinks.sh — Validate [[wikilinks]] in docs/*.md files", "make -f Makefile.control wikilinks-check")}
DOCS_DIR="$REPO_ROOT/docs"

echo "=== Wikilink Validation ==="

if [ ! -d "$DOCS_DIR" ]; then
  echo "  WARN: docs/ directory does not exist yet. Skipping."
  exit 0
fi

BROKEN=()
CHECKED=0

while IFS= read -r -d '' doc; do
  while IFS= read -r link; do
    target="\${link%%|*}"
    target="\${target%%#*}"

    if [ -z "$target" ]; then
      continue
    fi

    if [[ "$target" == ...* ]]; then
      continue
    fi

    if [[ "$target" == *NNN* ]] || [[ "$target" == *XXX* ]]; then
      continue
    fi

    if [[ "$target" == "wikilinks" ]] || [[ "$target" == "internal-link" ]]; then
      continue
    fi

    target="\${target%%#*}"
    target="\${target%/}"

    if [ -z "$target" ]; then
      continue
    fi

    CHECKED=$((CHECKED + 1))

    target_file="$DOCS_DIR/\${target}.md"
    target_dir="$DOCS_DIR/\${target}"

    if [ ! -f "$target_file" ] && [ ! -d "$target_dir" ]; then
      rel_doc="\${doc#"$REPO_ROOT"/}"
      BROKEN+=("$rel_doc -> [[\${target}]] (expected: docs/\${target}.md)")
    fi
  done < <(
    sed '/^\`\`\`/,/^\`\`\`/d' "$doc" \\
      | sed 's/\`[^\`]*\`//g' \\
      | grep -oE '\\[\\[[^]]+\\]\\]' 2>/dev/null \\
      | sed 's/^\\[\\[//; s/\\]\\]$//' \\
      || true
  )
done < <(find "$DOCS_DIR" -name '*.md' -print0 | sort -z)

echo "  Checked $CHECKED wikilinks."

if [ \${#BROKEN[@]} -gt 0 ]; then
  echo ""
  echo "  ERROR: Found \${#BROKEN[@]} broken wikilink(s):"
  for b in "\${BROKEN[@]}"; do
    echo "    - $b"
  done
  echo ""
  echo "  Create the missing target files or fix the wikilink paths."
  exit 1
fi

echo "  No broken wikilinks found."
echo "=== Wikilink validation passed ==="
`;

const generateAuditScript = (): string =>
  `${bashHeader("audit.sh — Entropy audit: topology coverage, stale docs, broken wikilinks", "make -f Makefile.control audit")}
echo "=== Entropy Audit ==="
echo ""
ISSUES=0

# --- 1. Topology Coverage ---
echo "[1/3] Checking topology coverage..."

TOPOLOGY_FILE="$REPO_ROOT/.control/topology.yaml"
if [ ! -f "$TOPOLOGY_FILE" ]; then
  echo "  ERROR: .control/topology.yaml not found!"
  ISSUES=$((ISSUES + 1))
else
  for app_dir in "$REPO_ROOT"/apps/*/; do
    app_name=$(basename "$app_dir")
    if ! grep -q "^  \${app_name}:" "$TOPOLOGY_FILE" 2>/dev/null; then
      echo "  WARN: apps/$app_name is not listed in .control/topology.yaml"
      ISSUES=$((ISSUES + 1))
    fi
  done

  for pkg_dir in "$REPO_ROOT"/packages/*/; do
    pkg_name=$(basename "$pkg_dir")
    if ! grep -q "^  \${pkg_name}:" "$TOPOLOGY_FILE" 2>/dev/null; then
      echo "  WARN: packages/$pkg_name is not listed in .control/topology.yaml"
      ISSUES=$((ISSUES + 1))
    fi
  done

  echo "  Topology coverage check complete."
fi
echo ""

# --- 2. Stale Docs ---
echo "[2/3] Checking for stale documentation (>90 days)..."

DOCS_DIR="$REPO_ROOT/docs"
if [ ! -d "$DOCS_DIR" ]; then
  echo "  WARN: docs/ directory does not exist yet. Skipping stale docs check."
else
  STALE_THRESHOLD=$((90 * 24 * 60 * 60))
  NOW=$(date +%s)
  STALE_COUNT=0

  while IFS= read -r -d '' doc; do
    if [[ "$OSTYPE" == "darwin"* ]]; then
      MOD_TIME=$(stat -f %m "$doc")
    else
      MOD_TIME=$(stat -c %Y "$doc")
    fi
    AGE=$((NOW - MOD_TIME))

    if [ "$AGE" -gt "$STALE_THRESHOLD" ]; then
      rel_path="\${doc#"$REPO_ROOT"/}"
      DAYS_OLD=$((AGE / 86400))
      echo "  STALE: $rel_path (\${DAYS_OLD} days old)"
      STALE_COUNT=$((STALE_COUNT + 1))
    fi
  done < <(find "$DOCS_DIR" -name '*.md' -print0 2>/dev/null)

  if [ "$STALE_COUNT" -eq 0 ]; then
    echo "  No stale docs found."
  else
    echo "  Found $STALE_COUNT stale doc(s)."
    ISSUES=$((ISSUES + STALE_COUNT))
  fi
fi
echo ""

# --- 3. Broken Wikilinks ---
echo "[3/3] Checking for broken wikilinks..."
if [ -f "$REPO_ROOT/scripts/harness/check-wikilinks.sh" ]; then
  if ! bash "$REPO_ROOT/scripts/harness/check-wikilinks.sh"; then
    ISSUES=$((ISSUES + 1))
  fi
else
  echo "  WARN: check-wikilinks.sh not found. Skipping."
fi

echo ""
echo "=== Audit Summary ==="
if [ "$ISSUES" -gt 0 ]; then
  echo "  Found $ISSUES issue(s). Review and address above warnings."
  exit 1
else
  echo "  No issues found. Repository is in good shape."
  exit 0
fi
`;

const generateInstallHooksScript = (): string =>
  `${bashHeader("install-hooks.sh — Install git hooks", "make -f Makefile.control hooks-install")}
HOOKS_DIR="$REPO_ROOT/.git/hooks"

if [ ! -d "$REPO_ROOT/.git" ]; then
  echo "No .git directory found. Skipping hook installation."
  exit 0
fi

mkdir -p "$HOOKS_DIR"

cp "$REPO_ROOT/scripts/harness/pre-commit.sh" "$HOOKS_DIR/pre-commit"
chmod +x "$HOOKS_DIR/pre-commit"

echo "Git hooks installed:"
echo "  - pre-commit -> scripts/harness/pre-commit.sh"
`;

const generatePreCommitScript = (config: ProjectConfig): string =>
  `${bashHeader("pre-commit.sh — Fast pre-commit hook (<10s)", "Installed as .git/hooks/pre-commit via install-hooks.sh")}
echo "=== Pre-commit Hook ==="

STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\\.(ts|tsx)$' || true)

if [ -n "$STAGED_FILES" ]; then
  echo "[1/2] Linting staged TypeScript files..."
  echo "$STAGED_FILES" | xargs ${pmExec(config, "biome check --no-errors-on-unmatched")}
else
  echo "[1/2] No staged TypeScript files to lint."
fi

echo "[2/2] Checking docs freshness..."
if [ -f "$REPO_ROOT/scripts/harness/check-docs-freshness.sh" ]; then
  bash "$REPO_ROOT/scripts/harness/check-docs-freshness.sh"
else
  echo "  Skipping: check-docs-freshness.sh not found."
fi

echo "=== Pre-commit passed ==="
`;

const generateMakefileControl = (config: ProjectConfig): string =>
  `# Makefile.control — Control harness for ${config.name}
# Usage: make -f Makefile.control <target>
# All targets delegate to scripts in scripts/harness/

.PHONY: help smoke check test build ci docs-check wikilinks-check policy-check hooks-install audit

SHELL := /usr/bin/env bash

help: ## Show all available targets
\t@echo "${config.name} — Control Harness"
\t@echo ""
\t@echo "Usage: make -f Makefile.control <target>"
\t@echo ""
\t@echo "Targets:"
\t@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \\033[36m%-18s\\033[0m %s\\n", $$1, $$2}'

smoke: ## Quick validation: install + check + build app (~120s)
\t@bash scripts/harness/smoke.sh

check: ## Lint + typecheck (~60s)
\t@bash scripts/harness/check.sh

test: ## Run test suite (~180s)
\t@${pmRun(config, "test")}

build: ## Full build (~300s)
\t@${pmRun(config, "build")}

ci: ## Full CI pipeline: check + test + build (~600s)
\t@bash scripts/harness/ci.sh

docs-check: ## Verify documentation freshness and index coverage (~10s)
\t@bash scripts/harness/check-docs-freshness.sh

wikilinks-check: ## Validate no broken [[wikilinks]] in docs/ (~10s)
\t@bash scripts/harness/check-wikilinks.sh

policy-check: ## Check staged files against policy gates
\t@bash scripts/harness/check-policy.sh

hooks-install: ## Install git pre-commit hooks
\t@bash scripts/harness/install-hooks.sh

audit: ## Entropy audit: topology, stale docs, broken links
\t@bash scripts/harness/audit.sh
`;

const generateCiWorkflow = (config: ProjectConfig): string => {
  const pm = config.packageManager;
  const installCmd = pmInstall(config, true);
  const setupStep = getCiSetupStep(pm);

  return `name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  ci:
    name: Check, Test, Build
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

${setupStep}

      - name: Install dependencies
        run: ${installCmd}

      - name: Lint + Typecheck
        run: bash scripts/harness/check.sh

      - name: Test
        run: ${pmRun(config, "test")}

      - name: Build
        run: ${pmRun(config, "build")}
`;
};

export const harnessLayer: Layer = {
  name: "harness",
  description:
    "Build automation scripts, Makefile.control, git hooks, CI workflow",
  dependsOn: ["control"],
  generate: (config: ProjectConfig): FileEntry[] => [
    {
      path: "scripts/harness/smoke.sh",
      content: generateSmokeScript(config),
      executable: true,
    },
    {
      path: "scripts/harness/check.sh",
      content: generateCheckScript(config),
      executable: true,
    },
    {
      path: "scripts/harness/ci.sh",
      content: generateCiScript(config),
      executable: true,
    },
    {
      path: "scripts/harness/check-policy.sh",
      content: generatePolicyCheckScript(config),
      executable: true,
    },
    {
      path: "scripts/harness/check-docs-freshness.sh",
      content: generateDocsFreshnessScript(),
      executable: true,
    },
    {
      path: "scripts/harness/check-wikilinks.sh",
      content: generateWikilinksScript(),
      executable: true,
    },
    {
      path: "scripts/harness/audit.sh",
      content: generateAuditScript(),
      executable: true,
    },
    {
      path: "scripts/harness/install-hooks.sh",
      content: generateInstallHooksScript(),
      executable: true,
    },
    {
      path: "scripts/harness/pre-commit.sh",
      content: generatePreCommitScript(config),
      executable: true,
    },
    {
      path: "Makefile.control",
      content: generateMakefileControl(config),
    },
    {
      path: ".github/workflows/ci.yml",
      content: generateCiWorkflow(config),
    },
  ],
};

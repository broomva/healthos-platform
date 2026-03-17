// audit-cmd.ts — `audit` subcommand handler

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { log } from "@clack/prompts";

const MD_EXT_RE = /\.md$/;

interface AuditResult {
  category: string;
  issues: string[];
  passed: boolean;
}

/**
 * Check if a directory's entries are listed in topology.yaml
 */
const checkDirInTopology = (
  dirPath: string,
  prefix: string,
  topologyContent: string,
  issues: string[]
) => {
  if (!existsSync(dirPath)) {
    return;
  }
  for (const entry of readdirSync(dirPath, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }
    const pattern = new RegExp(`^  ${entry.name}:`, "m");
    if (!pattern.test(topologyContent)) {
      issues.push(`${prefix}/${entry.name} not listed in topology.yaml`);
    }
  }
};

/**
 * Check topology coverage — all apps/ and packages/ dirs in topology.yaml
 */
const checkTopology = (cwd: string): AuditResult => {
  const topologyPath = join(cwd, ".control", "topology.yaml");
  const issues: string[] = [];

  if (!existsSync(topologyPath)) {
    return {
      category: "Topology Coverage",
      issues: [".control/topology.yaml not found (install control layer)"],
      passed: false,
    };
  }

  const topologyContent = readFileSync(topologyPath, "utf-8");
  checkDirInTopology(join(cwd, "apps"), "apps", topologyContent, issues);
  checkDirInTopology(
    join(cwd, "packages"),
    "packages",
    topologyContent,
    issues
  );

  return {
    category: "Topology Coverage",
    issues,
    passed: issues.length === 0,
  };
};

/**
 * Check for stale docs (>90 days old)
 */
const checkStaleDocs = (cwd: string): AuditResult => {
  const docsDir = join(cwd, "docs");
  const issues: string[] = [];

  if (!existsSync(docsDir)) {
    return {
      category: "Stale Docs",
      issues: ["docs/ directory not found (install knowledge layer)"],
      passed: false,
    };
  }

  const threshold = 90 * 24 * 60 * 60 * 1000; // 90 days in ms
  const now = Date.now();

  const checkDir = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== "_templates") {
          checkDir(fullPath);
        }
      } else if (entry.name.endsWith(".md")) {
        const stat = statSync(fullPath);
        const age = now - stat.mtimeMs;
        if (age > threshold) {
          const daysOld = Math.floor(age / (24 * 60 * 60 * 1000));
          const relPath = fullPath.replace(`${cwd}/`, "");
          issues.push(`${relPath} (${daysOld} days old)`);
        }
      }
    }
  };

  checkDir(docsDir);

  return {
    category: "Stale Docs",
    issues,
    passed: issues.length === 0,
  };
};

/**
 * Check docs index coverage — every .md in docs/ referenced in _index.md
 */
const checkIndexCoverage = (cwd: string): AuditResult => {
  const docsDir = join(cwd, "docs");
  const indexPath = join(docsDir, "_index.md");
  const issues: string[] = [];

  if (!existsSync(indexPath)) {
    return {
      category: "Index Coverage",
      issues: ["docs/_index.md not found"],
      passed: false,
    };
  }

  const indexContent = readFileSync(indexPath, "utf-8");

  const checkDir = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== "_templates") {
          checkDir(fullPath);
        }
      } else if (entry.name.endsWith(".md") && entry.name !== "_index.md") {
        const relPath = fullPath.replace(`${docsDir}/`, "");
        const basename = relPath.replace(MD_EXT_RE, "");
        if (
          !(indexContent.includes(basename) || indexContent.includes(relPath))
        ) {
          issues.push(`${relPath} not referenced in _index.md`);
        }
      }
    }
  };

  checkDir(docsDir);

  return {
    category: "Index Coverage",
    issues,
    passed: issues.length === 0,
  };
};

/**
 * Check manifest — verify .symphony-forge.json exists and is valid
 */
const checkManifest = (cwd: string): AuditResult => {
  const manifestPath = join(cwd, ".symphony-forge.json");
  const issues: string[] = [];

  if (existsSync(manifestPath)) {
    try {
      const raw = readFileSync(manifestPath, "utf-8");
      JSON.parse(raw);
    } catch {
      issues.push(".symphony-forge.json is not valid JSON");
    }
  } else {
    issues.push(
      ".symphony-forge.json not found (run symphony-forge layer to create)"
    );
  }

  return {
    category: "Manifest",
    issues,
    passed: issues.length === 0,
  };
};

export const auditCommand = () => {
  log.info("=== Symphony Forge — Entropy Audit ===\n");

  const cwd = process.cwd();
  const results: AuditResult[] = [
    checkManifest(cwd),
    checkTopology(cwd),
    checkStaleDocs(cwd),
    checkIndexCoverage(cwd),
  ];

  let totalIssues = 0;

  for (const result of results) {
    const icon = result.passed ? "✓" : "✗";
    log.info(`[${icon}] ${result.category}`);

    if (!result.passed) {
      for (const issue of result.issues) {
        log.warn(`    ${issue}`);
      }
      totalIssues += result.issues.length;
    }
  }

  log.info("");
  if (totalIssues > 0) {
    log.error(
      `Found ${totalIssues} issue(s). Review and address above warnings.`
    );
    process.exit(1);
  } else {
    log.info("No issues found. Repository is in good shape.");
  }
};

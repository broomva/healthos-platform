import { tool } from "ai";
import { execFile } from "child_process";
import { readdir, readFile } from "fs/promises";
import os from "os";
import path from "path";
import { promisify } from "util";
import { z } from "zod";

const exec = promisify(execFile);

const SKILLS_DIR = path.join(os.homedir(), ".agents/skills");
const LOCK_FILE = path.join(os.homedir(), ".agents/.skill-lock.json");

export const skillManager = tool({
  description: `Manage AI agent skills from the skills.sh ecosystem. Skills are self-contained capabilities defined by SKILL.md files.

Actions:
- list: List all installed skills with their descriptions
- read: Read a skill's full documentation (SKILL.md)
- search: Search skills.sh registry for available skills
- install: Install a skill from skills.sh (e.g., "owner/repo@skill-name")
- check: Check for skill updates

Skills are installed to ~/.agents/skills/ and provide CLI tools, documentation, and capabilities that extend the agent.`,
  inputSchema: z.object({
    action: z
      .enum(["list", "read", "search", "install", "check"])
      .describe("The action to perform"),
    skill: z
      .string()
      .describe(
        "For 'read': skill name (e.g., 'garmin-connect'). For 'install': full identifier (e.g., 'eddmann/garmin-connect-cli@garmin-connect'). For 'search': search query."
      )
      .optional(),
  }),
  execute: async ({ action, skill }) => {
    try {
      switch (action) {
        case "list": {
          const entries = await readdir(SKILLS_DIR, {
            withFileTypes: true,
          }).catch(() => []);

          const skills = [];
          for (const entry of entries) {
            if (!entry.isDirectory()) continue;
            const skillMdPath = path.join(SKILLS_DIR, entry.name, "SKILL.md");
            try {
              const content = await readFile(skillMdPath, "utf-8");
              const frontmatter = parseFrontmatter(content);
              skills.push({
                name: entry.name,
                description: frontmatter.description || "(no description)",
                path: skillMdPath,
              });
            } catch {
              skills.push({
                name: entry.name,
                description: "(SKILL.md not found)",
                path: path.join(SKILLS_DIR, entry.name),
              });
            }
          }

          let lockData = null;
          try {
            const lockContent = await readFile(LOCK_FILE, "utf-8");
            lockData = JSON.parse(lockContent);
          } catch {
            // No lock file
          }

          return {
            installedCount: skills.length,
            skills,
            lockFile: lockData
              ? {
                  version: lockData.version,
                  skillCount: Object.keys(lockData.skills || {}).length,
                }
              : null,
          };
        }

        case "read": {
          if (!skill) {
            return { error: "Skill name is required for 'read' action" };
          }

          const skillMdPath = path.join(SKILLS_DIR, skill, "SKILL.md");
          try {
            const content = await readFile(skillMdPath, "utf-8");
            const frontmatter = parseFrontmatter(content);
            return {
              name: skill,
              description: frontmatter.description || null,
              documentation: content,
              path: skillMdPath,
            };
          } catch {
            // Try CLAUDE.md as fallback
            const claudeMdPath = path.join(SKILLS_DIR, skill, "CLAUDE.md");
            try {
              const content = await readFile(claudeMdPath, "utf-8");
              return {
                name: skill,
                documentation: content,
                path: claudeMdPath,
                note: "Read from CLAUDE.md (no SKILL.md found)",
              };
            } catch {
              return {
                error: `Skill '${skill}' not found at ${skillMdPath}`,
              };
            }
          }
        }

        case "search": {
          if (!skill) {
            return {
              error: "Search query is required for 'search' action",
            };
          }

          const { stdout, stderr } = await exec(
            "npx",
            ["skills", "find", skill],
            {
              timeout: 30_000,
              maxBuffer: 1024 * 1024,
              env: {
                ...process.env,
                PATH: `${path.join(os.homedir(), ".local/bin")}:/usr/local/bin:/usr/bin:/bin:${process.env.PATH}`,
              },
            }
          );

          return {
            query: skill,
            results: stdout.trim(),
            stderr: stderr?.trim() || undefined,
          };
        }

        case "install": {
          if (!skill) {
            return {
              error:
                "Skill identifier is required for 'install' action (e.g., 'owner/repo@skill-name')",
            };
          }

          const { stdout, stderr } = await exec(
            "npx",
            ["skills", "add", skill, "-g", "-y"],
            {
              timeout: 60_000,
              maxBuffer: 1024 * 1024,
              env: {
                ...process.env,
                PATH: `${path.join(os.homedir(), ".local/bin")}:/usr/local/bin:/usr/bin:/bin:${process.env.PATH}`,
              },
            }
          );

          return {
            installed: skill,
            stdout: stdout.trim(),
            stderr: stderr?.trim() || undefined,
          };
        }

        case "check": {
          const { stdout, stderr } = await exec("npx", ["skills", "check"], {
            timeout: 30_000,
            maxBuffer: 1024 * 1024,
            env: {
              ...process.env,
              PATH: `${path.join(os.homedir(), ".local/bin")}:/usr/local/bin:/usr/bin:/bin:${process.env.PATH}`,
            },
          });

          return {
            stdout: stdout.trim(),
            stderr: stderr?.trim() || undefined,
          };
        }
      }
    } catch (error: unknown) {
      const err = error as { message?: string; stderr?: string };
      return {
        error: err.message || String(error),
        stderr: err.stderr?.slice(0, 1000) || undefined,
      };
    }
  },
});

function parseFrontmatter(content: string): Record<string, string> {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return {};

  const result: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const colonIndex = line.indexOf(":");
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      const value = line.slice(colonIndex + 1).trim();
      result[key] = value;
    }
  }
  return result;
}

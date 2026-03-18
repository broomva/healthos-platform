import { tool } from "ai";
import { execFile } from "child_process";
import os from "os";
import path from "path";
import { promisify } from "util";
import { z } from "zod";

const exec = promisify(execFile);

const ALLOWED_COMMANDS = new Set([
  "garmin-connect",
  "npx",
  "ls",
  "cat",
  "head",
  "tail",
  "grep",
  "find",
  "wc",
  "sort",
  "uniq",
  "jq",
  "date",
  "echo",
  "pwd",
]);

const BLOCKED_PATTERNS = [
  /rm\s+-rf/,
  /sudo/,
  /chmod/,
  /chown/,
  /mkfs/,
  /dd\s+if=/,
  />\s*\/dev\//,
  /curl.*\|\s*sh/,
  /curl.*\|\s*bash/,
  /wget.*\|\s*sh/,
];

function getBaseCommand(command: string): string {
  const parts = command.trim().split(/\s+/);
  return path.basename(parts[0]);
}

function isSafe(command: string): { safe: boolean; reason?: string } {
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(command)) {
      return { safe: false, reason: `Blocked pattern: ${pattern.source}` };
    }
  }

  const base = getBaseCommand(command);
  if (!ALLOWED_COMMANDS.has(base)) {
    return {
      safe: false,
      reason: `Command '${base}' not in allowlist. Allowed: ${[...ALLOWED_COMMANDS].join(", ")}`,
    };
  }

  return { safe: true };
}

export const shellExecute = tool({
  description: `Execute a shell command in a sandboxed environment. Only allowed commands can run:
${[...ALLOWED_COMMANDS].join(", ")}

Use this for:
- Running installed skill CLIs (garmin-connect, etc.)
- Filesystem exploration (ls, cat, find, grep)
- Data processing (jq, sort, wc)
- Installing skills via npx (npx skills add/find/check)

Commands are validated against an allowlist. Dangerous patterns (rm -rf, sudo, etc.) are blocked.`,
  inputSchema: z.object({
    command: z
      .string()
      .describe(
        "The shell command to execute. Examples: 'ls ~/.agents/skills', 'garmin-connect health sleep', 'npx skills find garmin'"
      ),
    timeout: z
      .number()
      .describe("Timeout in milliseconds (max 60000)")
      .default(30_000),
  }),
  execute: async ({ command, timeout }) => {
    const check = isSafe(command);
    if (!check.safe) {
      return {
        error: check.reason,
        command,
        allowed: [...ALLOWED_COMMANDS],
      };
    }

    const effectiveTimeout = Math.min(timeout, 60_000);

    try {
      const { stdout, stderr } = await exec("/bin/sh", ["-c", command], {
        timeout: effectiveTimeout,
        maxBuffer: 1024 * 1024 * 5,
        cwd: os.homedir(),
        env: {
          ...process.env,
          HOME: os.homedir(),
          PATH: `${path.join(os.homedir(), ".local/bin")}:/usr/local/bin:/usr/bin:/bin:${process.env.PATH}`,
        },
      });

      return {
        command,
        stdout: stdout.trim().slice(0, 50_000),
        stderr: stderr?.trim().slice(0, 2000) || undefined,
        exitCode: 0,
      };
    } catch (error: unknown) {
      const err = error as {
        code?: string | number;
        stderr?: string;
        stdout?: string;
        message?: string;
      };

      return {
        command,
        error: err.message || String(error),
        stdout: err.stdout?.trim().slice(0, 10_000) || undefined,
        stderr: err.stderr?.trim().slice(0, 2000) || undefined,
        exitCode: typeof err.code === "number" ? err.code : 1,
      };
    }
  },
});

import { tool } from "ai";
import { execFile } from "child_process";
import os from "os";
import path from "path";
import { promisify } from "util";
import { z } from "zod";

const exec = promisify(execFile);
const GARMIN_CLI = path.join(os.homedir(), ".local/bin/garmin-connect");

const COMMAND_DESCRIPTIONS: Record<string, string> = {
  context:
    "Aggregated health snapshot: profile + stats + health + training + activities. Best for general overview.",
  "health sleep":
    "Sleep data: duration, phases (deep/REM/light), sleep score, SpO2, respiration, HRV overnight.",
  "health heart-rate":
    "Heart rate data: resting HR, min/max, time series, HR zones.",
  "health steps":
    "Step count: total steps, distance, time series (15-min intervals).",
  "health stress":
    "Stress levels: avg/max, time distribution (rest/low/med/high), time series.",
  "health body-battery":
    "Body battery: charged/drained, highest/lowest, time series, feedback events.",
  "health rhr": "Resting heart rate: current and historical values.",
  "training status":
    "Training status: productive/maintaining/overreaching, ACWR, acute/chronic load.",
  "training readiness":
    "Training readiness: score 0-100, factor breakdown (sleep, recovery, HRV, stress, ACWR).",
  "training hrv":
    "HRV: weekly avg, last night, baseline range, status (balanced/unbalanced/low).",
  "training vo2max": "VO2 Max estimates for running and cycling.",
  "training lactate":
    "Lactate threshold: speed, heart rate, FTP, power-to-weight.",
  "training endurance": "Endurance score.",
  "training hill": "Hill score.",
  athlete:
    "Athlete profile: name, gender, weight, height, birth date, device settings.",
  "athlete stats":
    "Today's daily stats: steps, distance, calories, HR, floors, active time.",
  "activities list":
    "Recent activities list: type, duration, distance, HR, calories, elevation.",
  "weight get":
    "Current weight and body composition: weight, BMI, body fat, muscle mass.",
};

export const garminQuery = tool({
  description: `Execute a LIVE query to Garmin Connect via the garmin-connect CLI. Returns real-time data directly from Garmin's API. Use this for fresh data, specific dates, or any query not covered by the cached health tools.

Available commands:
- context — Full aggregated snapshot (best for general "how am I doing" questions)
- health sleep/heart-rate/steps/stress/body-battery/rhr — Daily health metrics
- training status/readiness/hrv/vo2max/lactate — Training and performance
- athlete / athlete stats — Profile and daily stats
- activities list — Recent workouts
- weight get — Body composition

All health/training commands accept --date YYYY-MM-DD for historical data.
activities list accepts --limit N, --after DATE, --before DATE, --type TYPE.
context accepts --activities N and --focus section1,section2.`,
  inputSchema: z.object({
    command: z
      .string()
      .describe(
        "The garmin-connect subcommand to run. Examples: 'context', 'health sleep', 'training readiness', 'activities list', 'health heart-rate'"
      ),
    args: z
      .array(z.string())
      .describe(
        "Additional CLI arguments. Examples: ['--date', '2026-02-10'], ['--limit', '5'], ['--activities', '10']"
      )
      .default([]),
  }),
  execute: async ({ command, args }) => {
    try {
      const cmdParts = command.split(/\s+/);
      const fullArgs = [...cmdParts, ...args];

      const { stdout, stderr } = await exec(GARMIN_CLI, fullArgs, {
        timeout: 30_000,
        maxBuffer: 1024 * 1024 * 5, // 5MB
        env: {
          ...process.env,
          PATH: `${path.join(os.homedir(), ".local/bin")}:${process.env.PATH}`,
        },
      });

      if (stderr && stderr.includes("auth")) {
        return {
          error:
            "Authentication error. The Garmin CLI needs to be re-authenticated. Run: garmin-connect auth login",
          exitCode: 2,
        };
      }

      try {
        const data = JSON.parse(stdout);
        return {
          command: `garmin-connect ${fullArgs.join(" ")}`,
          description: COMMAND_DESCRIPTIONS[command] || `Result of: ${command}`,
          data,
        };
      } catch {
        // Not JSON — return as raw text
        return {
          command: `garmin-connect ${fullArgs.join(" ")}`,
          rawOutput: stdout.trim(),
        };
      }
    } catch (error: unknown) {
      const err = error as { code?: string; stderr?: string; message?: string };

      if (err.code === "ENOENT") {
        return {
          error:
            "garmin-connect CLI not found. Install it: curl -fsSL https://raw.githubusercontent.com/eddmann/garmin-connect-cli/main/install.sh | sh",
        };
      }

      if (err.stderr?.includes("auth") || err.stderr?.includes("token")) {
        return {
          error: "Authentication expired. Run: garmin-connect auth login",
          exitCode: 2,
        };
      }

      return {
        error: `CLI error: ${err.message || String(error)}`,
        stderr: err.stderr?.slice(0, 500),
      };
    }
  },
});

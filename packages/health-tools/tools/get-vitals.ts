import { tool } from "ai";
import fs from "fs/promises";
import matter from "gray-matter";
import path from "path";
import { z } from "zod";

const DATA_DIR = path.join(process.cwd(), "data");

export const getVitals = tool({
  description:
    "Get daily vital signs including heart rate (resting, min, max), HRV, SpO2, stress levels, body battery, steps, calories, and activity summary. Returns data for a specific date or the latest available. Use this when the user asks about their daily health metrics, heart rate, stress, or body battery.",
  inputSchema: z.object({
    date: z
      .string()
      .describe("Date in YYYY-MM-DD format. Defaults to the latest available.")
      .optional(),
    days: z
      .number()
      .describe("Number of recent days to return (max 14). Defaults to 1.")
      .default(1),
  }),
  execute: async (input) => {
    try {
      const dailyDir = path.join(DATA_DIR, "daily");
      const files = await fs.readdir(dailyDir);
      const mdFiles = files
        .filter((f) => f.endsWith(".md"))
        .sort()
        .reverse();

      if (mdFiles.length === 0) {
        return { error: "No daily vitals data available." };
      }

      const days = Math.min(input.days || 1, 14);
      let selectedFiles = mdFiles.slice(0, days);

      if (input.date) {
        const startIdx = mdFiles.findIndex((f) => f.includes(input.date!));
        if (startIdx >= 0) {
          selectedFiles = mdFiles.slice(startIdx, startIdx + days);
        }
      }

      const results = await Promise.all(
        selectedFiles.map(async (file) => {
          const raw = await fs.readFile(path.join(dailyDir, file), "utf-8");
          const { data: frontmatter, content } = matter(raw);
          return {
            date: frontmatter.date,
            metrics: frontmatter.metrics,
            alerts: frontmatter.alerts || [],
            tags: frontmatter.tags || [],
            summary: content.trim(),
          };
        })
      );

      return {
        days: results,
        count: results.length,
      };
    } catch (error) {
      return { error: `Failed to read vitals: ${error}` };
    }
  },
});

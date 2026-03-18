import { tool } from "ai";
import fs from "fs/promises";
import matter from "gray-matter";
import path from "path";
import { z } from "zod";

const DATA_DIR = path.join(process.cwd(), "data");

export const getSleepAnalysis = tool({
  description:
    "Get comprehensive sleep analysis including sleep architecture (deep, REM, light percentages), sleep score trends, HRV overnight data, SpO2, and monthly/weekly trend comparisons. Use this when the user asks about their sleep quality, sleep patterns, or sleep-related health metrics.",
  inputSchema: z.object({
    period: z
      .enum(["latest", "full"])
      .describe(
        "'latest' for the most recent analysis, 'full' for the complete historical analysis"
      )
      .default("latest"),
  }),
  execute: async (input) => {
    try {
      const sleepDir = path.join(DATA_DIR, "sleep");
      const files = await fs.readdir(sleepDir);
      const mdFiles = files
        .filter((f) => f.endsWith(".md"))
        .sort()
        .reverse();

      if (mdFiles.length === 0) {
        return { error: "No sleep analysis data available." };
      }

      const raw = await fs.readFile(path.join(sleepDir, mdFiles[0]), "utf-8");
      const { data: frontmatter, content } = matter(raw);

      return {
        periodCovered: frontmatter.periodCovered,
        dataPoints: frontmatter.dataPoints,
        summary: frontmatter.summary,
        analysis: content.trim(),
      };
    } catch (error) {
      return { error: `Failed to read sleep analysis: ${error}` };
    }
  },
});

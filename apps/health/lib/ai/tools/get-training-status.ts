import { tool } from "ai";
import fs from "fs/promises";
import matter from "gray-matter";
import path from "path";
import { z } from "zod";

const DATA_DIR = path.join(process.cwd(), "data");

export const getTrainingStatus = tool({
  description:
    "Get current training status including training readiness score, ACWR (Acute:Chronic Workload Ratio), HRV baseline and status, training load breakdown (aerobic low/high, anaerobic), altitude acclimatization, and lactate threshold data. Use this when the user asks about their training, workout readiness, or exercise capacity.",
  inputSchema: z.object({
    date: z
      .string()
      .describe(
        "Optional date in YYYY-MM-DD format. Defaults to the latest available."
      )
      .optional(),
  }),
  execute: async (input) => {
    try {
      const trainingDir = path.join(DATA_DIR, "training");
      const files = await fs.readdir(trainingDir);
      const mdFiles = files
        .filter((f) => f.endsWith(".md"))
        .sort()
        .reverse();

      if (mdFiles.length === 0) {
        return { error: "No training data available." };
      }

      let targetFile = mdFiles[0];
      if (input.date) {
        const match = mdFiles.find((f) => f.includes(input.date!));
        if (match) targetFile = match;
      }

      const raw = await fs.readFile(
        path.join(trainingDir, targetFile),
        "utf-8"
      );
      const { data: frontmatter, content } = matter(raw);

      return {
        date: frontmatter.date,
        metrics: frontmatter.metrics,
        analysis: content.trim(),
      };
    } catch (error) {
      return { error: `Failed to read training status: ${error}` };
    }
  },
});

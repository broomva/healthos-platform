import { tool } from "ai";
import fs from "fs/promises";
import path from "path";
import { z } from "zod";

const DATA_DIR = path.join(process.cwd(), "data");

export const getRawData = tool({
  description:
    "Get raw JSON data from Garmin for a specific date. Returns the complete unprocessed data dump including all sensor readings, activity details, and device data. Use this when the user asks to see the raw data, wants to debug data quality, or needs detailed sensor values not available in processed summaries.",
  inputSchema: z.object({
    date: z
      .string()
      .describe("Date in YYYY-MM-DD format to fetch raw data for.")
      .optional(),
  }),
  execute: async (input) => {
    try {
      const rawDir = path.join(DATA_DIR, "raw");
      const files = await fs.readdir(rawDir);
      const jsonFiles = files
        .filter((f) => f.endsWith(".json"))
        .sort()
        .reverse();

      if (jsonFiles.length === 0) {
        return { error: "No raw data available." };
      }

      let targetFile = jsonFiles[0];
      if (input.date) {
        const match = jsonFiles.find((f) => f.includes(input.date!));
        if (match) {
          targetFile = match;
        } else {
          return {
            error: `No raw data for date ${input.date}. Available: ${jsonFiles.map((f) => f.replace("-raw.json", "")).join(", ")}`,
          };
        }
      }

      const raw = await fs.readFile(path.join(rawDir, targetFile), "utf-8");
      const data = JSON.parse(raw);

      return {
        date: targetFile.replace("-raw.json", ""),
        data,
        sizeBytes: Buffer.byteLength(raw, "utf-8"),
      };
    } catch (error) {
      return { error: `Failed to read raw data: ${error}` };
    }
  },
});

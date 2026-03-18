import { tool } from "ai";
import { z } from "zod";

export const getTrainingRecommendation = tool({
  description:
    "Get a daily training recommendation based on current recovery metrics, ACWR, sleep quality, and HRV trends.",
  inputSchema: z.object({
    sport: z
      .enum(["freediving", "swimming", "cycling", "breathwork", "general"])
      .optional()
      .describe("Sport focus"),
  }),
  execute: async ({ sport }) => {
    return {
      sport: sport || "general",
      recommendation: "moderate",
      reasoning:
        "Placeholder - will integrate with Garmin ACWR, sleep, and HRV data",
      acwr: { current: 0, sweetSpot: "0.8-1.3" },
    };
  },
});

import { analytics } from "@repo/analytics/server";
import { flag } from "flags/next";

export const createFlag = (key: string) =>
  flag({
    key,
    defaultValue: false,
    async decide() {
      // Better Auth uses API routes instead of callable auth().
      // Feature flags fall back to analytics-based evaluation or default.
      if (!analytics) {
        return this.defaultValue as boolean;
      }

      const isEnabled = await analytics.isFeatureEnabled(key, "anonymous");

      return isEnabled ?? (this.defaultValue as boolean);
    },
  });

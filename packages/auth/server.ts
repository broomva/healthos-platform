import "server-only";

import { database } from "@repo/database";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { anonymous } from "better-auth/plugins";
import { keys } from "./keys";

export const auth = betterAuth({
  database: drizzleAdapter(database, {
    provider: "pg",
  }),
  socialProviders: {
    google: {
      clientId: keys().GOOGLE_CLIENT_ID ?? "",
      clientSecret: keys().GOOGLE_CLIENT_SECRET ?? "",
      enabled: !!(keys().GOOGLE_CLIENT_ID && keys().GOOGLE_CLIENT_SECRET),
    },
    github: {
      clientId: keys().GITHUB_CLIENT_ID ?? "",
      clientSecret: keys().GITHUB_CLIENT_SECRET ?? "",
      enabled: !!(keys().GITHUB_CLIENT_ID && keys().GITHUB_CLIENT_SECRET),
    },
  },
  plugins: [anonymous()],
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
});

export type Session = typeof auth.$Infer.Session;

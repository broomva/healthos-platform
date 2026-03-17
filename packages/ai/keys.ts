import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const keys = () =>
  createEnv({
    server: {
      OPENAI_API_KEY: z.string().startsWith("sk-").optional(),
    },
    emptyStringAsUndefined: true,
    runtimeEnv: {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    },
  });

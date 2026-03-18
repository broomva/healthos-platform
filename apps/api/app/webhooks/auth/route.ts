import { log } from "@repo/observability/log";
import { NextResponse } from "next/server";

// Better Auth uses API routes instead of Clerk webhooks.
// This stub handles incoming webhook events if configured.
export const POST = async (request: Request): Promise<Response> => {
  const payload = (await request.json()) as Record<string, unknown>;

  log.info("Auth webhook received", { type: payload.type });

  return NextResponse.json({ ok: true }, { status: 200 });
};

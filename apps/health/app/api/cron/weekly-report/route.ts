import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  // TODO: Integrate with Garmin tools to fetch weekly data
  // TODO: Generate AI summary using @repo/ai
  // TODO: Store as Document in @repo/database
  // TODO: Send email notification
  return NextResponse.json({
    status: "ok",
    message: "Weekly health report generation - pending implementation",
    schedule: "weekly",
  });
}

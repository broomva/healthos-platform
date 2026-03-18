import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "csv";
  const metric = searchParams.get("metric") || "all";

  // TODO: Fetch data from Garmin tools
  // TODO: Format as CSV or generate PDF
  return NextResponse.json({
    status: "ok",
    format,
    metric,
    message: "Data export - pending implementation",
  });
}

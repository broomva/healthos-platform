import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  const status = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || "0.1.0",
    services: {
      database: "unchecked", // TODO: add DB ping
      redis: "unchecked", // TODO: add Redis ping
    },
  };

  return NextResponse.json(status);
}

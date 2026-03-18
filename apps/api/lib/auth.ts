import { NextResponse } from "next/server";

export interface AuthContext {
  orgId: string;
  userId: string;
}

/**
 * Authenticate a v1 API request.
 * Better Auth uses API routes; this is a placeholder until
 * session extraction from headers is wired up.
 */
export function authenticateRequest():
  | { ok: true; ctx: AuthContext }
  | { ok: false; response: NextResponse } {
  // TODO: integrate with Better Auth session via headers
  return {
    ok: false,
    response: NextResponse.json(
      { message: "Not authenticated", code: "UNAUTHORIZED", status: 401 },
      { status: 401 }
    ),
  };
}

/**
 * Standard JSON error response.
 */
export function apiError(
  message: string,
  code: string,
  status: number
): NextResponse {
  return NextResponse.json({ message, code, status }, { status });
}

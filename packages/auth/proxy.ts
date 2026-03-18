// Better Auth uses API routes instead of middleware.
// Apps should create /api/auth/[...all] route handlers.
// The authMiddleware stub mimics Clerk's signature: callback(auth, request, event)
// so proxy files that destructure (auth, request, event) work without Clerk.

/* eslint-disable @typescript-eslint/no-explicit-any */
type ProxyCallback = (
  auth: Record<string, never>,
  request: unknown,
  event: unknown
) => unknown;

export const authMiddleware =
  (callback: ProxyCallback) =>
  // biome-ignore lint/suspicious/noExplicitAny: proxy must accept Next.js types without importing next
  (request: any, event: any) =>
    callback({}, request, event);

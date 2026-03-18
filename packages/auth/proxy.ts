// Better Auth uses API routes instead of middleware.
// Apps should create /api/auth/[...all] route handlers.
// The authMiddleware stub mimics Clerk's signature: callback(auth, request, event)
// so proxy files that destructure (auth, request, event) work without Clerk.
export const authMiddleware =
  (callback: (...args: unknown[]) => unknown) =>
  (request: unknown, event: unknown) =>
    callback({}, request, event);

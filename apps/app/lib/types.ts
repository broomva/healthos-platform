/**
 * Shared types for healthOS Platform server actions.
 */

// ─── Generic wrappers ───────────────────────────────────────

/** Discriminated-union result type for mutating server actions. */
export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

/** Cursor-based pagination envelope returned by list endpoints. */
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    nextCursor: string | undefined;
    hasMore: boolean;
  };
}

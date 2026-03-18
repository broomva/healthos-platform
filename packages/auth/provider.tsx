"use client";

import type { ReactNode } from "react";

// Better Auth uses cookie-based sessions — no provider wrapper needed.
// This component is kept for API compatibility with the next-forge pattern.
export const AuthProvider = ({
  children,
}: {
  children: ReactNode;
  helpUrl?: string;
  privacyUrl?: string;
  termsUrl?: string;
}) => {
  return <>{children}</>;
};

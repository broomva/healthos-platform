"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  clearAnonymousSession,
  getAnonymousSession,
  setAnonymousSession,
} from "@/lib/anonymous-session-client";
import { createAnonymousSession } from "@/lib/create-anonymous-session";
import type { AnonymousSession } from "@/lib/types/anonymous";
import { useSession } from "@/providers/session-provider";
import { useTRPC } from "@/trpc/react";

// Schema validation function
function isValidAnonymousSession(obj: any): obj is AnonymousSession {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.id === "string" &&
    typeof obj.remainingCredits === "number" &&
    (obj.createdAt instanceof Date || typeof obj.createdAt === "string")
  );
}

export function AnonymousSessionInit() {
  const { data: session, isPending } = useSession();
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  useEffect(() => {
    if (isPending) {
      return;
    }
    if (session?.user) {
      return;
    }

    const existingSession = getAnonymousSession();

    if (existingSession) {
      if (!isValidAnonymousSession(existingSession)) {
        console.warn(
          "Invalid session schema detected during init, clearing and creating new session"
        );
        clearAnonymousSession();
        setAnonymousSession(createAnonymousSession());
        queryClient.invalidateQueries({
          queryKey: trpc.credits.getAvailableCredits.queryKey(),
        });
        return;
      }
    } else {
      setAnonymousSession(createAnonymousSession());
      queryClient.invalidateQueries({
        queryKey: trpc.credits.getAvailableCredits.queryKey(),
      });
    }
  }, [isPending, queryClient, trpc, session?.user]);

  return null;
}

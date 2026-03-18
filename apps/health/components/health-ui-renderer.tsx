// @ts-nocheck
// json-render 0.6.1 requires zod v4 for full type inference.
// AI SDK pins zod v3, so we disable type checking here.
// Runtime works correctly — only TypeScript types are affected.
"use client";

import { ActionProvider, Renderer, StateProvider } from "@json-render/react";
import { registry } from "@/lib/json-render/registry";

type HealthUIRendererProps = {
  title: string;
  spec: {
    root: string;
    elements: Record<
      string,
      {
        type: string;
        props: Record<string, unknown>;
        children?: string[];
      }
    >;
  };
};

export function HealthUIRenderer({ title, spec }: HealthUIRendererProps) {
  return (
    <div className="w-full rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-4 shadow-lg">
      {title && (
        <div className="mb-3 font-semibold text-sm text-white">{title}</div>
      )}
      <StateProvider initialState={{}}>
        <ActionProvider handlers={{}}>
          <Renderer registry={registry} spec={spec} />
        </ActionProvider>
      </StateProvider>
    </div>
  );
}

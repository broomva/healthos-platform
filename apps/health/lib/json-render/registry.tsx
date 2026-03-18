// @ts-nocheck
// json-render 0.6.1 requires zod v4 for full type inference.
// AI SDK pins zod v3, so we disable type checking here.
// Runtime works correctly — only TypeScript types are affected.
"use client";

import { defineRegistry } from "@json-render/react";
import { cn } from "@/lib/utils";
import { healthCatalog } from "./catalog";

const STATUS_COLORS = {
  good: "text-emerald-400",
  warning: "text-yellow-400",
  critical: "text-red-400",
  neutral: "text-zinc-400",
} as const;

const STATUS_BG = {
  good: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  warning: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  critical: "bg-red-500/20 text-red-300 border-red-500/30",
  neutral: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
} as const;

const TREND_ICONS = {
  up: "\u2191",
  down: "\u2193",
  stable: "\u2192",
} as const;

const BAR_COLORS = {
  blue: "bg-blue-500",
  green: "bg-emerald-500",
  yellow: "bg-yellow-500",
  red: "bg-red-500",
  purple: "bg-purple-500",
  teal: "bg-teal-500",
} as const;

const VARIANT_STYLES = {
  default: "from-slate-800 via-slate-900 to-slate-900",
  health: "from-slate-800 via-blue-900 to-slate-900",
  sleep: "from-indigo-900 via-slate-900 to-slate-900",
  training: "from-emerald-900 via-slate-900 to-slate-900",
  live: "from-emerald-900 via-teal-900 to-slate-900",
} as const;

const SEVERITY_STYLES = {
  info: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  warning: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
  critical: "border-red-500/30 bg-red-500/10 text-red-300",
} as const;

export const { registry } = defineRegistry(healthCatalog, {
  components: {
    MetricCard: ({ props, children }) => (
      <div className="rounded-xl bg-white/5 p-3 backdrop-blur-sm">
        <div className="mb-1 text-xs text-zinc-400">{props.label}</div>
        <div className="flex items-baseline gap-1">
          <span
            className={cn(
              "font-bold text-xl",
              props.status ? STATUS_COLORS[props.status] : "text-white"
            )}
          >
            {props.value}
          </span>
          {props.unit && (
            <span className="text-xs text-zinc-500">{props.unit}</span>
          )}
          {props.trend && (
            <span
              className={cn(
                "ml-1 text-sm",
                props.trend === "up" && "text-emerald-400",
                props.trend === "down" && "text-red-400",
                props.trend === "stable" && "text-zinc-400"
              )}
            >
              {TREND_ICONS[props.trend]}
            </span>
          )}
        </div>
        {children}
      </div>
    ),

    MetricGrid: ({ props, children }) => (
      <div
        className={cn(
          "grid gap-2",
          props.columns === 1 && "grid-cols-1",
          props.columns === 3 && "grid-cols-2 sm:grid-cols-3",
          props.columns === 4 && "grid-cols-2 sm:grid-cols-4",
          (!props.columns || props.columns === 2) && "grid-cols-2"
        )}
      >
        {children}
      </div>
    ),

    DataTable: ({ props }) => (
      <div className="overflow-x-auto">
        {props.title && (
          <div className="mb-2 font-semibold text-sm text-zinc-300">
            {props.title}
          </div>
        )}
        <table className="w-full text-sm">
          <thead>
            <tr className="border-white/10 border-b">
              {props.columns.map((col) => (
                <th
                  className={cn(
                    "px-3 py-2 font-medium text-zinc-400",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center",
                    (!col.align || col.align === "left") && "text-left"
                  )}
                  key={col.key}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {props.rows.map((row, i) => (
              <tr className="border-white/5 border-b" key={i}>
                {props.columns.map((col) => (
                  <td
                    className={cn(
                      "px-3 py-2 text-zinc-300",
                      col.align === "right" && "text-right",
                      col.align === "center" && "text-center"
                    )}
                    key={col.key}
                  >
                    {String(row[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),

    StatusBadge: ({ props }) => (
      <span
        className={cn(
          "inline-flex items-center rounded-full border px-2.5 py-0.5 font-medium text-xs",
          STATUS_BG[props.status]
        )}
      >
        {props.label}
      </span>
    ),

    ProgressBar: ({ props }) => (
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-zinc-400">{props.label}</span>
          <span className="text-zinc-300">{props.value}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-white/10">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              BAR_COLORS[props.color || "blue"]
            )}
            style={{ width: `${Math.min(100, Math.max(0, props.value))}%` }}
          />
        </div>
      </div>
    ),

    SectionCard: ({ props, children }) => (
      <div
        className={cn(
          "rounded-2xl bg-gradient-to-br p-4 shadow-lg",
          VARIANT_STYLES[props.variant || "default"]
        )}
      >
        <div className="mb-3">
          <div className="font-semibold text-sm text-white">{props.title}</div>
          {props.subtitle && (
            <div className="mt-0.5 text-xs text-zinc-400">{props.subtitle}</div>
          )}
        </div>
        {children}
      </div>
    ),

    AlertBanner: ({ props }) => (
      <div
        className={cn(
          "rounded-lg border p-3 text-sm",
          SEVERITY_STYLES[props.severity]
        )}
      >
        {props.message}
      </div>
    ),

    TextBlock: ({ props }) => {
      const variantClass = {
        body: "text-sm text-zinc-300",
        caption: "text-xs text-zinc-500",
        heading: "text-base font-semibold text-white",
        code: "text-xs font-mono text-emerald-300/80 bg-black/30 rounded p-2 whitespace-pre-wrap",
      };
      return (
        <div className={variantClass[props.variant || "body"]}>
          {props.content}
        </div>
      );
    },

    JsonViewer: ({ props }) => (
      <details className="group">
        <summary className="cursor-pointer text-xs text-zinc-500 transition-colors hover:text-zinc-300">
          {props.title || "View JSON data"}
        </summary>
        <pre
          className="mt-2 overflow-auto whitespace-pre-wrap rounded-lg bg-black/30 p-3 font-mono text-emerald-300/70 text-xs"
          style={{ maxHeight: props.maxHeight || 300 }}
        >
          {props.data}
        </pre>
      </details>
    ),

    SkillCard: ({ props }) => (
      <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-medium text-sm text-white">
              {props.name}
            </span>
            {props.installed !== undefined && (
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-1.5 py-0.5 font-medium text-[10px]",
                  props.installed
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-zinc-500/20 text-zinc-400"
                )}
              >
                {props.installed ? "Installed" : "Available"}
              </span>
            )}
          </div>
          <p className="mt-1 line-clamp-2 text-xs text-zinc-400">
            {props.description}
          </p>
          {props.source && (
            <code className="mt-1 block truncate text-[10px] text-zinc-600">
              {props.source}
            </code>
          )}
        </div>
      </div>
    ),
  },
  actions: {},
});

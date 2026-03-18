/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react";
import { z } from "zod";

// json-render 0.6.1 expects zod v4 types, but AI SDK pins zod v3.
// Runtime works fine — only TypeScript types are incompatible.
export const healthCatalog = (defineCatalog as any)(schema, {
  components: {
    MetricCard: {
      props: z.object({
        label: z.string(),
        value: z.string(),
        unit: z.string().optional(),
        trend: z.enum(["up", "down", "stable"]).optional(),
        status: z.enum(["good", "warning", "critical", "neutral"]).optional(),
      }),
      description:
        "A single metric display card showing a label, value, optional unit, trend direction, and status color",
    },
    MetricGrid: {
      props: z.object({
        columns: z.number().min(1).max(4).optional(),
      }),
      description:
        "A responsive grid layout for MetricCard children. Defaults to 2 columns on mobile, up to 4 on desktop.",
    },
    DataTable: {
      props: z.object({
        columns: z.array(
          z.object({
            key: z.string(),
            label: z.string(),
            align: z.enum(["left", "center", "right"]).optional(),
          })
        ),
        rows: z.array(z.record(z.unknown())),
        title: z.string().optional(),
      }),
      description:
        "A data table with typed columns and rows. Use for sleep architecture, activity lists, vitals over time.",
    },
    StatusBadge: {
      props: z.object({
        label: z.string(),
        status: z.enum(["good", "warning", "critical", "neutral"]),
      }),
      description:
        "A colored status badge (green/yellow/red/gray). Use for training readiness, sleep score, etc.",
    },
    ProgressBar: {
      props: z.object({
        label: z.string(),
        value: z.number().min(0).max(100),
        color: z
          .enum(["blue", "green", "yellow", "red", "purple", "teal"])
          .optional(),
      }),
      description:
        "A horizontal progress bar 0-100%. Use for sleep stages, body battery, training load.",
    },
    SectionCard: {
      props: z.object({
        title: z.string(),
        subtitle: z.string().optional(),
        variant: z
          .enum(["default", "health", "sleep", "training", "live"])
          .optional(),
      }),
      description:
        "A container card with title, optional subtitle, and theme variant. Wraps other components.",
    },
    AlertBanner: {
      props: z.object({
        message: z.string(),
        severity: z.enum(["info", "warning", "critical"]),
      }),
      description:
        "An alert banner for health warnings, recovery alerts, or informational notices.",
    },
    TextBlock: {
      props: z.object({
        content: z.string(),
        variant: z.enum(["body", "caption", "heading", "code"]).optional(),
      }),
      description:
        "A text block with styling variant. Use for analysis text, recommendations, or code output.",
    },
    JsonViewer: {
      props: z.object({
        data: z.string(),
        title: z.string().optional(),
        maxHeight: z.number().optional(),
      }),
      description:
        "A collapsible JSON viewer for raw data inspection. Pass data as a JSON string.",
    },
    SkillCard: {
      props: z.object({
        name: z.string(),
        description: z.string(),
        installed: z.boolean().optional(),
        source: z.string().optional(),
      }),
      description:
        "A card representing an agent skill from skills.sh. Shows name, description, install status.",
    },
  },
  actions: {},
});

import { tool } from "ai";
import { z } from "zod";

const uiElementSchema = z.object({
  type: z.string().describe("Component name from the catalog"),
  props: z.record(z.unknown()).describe("Props for the component"),
  children: z.array(z.string()).optional().describe("Keys of child elements"),
});

const specSchema = z.object({
  root: z.string().describe("Key of the root element in the elements map"),
  elements: z
    .record(uiElementSchema)
    .describe("Flat map of element key → element definition"),
});

export const renderHealthUI = tool({
  description: `Render a rich, interactive health UI using structured JSON specs. Use this to present health data visually with cards, grids, tables, progress bars, and badges — instead of plain text or raw JSON.

Available components:
- **SectionCard**: Container card with title, subtitle, and theme variant (default|health|sleep|training|live). Wraps other components.
- **MetricGrid**: Responsive grid for MetricCard children. columns: 1-4.
- **MetricCard**: Single metric display with label, value, optional unit, trend (up|down|stable), status (good|warning|critical|neutral).
- **DataTable**: Table with typed columns [{key,label,align?}] and rows [Record<string,unknown>]. Good for sleep architecture, vitals over time.
- **StatusBadge**: Colored badge (good|warning|critical|neutral) for readiness, scores, etc.
- **ProgressBar**: Horizontal bar 0-100%. label, value, color (blue|green|yellow|red|purple|teal). Good for sleep stages, body battery.
- **AlertBanner**: Alert with severity (info|warning|critical). For health warnings.
- **TextBlock**: Text with variant (body|caption|heading|code). For analysis text, recommendations.
- **JsonViewer**: Collapsible JSON viewer. data (JSON string), title, maxHeight.
- **SkillCard**: Agent skill card. name, description, installed (boolean), source.

Spec format uses a flat element map:
{
  "root": "section-1",
  "elements": {
    "section-1": { "type": "SectionCard", "props": { "title": "Sleep Analysis", "variant": "sleep" }, "children": ["grid-1"] },
    "grid-1": { "type": "MetricGrid", "props": { "columns": 3 }, "children": ["m1", "m2", "m3"] },
    "m1": { "type": "MetricCard", "props": { "label": "Score", "value": "82", "status": "good" } }
  }
}

Use this tool AFTER fetching data with health tools. Transform the raw data into a visual spec.`,
  inputSchema: z.object({
    title: z
      .string()
      .describe("Brief title for the UI panel (shown as a header)"),
    spec: specSchema,
  }),
  execute: async ({ title, spec }) => {
    // Validate that root exists in elements
    if (!spec.elements[spec.root]) {
      return {
        error: `Root element "${spec.root}" not found in elements map`,
      };
    }

    // Validate all children references exist
    for (const [key, element] of Object.entries(spec.elements)) {
      if (element.children) {
        for (const childKey of element.children) {
          if (!spec.elements[childKey]) {
            return {
              error: `Element "${key}" references child "${childKey}" which does not exist in elements map`,
            };
          }
        }
      }
    }

    return {
      title,
      spec,
      componentCount: Object.keys(spec.elements).length,
    };
  },
});

import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "harvest_estimate",
  title: "Harvest estimate",
  description: "Quick honey harvest estimate: gross, ethical reserve, and apiary total (kg).",
  inputSchema: {
    hives: z.number().int().positive(),
    frames_per_hive: z.number().positive().default(8),
    frame_fill_pct: z.number().min(0).max(100).default(80).describe("Average fill percent per frame."),
    kg_per_full_frame: z.number().positive().default(2.5),
    hhi: z.number().min(0).max(100).default(75).describe("Hive Health Index (0-100)."),
    reserve_pct: z.number().min(0).max(60).default(20).describe("Percent left for colony (ethical reserve)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ hives, frames_per_hive, frame_fill_pct, kg_per_full_frame, hhi, reserve_pct }) => {
    const grossPerHive = frames_per_hive * (frame_fill_pct / 100) * kg_per_full_frame * (hhi / 100);
    const reservePerHive = grossPerHive * (reserve_pct / 100);
    const harvestPerHive = grossPerHive - reservePerHive;
    const apiary = harvestPerHive * hives;
    const out = {
      gross_kg_per_hive: +grossPerHive.toFixed(2),
      reserve_kg_per_hive: +reservePerHive.toFixed(2),
      harvest_kg_per_hive: +harvestPerHive.toFixed(2),
      apiary_harvest_kg: +apiary.toFixed(2),
      hives,
      hhi,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(out, null, 2) }],
      structuredContent: out,
    };
  },
});

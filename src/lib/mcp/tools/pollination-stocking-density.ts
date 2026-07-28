import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

// Compact PSI table (colonies/acre) — mirrors the app's Pollination Lookup.
const PSI: Record<string, { colonies_per_acre: number; frames_per_hive: number; bloom_days: number }> = {
  almond: { colonies_per_acre: 2.5, frames_per_hive: 8, bloom_days: 21 },
  apple: { colonies_per_acre: 1.5, frames_per_hive: 6, bloom_days: 14 },
  avocado: { colonies_per_acre: 2, frames_per_hive: 6, bloom_days: 28 },
  blueberry: { colonies_per_acre: 3, frames_per_hive: 6, bloom_days: 21 },
  cherry: { colonies_per_acre: 2, frames_per_hive: 6, bloom_days: 10 },
  cranberry: { colonies_per_acre: 3, frames_per_hive: 6, bloom_days: 21 },
  cucumber: { colonies_per_acre: 2, frames_per_hive: 5, bloom_days: 45 },
  kiwi: { colonies_per_acre: 4, frames_per_hive: 6, bloom_days: 14 },
  melon: { colonies_per_acre: 1.5, frames_per_hive: 5, bloom_days: 40 },
  pear: { colonies_per_acre: 1.5, frames_per_hive: 6, bloom_days: 12 },
  plum: { colonies_per_acre: 1.5, frames_per_hive: 6, bloom_days: 10 },
  pumpkin: { colonies_per_acre: 1, frames_per_hive: 5, bloom_days: 30 },
  raspberry: { colonies_per_acre: 1.5, frames_per_hive: 6, bloom_days: 28 },
  squash: { colonies_per_acre: 1, frames_per_hive: 5, bloom_days: 35 },
  strawberry: { colonies_per_acre: 1, frames_per_hive: 5, bloom_days: 30 },
  sunflower: { colonies_per_acre: 1, frames_per_hive: 6, bloom_days: 21 },
  watermelon: { colonies_per_acre: 1.5, frames_per_hive: 5, bloom_days: 30 },
};

export default defineTool({
  name: "pollination_stocking_density",
  title: "Pollination stocking density",
  description: "Recommend colonies, frames, and bloom window for a crop and acreage (PSI-based).",
  inputSchema: {
    crop: z.string().min(1).describe("Crop name (e.g. almond, apple, blueberry)."),
    acres: z.number().positive().describe("Field size in acres."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ crop, acres }) => {
    const key = crop.toLowerCase().trim();
    const row = PSI[key];
    if (!row) {
      return {
        content: [{ type: "text", text: `Unknown crop "${crop}". Supported: ${Object.keys(PSI).join(", ")}` }],
        isError: true,
      };
    }
    const colonies = Math.ceil(row.colonies_per_acre * acres);
    const frames = colonies * row.frames_per_hive;
    const result = {
      crop: key,
      acres,
      recommended_colonies: colonies,
      total_pollination_frames: frames,
      bloom_window_days: row.bloom_days,
      psi_baseline: row.colonies_per_acre,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      structuredContent: result,
    };
  },
});

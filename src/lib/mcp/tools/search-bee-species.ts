import { defineTool } from "@lovable.dev/mcp-js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export default defineTool({
  name: "search_bee_species",
  title: "Search bee species",
  description: "Search the BeeYield bee species reference (common/scientific name, region, notes).",
  inputSchema: {
    query: z.string().min(1).describe("Free-text search across common name, scientific name, region, notes."),
    limit: z.number().int().min(1).max(50).default(10).describe("Max rows to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, limit }) => {
    const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!);
    const q = `%${query}%`;
    const { data, error } = await sb
      .from("bee_species")
      .select("common_name,scientific_name,region,size_mm,temperament,honey_yield_kg,notes")
      .or(`common_name.ilike.${q},scientific_name.ilike.${q},region.ilike.${q},notes.ilike.${q}`)
      .limit(limit);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { rows: data ?? [] },
    };
  },
});

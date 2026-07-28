import { defineTool } from "@lovable.dev/mcp-js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export default defineTool({
  name: "search_florage_plants",
  title: "Search florage plants",
  description: "Search the BeeYield florage database (bloom windows, nectar & pollen scores).",
  inputSchema: {
    query: z.string().min(1).describe("Free-text search across plant name, notes."),
    limit: z.number().int().min(1).max(50).default(20),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, limit }) => {
    const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!);
    const q = `%${query}%`;
    const { data, error } = await sb
      .from("florage_plants")
      .select("*")
      .or(`common_name.ilike.${q},scientific_name.ilike.${q},notes.ilike.${q}`)
      .limit(limit);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { rows: data ?? [] },
    };
  },
});

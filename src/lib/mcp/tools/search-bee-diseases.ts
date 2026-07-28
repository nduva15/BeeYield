import { defineTool } from "@lovable.dev/mcp-js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export default defineTool({
  name: "search_bee_diseases",
  title: "Search bee diseases",
  description: "Search the BeeYield bee diseases directory (name, symptoms, cause, treatment).",
  inputSchema: {
    query: z.string().min(1).describe("Free-text search across disease name, symptoms, cause, cure."),
    limit: z.number().int().min(1).max(50).default(10),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, limit }) => {
    const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!);
    const q = `%${query}%`;
    const { data, error } = await sb
      .from("bee_diseases")
      .select("name,category,severity,symptoms,cause,treatment,prevention,notes")
      .or(`name.ilike.${q},symptoms.ilike.${q},cause.ilike.${q},treatment.ilike.${q}`)
      .limit(limit);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { rows: data ?? [] },
    };
  },
});

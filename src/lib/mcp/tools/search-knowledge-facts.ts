import { defineTool } from "@lovable.dev/mcp-js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export default defineTool({
  name: "search_knowledge_facts",
  title: "Search knowledge base",
  description: "Search the BeeYield knowledge base (facts, sources, confidence).",
  inputSchema: {
    query: z.string().min(1),
    limit: z.number().int().min(1).max(50).default(15),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, limit }) => {
    const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!);
    const q = `%${query}%`;
    const { data, error } = await sb
      .from("knowledge_facts")
      .select("*")
      .or(`title.ilike.${q},content.ilike.${q},topic.ilike.${q}`)
      .limit(limit);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { rows: data ?? [] },
    };
  },
});

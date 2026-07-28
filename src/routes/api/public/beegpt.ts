import { createFileRoute } from "@tanstack/react-router";
import { BEEYIELD_SYSTEM_PROMPT } from "@/lib/beegpt-prompt";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type ChatMessage = { role: string; content: string | unknown[] };

function buildSystemPrompt(promptVariant?: string) {
  const variant =
    promptVariant === "bloom-only"
      ? "bloom"
      : promptVariant === "flight-only"
        ? "flight"
        : promptVariant === "bloom-flight"
          ? "bloom_flight"
          : promptVariant;

  if (variant === "bloom") {
    return (
      BEEYIELD_SYSTEM_PROMPT +
      "\n\nVARIANT FOCUS: Prioritise SECTION 21 (Bloom Phenology) above all else. Lead every answer with phenology shift analysis, climate drivers, and crop-specific bloom timing. Reference the bloom calendar, baseline windows, and forager-day math. Keep other sections concise."
    );
  }
  if (variant === "flight") {
    return (
      BEEYIELD_SYSTEM_PROMPT +
      "\n\nVARIANT FOCUS: Prioritise SECTION 22 (Bee Flight, Foraging, Activity). Lead with activity-counter interpretation, foraging biology, florage zones, and wind/orientation math. Keep other sections concise."
    );
  }
  if (variant === "bloom_flight") {
    return (
      BEEYIELD_SYSTEM_PROMPT +
      "\n\nVARIANT FOCUS: Combined Bloom x Flight expert mode. Always cross-reference SECTION 21 and SECTION 22. Lead with the Combined Bloom x Flight intelligence diagnostic (high bloom + low activity = colony stress; low bloom + high activity = robbing risk; deficit coverage = pollination gap). Output prioritised actions for hive placement and feeding/florage."
    );
  }
  return BEEYIELD_SYSTEM_PROMPT;
}

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export const Route = createFileRoute("/api/public/beegpt")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { headers: corsHeaders }),
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            messages?: ChatMessage[];
            imageBase64?: string;
            imageType?: string;
            audioBase64?: string;
            audioType?: string;
            promptVariant?: string;
          };

          const messages = Array.isArray(body.messages) ? body.messages : [];
          if (messages.length === 0) {
            return jsonError("No messages provided.", 400);
          }

          const apiKey = process.env.LOVABLE_API_KEY;
          if (!apiKey) return jsonError("AI is not configured.", 500);

          const { imageBase64, imageType, audioBase64, audioType } = body;

          const builtMessages = messages.map((msg, idx) => {
            if (
              idx === messages.length - 1 &&
              msg.role === "user" &&
              (imageBase64 || audioBase64)
            ) {
              const contentParts: unknown[] = [
                {
                  type: "text",
                  text: typeof msg.content === "string" ? msg.content : "Analyze this.",
                },
              ];
              if (imageBase64) {
                contentParts.push({
                  type: "image_url",
                  image_url: {
                    url: `data:${imageType || "image/jpeg"};base64,${imageBase64}`,
                  },
                });
              }
              if (audioBase64) {
                contentParts.push({
                  type: "text",
                  text: `[Audio file attached: ${audioType || "audio file"}. Describe and analyze any bee-related content the user may be referencing with this audio, such as bee colony sounds, buzzing frequency, or beekeeping audio notes.]`,
                });
              }
              return { role: msg.role, content: contentParts };
            }
            return msg;
          });

          const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-3-flash-preview",
              messages: [
                { role: "system", content: buildSystemPrompt(body.promptVariant) },
                ...builtMessages,
              ],
              stream: true,
            }),
          });

          if (!response.ok) {
            if (response.status === 429) {
              return jsonError(
                "Rate limit exceeded. Please wait a moment before asking another question.",
                429,
              );
            }
            if (response.status === 402) {
              return jsonError("Usage credits exhausted. Please add credits to continue.", 402);
            }
            const text = await response.text();
            console.error("AI gateway error:", response.status, text);
            return jsonError("AI gateway error. Please try again.", 500);
          }

          return new Response(response.body, {
            headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
          });
        } catch (e) {
          console.error("beegpt error:", e);
          return jsonError(e instanceof Error ? e.message : "Unknown error", 500);
        }
      },
    },
  },
});

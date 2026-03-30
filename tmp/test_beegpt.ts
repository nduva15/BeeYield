
import "https://deno.land/x/dotenv/load.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("SUPABASE_URL or SUPABASE_ANON_KEY not set in environment");
  Deno.exit(1);
}

const payload = {
  messages: [
    { role: "user", content: "Test: Say 'Hello BeeYield'" }
  ]
};

console.log(`Testing Edge Function at ${SUPABASE_URL}/functions/v1/beegpt`);

try {
  const resp = await fetch(`${SUPABASE_URL}/functions/v1/beegpt`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify(payload)
  });

  console.log("Status:", resp.status);
  if (!resp.ok) {
    const text = await resp.text();
    console.error("Error response:", text);
    Deno.exit(1);
  }

  const reader = resp.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    console.error("No reader available on response body");
    Deno.exit(1);
  }

  console.log("Streaming response:");
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    console.log(chunk);
  }
} catch (err) {
  console.error("Fetch failed:", err);
}

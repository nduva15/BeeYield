export type StreamVariant = "baseline" | "bloom-only" | "flight-only" | "bloom-flight";

/** Streams a BeeGPT completion, invoking onChunk with the accumulated text. */
export async function streamBeeGpt(
  prompt: string,
  onChunk: (text: string) => void,
  opts: { variant?: StreamVariant; signal?: AbortSignal } = {},
): Promise<string> {
  const resp = await fetch("/api/public/beegpt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "user", content: prompt }],
      promptVariant: opts.variant ?? "baseline",
    }),
    signal: opts.signal,
  });
  if (!resp.ok || !resp.body) throw new Error(`BeeGPT request failed (${resp.status})`);

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  let acc = "";
  let done = false;
  while (!done) {
    const { done: rd, value } = await reader.read();
    if (rd) break;
    buf += decoder.decode(value, { stream: true });
    let nl: number;
    while ((nl = buf.indexOf("\n")) !== -1) {
      let line = buf.slice(0, nl);
      buf = buf.slice(nl + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line.startsWith("data: ")) continue;
      const j = line.slice(6).trim();
      if (j === "[DONE]") { done = true; break; }
      try {
        const p = JSON.parse(j);
        const c = p.choices?.[0]?.delta?.content;
        if (c) { acc += c; onChunk(acc); }
      } catch { /* partial frame */ }
    }
  }
  return acc;
}

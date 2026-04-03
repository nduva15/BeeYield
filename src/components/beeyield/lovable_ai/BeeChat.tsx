import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const SUGGESTIONS = [
  "What are all the types of honey bees?",
  "Explain Varroa mite disease and how to treat it",
  "What is Manuka honey and why is it special?",
  "What causes Colony Collapse Disorder?",
  "List all bee diseases with symptoms and cures",
  "What are world records related to bees and honey?",
  "How do bees make honey step by step?",
  "What bee species are endangered?",
  "Explain the waggle dance communication",
  "What are the health benefits of bee pollen and propolis?",
];

const BEEGPT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/beegpt`;

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY_BEEYIELD ||
  import.meta.env.VITE_SUPABASE_ANON_KEY_SHOP ||
  import.meta.env.VITE_SUPABASE_ANON_KEY_CEBA ||
  "";

async function streamBeeGPT(
  messages: { role: string; content: string }[],
  onDelta: (text: string) => void,
  onDone: () => void,
  onError: (err: string) => void
) {
  const resp = await fetch(BEEGPT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Supabase Edge Functions accept either a user JWT or the project's anon key.
      // The original BeeGPT project used a different env var name; in this repo we standardize on ANON_KEY.
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ messages }),
  });

  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}));
    onError(data.error || `Error ${resp.status}`);
    return;
  }

  if (!resp.body) { onError("No response body"); return; }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  let done = false;

  while (!done) {
    const { done: rdDone, value } = await reader.read();
    if (rdDone) break;
    buf += decoder.decode(value, { stream: true });

    let nl: number;
    while ((nl = buf.indexOf("\n")) !== -1) {
      let line = buf.slice(0, nl);
      buf = buf.slice(nl + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") { done = true; break; }
      try {
        const parsed = JSON.parse(json);
        const c = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (c) onDelta(c);
      } catch { /* partial */ }
    }
  }
  onDone();
}

export default function BeeChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messageSeq = useRef(0);
  const nextMessageId = () => `m_${++messageSeq.current}`;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Message = { id: nextMessageId(), role: "user", content: text };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setIsLoading(true);

    const history = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));
    let assistantContent = "";

    try {
      await streamBeeGPT(
        history,
        (chunk) => {
          assistantContent += chunk;
          setMessages((p) => {
            const last = p[p.length - 1];
            if (last?.role === "assistant") {
              return p.map((m, i) => i === p.length - 1 ? { ...m, content: assistantContent } : m);
            }
            return [...p, { id: nextMessageId(), role: "assistant", content: assistantContent }];
          });
        },
        () => setIsLoading(false),
        (err) => {
          toast.error(err);
          setIsLoading(false);
        }
      );
    } catch (e) {
      toast.error("Failed to connect to BeeGPT");
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto custom-scroll p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="text-6xl mb-4 animate-fade-in">🐝</div>
            <h2 className="font-display text-2xl font-bold text-honey mb-2">Welcome to BeeGPT</h2>
            <p className="text-muted-foreground max-w-md mb-8 text-sm">
              The world's most comprehensive bee knowledge system. Ask me anything about bees, honey, diseases, research, and more.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-2xl">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-left px-3 py-2 rounded-lg text-xs border border-border hover:border-primary/50 hover:bg-muted transition-all text-muted-foreground hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-amber flex items-center justify-center text-sm">
                🐝
              </div>
            )}
            <div
              className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user" ? "chat-user" : "chat-assistant"
              }`}
            >
              {msg.content}
            </div>
            {msg.role === "user" && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-amber flex items-center justify-center text-sm">
              🐝
            </div>
            <div className="chat-assistant px-4 py-3 flex items-center gap-1">
              <span className="typing-dot w-2 h-2 rounded-full bg-primary inline-block" />
              <span className="typing-dot w-2 h-2 rounded-full bg-primary inline-block" />
              <span className="typing-dot w-2 h-2 rounded-full bg-primary inline-block" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="border-t border-border p-4">
        {messages.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-3">
            {SUGGESTIONS.slice(0, 3).map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="text-xs px-2 py-1 rounded-full border border-border hover:border-primary/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
              >
                {s.length > 35 ? s.slice(0, 35) + "…" : s}
              </button>
            ))}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask BeeGPT anything about bees, honey, diseases..."
            className="flex-1 bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="rounded-xl bg-gradient-amber text-primary-foreground hover:opacity-90 px-4"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
}

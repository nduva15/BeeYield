import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Loader2, Image, Mic, MicOff, X, User, Sun, Moon, History } from "lucide-react";
import { toast } from "sonner";
import beeyieldLogo from "@/assets/beeyield-logo.png";
import { useTheme } from "@/contexts/ThemeContext";
import { useDeviceId } from "@/hooks/use-device-id";
import { useVoiceInput } from "@/hooks/use-voice-input";
import { supabaseKnowledge as supabase } from "@/lib/supabase";
import ChatHistory, { type Conversation } from "./ChatHistory";
import KnowledgeHubDashboard from "./KnowledgeHubDashboard";

type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
    imagePreview?: string;
    audioName?: string;
};

const SUGGESTIONS = [
    "What are all types of honey bees and their subspecies?",
    "Explain Varroa destructor — lifecycle, damage, and all treatment options",
    "Compare all 300 plus honey varieties and their medicinal properties",
    "What causes Colony Collapse Disorder and what are the solutions?",
    "Precision pollination data — which crops need bees and economic value?",
    "List every bee disease with cause, symptoms, and cure",
    "What are world records related to bees, honey, and hives?",
    "Explain bee venom therapy and apitherapy research",
    "How does the waggle dance work and what did Karl von Frisch discover?",
    "What are the latest research findings on bee cognition and intelligence?",
    "Which bee species are endangered and why?",
    "Compare all hive types: Langstroth, Warré, Flow Hive, Top-Bar and more",
];

async function streamBeeyield(
    messages: { role: string; content: string }[],
    imageBase64: string | null,
    imageType: string | null,
    audioBase64: string | null,
    audioType: string | null,
    onDelta: (text: string) => void,
    onDone: () => void,
    onError: (err: string) => void
) {
    // Use knowledge URL and Key from env or lib/supabase
    const knowledgeUrl = import.meta.env.VITE_SUPABASE_URL_KNOWLEDGE || 'https://laeifazhrupoqrhqmyzg.supabase.co';
    const knowledgeKey = import.meta.env.VITE_SUPABASE_ANON_KEY_KNOWLEDGE ||
        import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhZWlmYXpocnVwb3FyaHFteXpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1NjAwMDUsImV4cCI6MjA4NzEzNjAwNX0.Qc6b_68QL_RzxCsBVZo49Ol4_tEZMQAEfRF-wwfii-k';

    const resp = await fetch(`${knowledgeUrl}/functions/v1/beegpt`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${knowledgeKey}`,
        },
        body: JSON.stringify({ messages, imageBase64, imageType, audioBase64, audioType }),
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

function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

interface BeeGPTViewProps {
    initialMessage?: string;
    onInitialMessageConsumed?: () => void;
    onTabChange?: (tab: string, message?: string) => void;
}

export default function BeeGPTView({ initialMessage, onInitialMessageConsumed, onTabChange }: BeeGPTViewProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { theme, setTheme } = useTheme();
    const deviceId = useDeviceId();

    // Conversation state
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [historyOpen, setHistoryOpen] = useState(false);

    // Media state
    const [attachedImage, setAttachedImage] = useState<File | null>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
    const [attachedAudio, setAttachedAudio] = useState<File | null>(null);

    const bottomRef = useRef<HTMLDivElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const audioInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Voice input
    const handleVoiceResult = useCallback((text: string) => {
        setInput((prev) => (prev ? prev + " " + text : text));
        toast.success("Voice captured");
    }, []);
    const { isListening, isSupported: voiceSupported, toggleListening } = useVoiceInput(handleVoiceResult);

    // Load conversations on mount
    useEffect(() => {
        if (supabase) loadConversations();
    }, [deviceId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Handle initial message from dashboard
    useEffect(() => {
        if (initialMessage) {
            send(initialMessage);
            if (onInitialMessageConsumed) onInitialMessageConsumed();
        }
    }, [initialMessage]);

    const loadConversations = async () => {
        if (!supabase) return;
        const { data } = await supabase
            .from("conversations")
            .select("id, title, updated_at")
            .eq("device_id", deviceId)
            .order("updated_at", { ascending: false })
            .limit(50);
        if (data) setConversations(data);
    };

    const loadConversation = async (id: string) => {
        if (!supabase) return;
        const { data } = await supabase
            .from("chat_messages")
            .select("id, role, content, created_at")
            .eq("conversation_id", id)
            .order("created_at", { ascending: true });
        if (data) {
            setMessages(data.map((m) => ({ id: m.id, role: m.role as "user" | "assistant", content: m.content })));
            setConversationId(id);
        }
    };

    const saveMessage = async (convId: string, role: string, content: string) => {
        if (!supabase) return;
        await supabase.from("chat_messages").insert({ conversation_id: convId, role, content });
    };

    const createConversation = async (title: string): Promise<string> => {
        if (!supabase) throw new Error("Supabase not initialized");
        const { data } = await supabase
            .from("conversations")
            .insert({ device_id: deviceId, title })
            .select("id")
            .single();
        if (!data) throw new Error("Failed to create conversation");
        loadConversations();
        return data.id;
    };

    const clearAttachments = useCallback(() => {
        setAttachedImage(null);
        setImagePreviewUrl(null);
        setAttachedAudio(null);
        if (imageInputRef.current) imageInputRef.current.value = "";
        if (audioInputRef.current) audioInputRef.current.value = "";
    }, []);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) { toast.error("Image must be under 10 MB"); return; }
        setAttachedImage(file);
        setImagePreviewUrl(URL.createObjectURL(file));
    };

    const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 20 * 1024 * 1024) { toast.error("Audio must be under 20 MB"); return; }
        setAttachedAudio(file);
        setAttachedImage(null);
        setImagePreviewUrl(null);
        toast.success(`Audio attached: ${file.name}`);
    };

    const send = async (text: string) => {
        if (!text.trim() || isLoading) return;

        let imgBase64: string | null = null;
        let imgType: string | null = null;
        let audioBase64: string | null = null;
        let audioType: string | null = null;

        if (attachedImage) {
            imgBase64 = await fileToBase64(attachedImage);
            imgType = attachedImage.type;
        }
        if (attachedAudio) {
            audioBase64 = await fileToBase64(attachedAudio);
            audioType = attachedAudio.type;
        }

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: text,
            imagePreview: imagePreviewUrl || undefined,
            audioName: attachedAudio?.name,
        };

        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput("");
        clearAttachments();
        setIsLoading(true);

        // Create or reuse conversation
        let convId = conversationId;
        if (!convId) {
            try {
                const title = text.length > 50 ? text.slice(0, 50) + "…" : text;
                convId = await createConversation(title);
                setConversationId(convId);
            } catch {
                toast.error("Failed to save conversation");
            }
        }

        // Save user message
        if (convId) saveMessage(convId, "user", text);

        const history = newMessages.map((m) => ({ role: m.role, content: m.content }));
        let assistantContent = "";

        try {
            await streamBeeyield(
                history,
                imgBase64,
                imgType,
                audioBase64,
                audioType,
                (chunk) => {
                    assistantContent += chunk;
                    setMessages((p) => {
                        const last = p[p.length - 1];
                        if (last?.role === "assistant") {
                            return p.map((m, i) => (i === p.length - 1 ? { ...m, content: assistantContent } : m));
                        }
                        return [...p, { id: (Date.now() + 1).toString(), role: "assistant" as const, content: assistantContent }];
                    });
                },
                () => {
                    setIsLoading(false);
                    // Save assistant message
                    if (convId && assistantContent && supabase) {
                        saveMessage(convId, "assistant", assistantContent);
                        // Update conversation timestamp
                        supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", convId).then(() => loadConversations());
                    }
                },
                (err) => { toast.error(err); setIsLoading(false); }
            );
        } catch {
            toast.error("Failed to connect to Beeyield AI");
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        send(input);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send(input);
        }
    };

    const resetChat = () => {
        setMessages([]);
        setInput("");
        setConversationId(null);
        clearAttachments();
    };

    const handleDeleteConversation = async (id: string) => {
        if (!supabase) return;
        await supabase.from("chat_messages").delete().eq("conversation_id", id);
        await supabase.from("conversations").delete().eq("id", id);
        if (conversationId === id) resetChat();
        loadConversations();
    };

    const handleRenameConversation = async (id: string, newTitle: string) => {
        if (!supabase) return;
        await supabase.from("conversations").update({ title: newTitle }).eq("id", id);
        loadConversations();
    };

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    return (
        <div className="flex flex-col h-full w-full bg-background honeycomb-bg overflow-hidden relative">
            {/* Chat History Sidebar Overlay */}
            <ChatHistory
                conversations={conversations}
                activeId={conversationId}
                onSelect={loadConversation}
                onNew={() => { resetChat(); setHistoryOpen(false); }}
                onDelete={handleDeleteConversation}
                onRename={handleRenameConversation}
                isOpen={historyOpen}
                onClose={() => setHistoryOpen(false)}
            />

            {/* Header */}
            <header className="flex-shrink-0 border-b border-border bg-card/50 backdrop-blur-md px-4 py-3 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setHistoryOpen(true)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:border-primary/50 transition-all text-muted-foreground hover:text-foreground bg-muted/50"
                        title="Chat history"
                    >
                        <History className="w-4 h-4" />
                        <span className="text-xs font-semibold">History</span>
                    </button>
                    <img src={beeyieldLogo} alt="Beeyield" className="h-9 w-auto" />
                    <div className="hidden sm:block">
                        <div className="font-display font-bold text-foreground text-base leading-tight">BeeYield AI</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Native Intelligence</div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleTheme}
                        className="w-8 h-8 rounded-lg border border-border hover:border-primary/50 flex items-center justify-center transition-all text-muted-foreground hover:text-foreground"
                        title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                    >
                        {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={resetChat}
                        className="text-xs font-bold text-muted-foreground hover:text-foreground border border-border hover:border-primary/50 px-3 py-1.5 rounded-lg transition-all"
                    >
                        New Chat
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden flex flex-col relative">
                <div className="flex-1 overflow-y-auto custom-scroll px-4 py-6 space-y-6">
                    {messages.length === 0 ? (
                        <div className="h-full max-w-4xl mx-auto">
                            <KnowledgeHubDashboard onAsk={send} />
                        </div>
                    ) : (
                        <>
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex gap-3 max-w-4xl mx-auto w-full ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                                >
                                    {msg.role === "assistant" && (
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-background border border-border shadow-sm">
                                            <img src={beeyieldLogo} alt="Beeyield AI" className="w-6 h-6 object-contain" />
                                        </div>
                                    )}
                                    <div className="flex flex-col gap-1 max-w-[85%] sm:max-w-[75%]">
                                        {msg.imagePreview && (
                                            <img src={msg.imagePreview} alt="Attached" className="rounded-2xl max-h-64 object-contain border border-border shadow-lg self-end mb-2" />
                                        )}
                                        {msg.audioName && (
                                            <div className="text-xs font-medium text-muted-foreground bg-muted border border-border rounded-xl px-4 py-2 self-end flex items-center gap-2 mb-2">
                                                <Mic className="w-3 h-3 text-honey" />
                                                {msg.audioName}
                                            </div>
                                        )}
                                        <div className={`px-5 py-4 text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${msg.role === "user" ? "chat-user" : "chat-assistant shadow-honey"}`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                    {msg.role === "user" && (
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center shadow-sm">
                                            <User className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                    )}
                                </div>
                            ))}

                            {isLoading && messages[messages.length - 1]?.role === "user" && (
                                <div className="flex gap-3 justify-start max-w-4xl mx-auto w-full">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden bg-background border border-border flex items-center justify-center shadow-sm">
                                        <img src={beeyieldLogo} alt="Beeyield AI" className="w-6 h-6 object-contain" />
                                    </div>
                                    <div className="chat-assistant px-5 py-4 flex items-center gap-1.5 shadow-honey">
                                        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-honey inline-block" />
                                        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-honey inline-block" />
                                        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-honey inline-block" />
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                    <div ref={bottomRef} className="h-4" />
                </div>

                {/* Input area */}
                <div className="flex-shrink-0 border-t border-border bg-card/80 backdrop-blur-lg px-4 pb-6 pt-4">
                    {messages.length > 0 && (
                        <div className="flex gap-2 flex-wrap mb-4 max-w-4xl mx-auto overflow-x-auto no-scrollbar py-1">
                            {SUGGESTIONS.slice(0, 4).map((s) => (
                                <button
                                    key={s}
                                    onClick={() => send(s)}
                                    className="text-[11px] font-semibold whitespace-nowrap px-3 py-1.5 rounded-full border border-border hover:border-honey/50 hover:bg-honey/5 text-muted-foreground hover:text-honey transition-all"
                                >
                                    {s.length > 40 ? s.slice(0, 40) + "…" : s}
                                </button>
                            ))}
                        </div>
                    )}

                    {(attachedImage || attachedAudio) && (
                        <div className="flex items-center gap-3 mb-4 max-w-4xl mx-auto">
                            {imagePreviewUrl && (
                                <div className="relative group">
                                    <img src={imagePreviewUrl} alt="Attached" className="h-20 w-20 object-cover rounded-2xl border-2 border-honey/30 shadow-md" />
                                    <button
                                        onClick={() => { setAttachedImage(null); setImagePreviewUrl(null); if (imageInputRef.current) imageInputRef.current.value = ""; }}
                                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}
                            {attachedAudio && (
                                <div className="flex items-center gap-3 bg-honey/10 border border-honey/20 rounded-2xl px-4 py-3 text-xs font-semibold text-honey shadow-sm">
                                    <Mic className="w-4 h-4" />
                                    <span className="max-w-[150px] truncate">{attachedAudio.name}</span>
                                    <button
                                        onClick={() => { setAttachedAudio(null); if (audioInputRef.current) audioInputRef.current.value = ""; }}
                                        className="ml-2 w-5 h-5 rounded-full bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-colors flex items-center justify-center"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex gap-3 items-end max-w-4xl mx-auto">
                        <div className="flex gap-2 flex-shrink-0">
                            <button
                                type="button"
                                onClick={() => imageInputRef.current?.click()}
                                className="w-11 h-11 rounded-2xl border border-border bg-background hover:border-honey/50 hover:bg-honey/5 flex items-center justify-center transition-all text-muted-foreground hover:text-honey group shadow-sm"
                                title="Attach image"
                            >
                                <Image className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </button>
                            <button
                                type="button"
                                onClick={() => audioInputRef.current?.click()}
                                className="w-11 h-11 rounded-2xl border border-border bg-background hover:border-honey/50 hover:bg-honey/5 flex items-center justify-center transition-all text-muted-foreground hover:text-honey group shadow-sm"
                                title="Attach audio file"
                            >
                                <Mic className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </button>
                        </div>

                        <div className="flex-1 relative group">
                            <textarea
                                ref={textareaRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask Beeyield AI about any bee species, diseases, research..."
                                className="w-full bg-background border border-border rounded-2xl px-5 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-honey/50 focus:ring-4 focus:ring-honey/10 transition-all resize-none min-h-[52px] max-h-[160px] shadow-sm"
                                rows={1}
                                disabled={isLoading}
                                style={{ height: "auto" }}
                                onInput={(e) => {
                                    const el = e.currentTarget;
                                    el.style.height = "auto";
                                    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
                                }}
                            />
                        </div>

                        <div className="flex gap-2 flex-shrink-0">
                            {voiceSupported && (
                                <button
                                    type="button"
                                    onClick={toggleListening}
                                    className={`w-11 h-11 rounded-2xl border flex items-center justify-center transition-all shadow-sm ${isListening
                                        ? "bg-destructive text-destructive-foreground border-destructive animate-pulse"
                                        : "border-border bg-background text-muted-foreground hover:text-honey hover:border-honey/50"
                                        }`}
                                    title={isListening ? "Stop listening" : "Voice input"}
                                >
                                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                </button>
                            )}

                            <button
                                type="submit"
                                disabled={(!input.trim() && !attachedImage && !attachedAudio) || isLoading}
                                className="w-11 h-11 rounded-2xl bg-honey text-white flex items-center justify-center hover:bg-honey-deep disabled:opacity-30 disabled:grayscale transition-all shadow-md shadow-honey/20 active:scale-95"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            </button>
                        </div>
                    </form>

                    <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleImageSelect} />
                    <input ref={audioInputRef} type="file" accept="audio/mp3,audio/mpeg,audio/wav,audio/ogg,audio/webm,audio/m4a,audio/*" className="hidden" onChange={handleAudioSelect} />

                    <p className="text-center text-[10px] font-bold text-muted-foreground/50 mt-4 max-w-4xl mx-auto uppercase tracking-tighter">
                        Beeyield Neural Hive — The World's Most Comprehensive Apiculture Dataset
                    </p>
                </div>
            </div>
        </div>
    );
}

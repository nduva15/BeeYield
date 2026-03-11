import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Loader2, Image, Mic, MicOff, X, User, Sun, Moon, History } from "lucide-react";
import { toast } from "sonner";
import Logo from "@/assets/Logo.png";
import { useTheme } from "@/hooks/use-theme";
import { useDeviceId } from "@/hooks/use-device-id";
import { useVoiceInput } from "@/hooks/use-voice-input";
import { supabase } from "@/integrations/supabase/client";
import ChatHistory, { type Conversation } from "@/components/ChatHistory";
import { aiService, type ChatMessage as AIChatMessage } from "@/services/aiService";
import { AboutBeeYieldAI } from "./AboutBeeYieldAI";
import { BeeSpeciesGallery } from "./BeeSpeciesGallery";
import { AnimatePresence, motion } from "framer-motion";
import { Info, ExternalLink, Bug } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AIAssistantViewProps {
    onTabChange: (tab: string, message?: string) => void;
    initialMessage?: string;
    onInitialMessageConsumed?: () => void;
}

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

function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export default function SmartAssistantView({ onTabChange, initialMessage, onInitialMessageConsumed }: AIAssistantViewProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const deviceId = useDeviceId();

    // Conversation state
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [aboutOpen, setAboutOpen] = useState(false);
    const [galleryOpen, setGalleryOpen] = useState(false);

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
        loadConversations();
    }, [deviceId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const loadConversations = async () => {
        const { data } = await supabase
            .from("conversations")
            .select("id, title, updated_at")
            .eq("device_id", deviceId)
            .order("updated_at", { ascending: false })
            .limit(50);
        if (data) setConversations(data);
    };

    const loadConversation = async (id: string) => {
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
        await supabase.from("chat_messages").insert({ conversation_id: convId, role, content });
    };

    const createConversation = async (title: string): Promise<string> => {
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

        const history: AIChatMessage[] = newMessages.map((m) => ({ role: m.role, content: m.content }));
        let assistantContent = "";

        try {
            await aiService.chat(
                text,
                history,
                "EN",
                convId || undefined,
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
                {
                    imageBase64: imgBase64,
                    imageType: imgType,
                    audioBase64: audioBase64,
                    audioType: audioType
                }
            );

            setIsLoading(false);
            // Save assistant message
            if (convId && assistantContent) {
                saveMessage(convId, "assistant", assistantContent);
                // Update conversation timestamp
                supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", convId).then(() => loadConversations());
            }
        } catch {
            toast.error("Failed to connect to Beeyield AI");
            setIsLoading(false);
        }
    };

    const handleNewChat = () => {
        resetChat();
        setHistoryOpen(false);
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
        await supabase.from("chat_messages").delete().eq("conversation_id", id);
        await supabase.from("conversations").delete().eq("id", id);
        if (conversationId === id) resetChat();
        loadConversations();
    };

    const handleRenameConversation = async (id: string, newTitle: string) => {
        await supabase.from("conversations").update({ title: newTitle }).eq("id", id);
        loadConversations();
    };

    useEffect(() => {
        if (initialMessage) {
            send(initialMessage);
            onInitialMessageConsumed?.();
        }
    }, [initialMessage]);

    return (
        <div className="flex flex-col h-full w-full bg-background honeycomb-bg overflow-hidden relative">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-honey/10 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-honey/10 to-transparent pointer-events-none rotate-180" />

            {/* Chat History Sidebar */}
            <ChatHistory
                conversations={conversations}
                activeId={conversationId}
                onSelect={loadConversation}
                onNew={handleNewChat}
                onDelete={handleDeleteConversation}
                onRename={handleRenameConversation}
                isOpen={historyOpen}
                onClose={() => setHistoryOpen(false)}
            />

            {/* Header */}
            <header className="flex-shrink-0 border-b border-border bg-white/50 backdrop-blur-md px-6 py-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setHistoryOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-border hover:border-honey/50 transition-all text-muted-foreground hover:text-foreground bg-muted/30"
                        title="Chat history"
                    >
                        <History className="w-5 h-5" />
                        <span className="text-xs font-black uppercase tracking-widest">History</span>
                    </button>

                    <button
                        onClick={() => setGalleryOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-border hover:border-honey/50 transition-all text-muted-foreground hover:text-foreground bg-muted/30"
                        title="Species Identification Gallery"
                    >
                        <Bug className="w-5 h-5" />
                        <span className="text-xs font-black uppercase tracking-widest">Species ID</span>
                    </button>

                    <div className="h-8 w-px bg-border mx-2" />

                    <img src={Logo} alt="Beeyield" className="h-10 w-auto" />
                    <div className="hidden sm:block">
                        <div className="flex items-center gap-2">
                            <div className="font-serif text-2xl font-black text-honey leading-none">BeeYield AI</div>
                            <button
                                onClick={() => setAboutOpen(true)}
                                className="w-5 h-5 rounded-full bg-honey/10 flex items-center justify-center hover:bg-honey/20 transition-all group"
                                title="About BeeYield AI"
                            >
                                <Info className="w-3 h-3 text-honey group-hover:scale-110" />
                            </button>
                        </div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Global Intelligence Framework</div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleTheme}
                        className="w-11 h-11 rounded-2xl border border-border hover:border-honey/50 flex items-center justify-center transition-all text-muted-foreground hover:text-foreground bg-muted/30"
                    >
                        {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                    <button
                        onClick={handleNewChat}
                        className="text-xs font-black uppercase tracking-widest text-honey hover:text-honey-deep border border-honey/30 hover:border-honey px-5 py-2.5 rounded-2xl transition-all"
                    >
                        New Chat
                    </button>
                </div>
            </header>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto custom-scroll px-6 py-8 space-y-8 z-0">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center animate-in fade-in zoom-in-95 duration-700 max-w-4xl mx-auto w-full pb-20">
                        <div className="relative mb-8">
                            <div className="absolute inset-0 bg-honey/20 blur-3xl rounded-full scale-150 animate-pulse" />
                        <img src={Logo} alt="Beeyield" className="h-24 w-auto relative z-10 opacity-100" />
                        </div>
                        <h1 className="font-serif text-6xl font-black text-honey mb-4 tracking-tight italic uppercase">BeeYield AI</h1>
                        <p className="text-muted-foreground max-w-2xl mb-12 text-sm font-black leading-relaxed uppercase tracking-[0.2em] opacity-50 flex items-center justify-center gap-4">
                            <span className="w-10 h-px bg-honey/20" />
                            750,000+ Research Datasets Integrated
                            <span className="w-10 h-px bg-honey/20" />
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full mb-12">
                            <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-border p-6 rounded-[2.5rem] flex flex-col items-center text-center">
                                <span className="text-2xl font-black text-honey mb-1">20,000+</span>
                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Bee Species</span>
                            </div>
                            <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-border p-6 rounded-[2.5rem] flex flex-col items-center text-center">
                                <span className="text-2xl font-black text-honey mb-1">300+</span>
                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Honey Varieties</span>
                            </div>
                            <div className="hidden lg:flex bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-border p-6 rounded-[2.5rem] flex flex-col items-center text-center">
                                <span className="text-2xl font-black text-honey mb-1">50+</span>
                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Protocols</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                            {SUGGESTIONS.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => send(s)}
                                    className="text-left px-6 py-5 rounded-[2rem] text-sm border border-border bg-white hover:border-honey/50 hover:bg-honey/5 hover:shadow-honey transition-all text-muted-foreground hover:text-foreground leading-relaxed font-semibold shadow-sm group flex items-center justify-between"
                                >
                                    {s}
                                    <Send className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all text-honey" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="max-w-4xl mx-auto w-full space-y-10 pb-40">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex gap-6 animate-in slide-in-from-bottom-4 duration-500 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            {msg.role === "assistant" && (
                                <div className="flex-shrink-0 w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center bg-white border border-honey/20 shadow-xl p-2.5">
                                    <img src={Logo} alt="AI" className="w-full h-full object-contain" />
                                </div>
                            )}
                            <div className={`flex flex-col gap-2 ${msg.role === "user" ? "max-w-[80%] items-end" : "max-w-[85%] items-start"}`}>
                                {msg.imagePreview && (
                                    <div className="rounded-[2rem] overflow-hidden border border-border shadow-2xl mb-2">
                                        <img src={msg.imagePreview} alt="Attached" className="max-h-72 object-contain" />
                                    </div>
                                )}
                                {msg.audioName && (
                                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted border border-border rounded-full px-5 py-2.5 self-end flex items-center gap-3">
                                        <Mic className="w-4 h-4 text-honey" />
                                        {msg.audioName}
                                    </div>
                                )}
                                <div className={`px-8 py-6 text-[15px] leading-relaxed whitespace-pre-wrap shadow-sm ${msg.role === "user"
                                        ? "bg-honey text-white rounded-[2rem] rounded-tr-lg font-bold"
                                        : "bg-white text-foreground border border-border rounded-[2.5rem] rounded-tl-lg font-medium prose prose-sm dark:prose-invert prose-p:leading-relaxed prose-headings:font-black prose-headings:tracking-tight prose-headings:uppercase prose-headings:flex prose-headings:items-center prose-headings:gap-2 prose-a:text-honey max-w-none"
                                    }`}>
                                    {msg.role === "user" ? (
                                        msg.content
                                    ) : (
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {msg.content}
                                        </ReactMarkdown>
                                    )}
                                </div>
                            </div>
                            {msg.role === "user" && (
                                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white border border-border flex items-center justify-center shadow-lg">
                                    <User className="w-6 h-6 text-muted-foreground" />
                                </div>
                            )}
                        </div>
                    ))}

                    {isLoading && messages[messages.length - 1]?.role === "user" && (
                        <div className="flex gap-6 justify-start animate-pulse">
                            <div className="flex-shrink-0 w-12 h-12 rounded-2xl overflow-hidden bg-white border border-honey/20 flex items-center justify-center p-2.5 shadow-xl">
                                <img src={Logo} alt="AI" className="w-full h-full object-contain" />
                            </div>
                            <div className="bg-white border border-border rounded-[2.5rem] rounded-tl-lg px-8 py-6 flex items-center gap-2">
                                <div className="typing-dot w-2 h-2 rounded-full bg-honey" />
                                <div className="typing-dot w-2 h-2 rounded-full bg-honey" />
                                <div className="typing-dot w-2 h-2 rounded-full bg-honey" />
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>
            </div>

            {/* Input area Container */}
            <div className="flex-shrink-0 px-6 pb-8 absolute bottom-0 w-full z-20">
                <div className="max-w-4xl mx-auto relative group">
                    <div className="absolute inset-0 bg-honey/5 blur-3xl -z-10 opacity-0 group-focus-within:opacity-100 transition-opacity" />

                    <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] border border-border shadow-[0_20px_50px_rgba(0,0,0,0.1)] group-focus-within:border-honey/30 transition-all p-3">
                        {(attachedImage || attachedAudio) && (
                            <div className="p-4 flex items-center gap-4 bg-muted/30 rounded-3xl mb-3 animate-in slide-in-from-bottom-2">
                                {imagePreviewUrl && (
                                    <div className="relative group/img">
                                        <img src={imagePreviewUrl} alt="Attached" className="h-16 w-16 object-cover rounded-2xl border-2 border-white shadow-xl" />
                                        <button
                                            onClick={() => { setAttachedImage(null); setImagePreviewUrl(null); if (imageInputRef.current) imageInputRef.current.value = ""; }}
                                            className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                                {attachedAudio && (
                                    <div className="flex items-center gap-4 bg-white border border-border rounded-2xl px-5 py-3 text-[11px] font-black uppercase text-foreground shadow-sm relative group/aud">
                                        <Mic className="w-4 h-4 text-honey animate-pulse" />
                                        <span className="max-w-[200px] truncate tracking-widest">{attachedAudio.name}</span>
                                        <button
                                            onClick={() => { setAttachedAudio(null); if (audioInputRef.current) audioInputRef.current.value = ""; }}
                                            className="ml-2 text-muted-foreground hover:text-destructive transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="flex gap-3 items-end">
                            <div className="flex flex-col gap-2 pb-1">
                                <button
                                    type="button"
                                    onClick={() => imageInputRef.current?.click()}
                                    className="w-11 h-11 rounded-2xl hover:bg-honey/10 flex items-center justify-center transition-all text-muted-foreground hover:text-honey"
                                    title="Attach imagery"
                                >
                                    <Image className="w-5 h-5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => audioInputRef.current?.click()}
                                    className="w-11 h-11 rounded-2xl hover:bg-honey/10 flex items-center justify-center transition-all text-muted-foreground hover:text-honey"
                                    title="Attach acoustic telemetry"
                                >
                                    <Mic className="w-5 h-5" />
                                </button>
                            </div>

                            <textarea
                                ref={textareaRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask BeeYield AI anything about bees, honey, diseases, pollination, research..."
                                className="flex-1 bg-transparent border-none px-4 py-4 text-[15px] text-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-0 transition-all resize-none min-h-[44px] max-h-[200px] font-medium"
                                rows={1}
                                disabled={isLoading}
                                onInput={(e) => {
                                    const el = e.currentTarget;
                                    el.style.height = "auto";
                                    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
                                }}
                            />

                            <div className="flex gap-2 pb-1">
                                {voiceSupported && (
                                    <button
                                        type="button"
                                        onClick={toggleListening}
                                        className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-sm ${isListening
                                                ? "bg-destructive text-white animate-pulse"
                                                : "text-muted-foreground hover:bg-honey/10 hover:text-honey"
                                            }`}
                                    >
                                        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                    </button>
                                )}

                                <button
                                    type="submit"
                                    disabled={(!input.trim() && !attachedImage && !attachedAudio) || isLoading}
                                    className="w-14 h-14 rounded-2xl bg-gradient-amber text-white flex items-center justify-center hover:opacity-90 disabled:opacity-30 transition-all shadow-xl hover:scale-105 active:scale-95"
                                >
                                    {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                                </button>
                            </div>
                        </form>
                    </div>

                    <p className="text-center text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] mt-4 opacity-100 flex items-center justify-center gap-4">
                        <span className="w-8 h-px bg-border" />
                        BeeYield AI — Specialized exclusively in bees, honey, apiculture, and pollination science
                        <span className="w-8 h-px bg-border" />
                    </p>
                </div>
            </div>

            <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleImageSelect} />
            <input ref={audioInputRef} type="file" accept="audio/mp3,audio/mpeg,audio/wav,audio/ogg,audio/webm,audio/m4a,audio/*" className="hidden" onChange={handleAudioSelect} />

            <AnimatePresence>
                {aboutOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setAboutOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        />
                        <AboutBeeYieldAI onClose={() => setAboutOpen(false)} />
                    </div>
                )}
                {galleryOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-12">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setGalleryOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        />
                        <div className="relative w-full h-full bg-background rounded-[3rem] overflow-hidden shadow-3xl border border-border z-10">
                            <button 
                                onClick={() => setGalleryOpen(false)}
                                className="absolute top-8 right-8 w-12 h-12 rounded-full bg-muted/50 hover:bg-honey transition-all flex items-center justify-center text-foreground hover:text-black z-[110]"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            <div className="w-full h-full overflow-y-auto">
                                <BeeSpeciesGallery />
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
        .custom-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: rgba(245, 158, 11, 0.1);
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(245, 158, 11, 0.3);
        }
      `}</style>
        </div>
    );
}

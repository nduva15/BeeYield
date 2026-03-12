import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Loader2, Image, Mic, MicOff, X, User, Sun, Moon, History, Bot, Info, ExternalLink, Bug } from "lucide-react";
import { toast } from "sonner";
import Logo from "@/assets/Logo.png";
import { useTheme } from "@/hooks/use-theme";
import { useDeviceId } from "@/hooks/use-device-id";
import { useVoiceInput } from "@/hooks/use-voice-input";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import ChatHistory, { type Conversation } from "@/components/ChatHistory";
import { aiService, type ChatMessage as AIChatMessage } from "@/services/aiService";
import { AboutBeeYieldAI } from "./AboutBeeYieldAI";
import { BeeSpeciesGallery } from "./BeeSpeciesGallery";
import { AnimatePresence, motion } from "framer-motion";
import { glass, PageHeader } from "./GlassTheme";
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
        <div className={cn(glass.page, "flex flex-col h-full w-full bg-[#FCFAF5] overflow-hidden relative p-0")}>
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-[#F4D03F]/[0.02] rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-[#1B9157]/[0.02] rounded-full blur-[100px] pointer-events-none" />

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
            <div className="flex-shrink-0 px-4 pt-4">
                <PageHeader
                    icon={Bot}
                    label="Neural Hive Engine"
                    title={<>BeeYield <span className="text-[#F4D03F]">AI</span></>}
                    subtitle="Synchronized Global Intelligence Hive for specialized research."
                    actions={
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setHistoryOpen(true)}
                                className={cn(glass.btnSecondary, "px-3 py-1.5 h-9")}
                                title="Chat history"
                            >
                                <History className="w-4 h-4 mr-2" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">History</span>
                            </button>
                            <button
                                onClick={() => setGalleryOpen(true)}
                                className={cn(glass.btnSecondary, "px-3 py-1.5 h-9")}
                                title="Species ID"
                            >
                                <Bug className="w-4 h-4 mr-2" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Species ID</span>
                            </button>
                            <button
                                onClick={handleNewChat}
                                className={cn(glass.btnPrimary, "px-4 py-1.5 h-9 text-[10px]")}
                            >
                                New Chat
                            </button>
                        </div>
                    }
                />
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto custom-scroll px-4 py-6 space-y-6 z-0">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center animate-in fade-in zoom-in-95 duration-700 max-w-4xl mx-auto w-full pb-20">
                        <div className="relative mb-4">
                            <div className="absolute inset-0 bg-[#F4D03F]/10 blur-3xl rounded-full scale-150 animate-pulse" />
                            <img src={Logo} alt="Beeyield" className="h-12 w-auto relative z-10" />
                        </div>
                        <h1 className="text-2xl font-black text-[#1A1A1A] mb-1 tracking-tighter uppercase">Intelligent <span className="text-[#F4D03F]">Nexus</span></h1>
                        <p className="text-[#1A1A1A]/30 max-w-2xl mb-6 text-[8px] font-black leading-relaxed uppercase tracking-[0.4em] flex items-center justify-center gap-3">
                            <span className="w-4 h-px bg-[#F4D03F]/20" />
                            Global Research Pipeline active
                            <span className="w-4 h-px bg-[#F4D03F]/20" />
                        </p>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full mb-6 max-w-xl">
                            <div className="bg-white border border-[#F4D03F]/5 p-3 rounded-2xl flex flex-col items-center text-center shadow-sm">
                                <span className="text-sm font-black text-[#F4D03F] tracking-tighter tabular-nums">13.8K+</span>
                                <span className="text-[7px] font-black uppercase tracking-widest text-[#1A1A1A]/30">Data Nodes</span>
                            </div>
                            <div className="bg-white border border-[#F4D03F]/5 p-3 rounded-2xl flex flex-col items-center text-center shadow-sm">
                                <span className="text-sm font-black text-[#F4D03F] tracking-tighter tabular-nums">300+</span>
                                <span className="text-[7px] font-black uppercase tracking-widest text-[#1A1A1A]/30">Taxonomies</span>
                            </div>
                            <div className="hidden sm:flex bg-white border border-[#F4D03F]/5 p-3 rounded-2xl flex flex-col items-center text-center shadow-sm">
                                <span className="text-sm font-black text-[#F4D03F] tracking-tighter tabular-nums">98.4%</span>
                                <span className="text-[7px] font-black uppercase tracking-widest text-[#1A1A1A]/30">Precision</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-3xl">
                            {SUGGESTIONS.slice(0, 8).map((s) => (
                                <button
                                    key={s}
                                    onClick={() => send(s)}
                                    className="text-left px-4 py-3 rounded-lg text-[11px] border border-[#F4D03F]/10 bg-[#FFF9F0] hover:border-[#F4D03F]/50 hover:bg-[#F4D03F]/5 transition-all text-[#1A1A1A]/60 hover:text-[#1A1A1A] leading-relaxed font-semibold shadow-sm group flex items-center justify-between"
                                >
                                    <span className="truncate mr-4">{s}</span>
                                    <Send className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all text-[#F4D03F]" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="max-w-4xl mx-auto w-full space-y-4 pb-44">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            {msg.role === "assistant" && (
                                <div className="flex-shrink-0 w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center bg-white border border-[#F4D03F]/10 shadow-sm p-1 self-start mt-1">
                                    <img src={Logo} alt="AI" className="w-full h-full object-contain" />
                                </div>
                            )}
                            <div className={`flex flex-col gap-1.5 ${msg.role === "user" ? "max-w-[85%] items-end" : "max-w-[90%] items-start"}`}>
                                {msg.imagePreview && (
                                    <div className="rounded-xl overflow-hidden border border-[#F4D03F]/5 shadow-sm mb-1">
                                        <img src={msg.imagePreview} alt="Attached" className="max-h-48 object-contain" />
                                    </div>
                                )}
                                <div className={`px-4 py-2.5 text-[12px] leading-relaxed whitespace-pre-wrap shadow-sm ${msg.role === "user"
                                        ? "bg-[#1A1A1A] text-white rounded-2xl rounded-tr-sm font-bold"
                                        : "bg-white text-[#1A1A1A] border border-[#F4D03F]/10 rounded-2xl rounded-tl-sm font-semibold prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-headings:text-[#1A1A1A] prose-strong:text-[#1A1A1A] prose-a:text-[#1B9157]"
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
                                <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-white border border-[#F4D03F]/10 flex items-center justify-center shadow-sm self-start mt-1">
                                    <User className="w-4 h-4 text-[#1A1A1A]/20" />
                                </div>
                            )}
                        </div>
                    ))}

                    {isLoading && messages[messages.length - 1]?.role === "user" && (
                        <div className="flex gap-6 justify-start animate-pulse">
                            <div className="flex-shrink-0 w-12 h-12 rounded-2xl overflow-hidden bg-[#FFF9F0] border border-[#F4D03F]/20 flex items-center justify-center p-2.5 shadow-xl">
                                <img src={Logo} alt="AI" className="w-full h-full object-contain" />
                            </div>
                            <div className="bg-[#FFF9F0] border border-border rounded-[2.5rem] rounded-tl-lg px-8 py-6 flex items-center gap-2">
                                <div className="typing-dot w-2 h-2 rounded-full bg-[#F4D03F]" />
                                <div className="typing-dot w-2 h-2 rounded-full bg-[#F4D03F]" />
                                <div className="typing-dot w-2 h-2 rounded-full bg-[#F4D03F]" />
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>
            </div>

            {/* Input area Container */}
            <div className="flex-shrink-0 px-4 pb-6 absolute bottom-0 w-full z-20">
                <div className="max-w-4xl mx-auto relative group">
                    <div className="absolute inset-0 bg-[#F4D03F]/5 blur-2xl -z-10 opacity-0 group-focus-within:opacity-100 transition-opacity" />

                    <div className="bg-[#FFF9F0]/90 backdrop-blur-2xl rounded-2xl border border-[#F4D03F]/20 shadow-xl group-focus-within:border-[#F4D03F]/40 transition-all p-2">
                        {(attachedImage || attachedAudio) && (
                            <div className="p-2 flex items-center gap-3 bg-[#F9F7F2] rounded-xl mb-2 animate-in slide-in-from-bottom-2">
                                {imagePreviewUrl && (
                                    <div className="relative group/img">
                                        <img src={imagePreviewUrl} alt="Attached" className="h-10 w-10 object-cover rounded-lg border border-[#F4D03F]/20 shadow-sm" />
                                        <button
                                            onClick={() => { setAttachedImage(null); setImagePreviewUrl(null); if (imageInputRef.current) imageInputRef.current.value = ""; }}
                                            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center shadow-sm hover:scale-110"
                                        >
                                            <X className="w-2.5 h-2.5" />
                                        </button>
                                    </div>
                                )}
                                {attachedAudio && (
                                    <div className="flex items-center gap-2 bg-[#FFF9F0] border border-[#F4D03F]/10 rounded-lg px-3 py-1.5 text-[9px] font-bold uppercase text-[#1A1A1A]/60 shadow-sm relative">
                                        <Mic className="w-3 h-3 text-[#F4D03F] animate-pulse" />
                                        <span className="max-w-[150px] truncate tracking-widest">{attachedAudio.name}</span>
                                        <button
                                            onClick={() => { setAttachedAudio(null); if (audioInputRef.current) audioInputRef.current.value = ""; }}
                                            className="ml-1 text-[#1A1A1A]/30 hover:text-red-500"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
                            <div className="flex gap-1 pb-1">
                                <button
                                    type="button"
                                    onClick={() => imageInputRef.current?.click()}
                                    className="w-9 h-9 rounded-lg hover:bg-[#F4D03F]/10 flex items-center justify-center transition-all text-[#1A1A1A]/40 hover:text-[#F4D03F]"
                                    title="Attach imagery"
                                >
                                    <Image className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => audioInputRef.current?.click()}
                                    className="w-9 h-9 rounded-lg hover:bg-[#F4D03F]/10 flex items-center justify-center transition-all text-[#1A1A1A]/40 hover:text-[#F4D03F]"
                                    title="Attach acoustic telemetry"
                                >
                                    <Mic className="w-4 h-4" />
                                </button>
                            </div>

                            <textarea
                                ref={textareaRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Consult BeeYield AI Hive Intelligence..."
                                className="flex-1 bg-transparent border-none px-2 py-2 text-sm text-[#1A1A1A] placeholder:text-[#1A1A1A]/30 outline-none focus:ring-0 transition-all resize-none min-h-[40px] max-h-[160px] font-semibold"
                                rows={1}
                                disabled={isLoading}
                                onInput={(e) => {
                                    const el = e.currentTarget;
                                    el.style.height = "auto";
                                    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
                                }}
                            />

                            <div className="flex gap-1.5 pb-1">
                                {voiceSupported && (
                                    <button
                                        type="button"
                                        onClick={toggleListening}
                                        className={cn("w-9 h-9 rounded-lg flex items-center justify-center transition-all shadow-sm",
                                            isListening ? "bg-red-500 text-white animate-pulse" : "text-[#1A1A1A]/40 hover:bg-[#F4D03F]/10 hover:text-[#F4D03F]"
                                        )}
                                    >
                                        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                    </button>
                                )}

                                <button
                                    type="submit"
                                    disabled={(!input.trim() && !attachedImage && !attachedAudio) || isLoading}
                                    className={cn(glass.btnPrimary, "w-10 h-10 p-0 shadow-lg")}
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                </button>
                            </div>
                        </form>
                    </div>

                    <p className="text-center text-[8px] text-[#1A1A1A]/30 font-bold uppercase tracking-[0.3em] mt-3 flex items-center justify-center gap-3">
                        <span className="w-6 h-px bg-[#F4D03F]/20" />
                        BeeYield AI Intelligence v5.2 — specialized research core
                        <span className="w-6 h-px bg-[#F4D03F]/20" />
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
                            className="absolute inset-0 bg-[#FFF9F0]/80 backdrop-blur-md"
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
                            className="absolute inset-0 bg-[#FFF9F0]/80 backdrop-blur-md"
                        />
                        <div className="relative w-full h-full bg-background rounded-[3rem] overflow-hidden shadow-3xl border border-border z-10">
                            <button 
                                onClick={() => setGalleryOpen(false)}
                                className="absolute top-8 right-8 w-12 h-12 rounded-full bg-muted/50 hover:bg-[#F4D03F] transition-all flex items-center justify-center text-foreground hover:text-[#1A1A1A] z-[110]"
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

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
import { intelligenceService, type ChatMessage as IntelligenceChatMessage } from "@/services/intelligenceService";
import { AboutBeeYield } from "./AboutBeeYield";
import { BeeSpeciesGallery } from "./BeeSpeciesGallery";
import { AnimatePresence, motion } from "framer-motion";
import { glass } from "./GlassTheme";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { fadeUp, motionSoftSpring } from "@/lib/motion";
import { BeeYieldPageHeader, BeeYieldPageShell } from "@/components/beeyield/BeeYieldUI";

interface AssistantViewProps {
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

const REQUIRED_REPORT_HEADINGS = [
    "## Executive Summary",
    "## Situation Assessment",
    "## Recommendations (Prioritized)",
    "## Implementation Plan",
    "## Risks & Mitigations",
    "## Metrics to Track",
    "## Sources & Assumptions",
];

function isStructuredLongReport(text: string) {
    if (!text) return false;
    const normalized = text.replace(/\r\n/g, "\n");
    const hasAllHeadings = REQUIRED_REPORT_HEADINGS.every((h) => normalized.includes(h));
    const hasRisksTable = normalized.includes("| Risk |") && normalized.includes("| Mitigation |");
    const hasMetricsTable = normalized.includes("| Metric |") && normalized.includes("| Target |");
    const isLongEnough = normalized.trim().length >= 6000; // closer to ~900+ words for typical markdown density
    return hasAllHeadings && hasRisksTable && hasMetricsTable && isLongEnough;
}

const SUGGESTIONS = [
    "What should I check during a hive inspection?",
    "How do I spot Varroa signs and what are common treatment options?",
    "What does high humidity in a hive usually mean?",
    "How can I reduce swarming risk during peak season?",
    "Which crops benefit most from bee pollination in my area?",
    "How do I verify a jar’s harvest info with the QR code?",
    "What are common causes of low honey yield?",
    "What’s a simple feeding plan during dearth?",
];

function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

const CONVERSATIONS_CACHE_KEY = 'beeyield_assistant_conversations_v1';

export default function SmartAssistantView({ onTabChange, initialMessage, onInitialMessageConsumed }: AssistantViewProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState(() => initialMessage || "");
    const [isLoading, setIsLoading] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const deviceId = useDeviceId();

    // Conversation state
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>(() => {
        const cached = localStorage.getItem(CONVERSATIONS_CACHE_KEY);
        return cached ? JSON.parse(cached) : [];
    });
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
    const messageSeq = useRef(0);
    const nextMessageId = useCallback(() => `m_${++messageSeq.current}`, []);

    // Voice input
    const handleVoiceResult = useCallback((text: string) => {
        setInput((prev) => (prev ? prev + " " + text : text));
        toast.success("Voice captured");
    }, []);
    const { isListening, isSupported: voiceSupported, toggleListening } = useVoiceInput(handleVoiceResult);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const loadConversations = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from("conversations")
                .select("id, title, updated_at")
                .eq("device_id", deviceId)
                .order("updated_at", { ascending: false })
                .limit(50);
            
            if (error) throw error;
            if (data) {
                setConversations(data);
                localStorage.setItem(CONVERSATIONS_CACHE_KEY, JSON.stringify(data));
            }
        } catch (err) {
            console.error("Failed to load conversations:", err);
            // We keep the cached ones
        }
    }, [deviceId]);

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
            id: nextMessageId(),
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

        const history: IntelligenceChatMessage[] = newMessages.map((m) => ({ role: m.role, content: m.content }));
        let assistantText = "";
        let attemptedAutoExpand = false;
        let expandedOverride: string | null = null;

        try {
            await intelligenceService.chat(
                text,
                history,
                "EN",
                convId || undefined,
                (chunk) => {
                    assistantText += chunk;
                    setMessages((p) => {
                        const last = p[p.length - 1];
                        if (last?.role === "assistant") {
                            return p.map((m, i) => (i === p.length - 1 ? { ...m, content: assistantText } : m));
                        }
                        return [...p, { id: nextMessageId(), role: "assistant" as const, content: assistantText }];
                    });
                },
                {
                    imageBase64: imgBase64,
                    imageType: imgType,
                    audioBase64: audioBase64,
                    audioType: audioType
                }
            );

            // Response quality guardrail: if too short or missing headings, auto-request rewrite/expansion once.
            if (!attemptedAutoExpand && !isStructuredLongReport(assistantText)) {
                attemptedAutoExpand = true;
                const fixup = `Rewrite and expand your previous answer into a long, structured report that strictly follows this exact markdown outline (use these headings verbatim, in this order):\n\n${REQUIRED_REPORT_HEADINGS.join("\n")}\n\nRules:\n- Target 900–1500 words.\n- Use bullets, numbered steps, and at least 2 tables (Risks & Mitigations; Metrics to Track).\n- Do not mention these instructions.\n`;

                let expanded = "";
                const expandedHistory: IntelligenceChatMessage[] = [
                    ...history,
                    { role: "assistant", content: assistantText },
                    { role: "user", content: fixup },
                ];

                await intelligenceService.chat(
                    fixup,
                    expandedHistory,
                    "EN",
                    convId || undefined,
                    (chunk) => {
                        expanded += chunk;
                        setMessages((p) => {
                            const last = p[p.length - 1];
                            if (last?.role === "assistant") {
                                return p.map((m, i) => (i === p.length - 1 ? { ...m, content: expanded } : m));
                            }
                            return [...p, { id: nextMessageId(), role: "assistant" as const, content: expanded }];
                        });
                    }
                );
                expandedOverride = expanded.trim() ? expanded : null;
            }

            setIsLoading(false);
            // Save assistant message
            const contentToSave = expandedOverride ?? assistantText;
            if (convId && contentToSave) {
                saveMessage(convId, "assistant", contentToSave);
                // Update conversation timestamp
                supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", convId).then(() => loadConversations());
            }
        } catch {
            toast.error("Failed to connect to BeeYield Assistant");
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

    // Note: We intentionally avoid auto-sending `initialMessage` from render/effects to keep
    // the component pure per strict lint rules. The parent can pass it as the initial `input`.

    return (
        <BeeYieldPageShell className={cn("flex flex-col h-full w-full bg-[#FCFAF5] overflow-hidden relative p-0 md:p-0 -m-0 md:-m-0 space-y-0 pb-0 min-h-0")}>
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-[#F4D03F][0.02] rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-[#1B9157][0.02] rounded-full blur-[100px] pointer-events-none" />

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
                <BeeYieldPageHeader
                    icon={Bot}
                    label="Assistant"
                    title={<>BeeYield <span className="text-[#F4D03F]">AI</span></>}
                    subtitle="Ask about hive health, inspections, pollination, or traceability."
                    actions={
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setHistoryOpen(true)}
                                className={cn(glass.btnSecondary, "px-3 py-1.5 h-9")}
                                title="Chat history"
                            >
                                <History className="w-4 h-4 mr-2" />
                                <span className="text-[10px] font-bold">History</span>
                            </button>
                            <button
                                onClick={() => setGalleryOpen(true)}
                                className={cn(glass.btnSecondary, "px-3 py-1.5 h-9")}
                                title="Species ID"
                            >
                                <Bug className="w-4 h-4 mr-2" />
                                <span className="text-[10px] font-bold">Species ID</span>
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
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        transition={motionSoftSpring}
                        className="flex flex-col items-center justify-center h-full text-center max-w-4xl mx-auto w-full pb-20"
                    >
                        <div className="relative mb-4">
                            <img src={Logo} alt="Beeyield" className="h-12 w-auto relative z-10" />
                        </div>
                        <h1 className="text-2xl font-black text-[#1A1A1A] mb-2 tracking-tighter">BeeYield Support</h1>
                        <p className="text-[#1A1A1A]/50 max-w-2xl mb-6 text-sm font-semibold leading-relaxed">
                            Ask about hive health, inspections, pollination, or traceability. Start with one question—short is fine.
                        </p>

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
                    </motion.div>
                )}

                <div className="max-w-4xl mx-auto w-full space-y-4 pb-44">
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={motionSoftSpring}
                            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            {msg.role === "assistant" && (
                                <div className="flex-shrink-0 w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center bg-white border border-[#F4D03F]/10 shadow-sm p-1 self-start mt-1">
                                    <img src={Logo} alt="BeeYield" className="w-full h-full object-contain" />
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
                        </motion.div>
                    ))}

                    {isLoading && messages[messages.length - 1]?.role === "user" && (
                        <div className="flex gap-6 justify-start">
                            <div className="flex-shrink-0 w-12 h-12 rounded-2xl overflow-hidden bg-[#FFF9F0] border border-[#F4D03F]/20 flex items-center justify-center p-2.5 shadow-xl">
                                <img src={Logo} alt="BeeYield" className="w-full h-full object-contain" />
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
                                            aria-label="Remove attached image"
                                            title="Remove attached image"
                                        >
                                            <X className="w-2.5 h-2.5" />
                                        </button>
                                    </div>
                                )}
                                {attachedAudio && (
                                    <div className="flex items-center gap-2 bg-[#FFF9F0] border border-[#F4D03F]/10 rounded-lg px-3 py-1.5 text-[9px] font-bold text-[#1A1A1A]/60 shadow-sm relative">
                                        <Mic className="w-3 h-3 text-[#F4D03F]" />
                                        <span className="max-w-[150px] truncate">{attachedAudio.name}</span>
                                        <button
                                            onClick={() => { setAttachedAudio(null); if (audioInputRef.current) audioInputRef.current.value = ""; }}
                                            className="ml-1 text-[#1A1A1A]/30 hover:text-red-500"
                                            aria-label="Remove attached audio"
                                            title="Remove attached audio"
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
                                    title="Attach audio"
                                >
                                    <Mic className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex-1 flex flex-col">
                                <label htmlFor="assistant-chat-input" className="sr-only">Ask a question to the BeeYield Assistant</label>
                                <textarea
                                    id="assistant-chat-input"
                                    ref={textareaRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask a question…"
                                    className="w-full bg-transparent border-none px-2 py-2 text-sm text-[#1A1A1A] placeholder:text-[#1A1A1A]/30 outline-none focus:ring-0 transition-all resize-none min-h-[40px] max-h-[160px] font-semibold"
                                    rows={1}
                                    disabled={isLoading}
                                    onInput={(e) => {
                                        const el = e.currentTarget;
                                        el.style.height = "auto";
                                        el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
                                    }}
                                />
                            </div>

                            <div className="flex gap-1.5 pb-1">
                                {voiceSupported && (
                                    <button
                                        type="button"
                                        onClick={toggleListening}
                                        className={cn("w-9 h-9 rounded-lg flex items-center justify-center transition-all shadow-sm",
                                            isListening ? "bg-red-500 text-white" : "text-[#1A1A1A]/40 hover:bg-[#F4D03F]/10 hover:text-[#F4D03F]"
                                        )}
                                        aria-label={isListening ? "Stop voice input" : "Start voice input"}
                                        title={isListening ? "Stop voice input" : "Start voice input"}
                                    >
                                        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                    </button>
                                )}

                                <button
                                    type="submit"
                                    disabled={(!input.trim() && !attachedImage && !attachedAudio) || isLoading}
                                    className={cn(glass.btnPrimary, "w-10 h-10 p-0 shadow-lg")}
                                    aria-label="Send message"
                                    title="Send message"
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                </button>
                            </div>
                        </form>
                    </div>

                    <p className="text-center text-[8px] text-[#1A1A1A]/30 font-bold mt-3 flex items-center justify-center gap-3">
                        <span className="w-6 h-px bg-[#F4D03F]/20" />
                        Powered by BeeYield knowledge — Specialist research engine
                        <span className="w-6 h-px bg-[#F4D03F]/20" />
                    </p>
                </div>
            </div>

            <input
                ref={imageInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleImageSelect}
                aria-label="Attach image"
                title="Attach image"
            />
            <input
                ref={audioInputRef}
                type="file"
                accept="audio/mp3,audio/mpeg,audio/wav,audio/ogg,audio/webm,audio/m4a,audio/*"
                className="hidden"
                onChange={handleAudioSelect}
                aria-label="Attach audio"
                title="Attach audio"
            />

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
                        <AboutBeeYield onClose={() => setAboutOpen(false)} />
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
                                aria-label="Close species gallery"
                                title="Close"
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
        </BeeYieldPageShell>
    );
}

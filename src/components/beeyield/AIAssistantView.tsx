import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    MessageSquare,
    Send,
    Plus,
    User,
    Trash2,
    Paperclip,
    Image as ImageIcon,
    Link as LinkIcon,
    Mic,
    ShieldCheck,
    Globe,
    Database,
    Search,
    ChevronRight,
    History
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Logo from '@/assets/Logo.png';
import { aiService, ChatMessage } from '@/services/aiService';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { beeyieldService, Hive, IoTDevice } from '@/services/beeyieldService';
import { motion, AnimatePresence } from 'framer-motion';
import { spring } from '@/lib/motion';
import { useAuth } from '@/contexts/AuthContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LineChart as ChartIcon, Activity, Thermometer, Droplets, Weight, Navigation, Shield } from 'lucide-react';

interface AIAssistantViewProps {
    onTabChange: (tab: string, message?: string) => void;
    initialMessage?: string;
    onInitialMessageConsumed?: () => void;
}

interface Chat {
    id: string;
    title: string;
    date: string;
    preview: string;
    messages: Message[];
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    sources?: Array<{ type: string; name: string }>;
    suggestions?: string[];
}

const AIAssistantView: React.FC<AIAssistantViewProps> = ({ onTabChange, initialMessage, onInitialMessageConsumed }) => {
    const [chats, setChats] = useState<Chat[]>(() => {
        const saved = localStorage.getItem('beeyield_chats');
        return saved ? JSON.parse(saved) : [];
    });
    const [selectedChat, setSelectedChat] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [showWelcome, setShowWelcome] = useState(true);
    const [systemStatus, setSystemStatus] = useState<{ status: string, capabilities?: string[] }>({ status: 'online' });
    const [isTyping, setIsTyping] = useState(false);

    // Synced Data State
    const [hives, setHives] = useState<Hive[]>([]);
    const [syncedDevices, setSyncedDevices] = useState<IoTDevice[]>([]);
    const [isDataSyncing, setIsDataSyncing] = useState(false);

    const { user } = useAuth();
    const { language, t } = useLanguage();
    const navigate = useNavigate();

    React.useEffect(() => {
        const checkStatus = async () => {
            const status = await aiService.getStatus();
            setSystemStatus(status);
        };
        const fetchSyncedData = async () => {
            setIsDataSyncing(true);
            try {
                const [hivesData, devicesData] = await Promise.all([
                    beeyieldService.getHives(),
                    beeyieldService.getDevices()
                ]);
                setHives(hivesData);
                setSyncedDevices(devicesData);
            } catch (error) {
                console.error("Failed to sync AI context data", error);
            } finally {
                setIsDataSyncing(false);
            }
        };
        checkStatus();
        fetchSyncedData();
    }, []);

    // Persist chats to localStorage
    React.useEffect(() => {
        localStorage.setItem('beeyield_chats', JSON.stringify(chats));
    }, [chats]);

    // Handle initial message from other views
    React.useEffect(() => {
        if (initialMessage) {
            setInputValue(initialMessage);
            onInitialMessageConsumed?.();
            // Automatically send the message after a short delay to ensure UI is ready
            const timer = setTimeout(() => {
                const sendButton = document.getElementById('send-ai-message');
                if (sendButton) sendButton.click();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [initialMessage, onInitialMessageConsumed]);

    // Load messages when selecting a chat
    const switchChat = (chatId: string) => {
        const chat = chats.find(c => c.id === chatId);
        if (chat) {
            setSelectedChat(chatId);
            setMessages(chat.messages);
            setShowWelcome(false);
        }
    };

    const deleteChat = (e: React.MouseEvent, chatId: string) => {
        e.stopPropagation();
        const updatedChats = chats.filter(c => c.id !== chatId);
        setChats(updatedChats);
        if (selectedChat === chatId) {
            setSelectedChat(null);
            setMessages([]);
            setShowWelcome(true);
        }
    };

    const topicCategories = [
        { icon: '🌸', label: t('topic_pollination'), color: 'bg-gray-50' },
        { icon: '📋', label: t('topic_blockchain'), color: 'bg-gray-50' },
        { icon: '🩺', label: t('topic_bee_health'), color: 'bg-gray-50' },
        { icon: '🛰️', label: t('topic_iot_hive'), color: 'bg-gray-50' },
        { icon: '🎓', label: t('topic_training'), color: 'bg-gray-50' },
        { icon: '🌍', label: t('topic_global_network'), color: 'bg-gray-50' },
    ];

    const handleNewChat = () => {
        const newChat: Chat = {
            id: Date.now().toString(),
            title: t('new_conversation_title') || 'New Conversation',
            date: new Date().toLocaleDateString(),
            preview: t('start_new_conversation') || 'Start a new conversation',
            messages: []
        };
        setChats([newChat, ...chats]);
        setSelectedChat(newChat.id);
        setMessages([]);
        setShowWelcome(false);
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: inputValue,
            timestamp: new Date().toLocaleTimeString()
        };

        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);

        // If this is the first message, update the chat title
        const currentId = selectedChat || Date.now().toString();

        if (!selectedChat) {
            const newChat: Chat = {
                id: currentId,
                title: inputValue.length > 30 ? inputValue.substring(0, 30) + '...' : inputValue,
                date: new Date().toLocaleDateString(),
                preview: inputValue,
                messages: updatedMessages
            };
            setChats([newChat, ...chats]);
            setSelectedChat(currentId);
        } else {
            setChats(prev => prev.map(c => {
                if (c.id === selectedChat) {
                    const isNewTitle = c.title === t('new_conversation_title');
                    return {
                        ...c,
                        title: isNewTitle ? (inputValue.length > 30 ? inputValue.substring(0, 30) + '...' : inputValue) : c.title,
                        preview: inputValue,
                        messages: updatedMessages
                    };
                }
                return c;
            }));
        }

        setInputValue('');
        setShowWelcome(false);
        setIsTyping(true);

        // Convert messages for API
        const history: ChatMessage[] = updatedMessages.map(m => ({
            role: m.role,
            content: m.content
        }));

        try {
            const aiData = await aiService.chat(inputValue, history, language);

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: aiData.response,
                timestamp: new Date().toLocaleTimeString(),
                sources: aiData.sources,
                suggestions: aiData.suggestions
            };

            setMessages(prev => [...prev, aiMessage]);
            setChats(prev => prev.map(c =>
                c.id === (selectedChat || currentId)
                    ? { ...c, messages: [...c.messages, aiMessage], preview: aiData.response.substring(0, 50) + '...' }
                    : c
            ));
        } catch (error) {
            const errorMessage: Message = {
                id: (Date.now() + 2).toString(),
                role: 'assistant',
                content: t('error_ai_thinking') || "I'm having trouble connecting to the BeeYield database. Please try again in a moment.",
                timestamp: new Date().toLocaleTimeString()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleTopicClick = (topic: string) => {
        setInputValue(topic);
        setShowWelcome(false);
        // Use a timeout to ensure state is updated before sending
        setTimeout(() => {
            const sendButton = document.getElementById('send-ai-message');
            if (sendButton) sendButton.click();
        }, 100);
    };

    const FormattedMessage: React.FC<{ content: string, isUser: boolean, messageId: string }> = ({ content, isUser, messageId }) => {
        if (isUser) return <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{content}</p>;

        const processBold = (text: string) => {
            const boldParts = text.split(/(\*\*[^*]+\*\*)/g);
            return boldParts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={i} className="font-bold text-amber-500">{part.slice(2, -2)}</strong>;
                }
                return part;
            });
        };

        const parts = content.split(/(\[Insert Link: beeyield\.com\/[a-zA-Z0-9\-\/]+\])/g);

        return (
            <div className="space-y-4">
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {parts.map((part, i) => {
                        const match = part.match(/\[Insert Link: beeyield\.com\/([a-zA-Z0-9\-\/]+)\]/);
                        if (match) {
                            const path = '/' + match[1];
                            return (
                                <a
                                    key={i}
                                    href={path}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-amber-600 font-bold hover:underline underline-offset-4 decoration-2 px-1 rounded hover:bg-amber-50 transition-all cursor-pointer inline-flex items-center uppercase tracking-tight"
                                >
                                    {match[1].replace(/-/g, ' ').toUpperCase()}
                                </a>
                            );
                        }
                        return <span key={i}>{processBold(part)}</span>;
                    })}
                </div>

                {/* Synced Data Rich Cards (Injected based on content) */}
                {content.toLowerCase().includes('trace') && content.toLowerCase().includes('origin') && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-5 bg-white rounded-2xl border border-amber-200 shadow-xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <ShieldCheck className="w-16 h-16 text-amber-500" />
                        </div>
                        <h4 className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <ShieldCheck className="w-3 h-3" /> Record Verification
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <span className="text-[9px] text-slate-400 uppercase font-bold">Origin Apiary</span>
                                <p className="text-xs font-bold text-slate-800 uppercase">Kibwezi Main Apiary</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[9px] text-slate-400 uppercase font-bold">Harvest Date</span>
                                <p className="text-xs font-bold text-slate-800 uppercase">Jan 12, 2026</p>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[9px] font-bold text-green-600 uppercase">Verified on HoneyChain</span>
                            </div>
                            <Button size="sm" className="h-7 text-[9px] bg-amber-500 text-white font-bold uppercase tracking-wider rounded-lg">View Journey</Button>
                        </div>
                    </motion.div>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col animate-in fade-in duration-500 pb-12 font-sans selection:bg-[#F4D03F]/30 selection:text-black">

            {/* Background Accents */}
            <div className="fixed inset-0 pointer-events-none opacity-20 z-0">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-amber-50 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-green-50 rounded-full blur-[100px]" style={{ animationDelay: '2s' }} />
            </div>

            {/* Page Title */}
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-4 mb-8 tracking-tight">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center p-2.5 shadow-sm border border-amber-100">
                    <MessageSquare className="w-full h-full text-amber-500" />
                </div>
                {t('ai_assistant_title') || 'BeeYield Support'}
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[750px] relative z-10">

                {/* LEFT: Apiary Hub */}
                <div className="lg:col-span-3 space-y-4">
                    <Card className="rounded-[2rem] border border-slate-100 bg-white shadow-xl overflow-hidden flex flex-col h-full group">
                        <div className="p-8 border-b border-slate-50 bg-gradient-to-br from-white to-slate-50">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-[10px] uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                    <Activity className="w-3 h-3 text-green-600" /> Apiary Monitor
                                </h3>
                                <Badge className="bg-green-50 text-green-600 border-none text-[8px] font-bold uppercase tracking-wider">ACTIVE</Badge>
                            </div>

                            {isDataSyncing ? (
                                <div className="space-y-4 py-8">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-12 bg-gray-100 rounded-2xl animate-pulse" />
                                    ))}
                                </div>
                            ) : (
                                <ScrollArea className="h-[500px] pr-4 mt-4">
                                    <div className="space-y-4">
                                        {hives.slice(0, 5).map(hive => (
                                            <motion.div
                                                key={hive.id}
                                                whileHover={{ x: 5 }}
                                                className="p-4 rounded-2xl bg-gray-50 border border-transparent hover:border-[#F4D03F]/30 hover:bg-white transition-all cursor-pointer group/item shadow-sm"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-[10px] font-black text-gray-900 uppercase tracking-tighter truncate max-w-[120px]">{hive.hive_code}</span>
                                                    <div className="flex gap-1">
                                                        <Activity className="w-2.5 h-2.5 text-green-600" />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 mt-3">
                                                    <div className="flex items-center gap-2">
                                                        <Thermometer className="w-3 h-3 text-orange-500" />
                                                        <span className="text-[10px] font-bold">34.5°C</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Weight className="w-3 h-3 text-blue-500" />
                                                        <span className="text-[10px] font-bold">42.1kg</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}

                                        <Button variant="ghost" className="w-full text-[9px] font-bold uppercase tracking-wider text-amber-500 hover:bg-amber-50 mt-4">
                                            Sync Entire Apiary Network
                                        </Button>
                                    </div>
                                </ScrollArea>
                            )}
                        </div>

                        <div className="p-8 mt-auto bg-gradient-to-t from-slate-50">
                            <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 transition-all">
                                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                                    <Activity className="w-5 h-5 text-amber-500" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">System Status</span>
                                    <span className="text-sm font-bold text-slate-800">Operational</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* CENTER: Main Chat Interface */}
                <div className="lg:col-span-6 flex flex-col h-full bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-2xl shadow-amber-500/5 relative group">

                    {/* Header Accent */}
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-30" />

                    {/* Chat Header */}
                    {!showWelcome && (
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white/80 backdrop-blur-md relative z-20">
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center p-2 border border-slate-100 relative group/icon">
                                    <img src={Logo} alt="BeeYield" className="w-full h-full object-contain relative z-10" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-lg text-slate-800 tracking-tight">BeeYield Assistant</h3>
                                        <Badge className="bg-green-50 text-green-600 border-none text-[8px] font-bold uppercase tracking-wider px-2 py-0.5">ONLINE</Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ready to help</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Chat Window */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-gray-50/20">
                        <AnimatePresence mode="popLayout">
                            {showWelcome ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    transition={spring.gentle}
                                    className="flex flex-col items-center justify-center h-full text-center space-y-10"
                                >
                                    <div className="w-24 h-24 rounded-[2rem] bg-white flex items-center justify-center p-5 shadow-xl border border-slate-100 animate-float">
                                        <img src={Logo} alt="Logo" className="w-full h-full object-contain" />
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-bold text-slate-800 tracking-tight leading-none mb-3 uppercase">
                                            BeeYield Support
                                        </h2>
                                        <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Professional Apiculture Guidance</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
                                        {topicCategories.map((topic, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleTopicClick(topic.label)}
                                                className="p-5 rounded-2xl bg-white border border-slate-100 text-left transition-all hover:border-amber-500 hover:shadow-xl hover:-translate-y-1 group/btn"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-xl group-hover/btn:scale-110 transition-transform">{topic.icon}</div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Analyze</span>
                                                        <span className="text-xs font-bold text-slate-800 uppercase">{topic.label}</span>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="space-y-10">
                                    {messages.map((m) => (
                                        <motion.div
                                            key={m.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={spring.gentle}
                                            className={cn(
                                                "flex gap-4",
                                                m.role === 'user' ? "justify-end" : "justify-start"
                                            )}
                                        >
                                            {m.role === 'assistant' && (
                                                <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center p-2 shadow-sm shrink-0">
                                                    <img src={Logo} alt="BeeYield" className="w-full h-full object-contain" />
                                                </div>
                                            )}
                                            <div className={cn(
                                                "max-w-[85%] p-6 rounded-[2rem] shadow-xl relative overflow-hidden transition-all",
                                                m.role === 'user'
                                                    ? "bg-amber-500 text-white rounded-br-none"
                                                    : "bg-white text-slate-800 rounded-bl-none border border-slate-100"
                                            )}>
                                                <FormattedMessage content={m.content} isUser={m.role === 'user'} messageId={m.id} />

                                                {m.role === 'assistant' && (
                                                    <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            {m.sources?.map((s, idx) => (
                                                                <Badge key={idx} className="bg-slate-50 text-[8px] font-bold uppercase tracking-wider text-slate-400 border-none px-2 py-1">
                                                                    {s.name}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider">{m.timestamp}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                    {isTyping && (
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2">
                                                <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce" />
                                            </div>
                                            <div className="bg-white p-5 rounded-2xl rounded-bl-none border border-slate-100 shadow-sm">
                                                <div className="flex gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                                                    <div className="w-2 h-2 rounded-full bg-amber-500/60" />
                                                    <div className="w-2 h-2 rounded-full bg-amber-500/30" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Chat Input */}
                    <div className="p-8 bg-white border-t border-gray-50 relative z-20">
                        <div className="max-w-4xl mx-auto flex items-center gap-4">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#F4D03F] transition-colors" />
                                <Input
                                    className="h-14 pl-14 pr-16 rounded-xl bg-slate-50 border-none ring-1 ring-slate-100 focus-visible:ring-2 focus-visible:ring-amber-500 transition-all text-sm font-bold placeholder:text-slate-400 placeholder:uppercase placeholder:tracking-wider"
                                    placeholder="Type your message..."
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                />
                                <Button
                                    id="send-ai-message"
                                    onClick={handleSendMessage}
                                    className="absolute right-1.5 top-1.5 h-11 w-11 rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="flex items-center gap-2">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" className="h-14 w-14 rounded-xl bg-slate-50 hover:bg-amber-50 text-slate-400 hover:text-amber-500 transition-all">
                                                <Mic className="w-5 h-5" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-amber-100 text-amber-900 border-none text-[9px] font-bold uppercase font-sans">Voice Input</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Chat History Hub */}
                <div className="lg:col-span-3">
                    <Card className="rounded-[2rem] border border-slate-100 bg-white shadow-xl overflow-hidden h-full flex flex-col">
                        <div className="p-8 border-b border-slate-50">
                            <h3 className="font-bold text-[10px] uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                <History className="w-3 h-3 text-amber-500" /> Conversations
                            </h3>
                        </div>
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-3">
                                {chats.map(chat => (
                                    <button
                                        key={chat.id}
                                        onClick={() => switchChat(chat.id)}
                                        className={cn(
                                            "w-full p-5 rounded-2xl text-left transition-all relative group/chat",
                                            selectedChat === chat.id
                                                ? "bg-amber-500 text-white shadow-lg"
                                                : "hover:bg-slate-50"
                                        )}
                                    >
                                        <p className="text-[11px] font-bold uppercase tracking-tight truncate mb-1 pr-4">{chat.title}</p>
                                        <div className="flex items-center justify-between">
                                            <span className={cn("text-[9px] font-bold uppercase", selectedChat === chat.id ? "text-white/70" : "text-slate-400")}>{chat.date}</span>
                                            <ChevronRight className="w-3 h-3 opacity-0 group-hover/chat:opacity-100 transition-opacity" />
                                        </div>
                                        {selectedChat !== chat.id && (
                                            <Trash2
                                                onClick={(e) => deleteChat(e, chat.id)}
                                                className="absolute top-5 right-5 w-3 h-3 text-red-500 opacity-0 group-hover/chat:opacity-100 transition-opacity cursor-pointer"
                                            />
                                        )}
                                    </button>
                                ))}

                                <Button
                                    onClick={handleNewChat}
                                    variant="outline"
                                    className="w-full h-12 rounded-xl border-dashed border-amber-200 text-amber-600 hover:bg-amber-50 font-bold uppercase tracking-wider text-[9px] gap-2 mt-4"
                                >
                                    <Plus className="w-3 h-3" /> New Conversation
                                </Button>
                            </div>
                        </ScrollArea>
                    </Card>
                </div>

            </div >

            {/* AI Security Policy Footer */}
            < div className="mt-8 flex items-center justify-center gap-8 py-5 bg-white rounded-2xl border border-slate-50 shadow-sm" >
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Encrypted Connection</span>
                </div>
                <Separator orientation="vertical" className="h-4 bg-slate-100" />
                <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-amber-500" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Research Database v2.1</span>
                </div>
                <Separator orientation="vertical" className="h-4 bg-slate-100" />
                <div className="flex items-center gap-2 text-amber-500 hover:text-amber-600 transition-colors cursor-pointer">
                    <Globe className="w-4 h-4" />
                    <span className="text-[9px] font-bold uppercase tracking-wider underline underline-offset-4">Safety Guidelines</span>
                </div>
            </div >
        </div >
    );
};

export default AIAssistantView;

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    MessageSquare,
    Send,
    Plus,
    Bot,
    Trash2,
    Paperclip,
    Image as ImageIcon,
    Link as LinkIcon,
    Mic,
    ShieldCheck,
    Globe,
    Database,
    Cpu,
    Sparkles,
    Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Logo from '@/assets/Logo.png';
import { aiService, ChatMessage } from '@/services/aiService';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

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

const SmartAssistantView: React.FC<AIAssistantViewProps> = ({ onTabChange, initialMessage, onInitialMessageConsumed }) => {
    const [chats, setChats] = useState<Chat[]>(() => {
        const saved = localStorage.getItem('beeyield_chats');
        return saved ? JSON.parse(saved) : [];
    });
    const [selectedChat, setSelectedChat] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [showWelcome, setShowWelcome] = useState(true);
    const [systemStatus, setSystemStatus] = useState<{ status: string, capabilities?: string[] }>({ status: 'online' });
    const { language, t } = useLanguage();
    const navigate = useNavigate();

    useEffect(() => {
        const checkStatus = async () => {
            const status = await aiService.getStatus();
            setSystemStatus(status);
        };
        checkStatus();
    }, []);

    useEffect(() => {
        localStorage.setItem('beeyield_chats', JSON.stringify(chats));
    }, [chats]);

    useEffect(() => {
        if (initialMessage) {
            setInputValue(initialMessage);
            onInitialMessageConsumed?.();
            const timer = setTimeout(() => {
                const sendButton = document.getElementById('send-ai-message');
                if (sendButton) sendButton.click();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [initialMessage, onInitialMessageConsumed]);

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
        { icon: '🌸', label: t('topic_pollination'), color: 'bg-beeyield-forest/5' },
        { icon: '📋', label: t('topic_blockchain'), color: 'bg-beeyield-forest/5' },
        { icon: '🩺', label: t('topic_bee_health'), color: 'bg-beeyield-forest/5' },
        { icon: '🛰️', label: t('topic_iot_hive'), color: 'bg-beeyield-forest/5' },
        { icon: '🎓', label: t('topic_training'), color: 'bg-beeyield-forest/5' },
        { icon: '🌍', label: t('topic_global_network'), color: 'bg-beeyield-forest/5' },
    ];

    const handleNewChat = () => {
        const newChat: Chat = {
            id: Date.now().toString(),
            title: t('new_conversation_title'),
            date: new Date().toLocaleDateString(),
            preview: t('start_new_conversation'),
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
                content: t('error_ai_thinking'),
                timestamp: new Date().toLocaleTimeString()
            };
            setMessages(prev => [...prev, errorMessage]);
        }
    };

    const handleTopicClick = (topic: string) => {
        setInputValue(topic);
        setShowWelcome(false);
        setTimeout(() => {
            const sendButton = document.getElementById('send-ai-message');
            if (sendButton) sendButton.click();
        }, 100);
    };

    const FormattedMessage: React.FC<{ content: string, isUser: boolean }> = ({ content, isUser }) => {
        if (isUser) return <p className="text-[15px] leading-relaxed font-medium">{content}</p>;

        const processBoldAndLinks = (text: string) => {
            const boldParts = text.split(/(\*\*[^*]+\*\*|\[.*?\]\(.*?\))/g);
            return boldParts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={i} className="font-bold text-beeyield-forest">{part.slice(2, -2)}</strong>;
                }
                const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
                if (linkMatch) {
                    return (
                        <a key={i} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="shadow-underline text-beeyield-forest font-bold">
                            {linkMatch[1]}
                        </a>
                    );
                }
                return part;
            });
        };

        const processInternalLinks = (text: string) => {
            const parts = text.split(/(\[Insert Link: beeyield\.com[a-zA-Z0-9\-\/\?\=\&]+\])/g);

            return parts.map((part, j) => {
                const match = part.match(/\[Insert Link: beeyield\.com([a-zA-Z0-9\-\/\?\=\&]+)\]/);
                if (match) {
                    const path = match[1];
                    const displayName = path.split('?')[0].split('/').pop()?.replace(/-/g, ' ').toUpperCase() || 'NAVIGATE';

                    return (
                        <button
                            key={j}
                            onClick={() => {
                                if (path.startsWith('/')) {
                                    navigate(path);
                                } else {
                                    window.open(path, '_blank');
                                }
                            }}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-beeyield-forest text-white font-bold text-[10px] rounded-lg uppercase tracking-wider hover:bg-opacity-90 transition-all mx-1 align-middle"
                        >
                            <LinkIcon className="h-3 w-3" />
                            {displayName}
                        </button>
                    );
                }
                return <span key={j}>{processBoldAndLinks(part)}</span>;
            });
        };

        const lines = content.split('\n');

        return (
            <div className="text-[15px] leading-[1.6] space-y-5 text-gray-700">
                {lines.map((line, i) => {
                    const trimmedLine = line.trim();
                    if (!trimmedLine) return <div key={i} className="h-2" />;

                    if (trimmedLine.startsWith('###')) {
                        return <h4 key={i} className="text-lg font-bold mt-6 mb-3 text-beeyield-forest">{trimmedLine.replace('###', '').trim()}</h4>;
                    }
                    if (trimmedLine.startsWith('##')) {
                        return <h3 key={i} className="text-xl font-bold mt-8 mb-4 text-beeyield-forest tracking-tight">{trimmedLine.replace('##', '').trim()}</h3>;
                    }
                    if (trimmedLine.startsWith('#')) {
                        return <h2 key={i} className="text-2xl font-bold mt-10 mb-5 text-beeyield-forest tracking-tighter">{trimmedLine.replace('#', '').trim()}</h2>;
                    }

                    if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
                        return (
                            <div key={i} className="flex gap-4 ml-2">
                                <span className="text-beeyield-forest font-bold mt-1.5">•</span>
                                <div className="flex-1">
                                    {processInternalLinks(trimmedLine.substring(2))}
                                </div>
                            </div>
                        );
                    }

                    return <div key={i}>{processInternalLinks(line)}</div>;
                })}
            </div>
        );
    };

    return (
        <div className="flex flex-col animate-in fade-in duration-700 pb-16">
            {/* Header Area */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-beeyield-charcoal flex items-center gap-3">
                        Smart Assistant
                    </h1>
                    <p className="text-gray-500 font-medium mt-1">Ecosystem Intelligence Node active.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-beeyield-forest/5 border border-beeyield-forest/10 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-bold text-beeyield-forest uppercase tracking-widest">Neural Sync Stable</span>
                </div>
            </div>

            {/* Forest Theme Hero Card */}
            <div className="relative mb-12 overflow-hidden rounded-[2.5rem] bg-beeyield-forest p-12 text-white shadow-xl shadow-beeyield-forest/10 group">
                <div className="absolute top-0 right-0 w-80 h-full bg-white/10 rounded-l-full blur-[100px] group-hover:bg-white/20 transition-all duration-1000" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
                    <div className="space-y-6 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                            <Sparkles className="h-3 w-3 text-white" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Floaria™ Intelligence</span>
                        </div>
                        <h2 className="text-5xl font-bold tracking-tighter leading-[1.05]">
                            Consult the <br />Hive Mind.
                        </h2>
                        <p className="text-white/70 font-medium leading-relaxed max-w-lg">
                            An expert retrieval system specialized in apiculture, pollination forensics, and IoT telemetry interpretation.
                        </p>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleNewChat}
                        className="bg-white text-beeyield-forest rounded-2xl px-10 h-16 font-bold text-lg flex items-center justify-center gap-3 shadow-2xl transition-all"
                    >
                        <Plus className="w-6 h-6 stroke-[3px]" />
                        Initialize Node
                    </motion.button>
                </div>
            </div>

            {/* Main Chat Interface */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 min-h-[700px]">
                {/* Sidebar - Chat History */}
                <div className="lg:col-span-3 bg-white rounded-[2rem] border border-[#E0E0E0] overflow-hidden flex flex-col shadow-sm">
                    <div className="p-7 px-8 border-b border-[#F5F5F5] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <MessageSquare className="w-5 h-5 text-beeyield-forest/40" />
                            <span className="text-sm font-bold text-beeyield-charcoal">Conversations</span>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar-slim p-4 pt-6 space-y-2">
                        {chats.length === 0 ? (
                            <div className="text-center py-20 px-6">
                                <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">No Active Nodes</p>
                            </div>
                        ) : (
                            chats.map((chat) => (
                                <div key={chat.id} className="relative group">
                                    <button
                                        onClick={() => switchChat(chat.id)}
                                        className={cn(
                                            "w-full text-left p-5 rounded-[1.25rem] transition-all duration-300",
                                            selectedChat === chat.id
                                                ? "bg-beeyield-forest/[0.04] border border-beeyield-forest/10"
                                                : "hover:bg-beeyield-sand/50 border border-transparent"
                                        )}
                                    >
                                        <div className="flex flex-col gap-1">
                                            <p className={cn(
                                                "text-[13px] font-bold truncate",
                                                selectedChat === chat.id ? "text-beeyield-forest" : "text-beeyield-charcoal"
                                            )}>
                                                {chat.title}
                                            </p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{chat.date}</p>
                                        </div>
                                    </button>
                                    <button
                                        onClick={(e) => deleteChat(e, chat.id)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-9 bg-white rounded-[2rem] border border-[#E0E0E0] overflow-hidden flex flex-col shadow-sm relative">
                    <div className="flex-1 overflow-y-auto p-12 custom-scrollbar shadow-inner bg-beeyield-sand/20">
                        {showWelcome ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center max-w-xl animate-in zoom-in-95 duration-500">
                                    <div className="w-24 h-24 bg-beeyield-forest rounded-[2rem] flex items-center justify-center shadow-xl mx-auto mb-10 group-hover:rotate-6 transition-transform">
                                        <Hexagon className="w-10 h-10 text-white" />
                                    </div>
                                    <h3 className="text-4xl font-bold text-beeyield-charcoal mb-4">Neural Hive Node</h3>
                                    <p className="text-gray-500 font-medium mb-12">Search our proprietary apiculture knowledge graph.</p>

                                    <div className="grid grid-cols-2 gap-4">
                                        {topicCategories.map((topic, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleTopicClick(topic.label)}
                                                className="p-8 rounded-[2rem] bg-white border border-[#EBEBEB] text-left hover:border-beeyield-forest hover:shadow-md transition-all group"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <span className="text-2xl">{topic.icon}</span>
                                                    <span className="text-[13px] font-bold text-gray-600 group-hover:text-beeyield-forest uppercase tracking-tighter">{topic.label}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="max-w-4xl mx-auto space-y-10">
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={cn(
                                            "flex gap-6",
                                            message.role === 'user' ? "flex-row-reverse" : "flex-row"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border",
                                            message.role === 'user' ? "bg-white border-[#E0E0E0]" : "bg-beeyield-forest border-beeyield-forest shadow-md shadow-beeyield-forest/10"
                                        )}>
                                            {message.role === 'user' ? (
                                                <span className="text-xs font-bold text-beeyield-charcoal">ME</span>
                                            ) : (
                                                <Bot className="w-6 h-6 text-white" />
                                            )}
                                        </div>

                                        <div className={cn(
                                            "flex-1 p-8 rounded-[2rem] shadow-sm",
                                            message.role === 'user'
                                                ? "bg-beeyield-forest/5 border border-beeyield-forest/10 rounded-tr-none text-beeyield-charcoal"
                                                : "bg-white border border-[#E0E0E0] rounded-tl-none shadow-md"
                                        )}>
                                            <FormattedMessage content={message.content} isUser={message.role === 'user'} />

                                            {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                                                <div className="mt-8 pt-6 border-t border-[#F0F0F0] flex flex-wrap gap-2.5">
                                                    {message.sources.map((source, idx) => (
                                                        <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-[#E0E0E0]">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-beeyield-forest" />
                                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{source.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {message.role === 'assistant' && message.suggestions && message.suggestions.length > 0 && (
                                                <div className="mt-8 flex flex-wrap gap-2">
                                                    {message.suggestions.map((suggestion, idx) => (
                                                        <button
                                                            key={idx}
                                                            onClick={() => handleTopicClick(suggestion)}
                                                            className="px-4 py-2 bg-beeyield-forest/10 text-beeyield-forest text-[11px] font-bold uppercase tracking-widest rounded-full border border-beeyield-forest/20 hover:bg-beeyield-forest hover:text-white transition-all"
                                                        >
                                                            {suggestion}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="mt-6 flex items-center justify-between opacity-30">
                                                <span className="text-[10px] font-bold uppercase tracking-widest">{message.timestamp}</span>
                                                <div className="flex gap-1">
                                                    {[1, 2, 3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-beeyield-forest" />)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Chat Input Area */}
                    <div className="p-10 bg-white border-t border-[#F5F5F5]">
                        <div className="max-w-4xl mx-auto flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="w-12 h-12 rounded-xl text-gray-400 hover:text-beeyield-forest hover:bg-beeyield-forest/5 transition-all">
                                    <Paperclip className="w-5 h-5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="w-12 h-12 rounded-xl text-gray-400 hover:text-beeyield-forest hover:bg-beeyield-forest/5 transition-all">
                                    <ImageIcon className="w-5 h-5" />
                                </Button>
                            </div>
                            <div className="relative flex-1">
                                <Input
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Type a research vector or query..."
                                    className="w-full h-14 pl-6 pr-14 rounded-2xl bg-beeyield-sand/30 border-[#E0E0E0] focus:ring-beeyield-forest/20 font-medium placeholder:text-gray-300"
                                />
                                <Button
                                    id="send-ai-message"
                                    onClick={handleSendMessage}
                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-xl bg-beeyield-forest hover:bg-opacity-90 text-white shadow-lg transition-transform active:scale-95"
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Regulatory Footer */}
            <div className="mt-8 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white py-4 rounded-2xl border border-[#F5F5F5] shadow-sm">
                Neural Retrieval Layer — AI outputs may be nondeterministic. <a href="#" className="text-beeyield-forest hover:underline ml-1">Terms of Protocol</a>
            </div>
        </div>
    );
};

export default SmartAssistantView;

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
    const { language, t } = useLanguage();
    const navigate = useNavigate();

    // Check system health on mount
    React.useEffect(() => {
        const checkStatus = async () => {
            const status = await aiService.getStatus();
            setSystemStatus(status);
        };
        checkStatus();
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
        { icon: '🌸', label: t('topic_pollination'), color: 'bg-gray-50 dark:bg-gray-800/10' },
        { icon: '📋', label: t('topic_blockchain'), color: 'bg-gray-50 dark:bg-gray-800/10' },
        { icon: '🩺', label: t('topic_bee_health'), color: 'bg-gray-50 dark:bg-gray-800/10' },
        { icon: '🛰️', label: t('topic_iot_hive'), color: 'bg-gray-50 dark:bg-gray-800/10' },
        { icon: '🎓', label: t('topic_training'), color: 'bg-gray-50 dark:bg-gray-800/10' },
        { icon: '🌍', label: t('topic_global_network'), color: 'bg-gray-50 dark:bg-gray-800/10' },
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
                content: t('error_ai_thinking'),
                timestamp: new Date().toLocaleTimeString()
            };
            setMessages(prev => [...prev, errorMessage]);
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

    const FormattedMessage: React.FC<{ content: string, isUser: boolean }> = ({ content, isUser }) => {
        if (isUser) return <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>;

        // Handle bold pattern **text**
        const processBold = (text: string) => {
            const boldParts = text.split(/(\*\*[^*]+\*\*)/g);
            return boldParts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={i} className="font-black text-foreground">{part.slice(2, -2)}</strong>;
                }
                return part;
            });
        };

        // eslint-disable-next-line no-useless-escape
        const parts = content.split(/(\[Insert Link: beeyield\.com\/[a-zA-Z0-9\-\/]+\])/g);

        return (
            <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {parts.map((part, i) => {
                    // eslint-disable-next-line no-useless-escape
                    const match = part.match(/\[Insert Link: beeyield\.com\/([a-zA-Z0-9\-\/]+)\]/);
                    if (match) {
                        const path = '/' + match[1];
                        return (
                            <a
                                key={i}
                                href={path}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#F4D03F] dark:text-[#F4D03F] font-bold hover:underline underline-offset-4 decoration-2 px-1 rounded hover:bg-[#F4D03F]/5 dark:hover:bg-[#F4D03F]/20 transition-all cursor-pointer inline-flex items-center"
                            >
                                {match[1].replace(/-/g, ' ').toUpperCase()}
                            </a>
                        );
                    }
                    return <span key={i}>{processBold(part)}</span>;
                })}
            </div>
        );
    };

    return (
        <div className="flex flex-col animate-in fade-in duration-500 pb-12">

            {/* Page Title */}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-8">
                {t('ai_assistant_title')} <span role="img" aria-label="robot">🤖</span>
            </h1>

            {/* Orange Hero Card */}
            <div className="relative mb-8 overflow-hidden rounded-[3rem] bg-[#0F172A] p-12 shadow-2xl group border border-white/5">
                {/* Visual Accent Background */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-[#F4D03F]/10 rounded-l-full blur-[100px] group-hover:bg-[#F4D03F]/20 transition-all duration-1000" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />

                {/* Neural Pattern Overlay */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                        <pattern id="neural-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                            <circle cx="1" cy="1" r="0.5" fill="white" />
                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.1" />
                        </pattern>
                        <rect width="100%" height="100%" fill="url(#neural-grid)" />
                    </svg>
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                    <div className="space-y-6 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
                            <Zap className="h-3 w-3 text-primary" />
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Neural Network v4.2</span>
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-black text-white uppercase tracking-tight leading-[1.1]">
                            {t('ai_hub_intelligence')}
                        </h2>
                        <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0F172A] bg-primary/20 flex items-center justify-center text-[10px] font-black text-white">AI</div>
                                ))}
                            </div>
                            <p className="text-white font-bold opacity-70 uppercase tracking-widest text-xs">
                                {t('ai_hub_status')}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-4">
                            {topicCategories.slice(0, 4).map((topic, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleTopicClick(topic.label)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[11px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 backdrop-blur-md"
                                >
                                    <span>{topic.icon}</span>
                                    <span>{topic.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <Button
                        onClick={handleNewChat}
                        className="bg-primary hover:bg-primary/90 text-black rounded-2xl px-10 h-16 font-black text-lg flex items-center gap-3 shadow-[0_0_30px_rgba(244,208,63,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0 uppercase tracking-tight"
                    >
                        <Plus className="w-6 h-6 stroke-[3px]" />
                        {t('new_chat')}
                    </Button>
                </div>
            </div>


            {/* Main Chat Interface Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
                {/* Left Sidebar - Chats List */}
                <div className="lg:col-span-3 bg-white dark:bg-[#141414] rounded-[2.5rem] border border-gray-100 dark:border-[#1e1e1e] overflow-hidden flex flex-col shadow-sm">
                    <div className="p-6 border-b border-gray-50 dark:border-[#1e1e1e]">
                        <div className="flex items-center gap-3 text-gray-900 dark:text-white">
                            <MessageSquare className="w-5 h-5 text-gray-400" />
                            <span className="font-bold">{t('chats_label')}</span>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {chats.length === 0 ? (
                            <div className="p-8 text-center">
                                <p className="text-gray-400 text-sm font-medium">{t('start_conversation')}</p>
                            </div>
                        ) : (
                            <div className="p-3 space-y-2">
                                {chats.map((chat) => (
                                    <div key={chat.id} className="relative group/chat">
                                        <button
                                            key={chat.id}
                                            onClick={() => switchChat(chat.id)}
                                            className={cn(
                                                "w-full text-left p-4 rounded-3xl transition-all duration-200 pr-12",
                                                selectedChat === chat.id
                                                    ? "bg-[#FFF8F0] border border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/20 shadow-sm"
                                                    : "hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent"
                                            )}
                                        >
                                            <div className="flex gap-3 items-center mb-1">
                                                <div className="w-8 h-8 rounded-full bg-white p-1.5 border border-gray-100 flex items-center justify-center shrink-0">
                                                    <img src={Logo} alt="Icon" className="w-full h-full object-contain" />
                                                </div>
                                                <p className="font-bold text-sm text-gray-900 dark:text-white truncate flex-1">
                                                    {chat.title}
                                                </p>
                                            </div>
                                            <div className="flex justify-between items-center ml-11">
                                                <p className="text-[10px] text-gray-400 font-medium">
                                                    {chat.date}
                                                </p>
                                                <p className="text-[10px] text-[#F4D03F]/60 font-bold group-hover/chat:opacity-100 opacity-0 transition-opacity">
                                                    {chat.messages.length} {t('msgs_count')}
                                                </p>
                                            </div>
                                        </button>
                                        <button
                                            onClick={(e) => deleteChat(e, chat.id)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl opacity-0 group-hover/chat:opacity-100 transition-all"
                                            title="Delete Chat"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className="lg:col-span-9 bg-white dark:bg-[#141414] rounded-[2.5rem] border border-gray-100 dark:border-[#1e1e1e] overflow-hidden flex flex-col shadow-sm">
                    {/* Chat Header */}
                    {!showWelcome && (
                        <div className="p-8 border-b border-gray-50 dark:border-[#1e1e1e] flex items-center justify-between bg-white dark:bg-white/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Bot className="h-24 w-24 text-primary" />
                            </div>

                            <div className="flex items-center gap-6 relative z-10">
                                <div className="w-16 h-16 rounded-[1.25rem] bg-indigo-50 dark:bg-[#F4D03F]/20 border-[#F4D03F]/20 dark:border-[#F4D03F]/30 flex items-center justify-center p-3 shadow-premium animate-in fade-in zoom-in duration-500 relative group">
                                    <div className="absolute -inset-2 bg-primary/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
                                    <img src={Logo} alt="BEEYIELD" className="w-full h-full object-contain relative z-10" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-black text-2xl text-gray-900 dark:text-white uppercase tracking-tighter">
                                            BeeYield AI
                                        </h3>
                                        <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5">INTERNAL</Badge>
                                    </div>
                                    <p className="text-[10px] text-amber-500 font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                        <span className={cn(
                                            "w-2 h-2 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-[pulse-fast_1s_infinite]",
                                            systemStatus.status === 'healthy' ? "bg-green-500" : "bg-amber-500"
                                        )} />
                                        {systemStatus.status === 'healthy' ? t('neural_core_synchronized') : t('neural_core_online')}
                                    </p>
                                </div>
                            </div>

                            <div className="hidden md:flex flex-col items-end">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Neural Load</p>
                                <div className="h-1.5 w-32 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary w-[35%] animate-pulse" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Messages Window */}
                    <div className="flex-1 overflow-y-auto p-10 bg-gray-50/30 dark:bg-black/20">
                        {showWelcome ? (
                            <div className="flex items-center justify-center h-full">
                                <Card className="w-full max-w-lg bg-white dark:bg-[#09090b] border-none rounded-[2.5rem] shadow-xl overflow-hidden animate-in zoom-in-95 duration-300">
                                    <CardContent className="p-10 text-center space-y-8">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-24 h-24 bg-white dark:bg-amber-900/20 rounded-[2.5rem] flex items-center justify-center shadow-2xl border-2 border-amber-100 dark:border-amber-900/30 p-5 rotate-3 hover:rotate-0 transition-transform duration-500">
                                                <img src={Logo} alt="BeeYield AI" className="w-full h-full object-contain" />
                                            </div>
                                            <h3 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2">
                                                {t('ai_hub_title')}
                                            </h3>
                                        </div>
                                        <p className="text-gray-500 dark:text-gray-400 font-bold text-xs uppercase tracking-[0.15em] opacity-70">
                                            {t('ai_expert_assistant')}
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {topicCategories.map((category, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => handleTopicClick(category.label)}
                                                    className="p-6 rounded-3xl bg-gray-50 dark:bg-[#1a1a1a] border border-gray-100 dark:border-gray-800 text-left transition-all duration-200 hover:border-[#F4D03F] hover:shadow-md hover:bg-white dark:hover:bg-[#222]"
                                                >
                                                    <div className="flex items-start gap-4">
                                                        <span className="text-2xl shrink-0">{category.icon}</span>
                                                        <span className="text-xs font-bold text-gray-700 dark:text-gray-200 leading-snug">
                                                            {category.label}
                                                        </span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                        <div className="space-y-4 pt-4">
                                            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest leading-relaxed px-10">
                                                {t('ai_proprietary_ml')}
                                            </p>
                                        </div>
                                        <Button
                                            onClick={handleNewChat}
                                            className="bg-[#F4D03F] hover:bg-[#FFA000] text-gray-900 rounded-2xl px-10 h-14 font-extrabold shadow-lg shadow-[#F4D03F]/20 transition-all hover:scale-105"
                                        >
                                            {t('new_chat')}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        ) : (
                            <div className="space-y-6 max-w-4xl mx-auto h-full flex flex-col">
                                {messages.length === 0 ? (
                                    <div className="flex-1 flex items-center justify-center">
                                        <div className="px-6 py-3 bg-gray-200/50 dark:bg-gray-800 rounded-full text-gray-500 font-bold text-sm">
                                            {t('new_chat')}
                                        </div>
                                    </div>
                                ) : (
                                    messages.map((message) => (
                                        <div
                                            key={message.id}
                                            className={cn(
                                                "flex gap-4",
                                                message.role === 'user' ? "justify-end" : "justify-start"
                                            )}
                                        >
                                            {message.role === 'assistant' && (
                                                <div className="relative group">
                                                    <div className="absolute -inset-1 bg-primary/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    <div className="w-14 h-14 rounded-2xl bg-white/80 backdrop-blur-md dark:bg-amber-900/40 flex items-center justify-center shrink-0 shadow-premium p-3 border border-amber-100 dark:border-amber-900/50 animate-in fade-in zoom-in duration-500 relative z-10">
                                                        <img src={Logo} alt="BeeYield AI" className="w-full h-full object-contain" />
                                                    </div>
                                                </div>
                                            )}
                                            <div
                                                className={cn(
                                                    "max-w-[80%] p-7 rounded-[2.25rem] shadow-lg relative overflow-hidden",
                                                    message.role === 'user'
                                                        ? "bg-primary text-black font-semibold rounded-br-none"
                                                        : "bg-white/80 backdrop-blur-xl dark:bg-[#1e1e1e] text-gray-800 dark:text-gray-200 font-medium rounded-bl-none border border-white/40 dark:border-gray-800 shadow-xl"
                                                )}
                                            >
                                                {message.role === 'assistant' && (
                                                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                                                        <Zap className="h-12 w-12 text-primary" />
                                                    </div>
                                                )}
                                                <FormattedMessage content={message.content} isUser={message.role === 'user'} />

                                                {/* Sources Tooltip/Icons */}
                                                {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                                                    <div className="mt-4 flex flex-wrap gap-2">
                                                        {message.sources.map((source, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="flex items-center gap-1.5 px-2 py-1 bg-black/5 dark:bg-white/5 rounded-lg border border-black/5 dark:border-white/10 group/source hover:bg-primary/10 transition-colors"
                                                            >
                                                                {source.type === 'blockchain' && <ShieldCheck className="w-3 h-3 text-emerald-500" />}
                                                                {source.type === 'iot' && <Cpu className="w-3 h-3 text-indigo-500" />}
                                                                {source.type === 'database' && <Database className="w-3 h-3 text-amber-500" />}
                                                                {source.type === 'web' && <Globe className="w-3 h-3 text-blue-500" />}
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover/source:text-primary transition-colors">
                                                                    {source.name}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Suggestions Chips */}
                                                {message.role === 'assistant' && message.suggestions && message.suggestions.length > 0 && (
                                                    <div className="mt-6 flex flex-wrap gap-2 animate-in slide-in-from-bottom-2 duration-500">
                                                        {message.suggestions.map((suggestion, idx) => (
                                                            <button
                                                                key={idx}
                                                                onClick={() => handleTopicClick(suggestion)}
                                                                className="px-3 py-1.5 bg-primary/5 hover:bg-primary/20 border border-primary/20 rounded-full text-[10px] font-black text-primary uppercase tracking-wider transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                                                            >
                                                                <Sparkles className="w-3 h-3" />
                                                                {suggestion}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between mt-4 border-t border-black/5 dark:border-white/5 pt-3">
                                                    <p className={cn(
                                                        "text-[9px] uppercase tracking-widest font-black opacity-40",
                                                        message.role === 'user' ? "text-black" : "text-gray-400"
                                                    )}>
                                                        {message.timestamp} — {message.role === 'assistant' ? "PROCESSED BY NEURAL CORE" : "SENT VIA CLIENT"}
                                                    </p>
                                                    {message.role === 'assistant' && (
                                                        <div className="flex gap-1">
                                                            <div className="h-1 w-1 rounded-full bg-primary" />
                                                            <div className="h-1 w-1 rounded-full bg-primary/40" />
                                                            <div className="h-1 w-1 rounded-full bg-primary/20" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Chat Input Area */}
                    <div className="p-8 bg-white dark:bg-[#141414] border-t border-gray-50 dark:border-[#1e1e1e]">
                        <div className="max-w-4xl mx-auto relative group flex items-center gap-3">
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-12 h-12 rounded-2xl text-gray-400 hover:text-primary hover:bg-primary/5 transition-all"
                                    title="Upload Document"
                                >
                                    <Paperclip className="w-5 h-5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-12 h-12 rounded-2xl text-gray-400 hover:text-primary hover:bg-primary/5 transition-all"
                                    title="Upload Photo"
                                >
                                    <ImageIcon className="w-5 h-5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-12 h-12 rounded-2xl text-gray-400 hover:text-primary hover:bg-primary/5 transition-all"
                                    title="Add Link"
                                >
                                    <LinkIcon className="w-5 h-5" />
                                </Button>
                            </div>
                            <div className="relative flex-1">
                                <Input
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder={t('ask_ai_placeholder')}
                                    className="w-full h-16 pl-6 pr-16 rounded-3xl bg-gray-50 dark:bg-[#09090b] border-gray-100 dark:border-gray-800 focus-visible:ring-[#F4D03F]/20 border-[#F4D03F]/20 transition-all text-base font-medium"
                                />
                                <Button
                                    id="send-ai-message"
                                    onClick={handleSendMessage}
                                    size="icon"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-primary hover:bg-primary/90 text-black shadow-lg transition-all active:scale-95 flex items-center justify-center"
                                >
                                    <Send className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Terms and Regulations Footer */}
            <div className="mt-8 text-center bg-white dark:bg-[#141414] py-4 rounded-3xl border border-gray-50 dark:border-[#1e1e1e] shadow-sm">
                <p className="text-xs font-bold text-gray-400 flex items-center justify-center gap-1">
                    {t('ai_terms_agree')}{' '}
                    <a href="#" className="text-amber-500 hover:underline">
                        {t('terms_regulations')}
                    </a>
                    .
                </p>
            </div>
        </div>
    );
};

export default AIAssistantView;

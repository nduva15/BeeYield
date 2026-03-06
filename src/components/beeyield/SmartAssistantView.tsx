import React from 'react';
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
    Zap,
    Hexagon
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
    const [chats, setChats] = React.useState<Chat[]>([]);
    const [selectedChat, setSelectedChat] = React.useState<string | null>(null);
    const [messages, setMessages] = React.useState<Message[]>([]);
    const [inputValue, setInputValue] = React.useState('');
    const [showWelcome, setShowWelcome] = React.useState(true);
    const [systemStatus, setSystemStatus] = React.useState<{ status: string, capabilities?: string[] }>({ status: 'online' });
    const { language, t } = useLanguage();
    const navigate = useNavigate();

    React.useEffect(() => {
        const checkStatus = async () => {
            const status = await aiService.getStatus();
            setSystemStatus(status);
        };
        checkStatus();
    }, []);

    React.useEffect(() => {
        const loadSessions = async () => {
            const sessions = await aiService.getSessions();
            setChats(sessions.map(s => ({
                id: s.id,
                title: s.title,
                date: new Date(s.updated_at || s.created_at).toLocaleDateString(),
                preview: '...',
                messages: []
            })));
        };
        loadSessions();
    }, []);

    React.useEffect(() => {
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

    const switchChat = async (chatId: string) => {
        const chat = chats.find(c => c.id === chatId);
        if (chat) {
            setSelectedChat(chatId);
            setShowWelcome(false);
            const data = await aiService.getSessionMessages(chatId);
            if (data && data.messages) {
                const msgs: Message[] = data.messages.map(m => ({
                    id: m.id,
                    role: m.role,
                    content: m.content,
                    timestamp: new Date(m.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
                    sources: typeof m.sources === 'string' ? JSON.parse(m.sources) : m.sources,
                    suggestions: typeof m.suggestions === 'string' ? JSON.parse(m.suggestions) : m.suggestions
                }));
                setMessages(msgs);
            } else {
                setMessages(chat.messages || []);
            }
        }
    };

    const deleteChat = async (e: React.MouseEvent, chatId: string) => {
        e.stopPropagation();
        const updatedChats = chats.filter(c => c.id !== chatId);
        setChats(updatedChats);

        // Remove from persistent DB via backend
        await aiService.deleteSession(chatId);

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
            const aiData = await aiService.chat(inputValue, history, language, selectedChat || undefined);

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: aiData.response,
                timestamp: new Date().toLocaleTimeString(),
                sources: aiData.sources,
                suggestions: aiData.suggestions
            };

            setMessages(prev => [...prev, aiMessage]);

            // Handle if a new session was created on backend
            if (aiData.session_id && !selectedChat) {
                setSelectedChat(aiData.session_id);
                setChats(prev => prev.map(c =>
                    c.id === currentId ? { ...c, id: aiData.session_id!, preview: aiData.response.substring(0, 50) + '...' } : c
                ));
            } else {
                setChats(prev => prev.map(c =>
                    c.id === (selectedChat || currentId)
                        ? { ...c, messages: [...c.messages, aiMessage], preview: aiData.response.substring(0, 50) + '...' }
                        : c
                ));
            }
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

    const FormattedMessage: React.FC<{ content: string, isUser: boolean, sources?: Message['sources'] }> = ({ content, isUser, sources }) => {
        if (isUser) return <p className="text-[15px] leading-relaxed font-medium">{content}</p>;

        const processBoldAndLinks = (text: string) => {
            const boldParts = text.split(/(\*\*[^*]+\*\*|\[.*?\]\(.*?\))/g);
            return boldParts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={i} className="font-black text-black">{part.slice(2, -2)}</strong>;
                }
                const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
                if (linkMatch) {
                    return (
                        <a key={i} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="border-b-2 border-black font-black hover:bg-black hover:text-white transition-none">
                            {linkMatch[1]}
                        </a>
                    );
                }
                return part;
            });
        };

        const processInternalLinks = (text: string) => {
            // Updated regex to be more inclusive of allowed URL characters
            const parts = text.split(/(\[Insert Link: beeyield\.com[a-zA-Z0-9\-\/\?\=\&\._@]+\])/g);

            return parts.map((part, j) => {
                const match = part.match(/\[Insert Link: beeyield\.com([a-zA-Z0-9\-\/\?\=\&\._@]+)\]/);
                if (match) {
                    const path = match[1];
                    // Create a nicer display name: /bee-health -> BEE HEALTH
                    const displayName = path.split('?')[0].split('/').filter(Boolean).pop()?.replace(/-/g, ' ').toUpperCase() || 'DOCUMENT';

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
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-black text-white font-black text-[10px] rounded-none uppercase tracking-widest hover:bg-[#FF4F00] transition-all mx-1 align-middle shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
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
        let inTakeaways = false;
        let inReferences = false;

        return (
            <div className="text-[15px] leading-[1.8] space-y-6 text-black">
                {lines.map((line, i) => {
                    const trimmedLine = line.trim();
                    if (!trimmedLine) return <div key={i} className="h-2" />;

                    // Detect start of sections
                    if (trimmedLine.toLowerCase().includes('key takeaways')) {
                        inTakeaways = true;
                        inReferences = false;
                    }
                    if (trimmedLine.includes('### 📚 References') || (trimmedLine.startsWith('---') && lines[i + 1]?.includes('References'))) {
                        inReferences = true;
                        inTakeaways = false;
                    }

                    // Section: References (Brutalist compact)
                    if (inReferences) {
                        if (trimmedLine.startsWith('###')) {
                            return <h4 key={i} className="text-xs font-black uppercase tracking-[0.2em] mt-10 mb-4 bg-black text-white px-4 py-2 inline-block">Verification Bibliography</h4>;
                        }
                        if (trimmedLine.startsWith('---')) return null;
                        return (
                            <div key={i} className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 border-l-2 border-neutral-200 pl-4 py-1">
                                {processInternalLinks(trimmedLine)}
                            </div>
                        );
                    }

                    // Section: Key Takeaways (Brutalist Callout)
                    if (inTakeaways) {
                        if (trimmedLine.toLowerCase().includes('key takeaways')) {
                            return <h4 key={i} className="text-xl font-black uppercase tracking-tighter mt-10 mb-6 flex items-center gap-4"><Sparkles className="w-5 h-5 text-[#FF4F00]" /> Intelligence Summary</h4>;
                        }
                        if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
                            return (
                                <div key={i} className="bg-neutral-100 border-l-8 border-black p-6 mb-4 shadow-[8px_8px_0px_0px_rgba(255,179,0,0.2)]">
                                    <div className="flex gap-4">
                                        <div className="w-2 h-2 bg-[#FF4F00] mt-2 shrink-0" />
                                        <p className="font-bold text-sm tracking-tight">{processInternalLinks(trimmedLine.substring(2))}</p>
                                    </div>
                                </div>
                            );
                        }
                        // Stop takeaways if we hit a new heading
                        if (trimmedLine.startsWith('#')) { inTakeaways = false; }
                    }

                    // Headings
                    if (trimmedLine.startsWith('###')) {
                        return <h4 key={i} className="text-xl font-black uppercase tracking-tighter mt-10 mb-4 border-b-4 border-black pb-2">{trimmedLine.replace('###', '').trim()}</h4>;
                    }
                    if (trimmedLine.startsWith('##')) {
                        return <h3 key={i} className="text-3xl font-black uppercase tracking-tighter mt-14 mb-6 leading-none italic">{trimmedLine.replace('##', '').trim()}</h3>;
                    }
                    if (trimmedLine.startsWith('#')) {
                        return <h2 key={i} className="text-5xl font-black uppercase tracking-tighter mt-20 mb-8 bg-black text-white p-6 inline-block">{trimmedLine.replace('#', '').trim()}</h2>;
                    }

                    // Standard Lists
                    if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
                        return (
                            <div key={i} className="flex gap-4 ml-6 items-start group">
                                <span className="w-1.5 h-1.5 bg-black mt-2.5 transition-all group-hover:bg-[#FF4F00] shrink-0" />
                                <div className="flex-1">
                                    {processInternalLinks(trimmedLine.substring(2))}
                                </div>
                            </div>
                        );
                    }

                    return <div key={i} className="font-medium">{processInternalLinks(line)}</div>;
                })}
            </div>
        );
    };

    return (
        <div className="flex flex-col animate-in fade-in duration-700 pb-16">
            {/* Header Area */}
            <div className="flex items-center justify-between mb-8 border-b-4 border-black pb-6">
                <div>
                    <h1 className="text-5xl font-black text-black uppercase tracking-tighter">
                        Chat
                    </h1>
                    <p className="text-neutral-400 font-bold uppercase text-[10px] tracking-widest mt-1">Status: Online</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 border-2 border-black">
                    <div className="w-2 h-2 bg-black" />
                    <span className="text-[10px] font-black text-black uppercase tracking-widest">System OK</span>
                </div>
            </div>

            {/* Clean Hero Area */}
            <div className="relative mb-12 border-4 border-black bg-black p-12 text-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
                    <div className="space-y-6 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FF4F00] border-2 border-black">
                            <span className="text-[10px] font-black uppercase tracking-widest">Expert Search</span>
                        </div>
                        <h2 className="text-6xl font-black tracking-tighter uppercase leading-[0.8]">
                            Search <br />Records.
                        </h2>
                        <p className="text-neutral-400 font-bold uppercase text-xs tracking-wide leading-relaxed max-w-lg">
                            Search through hive data, pollination records, and health telemetry.
                        </p>
                    </div>

                    <button
                        onClick={handleNewChat}
                        className="bg-white text-black border-4 border-black px-10 h-16 font-black uppercase tracking-widest text-lg flex items-center justify-center gap-3 transition-none hover:bg-[#FF4F00] hover:text-white"
                    >
                        <Plus className="w-6 h-6 stroke-[3px]" />
                        New Chat
                    </button>
                </div>
            </div>

            {/* Main Chat Interface */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 min-h-[700px]">
                {/* Sidebar - History */}
                <div className="lg:col-span-3 bg-white border-4 border-black flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <div className="p-6 border-b-4 border-black flex items-center justify-between bg-neutral-50">
                        <div className="flex items-center gap-3">
                            <MessageSquare className="w-5 h-5 text-black" />
                            <span className="text-xs font-black uppercase tracking-widest">History</span>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {chats.length === 0 ? (
                            <div className="text-center py-20 px-6">
                                <p className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">No Logs</p>
                            </div>
                        ) : (
                            chats.map((chat) => (
                                <div key={chat.id} className="relative group">
                                    <button
                                        onClick={() => switchChat(chat.id)}
                                        className={cn(
                                            "w-full text-left p-4 border-2 border-black transition-none",
                                            selectedChat === chat.id
                                                ? "bg-black text-white"
                                                : "hover:bg-neutral-50"
                                        )}
                                    >
                                        <div className="flex flex-col gap-1">
                                            <p className="text-[11px] font-bold uppercase truncate">
                                                {chat.title}
                                            </p>
                                            <p className={cn(
                                                "text-[8px] font-bold uppercase tracking-widest",
                                                selectedChat === chat.id ? "text-neutral-400" : "text-neutral-400"
                                            )}>{chat.date}</p>
                                        </div>
                                    </button>
                                    <button
                                        onClick={(e) => deleteChat(e, chat.id)}
                                        className="absolute right-2 top-2 p-1.5 bg-black border border-white text-white opacity-0 group-hover:opacity-100 transition-none hover:bg-red-600"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-9 bg-white border-4 border-black flex flex-col shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative">
                    <div className="flex-1 overflow-y-auto p-12 bg-neutral-50/50">
                        {showWelcome ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center max-w-xl">
                                    <div className="w-24 h-24 bg-black flex items-center justify-center shadow-[8px_8px_0px_0px_rgba(255,79,0,1)] mx-auto mb-10">
                                        <Hexagon className="w-10 h-10 text-white" />
                                    </div>
                                    <h3 className="text-5xl font-black text-black uppercase tracking-tighter mb-4">Search</h3>
                                    <p className="text-neutral-400 font-bold uppercase text-xs tracking-widest mb-12">Search hive records and health telemetry.</p>

                                    <div className="grid grid-cols-2 gap-6">
                                        {topicCategories.map((topic, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleTopicClick(topic.label)}
                                                className="p-8 border-2 border-black bg-white text-left hover:bg-[#FF4F00] hover:text-white transition-none group"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <span className="text-2xl">{topic.icon}</span>
                                                    <span className="text-[11px] font-black uppercase tracking-widest">{topic.label}</span>
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
                                            "w-12 h-12 flex items-center justify-center shrink-0 border-4 border-black",
                                            message.role === 'user' ? "bg-white" : "bg-black"
                                        )}>
                                            {message.role === 'user' ? (
                                                <span className="text-xs font-black text-black">U</span>
                                            ) : (
                                                <Bot className="w-6 h-6 text-white" />
                                            )}
                                        </div>

                                        <div className={cn(
                                            "flex-1 p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
                                            message.role === 'user'
                                                ? "bg-neutral-50"
                                                : "bg-white"
                                        )}>
                                            <FormattedMessage content={message.content} isUser={message.role === 'user'} sources={message.sources} />

                                            {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                                                <div className="mt-8 pt-6 border-t-2 border-black flex flex-wrap gap-2.5">
                                                    {message.sources.map((source, idx) => {
                                                        const getUrl = (type: string) => {
                                                            const t = (type || 'document').toLowerCase();
                                                            if (t === 'blockchain') return '/traceability';
                                                            if (t === 'iot') return '/beeyield-dashboard/meters';
                                                            if (t === 'research') return '/research-hub';
                                                            if (t === 'document' || t === 'database') return '/bee-data';
                                                            return '#';
                                                        };
                                                        return (

                                                            <button
                                                                key={idx}
                                                                onClick={() => {
                                                                    const url = getUrl(source.type);
                                                                    if (url.startsWith('/')) navigate(url);
                                                                }}
                                                                className="flex items-center gap-2 px-3 py-1.5 bg-black border-2 border-black hover:bg-[#FF4F00] transition-none group"
                                                            >
                                                                <div className="w-1.5 h-1.5 bg-white" />
                                                                <span className="text-[8px] font-black text-white uppercase tracking-widest">{source.name}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {message.role === 'assistant' && message.suggestions && message.suggestions.length > 0 && (
                                                <div className="mt-8 flex flex-wrap gap-2">
                                                    {message.suggestions.map((suggestion, idx) => (
                                                        <button
                                                            key={idx}
                                                            onClick={() => handleTopicClick(suggestion)}
                                                            className="px-4 py-2 border-2 border-black bg-white text-black text-[9px] font-bold uppercase tracking-widest hover:bg-[#FF4F00] hover:text-white transition-none"
                                                        >
                                                            {suggestion}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="mt-6 flex items-center justify-between border-t-2 border-black pt-4">
                                                <span className="text-[8px] font-black uppercase tracking-widest text-neutral-400">{message.timestamp}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Chat Input Area */}
                    <div className="p-10 bg-white border-t-4 border-black">
                        <div className="max-w-4xl mx-auto flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="w-14 h-14 border-2 border-black rounded-none text-black hover:bg-neutral-100 transition-none">
                                    <Paperclip className="w-6 h-6" />
                                </Button>
                                <Button variant="ghost" size="icon" className="w-14 h-14 border-2 border-black rounded-none text-black hover:bg-neutral-100 transition-none">
                                    <ImageIcon className="w-6 h-6" />
                                </Button>
                            </div>
                            <div className="relative flex-1">
                                <Input
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Enter your query..."
                                    className="w-full h-14 pl-6 pr-14 rounded-none bg-white border-2 border-black focus:ring-0 font-bold placeholder:text-neutral-300 transition-none"
                                />
                                <Button
                                    id="send-ai-message"
                                    onClick={handleSendMessage}
                                    className="absolute right-0 top-0 w-14 h-14 rounded-none bg-black hover:bg-[#FF4F00] text-white transition-none shadow-none"
                                >
                                    <Send className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center text-[9px] font-bold text-neutral-400 uppercase tracking-widest bg-white py-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                Archive Retrieval Layer — Search results are limited to available telemetry. <a href="#" className="underline ml-1 hover:text-black">Terms of Service</a>
            </div>
        </div>
    );
};

export default SmartAssistantView;

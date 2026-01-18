import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    MessageSquare,
    Send,
    Plus,
    Bot,
    Trash2,
    Paperclip,
    Image as ImageIcon,
    Link as LinkIcon,
    Mic
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
    const { language } = useLanguage();
    const navigate = useNavigate();

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
    }, [initialMessage]);

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
        { icon: '🌸', label: 'Precision Pollination Services', color: 'bg-gray-50 dark:bg-gray-800/10' },
        { icon: '📋', label: 'Blockchain & Honey Traceability', color: 'bg-gray-50 dark:bg-gray-800/10' },
        { icon: '🩺', label: 'Bee Health & Acoustic AI', color: 'bg-gray-50 dark:bg-gray-800/10' },
        { icon: '🛰️', label: 'IoT Smart Hive Technology', color: 'bg-gray-50 dark:bg-gray-800/10' },
        { icon: '🎓', label: 'Beekeeper Training & Consulting', color: 'bg-gray-50 dark:bg-gray-800/10' },
        { icon: '🌍', label: 'Global Network & Sustainability', color: 'bg-gray-50 dark:bg-gray-800/10' },
    ];

    const handleNewChat = () => {
        const newChat: Chat = {
            id: Date.now().toString(),
            title: 'New Conversation',
            date: new Date().toLocaleDateString(),
            preview: 'Start a new conversation...',
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
                    const isNewTitle = c.title === 'New Conversation';
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
            const aiResponse = await aiService.chat(inputValue, history, language);

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: aiResponse,
                timestamp: new Date().toLocaleTimeString()
            };

            setMessages(prev => [...prev, aiMessage]);
            setChats(prev => prev.map(c =>
                c.id === (selectedChat || currentId)
                    ? { ...c, messages: [...c.messages, aiMessage], preview: aiResponse.substring(0, 50) + '...' }
                    : c
            ));
        } catch (error) {
            const errorMessage: Message = {
                id: (Date.now() + 2).toString(),
                role: 'assistant',
                content: "I'm sorry, I'm having trouble thinking right now. Please try again.",
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

        const parts = content.split(/(\[Insert Link: beeyield\.com\/[a-zA-Z0-9\-\/]+\])/g);

        return (
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
                                className="text-amber-600 dark:text-amber-400 font-bold hover:underline underline-offset-4 decoration-2 px-1 rounded hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all cursor-pointer inline-flex items-center"
                            >
                                {match[1].replace(/-/g, ' ').toUpperCase()}
                            </a>
                        );
                    }
                    return <span key={i}>{part}</span>;
                })}
            </div>
        );
    };

    return (
        <div className="flex flex-col animate-in fade-in duration-500 pb-12">

            {/* Page Title */}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-8">
                BeeYield AI <span role="img" aria-label="robot">🤖</span>
            </h1>

            {/* Orange Hero Card */}
            <div className="relative mb-8 overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#FFA000] to-[#FF6F00] p-10 shadow-lg">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-4 max-w-2xl">
                        <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
                            BeeYield AI HUB INTELLIGENCE
                        </h2>
                        <p className="text-white font-bold opacity-90 uppercase tracking-widest text-xs">
                            Secure IoT Monitoring & Analysis | Neural Connectivity Active
                        </p>
                        <div className="flex flex-wrap gap-2 mt-6">
                            {topicCategories.map((topic, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleTopicClick(topic.label)}
                                    className="flex items-center gap-2 px-6 py-3 bg-[#0F172A]/80 hover:bg-[#0F172A] text-white text-sm font-bold rounded-full transition-all duration-200 backdrop-blur-sm"
                                >
                                    <span>{topic.icon}</span>
                                    <span>{topic.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <Button
                        onClick={handleNewChat}
                        className="bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-2xl px-8 h-14 font-bold flex items-center gap-2 shadow-xl shrink-0"
                    >
                        <Plus className="w-5 h-5" />
                        New Chat
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
                            <span className="font-bold">Chats</span>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {chats.length === 0 ? (
                            <div className="p-8 text-center">
                                <p className="text-gray-400 text-sm font-medium">Start a conversation!</p>
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
                                                <p className="text-[10px] text-amber-500/60 font-bold group-hover/chat:opacity-100 opacity-0 transition-opacity">
                                                    {chat.messages.length} msgs
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
                        <div className="p-6 border-b border-gray-50 dark:border-[#1e1e1e] flex items-center gap-4 bg-gray-50/50 dark:bg-white/5">
                            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-amber-900/40 border-2 border-amber-200 dark:border-amber-900/50 flex items-center justify-center p-3 shadow-md animate-in fade-in zoom-in duration-500">
                                <img src={Logo} alt="BEEYIELD" className="w-full h-full object-contain" />
                            </div>
                            <div>
                                <h3 className="font-black text-xl text-gray-900 dark:text-white uppercase tracking-tighter">
                                    BeeYield AI
                                </h3>
                                <p className="text-[10px] text-amber-500 font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    NEURAL CORE ONLINE
                                </p>
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
                                                BeeYield AI HUB
                                            </h3>
                                        </div>
                                        <p className="text-gray-500 dark:text-gray-400 font-bold text-xs uppercase tracking-[0.15em] opacity-70">
                                            Expert AI/ML Engineering Assistant
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {topicCategories.map((category, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => handleTopicClick(category.label)}
                                                    className="p-6 rounded-3xl bg-gray-50 dark:bg-[#1a1a1a] border border-gray-100 dark:border-gray-800 text-left transition-all duration-200 hover:border-amber-400 hover:shadow-md hover:bg-white dark:hover:bg-[#222]"
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
                                                I use proprietary ML algorithms to analyze sensor data, detect anomalies, and predict disease risks with engineering precision.
                                            </p>
                                        </div>
                                        <Button
                                            onClick={handleNewChat}
                                            className="bg-[#FFB300] hover:bg-[#FFA000] text-gray-900 rounded-2xl px-10 h-14 font-extrabold shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
                                        >
                                            New Chat
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        ) : (
                            <div className="space-y-6 max-w-4xl mx-auto h-full flex flex-col">
                                {messages.length === 0 ? (
                                    <div className="flex-1 flex items-center justify-center">
                                        <div className="px-6 py-3 bg-gray-200/50 dark:bg-gray-800 rounded-full text-gray-500 font-bold text-sm">
                                            New Chat
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
                                                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-amber-900/40 flex items-center justify-center shrink-0 shadow-md p-3 border-2 border-amber-100 dark:border-amber-900/50 animate-in fade-in zoom-in duration-500">
                                                    <img src={Logo} alt="BeeYield AI" className="w-full h-full object-contain" />
                                                </div>
                                            )}
                                            <div
                                                className={cn(
                                                    "max-w-[80%] p-6 rounded-[2rem] shadow-sm",
                                                    message.role === 'user'
                                                        ? "bg-[#FFB300] text-gray-900 font-medium rounded-br-none"
                                                        : "bg-white dark:bg-[#1e1e1e] text-gray-800 dark:text-gray-200 font-medium rounded-bl-none border border-gray-50 dark:border-gray-800"
                                                )}
                                            >
                                                <FormattedMessage content={message.content} isUser={message.role === 'user'} />
                                                <p className={cn(
                                                    "text-[10px] mt-3 uppercase tracking-widest font-bold opacity-60",
                                                    message.role === 'user' ? "text-gray-800" : "text-gray-400"
                                                )}>
                                                    {message.timestamp}
                                                </p>
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
                                    placeholder="Ask BeeYield AI... (Upload photos, docs or links)"
                                    className="w-full h-16 pl-6 pr-16 rounded-3xl bg-gray-50 dark:bg-[#09090b] border-gray-100 dark:border-gray-800 focus-visible:ring-amber-200 shadow-inner group-hover:border-amber-200 transition-all text-base font-medium"
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
                    By using AI Assistant, you agree to our{' '}
                    <a href="#" className="text-amber-500 hover:underline">
                        Terms and Regulations
                    </a>
                    .
                </p>
            </div>
        </div>
    );
};

export default AIAssistantView;

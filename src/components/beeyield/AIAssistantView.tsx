import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    MessageSquare,
    Send,
    Plus,
    Bot
} from 'lucide-react';
import { cn } from '@/lib/utils';
import FirstStepsBanner from './FirstStepsBanner';
import Logo from '@/assets/Logo.png';
import { aiService, ChatMessage } from '@/services/aiService';

interface AIAssistantViewProps {
    onTabChange: (tab: string) => void;
}

interface Chat {
    id: string;
    title: string;
    date: string;
    preview: string;
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
}

const AIAssistantView: React.FC<AIAssistantViewProps> = ({ onTabChange }) => {
    const [chats, setChats] = useState<Chat[]>([]);
    const [selectedChat, setSelectedChat] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [showWelcome, setShowWelcome] = useState(true);

    const topicCategories = [
        { icon: '🌸', label: 'Crop Pollination & Yield Benefits', color: 'bg-gray-50 dark:bg-gray-800/10' },
        { icon: '🐝', label: 'BeeYield Intelligent Hive Technology', color: 'bg-gray-50 dark:bg-gray-800/10' },
        { icon: '🩺', label: 'Hive Health & Disease Management', color: 'bg-gray-50 dark:bg-gray-800/10' },
        { icon: '📋', label: 'Honey Traceability & Quality Standards', color: 'bg-gray-50 dark:bg-gray-800/10' },
    ];

    const handleNewChat = () => {
        const newChat: Chat = {
            id: Date.now().toString(),
            title: 'New Conversation',
            date: new Date().toLocaleDateString(),
            preview: 'Start a new conversation...'
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

        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInputValue('');
        setShowWelcome(false);

        // Convert messages for API
        const history: ChatMessage[] = messages.map(m => ({
            role: m.role,
            content: m.content
        }));

        try {
            const aiResponse = await aiService.chat(inputValue, history);

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: aiResponse,
                timestamp: new Date().toLocaleTimeString()
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
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
    };

    return (
        <div className="flex flex-col animate-in fade-in duration-500 pb-12">
            {/* First Steps Banner */}
            <FirstStepsBanner onTabChange={onTabChange} />

            {/* Page Title */}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-8">
                AI Assistant <span role="img" aria-label="robot">🤖</span>
            </h1>

            {/* Orange Hero Card */}
            <div className="relative mb-8 overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#FFA000] to-[#FF6F00] p-10 shadow-lg">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-4 max-w-2xl">
                        <h2 className="text-3xl md:text-4xl font-bold text-white">
                            Your BeeYield AI assistant for smarter apiaries
                        </h2>
                        <p className="text-white font-medium">
                            Start a conversation with our AI Assistant to get help on topics like:
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
                                    <button
                                        key={chat.id}
                                        onClick={() => setSelectedChat(chat.id)}
                                        className={cn(
                                            "w-full text-left p-4 rounded-3xl transition-all duration-200",
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
                                        <p className="text-xs text-gray-400 ml-11 font-medium">
                                            {chat.date}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className="lg:col-span-9 bg-white dark:bg-[#141414] rounded-[2.5rem] border border-gray-100 dark:border-[#1e1e1e] overflow-hidden flex flex-col shadow-sm">
                    {/* Chat Header */}
                    {!showWelcome && (
                        <div className="p-6 border-b border-gray-50 dark:border-[#1e1e1e] flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-[#FFF8F0] dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 flex items-center justify-center p-2.5">
                                <img src={Logo} alt="BeeYield" className="w-full h-full object-contain" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                    {chats.find(c => c.id === selectedChat)?.title || 'New Chat'}
                                </h3>
                                <p className="text-xs text-gray-400 font-medium">
                                    {chats.find(c => c.id === selectedChat)?.date || 'a few seconds ago'}
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
                                            <div className="w-16 h-16 bg-[#FFF8F0] dark:bg-amber-900/20 rounded-3xl flex items-center justify-center text-4xl animate-bounce">
                                                👋
                                            </div>
                                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                                Welcome to BeeYield Hub!
                                            </h3>
                                        </div>
                                        <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">
                                            Start a conversation with our AI Assistant to get help on topics like:
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
                                        <div className="space-y-2">
                                            <p className="text-gray-400 font-medium text-xs">
                                                Ask a question, request advice or inquire about BeeYield Hub features.
                                            </p>
                                            <p className="text-gray-400 font-medium text-xs">
                                                Our AI Assistant is here to help you!
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
                                                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-amber-900/30 flex items-center justify-center shrink-0 shadow-sm p-2">
                                                    <img src={Logo} alt="BeeYield Assistant" className="w-full h-full object-contain" />
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
                                                <p className="text-sm leading-relaxed">{message.content}</p>
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
                    <div className="p-6 bg-white dark:bg-[#141414] border-t border-gray-50 dark:border-[#1e1e1e]">
                        <div className="max-w-4xl mx-auto relative group">
                            <Input
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Your Message"
                                className="w-full h-20 pl-6 pr-20 rounded-3xl bg-white dark:bg-[#09090b] border-gray-200 dark:border-gray-800 focus-visible:ring-amber-200 shadow-sm group-hover:border-amber-200 transition-all text-base font-medium pt-4 pb-4 items-start resize-none"
                            />
                            <Button
                                onClick={handleSendMessage}
                                size="icon"
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-xl bg-[#FDE68A] hover:bg-[#FCD34D] text-amber-900/80 shadow-sm transition-all active:scale-95"
                            >
                                <Send className="w-5 h-5 ml-0.5" />
                            </Button>
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

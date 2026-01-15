import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    MessageSquare,
    Send,
    Plus,
    Search,
    Settings,
    Bell,
    Headphones,
    Wifi,
    Puzzle,
    LogOut,
    Moon,
    Bot,
    ChevronRight,
    SearchIcon,
    Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import FirstStepsBanner from './FirstStepsBanner';

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
        { icon: '🐝', label: 'Beekeeping and honeybee farming', color: 'bg-gray-50 dark:bg-gray-800/10' },
        { icon: '🌾', label: 'Agriculture and modern technologies', color: 'bg-gray-50 dark:bg-gray-800/10' },
        { icon: '🌍', label: 'Sustainable farming practices and environmental protection', color: 'bg-gray-50 dark:bg-gray-800/10' },
        { icon: '💡', label: 'Innovations and solutions for apiaries', color: 'bg-gray-50 dark:bg-gray-800/10' },
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

    const handleSendMessage = () => {
        if (!inputValue.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: inputValue,
            timestamp: new Date().toLocaleTimeString()
        };

        setMessages([...messages, userMessage]);
        setInputValue('');
        setShowWelcome(false);

        setTimeout(() => {
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Thank you for your question! I\'m here to help you with beekeeping and apiary management. How can I assist you today?',
                timestamp: new Date().toLocaleTimeString()
            };
            setMessages(prev => [...prev, aiMessage]);
        }, 1000);
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
                            Your AI assistant for smarter apiaries
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
                                                ? "bg-[#FFF8F0] dark:bg-amber-900/10 shadow-sm"
                                                : "hover:bg-gray-50 dark:hover:bg-gray-800"
                                        )}
                                    >
                                        <p className="font-bold text-sm text-gray-900 dark:text-white truncate">
                                            {chat.title}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1 font-medium">
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
                    {/* Top Control Bar */}
                    <div className="p-4 border-b border-gray-50 dark:border-[#1e1e1e] flex flex-col gap-4">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 px-2">
                            Ask a question, request advice or inquire about BeeYield Hub features.
                        </p>
                        <div className="flex items-center gap-4 flex-wrap px-2">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Search apiaries, beehives"
                                    className="pl-12 h-12 bg-white dark:bg-[#09090b] border-gray-100 dark:border-gray-800 rounded-full text-sm shadow-sm"
                                />
                            </div>

                            <Button variant="outline" className="h-12 px-6 rounded-full border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] flex items-center gap-2 shadow-sm">
                                <img src="https://flagcdn.com/w20/gb.png" alt="English" className="w-5 h-auto rounded-sm" />
                                <span className="font-bold text-xs uppercase tracking-tight">English</span>
                            </Button>

                            <div className="flex items-center gap-2">
                                <button className="w-10 h-10 rounded-xl bg-white dark:bg-[#09090b] border border-gray-50 dark:border-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors shadow-sm">
                                    <Settings className="w-5 h-5" />
                                </button>
                                <button className="w-10 h-10 rounded-xl bg-white dark:bg-[#09090b] border border-gray-50 dark:border-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors shadow-sm">
                                    <Moon className="w-5 h-5" />
                                </button>
                                <button className="w-10 h-10 rounded-xl bg-white dark:bg-[#09090b] border border-gray-50 dark:border-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors shadow-sm">
                                    <Bell className="w-5 h-5" />
                                </button>
                                <button className="w-10 h-10 rounded-xl bg-white dark:bg-[#09090b] border border-gray-50 dark:border-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors shadow-sm">
                                    <Headphones className="w-5 h-5" />
                                </button>
                                <button className="w-10 h-10 rounded-xl bg-white dark:bg-[#09090b] border border-gray-50 dark:border-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors shadow-sm">
                                    <Wifi className="w-5 h-5" />
                                </button>
                                <button className="w-10 h-10 rounded-xl bg-white dark:bg-[#09090b] border border-gray-50 dark:border-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors shadow-sm">
                                    <Puzzle className="w-5 h-5" />
                                </button>
                                <button className="w-10 h-10 rounded-xl bg-white dark:bg-[#09090b] border border-gray-50 dark:border-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors shadow-sm">
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Messages Window */}
                    <div className="flex-1 overflow-y-auto p-10 bg-gray-50/30 dark:bg-black/20">
                        {showWelcome || messages.length === 0 ? (
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
                            <div className="space-y-6 max-w-4xl mx-auto">
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={cn(
                                            "flex gap-4",
                                            message.role === 'user' ? "justify-end" : "justify-start"
                                        )}
                                    >
                                        {message.role === 'assistant' && (
                                            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0 shadow-sm">
                                                <Bot className="w-6 h-6 text-amber-600" />
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
                                ))}
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
                                placeholder="Type your message here..."
                                className="w-full h-16 pl-6 pr-16 rounded-3xl bg-gray-50 dark:bg-[#09090b] border-gray-100 dark:border-gray-800 focus-visible:ring-amber-200 shadow-inner group-hover:border-amber-200 transition-all text-sm font-medium"
                            />
                            <Button
                                onClick={handleSendMessage}
                                size="icon"
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-2xl bg-[#FFB300] hover:bg-[#FFA000] text-gray-900 shadow-md transition-all active:scale-95"
                            >
                                <Send className="w-5 h-5" />
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

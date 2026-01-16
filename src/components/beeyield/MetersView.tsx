import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Droplet, Flame, Zap, AlertTriangle, TrendingUp, Send,
    Bot, ChevronDown, MessageCircle, ThermometerSun
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import MetersAlarms from './MetersAlarms';
import MetersPayments from './MetersPayments';
import MetersReports from './MetersReports';
import MetersSettings from './MetersSettings';

// Usage trend data
const usageTrendData = [
    { day: 'Day 1', value: 125 },
    { day: 'Day 3', value: 165 },
    { day: 'Day 5', value: 185 },
    { day: 'Day 7', value: 195 },
    { day: 'Day 9', value: 210 },
    { day: 'Day 11', value: 200 },
    { day: 'Day 13', value: 195 },
];

// Recent events data
const recentEvents = [
    {
        id: 1,
        type: 'Leak',
        severity: 'ALERT',
        location: 'Budynek A - staba 2',
        reason: 'Why?: Sudden spike in short time',
        time: '08:12'
    },
    {
        id: 2,
        type: 'No growth',
        severity: 'WARNING',
        location: 'Budynek B - piwnica',
        reason: 'Why?: No pulses for 12h',
        time: 'Wczoraj 21:40'
    },
    {
        id: 3,
        type: 'Tamper attempt',
        severity: 'ALERT',
        location: 'Budynek C - lokal 12',
        reason: 'Why?: Magnetic field event',
        time: 'Wczoraj 16:05'
    },
    {
        id: 4,
        type: 'No communication',
        severity: 'WARNING',
        location: 'Budynek D - winda',
        reason: 'Why?: No readings for last 6h',
        time: 'Wczoraj 13:22'
    },
    {
        id: 5,
        type: 'Pressure drop',
        severity: 'WARNING',
        location: 'Budynek A - hydrofornia',
        reason: 'Why?: Pressure drop in the zone',
        time: 'Wczoraj 11:10'
    },
];

// Suggested AI questions
const suggestedQuestions = [
    'How long does meter certification take?',
    'How to settle heat costs in a multi-unit building?',
    'Overlay module or built-in module meters?',
    'Mechanical or ultrasonic heat meter?',
    'How to detect a water leak quickly?',
];

interface MetersViewProps {
    onTabChange: (tab: string) => void;
    activeSubTab?: string;
}

const MetersView: React.FC<MetersViewProps> = ({ onTabChange, activeSubTab = 'meters-dashboard' }) => {
    // ... (keep state logic if needed, or move it inside the default dashboard view)
    // Actually, I should probably split the Dashboard content into its own component or just render it inline if subTab is default.
    // For simplicity, I will render the new components if the tab matches, otherwise function as before.

    // Import these dynamically or assume they are available if I was rewriting whole file, but here I am using replace.
    // I need to add imports at top, but I can't do that easily with a single contiguous block unless I replace the whole file or use multi_replace.
    // I'll assume I can just switch on activeSubTab here.

    if (activeSubTab === 'meters-alarms') {
        return <MetersAlarms />;
    }
    if (activeSubTab === 'meters-payments') {
        return <MetersPayments />;
    }
    if (activeSubTab === 'meters-reports') {
        return <MetersReports />;
    }
    if (activeSubTab === 'meters-settings') {
        return <MetersSettings />;
    }

    // Default Dashboard Logic
    const [usagePeriod, setUsagePeriod] = useState<'Daily' | 'Hourly'>('Daily');
    const [usageFilter, setUsageFilter] = useState<'Water' | 'Heat' | 'Energy' | 'Other'>('Water');
    const [aiMessage, setAiMessage] = useState('');
    const [chatMessages, setChatMessages] = useState([
        { role: 'assistant', content: 'Hi! I can help with meter operations and billing.' },
        { role: 'assistant', content: 'Ask about certification, settlement rules, or anomalies.' },
        { role: 'user', content: 'How long does meter certification take?' },
        { role: 'assistant', content: 'Certification usually takes 5-7 years depending on meter type.' },
    ]);

    const handleSendMessage = () => {
        if (aiMessage.trim()) {
            setChatMessages([...chatMessages, { role: 'user', content: aiMessage }]);
            setAiMessage('');
            // Simulate AI response
            setTimeout(() => {
                setChatMessages(prev => [...prev, {
                    role: 'assistant',
                    content: 'Thank you for your question. I\'ll analyze the meter data and get back to you shortly.'
                }]);
            }, 1000);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            {/* Title */}
            <h1 className="text-[2.5rem] font-bold text-[#0F172A] dark:text-white tracking-tight">Meters</h1>

            {/* Usage Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Water Usage Card */}
                <Card className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] shadow-sm p-5">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                                <Droplet className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Water usage</p>
                                <p className="text-[10px] text-gray-400">(today / month)</p>
                            </div>
                        </div>
                        <Badge className="bg-green-100 text-green-700 border-0 text-[10px] font-bold px-2">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
                            OK
                        </Badge>
                    </div>
                    <div className="mt-4">
                        <p className="text-xl font-black text-gray-900 dark:text-white">12.4 m3 / 384 m3</p>
                        <p className="text-xs text-green-500 font-medium mt-1">+21%</p>
                    </div>
                </Card>

                {/* Heat Usage Card */}
                <Card className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] shadow-sm p-5">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center">
                                <ThermometerSun className="w-5 h-5 text-orange-500" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Heat usage</p>
                            </div>
                        </div>
                        <Badge className="bg-green-100 text-green-700 border-0 text-[10px] font-bold px-2">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
                            OK
                        </Badge>
                    </div>
                    <div className="mt-4">
                        <p className="text-xl font-black text-gray-900 dark:text-white">8.9 GJ</p>
                        <p className="text-xs text-green-500 font-medium mt-1">+0.4%</p>
                    </div>
                </Card>

                {/* Electricity Usage Card */}
                <Card className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] shadow-sm p-5">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-yellow-50 dark:bg-yellow-950/30 flex items-center justify-center">
                                <Zap className="w-5 h-5 text-yellow-500" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Electricity</p>
                                <p className="text-[10px] text-gray-400">usage</p>
                            </div>
                        </div>
                        <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px] font-bold px-2">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-1"></span>
                            WARNING
                        </Badge>
                    </div>
                    <div className="mt-4">
                        <p className="text-xl font-black text-gray-900 dark:text-white">214 kWh</p>
                        <p className="text-xs text-green-500 font-medium mt-1">+4.8%</p>
                    </div>
                </Card>

                {/* Active Alarms Card */}
                <Card className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] shadow-sm p-5">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-red-500" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Active alarms</p>
                            </div>
                        </div>
                        <Badge className="bg-red-100 text-red-700 border-0 text-[10px] font-bold px-2">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1"></span>
                            ALERT
                        </Badge>
                    </div>
                    <div className="mt-4">
                        <p className="text-xl font-black text-gray-900 dark:text-white">3</p>
                        <p className="text-xs text-gray-400 font-medium mt-1">1 new</p>
                    </div>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Usage Trend Chart */}
                <Card className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] shadow-sm overflow-hidden">
                    <CardHeader className="p-6 pb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-gray-400" />
                                <CardTitle className="text-lg font-bold">Usage trend</CardTitle>
                            </div>
                        </div>

                        {/* Period Toggle */}
                        <div className="flex gap-2 mt-4">
                            <Button
                                variant={usagePeriod === 'Daily' ? 'default' : 'outline'}
                                size="sm"
                                className={cn(
                                    "rounded-lg h-8 px-4 text-xs font-medium",
                                    usagePeriod === 'Daily'
                                        ? "bg-gray-900 text-white hover:bg-gray-800"
                                        : "border-gray-200 dark:border-gray-700"
                                )}
                                onClick={() => setUsagePeriod('Daily')}
                            >
                                Daily
                            </Button>
                            <Button
                                variant={usagePeriod === 'Hourly' ? 'default' : 'outline'}
                                size="sm"
                                className={cn(
                                    "rounded-lg h-8 px-4 text-xs font-medium",
                                    usagePeriod === 'Hourly'
                                        ? "bg-gray-900 text-white hover:bg-gray-800"
                                        : "border-gray-200 dark:border-gray-700"
                                )}
                                onClick={() => setUsagePeriod('Hourly')}
                            >
                                Hourly
                            </Button>
                        </div>

                        {/* Resource Filter */}
                        <div className="flex items-center gap-4 mt-4">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">MEDIUM</span>
                            <div className="flex gap-2">
                                {(['Water', 'Heat', 'Energy', 'Other'] as const).map((filter) => (
                                    <Button
                                        key={filter}
                                        variant={usageFilter === filter ? 'default' : 'outline'}
                                        size="sm"
                                        className={cn(
                                            "rounded-lg h-7 px-3 text-xs font-medium",
                                            usageFilter === filter
                                                ? "bg-gray-900 text-white hover:bg-gray-800"
                                                : "border-gray-200 dark:border-gray-700 text-gray-500"
                                        )}
                                        onClick={() => setUsageFilter(filter)}
                                    >
                                        {filter}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                        <div className="h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={usageTrendData}>
                                    <defs>
                                        <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="day"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 600 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 600 }}
                                        domain={[120, 220]}
                                        ticks={[120, 140, 160, 180, 200, 220]}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: '1px solid #e5e7eb',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                            fontWeight: 600
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#3B82F6"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorUsage)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Events */}
                <Card className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] shadow-sm overflow-hidden">
                    <CardHeader className="p-6 pb-4">
                        <CardTitle className="text-lg font-bold">Recent events</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-0 max-h-[380px] overflow-y-auto custom-scrollbar">
                        <div className="space-y-4">
                            {recentEvents.map((event) => (
                                <div key={event.id} className="flex items-start justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
                                    <div className="flex items-start gap-3">
                                        <div className={cn(
                                            "w-2 h-2 rounded-full mt-2",
                                            event.severity === 'ALERT' ? "bg-red-500" : "bg-amber-500"
                                        )} />
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-gray-900 dark:text-white">{event.type}</span>
                                                <Badge className={cn(
                                                    "text-[10px] font-bold px-2 border-0",
                                                    event.severity === 'ALERT'
                                                        ? "bg-red-100 text-red-700"
                                                        : "bg-amber-100 text-amber-700"
                                                )}>
                                                    <span className={cn(
                                                        "w-1.5 h-1.5 rounded-full mr-1",
                                                        event.severity === 'ALERT' ? "bg-red-500" : "bg-amber-500"
                                                    )}></span>
                                                    {event.severity}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">{event.location}</p>
                                            <p className="text-[11px] text-gray-400 mt-0.5">{event.reason}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-400 font-medium whitespace-nowrap">{event.time}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* AI Assistant Section */}
            <Card className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] shadow-sm overflow-hidden">
                <CardHeader className="p-6 pb-4">
                    <div className="flex items-center gap-2">
                        <Bot className="w-5 h-5 text-gray-400" />
                        <CardTitle className="text-lg font-bold">AI assistant for meters</CardTitle>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Sample questions for administrators</p>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                    {/* Chat Messages */}
                    <div className="space-y-3 mb-4">
                        {chatMessages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    "py-3 px-4 rounded-2xl max-w-[80%]",
                                    msg.role === 'assistant'
                                        ? "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                                        : "bg-amber-50 dark:bg-amber-950/30 text-gray-700 dark:text-gray-300 ml-auto"
                                )}
                            >
                                <p className="text-sm">{msg.content}</p>
                            </div>
                        ))}
                    </div>

                    {/* Input Area */}
                    <div className="flex gap-3 items-center">
                        <Input
                            placeholder="Ask about meters, billing, anomalies..."
                            value={aiMessage}
                            onChange={(e) => setAiMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            className="flex-1 rounded-xl h-11 border-gray-200 dark:border-gray-700"
                        />
                        <Button
                            onClick={handleSendMessage}
                            className="bg-[#B48428] hover:bg-[#966b1d] text-white rounded-xl h-11 px-5"
                        >
                            Send
                        </Button>
                    </div>

                    {/* Suggested Questions */}
                    <div className="mt-4">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Suggested questions</p>
                        <div className="flex flex-wrap gap-2">
                            {suggestedQuestions.map((question, idx) => (
                                <Button
                                    key={idx}
                                    variant="outline"
                                    size="sm"
                                    className="rounded-full h-8 px-3 text-xs font-medium border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                                    onClick={() => setAiMessage(question)}
                                >
                                    {question}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Open AI Assistant Link */}
                    <Button
                        variant="link"
                        className="text-[#B48428] hover:text-[#966b1d] px-0 mt-4 text-sm font-medium"
                        onClick={() => onTabChange('assistant')}
                    >
                        Open AI Assistant
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default MetersView;

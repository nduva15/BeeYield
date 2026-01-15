import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    ChevronLeft,
    ChevronRight,
    Search,
    Sun,
    Moon,
    Bell,
    Headphones,
    Wifi,
    Settings,
    LogOut,
    Plus,
    ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import FirstStepsBanner from './FirstStepsBanner';

interface MyTaskViewProps {
    onTabChange: (tab: string) => void;
}

const MyTaskView: React.FC<MyTaskViewProps> = ({ onTabChange }) => {
    const [view, setView] = useState<'list' | 'month'>('month');
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Hardcoded for January 2026 as per screenshot
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // Generating calendar days for Jan 2026
    const calendarDays = [
        { date: 29, currentMonth: false }, { date: 30, currentMonth: false }, { date: 31, currentMonth: false },
        { date: 1, currentMonth: true }, { date: 2, currentMonth: true }, { date: 3, currentMonth: true }, { date: 4, currentMonth: true },
        { date: 5, currentMonth: true }, { date: 6, currentMonth: true }, { date: 7, currentMonth: true }, { date: 8, currentMonth: true }, { date: 9, currentMonth: true }, { date: 10, currentMonth: true }, { date: 11, currentMonth: true },
        { date: 12, currentMonth: true }, { date: 13, currentMonth: true }, { date: 14, currentMonth: true }, { date: 15, currentMonth: true }, { date: 16, currentMonth: true }, { date: 17, currentMonth: true }, { date: 18, currentMonth: true },
        { date: 19, currentMonth: true }, { date: 20, currentMonth: true }, { date: 21, currentMonth: true }, { date: 22, currentMonth: true }, { date: 23, currentMonth: true }, { date: 24, currentMonth: true }, { date: 25, currentMonth: true },
        { date: 26, currentMonth: true }, { date: 27, currentMonth: true }, { date: 28, currentMonth: true }, { date: 29, currentMonth: true }, { date: 30, currentMonth: true }, { date: 31, currentMonth: true }, { date: 1, currentMonth: false },
        { date: 2, currentMonth: false }, { date: 3, currentMonth: false }, { date: 4, currentMonth: false }, { date: 5, currentMonth: false }, { date: 6, currentMonth: false }, { date: 7, currentMonth: false }, { date: 8, currentMonth: false },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20 relative">
            <FirstStepsBanner onTabChange={onTabChange} />

            <div className="flex justify-between items-end px-2">
                <h1 className="text-[2.5rem] font-bold text-[#0F172A] dark:text-white tracking-tight">My Task</h1>
            </div>

            <div className="relative">
                <Card className="rounded-[2rem] border-none bg-white dark:bg-[#09090b] shadow-2xl overflow-hidden ring-1 ring-slate-100 dark:ring-gray-800">
                    {/* Calendar Header */}
                    <CardContent className="p-0">
                        <div className="flex items-center justify-between p-6 bg-[#FEF9E7] dark:bg-[#1a1a1a]">
                            <div className="flex gap-2">
                                <Button size="icon" className="w-10 h-10 rounded-lg bg-[#FDBA31] hover:bg-[#e5a82c] text-slate-800 border-none">
                                    <ChevronLeft className="w-5 h-5" />
                                </Button>
                                <Button size="icon" className="w-10 h-10 rounded-lg bg-[#FDBA31] hover:bg-[#e5a82c] text-slate-800 border-none">
                                    <ChevronRight className="w-5 h-5" />
                                </Button>
                            </div>

                            <h2 className="text-3xl font-semibold text-slate-800 dark:text-white">January 2026</h2>

                            <div className="flex bg-[#FDBA31] dark:bg-[#1e1e1e] p-1 rounded-lg">
                                <Button
                                    onClick={() => setView('list')}
                                    className={cn(
                                        "px-6 h-9 rounded-md text-xs font-bold transition-all border-none",
                                        view === 'list' ? "bg-[#FDBA31] text-slate-800" : "bg-transparent text-slate-700 dark:text-slate-400"
                                    )}
                                >
                                    LIST
                                </Button>
                                <Button
                                    onClick={() => setView('month')}
                                    className={cn(
                                        "px-6 h-9 rounded-md text-xs font-bold transition-all border-none",
                                        view === 'month' ? "bg-[#1E293B] text-white" : "bg-transparent text-slate-700 dark:text-slate-400"
                                    )}
                                >
                                    MONTH
                                </Button>
                            </div>
                        </div>

                        {/* Toolbar Row */}
                        <div className="flex flex-wrap items-center justify-between gap-4 py-4 px-6 bg-[#F8FAFC] dark:bg-[#111111] border-b border-slate-100 dark:border-gray-800">
                            <div className="relative flex-1 min-w-[250px]">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search apiaries, beehives"
                                    className="w-full pl-10 pr-4 h-12 bg-white dark:bg-[#1e1e1e] border border-slate-200 dark:border-gray-800 rounded-full text-sm focus:ring-2 focus:ring-amber-400 outline-none shadow-sm"
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Language Selector */}
                                <div className="flex items-center gap-2 bg-white dark:bg-[#1e1e1e] border border-slate-200 dark:border-gray-800 rounded-full px-4 h-12 shadow-sm cursor-pointer hover:bg-slate-50">
                                    <img src="https://flagcdn.com/w20/gb.png" alt="UK" className="w-5 h-auto rounded-sm" />
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">English</span>
                                    <ChevronDown className="w-4 h-4 text-slate-400" />
                                </div>

                                {/* Theme Toggle */}
                                <div className="flex bg-white dark:bg-[#1e1e1e] border border-slate-200 dark:border-gray-800 rounded-full p-1 h-12 shadow-sm">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className={cn("w-10 h-10 rounded-full", !isDarkMode ? "bg-amber-50 text-amber-600 shadow-sm" : "text-gray-400")}
                                        onClick={() => setIsDarkMode(false)}
                                    >
                                        <Sun className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className={cn("w-10 h-10 rounded-full", isDarkMode ? "bg-slate-800 text-white shadow-sm" : "text-gray-400")}
                                        onClick={() => setIsDarkMode(true)}
                                    >
                                        <Moon className="w-4 h-4" />
                                    </Button>
                                </div>

                                {/* Utility Icons */}
                                <div className="flex gap-2">
                                    <Button size="icon" className="w-12 h-12 rounded-2xl bg-white dark:bg-[#1e1e1e] border border-slate-200 dark:border-gray-800 text-slate-600 dark:text-slate-400 shadow-sm relative group">
                                        <Bell className="w-5 h-5 mx-1" />
                                        <ChevronDown className="w-3 h-3 text-slate-400" />
                                        <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#1e1e1e]"></span>
                                    </Button>
                                    <Button size="icon" className="w-12 h-12 rounded-2xl bg-white dark:bg-[#1e1e1e] border border-slate-200 dark:border-gray-800 text-slate-600 dark:text-slate-400 shadow-sm">
                                        <Headphones className="w-5 h-5" />
                                    </Button>
                                    <Button size="icon" className="w-12 h-12 rounded-2xl bg-white dark:bg-[#1e1e1e] border border-slate-200 dark:border-gray-800 text-slate-600 dark:text-slate-400 shadow-sm">
                                        <Wifi className="w-5 h-5 mx-1" />
                                        <ChevronDown className="w-3 h-3 text-slate-400" />
                                    </Button>
                                    <Button size="icon" className="w-12 h-12 rounded-2xl bg-white dark:bg-[#1e1e1e] border border-slate-200 dark:border-gray-800 text-slate-600 dark:text-slate-400 shadow-sm">
                                        <Settings className="w-5 h-5" />
                                    </Button>
                                    <Button size="icon" className="w-12 h-12 rounded-2xl bg-white dark:bg-[#1e1e1e] border border-slate-200 dark:border-gray-800 text-slate-600 dark:text-slate-400 shadow-sm">
                                        <LogOut className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Calendar Grid */}
                        <div className="bg-[#FEF9E7] dark:bg-[#0c0c0c]">
                            <div className="grid grid-cols-7">
                                {/* Day Labels */}
                                {days.map((day, i) => (
                                    <div key={day} className="h-10 flex items-center justify-center border-r border-b border-amber-100/50 dark:border-gray-800">
                                        <span className={cn(
                                            "text-sm font-medium",
                                            "text-[#3b82f6]"
                                        )}>
                                            {day}
                                        </span>
                                    </div>
                                ))}

                                {/* Date Cells */}
                                {calendarDays.map((day, i) => (
                                    <div key={i} className="min-h-[100px] p-2 text-right border-r border-b border-amber-100/50 dark:border-gray-800 relative group cursor-pointer hover:bg-white/50 transition-colors">
                                        <span className={cn(
                                            "text-sm font-medium",
                                            day.currentMonth ? "text-[#3b82f6]" : "text-[#3b82f6]/30"
                                        )}>
                                            {day.date}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Floating Action Button */}
                <Button size="icon" className="absolute -bottom-6 -right-6 w-16 h-16 rounded-full bg-[#FDBA31] hover:bg-[#e5a82c] text-slate-800 border-none shadow-xl flex items-center justify-center z-10">
                    <Plus className="w-8 h-8" />
                </Button>
            </div>
        </div>
    );
};

export default MyTaskView;

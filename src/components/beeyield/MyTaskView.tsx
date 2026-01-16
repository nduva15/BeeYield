import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    ChevronLeft,
    ChevronRight,
    Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import FirstStepsBanner from './FirstStepsBanner';

interface MyTaskViewProps {
    onTabChange: (tab: string) => void;
}

const MyTaskView: React.FC<MyTaskViewProps> = ({ onTabChange }) => {
    const [view, setView] = useState<'list' | 'month'>('month');

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

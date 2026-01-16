import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Box, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MyRequestsViewProps {
    onTabChange: (tab: string) => void;
}

const MyRequestsView: React.FC<MyRequestsViewProps> = ({ onTabChange }) => {
    return (
        <div className="space-y-12 animate-in fade-in duration-500 pb-12 px-2">

            <div className="space-y-10">
                <div className="flex justify-between items-center">
                    <h1 className="text-[2.5rem] font-bold text-[#0F172A] dark:text-white tracking-tight leading-none">My Requests</h1>
                    <div className="text-[#B48428] pr-4">
                        <ChevronDown className="w-5 h-5 opacity-40 rotate-180" />
                    </div>
                </div>

                <div className="flex flex-wrap gap-4">
                    {/* My Places Filter */}
                    <div className="flex items-center gap-4 px-5 py-3.5 bg-white dark:bg-[#09090b] border border-gray-200 dark:border-gray-800 rounded-[12px] min-w-[230px] shadow-sm hover:shadow-md transition-all cursor-pointer group">
                        <div className="w-5 h-5 flex items-center justify-center">
                            <LayoutGrid className="w-5 h-5 text-[#B48428]" strokeWidth={2.5} />
                        </div>
                        <span className="text-[11px] font-[800] text-[#64748B] uppercase tracking-[0.1em] flex-1">My Places</span>
                        <span className="text-[#94A3B8] font-medium text-sm pr-1">-</span>
                    </div>

                    {/* Hive Filter */}
                    <div className="flex items-center gap-4 px-5 py-3.5 bg-white dark:bg-[#09090b] border border-gray-200 dark:border-gray-800 rounded-[12px] min-w-[230px] shadow-sm hover:shadow-md transition-all cursor-pointer group">
                        <div className="w-5 h-5 flex items-center justify-center">
                            <Box className="w-5 h-5 text-[#B48428]" strokeWidth={2.5} />
                        </div>
                        <span className="text-[11px] font-[800] text-[#64748B] uppercase tracking-[0.1em] flex-1">Hive</span>
                        <span className="text-[#94A3B8] font-medium text-sm pr-1">-</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyRequestsView;

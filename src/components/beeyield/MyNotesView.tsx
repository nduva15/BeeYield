import React from 'react';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Plus, ChevronDown, Box } from 'lucide-react';
import FirstStepsBanner from './FirstStepsBanner';

interface MyNotesViewProps {
    onTabChange?: (tab: string) => void;
}

const MyNotesView: React.FC<MyNotesViewProps> = ({ onTabChange = () => { } }) => {
    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-24 relative min-h-[600px]">
            {/* Banner */}
            <FirstStepsBanner onTabChange={onTabChange} />

            {/* Title Section */}
            <div className="flex items-center gap-4">
                <h1 className="text-[2.5rem] font-bold text-[#0F172A] tracking-tight">My Notes</h1>
                <div className="w-5 h-5 border-2 border-[#B48428] border-t-transparent rounded-full animate-spin opacity-60" />
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-4 mt-8">
                <button className="flex items-center gap-3 px-6 py-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-orange-200 transition-all group min-w-[190px]">
                    <div className="w-8 h-8 rounded-md bg-[#B48428]/10 flex items-center justify-center">
                        <LayoutGrid className="w-4 h-4 text-[#B48428]" strokeWidth={2.5} />
                    </div>
                    <span className="text-[11px] font-black text-[#B48428] uppercase tracking-widest flex-1 text-left">My Places</span>
                    <span className="text-[#B48428] opacity-60 font-black">-</span>
                </button>

                <button className="flex items-center gap-3 px-6 py-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-orange-200 transition-all group min-w-[170px]">
                    <div className="w-8 h-8 rounded-md bg-[#B48428]/10 flex items-center justify-center">
                        <Box className="w-4 h-4 text-[#B48428]" strokeWidth={2.5} />
                    </div>
                    <span className="text-[11px] font-black text-[#B48428] uppercase tracking-widest flex-1 text-left font-montserrat">Hive</span>
                    <span className="text-[#B48428] opacity-60 font-black">-</span>
                </button>
            </div>

            {/* Floating Action Button */}
            <div className="fixed bottom-12 right-12 z-50">
                <Button
                    className="w-16 h-16 rounded-full bg-[#FBBF24] hover:bg-[#F59E0B] text-black shadow-2xl shadow-amber-500/40 flex items-center justify-center p-0 border-none transition-transform hover:scale-110 active:scale-95"
                >
                    <Plus className="w-8 h-8 stroke-[2.5]" />
                </Button>
            </div>
        </div>
    );
};

export default MyNotesView;

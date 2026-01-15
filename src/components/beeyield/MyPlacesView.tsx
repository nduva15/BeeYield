import React from 'react';
import { Plus } from 'lucide-react';
import FirstStepsBanner from './FirstStepsBanner';

interface MyPlacesViewProps {
    onTabChange: (tab: string) => void;
}

const MyPlacesView: React.FC<MyPlacesViewProps> = ({ onTabChange }) => {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
            <FirstStepsBanner onTabChange={onTabChange} />

            {/* Section Heading - Exact Font Weight and Size from Image */}
            <div className="mb-8 px-2">
                <h1 className="text-[44px] font-[900] text-[#1e293b] dark:text-white tracking-tight">
                    My Places
                </h1>
            </div>

            {/* Empty State Banner - Precise Pink Shade and Spacing */}
            <div className="bg-[#FEF2F2] dark:bg-red-950/20 border border-[#FEE2E2] dark:border-red-900/40 rounded-[2rem] py-16 flex items-center justify-center shadow-sm">
                <span className="text-[#F87171] dark:text-red-400 font-extrabold text-center text-lg tracking-[0.15em] px-8">
                    YOU DON'T HAVE ANY APIARIES YET.
                </span>
            </div>

            {/* Floating Action Button - Perfected Shadow and Icon Scale */}
            <div className="fixed bottom-12 right-12 flex items-center justify-center">
                <button
                    onClick={() => { }}
                    className="w-[72px] h-[72px] bg-[#F6AD55] hover:bg-[#ED8936] text-white rounded-[24px] shadow-[0_20px_40px_-10px_rgba(246,173,85,0.5)] flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-90 z-50 group overflow-hidden"
                >
                    <Plus className="w-10 h-10 text-white stroke-[3.5]" />
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
            </div>
        </div>
    );
};

export default MyPlacesView;

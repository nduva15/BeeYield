import React, { useState } from 'react';
import { LayoutGrid, Box, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MyRequestsViewProps {
    onTabChange: (tab: string) => void;
}

const MyRequestsView: React.FC<MyRequestsViewProps> = ({ onTabChange }) => {
    // No data available yet
    const hives: any[] = [];
    const places: string[] = [];
    const filteredHives: any[] = [];

    const [selectedPlace, setSelectedPlace] = useState<string>("");
    const [selectedHive, setSelectedHive] = useState<string>("");
    const [isPlacesOpen, setIsPlacesOpen] = useState(false);
    const [isHivesOpen, setIsHivesOpen] = useState(false);

    return (
        <div className="space-y-12 animate-in fade-in duration-500 pb-12 px-2 relative min-h-[600px]">

            <div className="space-y-10">
                <div className="flex justify-between items-center">
                    <h1 className="text-[2.5rem] font-bold text-[#0F172A] dark:text-white tracking-tight leading-none">My Requests</h1>
                    <div className="text-[#B48428] pr-4">
                        <ChevronDown className="w-5 h-5 opacity-40 rotate-180" />
                    </div>
                </div>

                <div className="flex flex-wrap gap-4">
                    {/* My Places Dropdown */}
                    <div className="relative group/dropdown min-w-[230px]">
                        <button
                            type="button"
                            onClick={() => {
                                setIsPlacesOpen(!isPlacesOpen);
                                setIsHivesOpen(false);
                            }}
                            className={cn(
                                "flex items-center gap-4 px-5 py-3.5 bg-white dark:bg-[#09090b] border border-gray-200 dark:border-gray-800 rounded-[12px] shadow-sm hover:shadow-md hover:border-orange-200 transition-all w-full cursor-pointer h-auto outline-none",
                                isPlacesOpen && "border-orange-200 ring-2 ring-orange-50 dark:ring-orange-900/20"
                            )}
                        >
                            <div className="w-5 h-5 flex items-center justify-center">
                                <LayoutGrid className="w-5 h-5 text-[#B48428]" strokeWidth={2.5} />
                            </div>
                            <div className="flex flex-col items-start flex-1 min-w-0">
                                <span className="text-[11px] font-[800] text-[#64748B] uppercase tracking-[0.1em] text-left">My Places</span>
                                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate w-full text-left -mt-0.5">
                                    {selectedPlace || "-"}
                                </span>
                            </div>
                            <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-300", isPlacesOpen && "rotate-180 text-[#B48428]")} />
                        </button>

                        <AnimatePresence>
                            {isPlacesOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#09090b] border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl z-50 overflow-hidden"
                                >
                                    <div className="p-2 max-h-[300px] overflow-y-auto">
                                        <button
                                            onClick={() => {
                                                setSelectedPlace("");
                                                setIsPlacesOpen(false);
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 dark:hover:bg-orange-900/10 rounded-lg transition-colors group"
                                        >
                                            <div className="w-2 h-2 rounded-full bg-slate-300 group-hover:bg-orange-400" />
                                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">All Places</span>
                                            {!selectedPlace && <Check className="w-4 h-4 ml-auto text-orange-500" />}
                                        </button>

                                        {places.length === 0 && (
                                            <div className="px-4 py-8 text-center text-slate-400 text-xs font-bold uppercase tracking-wider">
                                                No places found
                                            </div>
                                        )}

                                        {places.map((place) => (
                                            <button
                                                key={place}
                                                onClick={() => {
                                                    setSelectedPlace(place);
                                                    setIsPlacesOpen(false);
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 dark:hover:bg-orange-900/10 rounded-lg transition-colors group"
                                            >
                                                <LayoutGrid className="w-4 h-4 text-slate-400 group-hover:text-orange-500" />
                                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{place}</span>
                                                {selectedPlace === place && <Check className="w-4 h-4 ml-auto text-orange-500" />}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Hive Dropdown */}
                    <div className="relative group/dropdown min-w-[230px]">
                        <button
                            type="button"
                            onClick={() => {
                                setIsHivesOpen(!isHivesOpen);
                                setIsPlacesOpen(false);
                            }}
                            className={cn(
                                "flex items-center gap-4 px-5 py-3.5 bg-white dark:bg-[#09090b] border border-gray-200 dark:border-gray-800 rounded-[12px] shadow-sm hover:shadow-md hover:border-orange-200 transition-all w-full cursor-pointer h-auto outline-none",
                                isHivesOpen && "border-orange-200 ring-2 ring-orange-50 dark:ring-orange-900/20"
                            )}
                        >
                            <div className="w-5 h-5 flex items-center justify-center">
                                <Box className="w-5 h-5 text-[#B48428]" strokeWidth={2.5} />
                            </div>
                            <div className="flex flex-col items-start flex-1 min-w-0">
                                <span className="text-[11px] font-[800] text-[#64748B] uppercase tracking-[0.1em] text-left">Hive</span>
                                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate w-full text-left -mt-0.5">
                                    {selectedHive || "-"}
                                </span>
                            </div>
                            <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-300", isHivesOpen && "rotate-180 text-[#B48428]")} />
                        </button>

                        <AnimatePresence>
                            {isHivesOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#09090b] border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl z-50 overflow-hidden"
                                >
                                    <div className="p-2 max-h-[300px] overflow-y-auto">
                                        <button
                                            onClick={() => {
                                                setSelectedHive("");
                                                setIsHivesOpen(false);
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 dark:hover:bg-orange-900/10 rounded-lg transition-colors group"
                                        >
                                            <div className="w-2 h-2 rounded-full bg-slate-300 group-hover:bg-orange-400" />
                                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">All Hives</span>
                                            {!selectedHive && <Check className="w-4 h-4 ml-auto text-orange-500" />}
                                        </button>

                                        {filteredHives.length === 0 && (
                                            <div className="px-4 py-8 text-center text-slate-400 text-xs font-bold uppercase tracking-wider">
                                                No hives found
                                            </div>
                                        )}

                                        {filteredHives.map((hive) => (
                                            <button
                                                key={hive.id}
                                                onClick={() => {
                                                    setSelectedHive(hive.hive_code);
                                                    setIsHivesOpen(false);
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 dark:hover:bg-orange-900/10 rounded-lg transition-colors group"
                                            >
                                                <Box className="w-4 h-4 text-slate-400 group-hover:text-orange-500" />
                                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{hive.hive_code}</span>
                                                {selectedHive === hive.hive_code && <Check className="w-4 h-4 ml-auto text-orange-500" />}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Backdrop for click-away */}
            {(isPlacesOpen || isHivesOpen) && (
                <div
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={() => {
                        setIsPlacesOpen(false);
                        setIsHivesOpen(false);
                    }}
                />
            )}
        </div>
    );
};

export default MyRequestsView;

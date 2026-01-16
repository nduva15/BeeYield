import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Grid3X3, StickyNote, CheckSquare, Box, MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BeeYieldHivesViewProps {
    onTabChange: (tab: string) => void;
}

const BeeYieldHivesView: React.FC<BeeYieldHivesViewProps> = ({ onTabChange }) => {
    const [selectedPlace, setSelectedPlace] = useState('my-places');
    const [showFab, setShowFab] = useState(false);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12 relative">
            {/* Page Title */}
            <div className="flex justify-between items-center">
                <h1 className="text-[2.5rem] font-bold text-[#0F172A] dark:text-white tracking-tight">BeeYield</h1>
                {/* Loading spinner */}
                <Loader2 className="w-5 h-5 text-[#C4A77D] animate-spin" />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Side - Loading Data Card */}
                <Card className="rounded-2xl border border-gray-100 dark:border-[#1e1e1e] bg-white dark:bg-[#09090b] shadow-sm min-h-[200px]">
                    <CardContent className="p-6 flex items-center justify-start h-full">
                        <span className="text-gray-400 dark:text-gray-500 italic text-sm">Loading data</span>
                    </CardContent>
                </Card>

                {/* Right Side - My Places Card */}
                <Card className="rounded-2xl border border-gray-100 dark:border-[#1e1e1e] bg-white dark:bg-[#09090b] shadow-sm">
                    <CardContent className="p-6 space-y-5">
                        {/* Card Header */}
                        <div>
                            <h3 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.15em] mb-1">MY PLACES</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Choose a place from the list below to browse its hives.</p>
                        </div>

                        {/* Place Selector */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">My Places</label>
                            <Select value={selectedPlace} onValueChange={setSelectedPlace}>
                                <SelectTrigger className="w-full rounded-xl border-gray-200 dark:border-gray-700 h-11 bg-white dark:bg-[#1e1e1e]">
                                    <div className="flex items-center gap-2">
                                        <Grid3X3 className="w-4 h-4 text-gray-400" />
                                        <SelectValue placeholder="Select a place" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="my-places">My Places</SelectItem>
                                    <SelectItem value="apiary-1">North Orchard Apiary</SelectItem>
                                    <SelectItem value="apiary-2">Backyard Bees</SelectItem>
                                    <SelectItem value="apiary-3">River Side Hives</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 pt-2">
                            <Button
                                className="bg-[#F5C842] hover:bg-[#E5B832] text-black rounded-full px-5 h-10 font-bold text-sm shadow-none border-none"
                                onClick={() => onTabChange('assistant')}
                            >
                                AI ASSISTANT
                            </Button>
                            <Button
                                variant="outline"
                                className="rounded-full px-5 h-10 font-medium text-sm border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#1e1e1e]"
                            >
                                Raport
                            </Button>
                            <Button
                                className="bg-[#4ADE80] hover:bg-[#22C55E] text-black rounded-full px-5 h-10 font-bold text-sm shadow-none border-none"
                            >
                                Export Excel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Floating Action Buttons - Right Side */}
            <div className="fixed right-6 bottom-6 flex flex-col items-end gap-3 z-50">
                {/* Expanded FAB Menu */}
                <div className={cn(
                    "flex flex-col gap-3 transition-all duration-300",
                    showFab ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
                )}>
                    <Button
                        onClick={() => onTabChange('notes')}
                        className="bg-[#F97B5C] hover:bg-[#E86B4C] text-white rounded-full pl-4 pr-5 h-11 font-bold text-sm shadow-lg flex items-center gap-2"
                    >
                        <StickyNote className="w-4 h-4" />
                        ADD NOTES
                    </Button>
                    <Button
                        onClick={() => onTabChange('task')}
                        className="bg-[#F5C842] hover:bg-[#E5B832] text-black rounded-full pl-4 pr-5 h-11 font-bold text-sm shadow-lg flex items-center gap-2"
                    >
                        <CheckSquare className="w-4 h-4" />
                        TASK
                    </Button>
                    <Button
                        className="bg-[#C4A77D] hover:bg-[#B4975D] text-white rounded-full pl-4 pr-5 h-11 font-bold text-sm shadow-lg flex items-center gap-2"
                    >
                        <Box className="w-4 h-4" />
                        HIVE
                    </Button>
                    <Button
                        onClick={() => onTabChange('places')}
                        className="bg-[#3D3D3D] hover:bg-[#2D2D2D] text-white rounded-full pl-4 pr-5 h-11 font-bold text-sm shadow-lg flex items-center gap-2"
                    >
                        <MapPin className="w-4 h-4 text-[#4ADE80]" />
                        PLACE
                    </Button>
                </div>

                {/* Main FAB Button */}
                <Button
                    onClick={() => setShowFab(!showFab)}
                    className={cn(
                        "w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300",
                        showFab
                            ? "bg-gray-800 hover:bg-gray-700 rotate-45"
                            : "bg-[#F97B5C] hover:bg-[#E86B4C]"
                    )}
                >
                    <Plus className="w-6 h-6 text-white" />
                </Button>
            </div>
        </div>
    );
};

export default BeeYieldHivesView;

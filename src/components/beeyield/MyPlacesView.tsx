import React, { useState } from 'react';
import { Plus, MapPin } from 'lucide-react';
import FirstStepsBanner from './FirstStepsBanner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

interface MyPlacesViewProps {
    onTabChange: (tab: string) => void;
}

const MyPlacesView: React.FC<MyPlacesViewProps> = ({ onTabChange }) => {
    const [isAddingPlace, setIsAddingPlace] = useState(false);

    if (isAddingPlace) {
        return (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
                {/* Header for Form */}
                <div className="mb-8 px-2">
                    <h1 className="text-[32px] font-[900] text-[#1e293b] dark:text-white tracking-tight">
                        Add Place
                    </h1>
                </div>

                <Card className="border-none shadow-sm bg-white dark:bg-[#1e1e1e] rounded-[2rem] overflow-hidden max-w-2xl mx-2">
                    <CardContent className="p-8 space-y-8">
                        <div className="space-y-3">
                            <Label htmlFor="name" className="text-base font-bold text-slate-700 dark:text-slate-200">
                                Name<span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                placeholder="Enter place name"
                                className="h-14 rounded-xl border-slate-200 dark:border-slate-700 max-w-md text-base bg-slate-50/50 dark:bg-slate-900/50"
                            />
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="location" className="text-base font-bold text-slate-700 dark:text-slate-200">
                                Location
                            </Label>
                            <Input
                                id="location"
                                placeholder="Select location"
                                className="h-14 rounded-xl border-slate-200 dark:border-slate-700 max-w-md text-base bg-slate-50/50 dark:bg-slate-900/50"
                            />
                        </div>

                        <div className="pt-8 flex items-center gap-4">
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => setIsAddingPlace(false)}
                                className="h-12 rounded-xl font-bold border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 px-8 text-base text-slate-600 dark:text-slate-300"
                            >
                                Go back
                            </Button>
                            <Button
                                size="lg"
                                className="h-12 rounded-xl font-bold bg-[#F6AD55] hover:bg-[#ED8936] text-white min-w-[160px] text-base shadow-lg shadow-orange-200 dark:shadow-none"
                                onClick={() => setIsAddingPlace(false)}
                            >
                                Save form
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20 min-h-[80vh]">
            <FirstStepsBanner onTabChange={onTabChange} />

            {/* Section Heading - Exact Font Weight and Size from Image */}
            <div className="mb-8 px-2">
                <h1 className="text-[44px] font-[900] text-[#1e293b] dark:text-white tracking-tight">
                    My Places
                </h1>
            </div>

            {/* Empty State Banner - Precise Pink Shade and Spacing */}
            <div className="bg-[#FEF2F2] dark:bg-red-950/20 border border-[#FEE2E2] dark:border-red-900/40 rounded-[2rem] py-16 flex items-center justify-center shadow-sm mx-2">
                <span className="text-[#F87171] dark:text-red-400 font-extrabold text-center text-lg tracking-[0.15em] px-8 uppercase">
                    You don't have any apiaries yet.
                </span>
            </div>

            {/* Floating Actions */}
            <div className="fixed bottom-12 right-12 flex flex-col items-end gap-3 z-50">
                {/* PLACE Label/Button */}
                <button
                    onClick={() => setIsAddingPlace(true)}
                    className="bg-[#2D3748] dark:bg-[#1e293b] text-white pl-4 pr-6 py-3 rounded-lg font-bold shadow-xl flex items-center gap-3 hover:scale-105 transition-transform mr-2"
                >
                    <MapPin className="w-5 h-5 text-[#F6E05E] fill-current" />
                    <span className="tracking-[0.2em] text-sm font-black">PLACE</span>
                </button>

                {/* FAB - Adjusted to rounded-[24px] to match original code which likely matched design system */}
                <button
                    onClick={() => setIsAddingPlace(true)}
                    className="w-[72px] h-[72px] bg-[#F6AD55] hover:bg-[#ED8936] text-white rounded-full shadow-[0_20px_40px_-10px_rgba(246,173,85,0.5)] flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-90 group overflow-hidden"
                >
                    <Plus className="w-10 h-10 text-white stroke-[3.5]" />
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
            </div>
        </div>
    );
};

export default MyPlacesView;

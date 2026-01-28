import React, { useState } from 'react';
import { Plus, MapPin, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Search, Info, NotepadText } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface MyPlacesViewProps {
    onTabChange: (tab: string) => void;
}

const MyPlacesView: React.FC<MyPlacesViewProps> = ({ onTabChange }) => {
    const [isAddingPlace, setIsAddingPlace] = useState(false);
    const [isFabExpanded, setIsFabExpanded] = useState(false);

    if (isAddingPlace) {
        return (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
                {/* Header for Form */}
                <div className="mb-8 px-2">
                    <h1 className="text-3xl font-bold text-[#1e293b] dark:text-white tracking-tight">
                        Add Place
                    </h1>
                </div>

                <Card className="border-none shadow-sm bg-white dark:bg-[#1e1e1e] rounded-[2rem] overflow-hidden max-w-4xl mx-2">
                    <CardContent className="p-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                            {/* Left Column */}
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <Label htmlFor="name" className="text-sm font-[800] text-slate-500 uppercase tracking-widest">
                                        Apiary Name<span className="text-red-500 ml-1">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g. Nanyuki North Field"
                                        className="h-14 rounded-2xl border-slate-100 dark:border-slate-800 text-base bg-slate-50/50 dark:bg-slate-900/50"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="type" className="text-sm font-[800] text-slate-500 uppercase tracking-widest">
                                        Apiary Type
                                    </Label>
                                    <Select>
                                        <SelectTrigger className="h-14 rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="permanent">Permanent</SelectItem>
                                            <SelectItem value="migratory">Migratory</SelectItem>
                                            <SelectItem value="breeding">Breeding</SelectItem>
                                            <SelectItem value="quarantine">Quarantine</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="hives" className="text-sm font-[800] text-slate-500 uppercase tracking-widest">
                                        Expected Hives
                                    </Label>
                                    <Input
                                        id="hives"
                                        type="number"
                                        placeholder="0"
                                        className="h-14 rounded-2xl border-slate-100 dark:border-slate-800 text-base bg-slate-50/50 dark:bg-slate-900/50"
                                    />
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <Label htmlFor="location" className="text-sm font-[800] text-slate-500 uppercase tracking-widest">
                                        Location / Coordinates
                                    </Label>
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <Input
                                            id="location"
                                            placeholder="Search location..."
                                            className="h-14 pl-12 rounded-2xl border-slate-100 dark:border-slate-800 text-base bg-slate-50/50 dark:bg-slate-900/50"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="forage" className="text-sm font-[800] text-slate-500 uppercase tracking-widest">
                                        Primary Forage
                                    </Label>
                                    <Input
                                        id="forage"
                                        placeholder="e.g. Acacia, Sunflowers"
                                        className="h-14 rounded-2xl border-slate-100 dark:border-slate-800 text-base bg-slate-50/50 dark:bg-slate-900/50"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="notes" className="text-sm font-[800] text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <NotepadText className="w-4 h-4" /> Notes
                                    </Label>
                                    <Textarea
                                        id="notes"
                                        placeholder="Add any special instructions or observations..."
                                        className="min-h-[120px] rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-slate-50 dark:border-slate-800 flex items-center justify-end gap-6">
                            <Button
                                variant="ghost"
                                onClick={() => setIsAddingPlace(false)}
                                className="h-14 px-8 rounded-2xl font-bold text-slate-500 hover:text-slate-900 transition-all"
                            >
                                Discard
                            </Button>
                            <Button
                                onClick={() => setIsAddingPlace(false)}
                                className="h-14 px-10 rounded-2xl font-[900] bg-[#F4D03F] hover:bg-[#D4AF37] text-white shadow-xl shadow-[#F4D03F]/40 dark:shadow-none tracking-widest uppercase text-xs"
                            >
                                Deploy Apiary
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20 min-h-[80vh]">

            {/* Section Heading - Exact Font Weight and Size from Image */}
            <div className="mb-8 px-2">
                <h1 className="text-3xl font-bold text-[#1e293b] dark:text-white tracking-tight">
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
                <AnimatePresence>
                    {isFabExpanded && (
                        <>
                            {/* Backdrop for click-out */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsFabExpanded(false)}
                                className="fixed inset-0 z-[-1] bg-transparent"
                            />

                            {/* PLACE Label/Button */}
                            <motion.button
                                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.5, y: 20 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                onClick={() => {
                                    setIsAddingPlace(true);
                                    setIsFabExpanded(false);
                                }}
                                className="bg-[#2D3748] dark:bg-[#1e293b] text-white pl-4 pr-6 py-3 rounded-2xl font-bold shadow-2xl flex items-center gap-3 hover:scale-105 transition-transform mr-1 mb-2"
                            >
                                <MapPin className="w-4 h-4 text-[#F4D03F] fill-current" />
                                <span className="tracking-[0.2em] text-[11px] font-black">PLACE</span>
                            </motion.button>
                        </>
                    )}
                </AnimatePresence>

                {/* FAB Main Button */}
                <button
                    onClick={() => setIsFabExpanded(!isFabExpanded)}
                    className={cn(
                        "w-[64px] h-[64px] text-white rounded-full shadow-[0_15px_30px_-5px_rgba(246,173,85,0.4)] flex items-center justify-center transition-all duration-500 active:scale-90 group overflow-hidden relative",
                        isFabExpanded ? "bg-[#2D3748] rotate-90 shadow-xl" : "bg-[#F4D03F] hover:bg-[#D4AF37]"
                    )}
                >
                    <AnimatePresence mode="wait">
                        {isFabExpanded ? (
                            <motion.div
                                key="close"
                                initial={{ rotate: -90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: 90, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <X className="w-7 h-7 text-white stroke-[3.5]" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="plus"
                                initial={{ rotate: 90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: -90, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Plus className="w-7 h-7 text-white stroke-[3.5]" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
            </div>
        </div>
    );
};

export default MyPlacesView;

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Plus, ChevronDown, Box, MapPin, Loader2, Check, Clock as ClockIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar as CalendarIcon } from 'lucide-react';

interface MyNotesViewProps {
    onTabChange?: (tab: string) => void;
}

interface Place {
    id: string;
    name: string;
}

interface Hive {
    id: string;
    hive_code: string;
    apiary_id: string;
    hive_name?: string;
}

interface Note {
    id: string;
    title?: string;
    description: string;
    note_date: string;
    note_time: string;
    priority: "low" | "medium" | "high";
    category: string;
    apiary_id?: string;
    hive_id?: string;
    created_at: string;
    place_name?: string; // For display, joined manually or via view
    hive_code?: string; // For display
}

const MyNotesView: React.FC<MyNotesViewProps> = ({ onTabChange = () => { } }) => {
    const [places, setPlaces] = useState<Place[]>([]);
    const [hives, setHives] = useState<Hive[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPlacesOpen, setIsPlacesOpen] = useState(false);
    const [isHivesOpen, setIsHivesOpen] = useState(false);
    const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
    const [selectedHive, setSelectedHive] = useState<Hive | null>(null);
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [noteDate, setNoteDate] = useState<Date>(new Date());
    const [noteTime, setNoteTime] = useState("12:00");
    const [isClockMinutes, setIsClockMinutes] = useState(false);
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
    const [category, setCategory] = useState("General");

    useEffect(() => {
        const fetchData = async () => {
            if (!supabase) return;
            setLoading(true);
            try {
                const [placesRes, hivesRes, notesRes] = await Promise.all([
                    supabase.from('apiaries').select('id, name'),
                    supabase.from('hives').select('id, hive_code, apiary_id'),
                    supabase.from('notes').select('*').order('created_at', { ascending: false })
                ]);

                if (placesRes.data) setPlaces(placesRes.data);
                if (hivesRes.data) setHives(hivesRes.data as Hive[]);

                // Process notes to add place/hive names (simple client-side join for now)
                if (notesRes.data) {
                    const placesMap = new Map((placesRes.data || []).map(p => [p.id, p.name]));
                    const hivesMap = new Map((hivesRes.data || []).map(h => [h.id, h.hive_code]));

                    const enrichedNotes = notesRes.data.map((note: any) => ({
                        ...note,
                        place_name: note.apiary_id ? placesMap.get(note.apiary_id) : undefined,
                        hive_code: note.hive_id ? hivesMap.get(note.hive_id) : undefined
                    }));
                    setNotes(enrichedNotes);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (isAddingNote) {
        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 relative">
                <div className="flex items-center justify-between px-2">
                    <div className="flex flex-col gap-1">
                        <button
                            type="button"
                            onClick={() => setIsAddingNote(false)}
                            className="text-sm font-bold text-slate-400 hover:text-orange-500 transition-colors flex items-center gap-1 mb-2 uppercase tracking-widest outline-none border-none bg-transparent cursor-pointer"
                        >
                            <ChevronDown className="w-4 h-4 rotate-90" /> Back to Notes
                        </button>
                        <h1 className="text-[2.5rem] font-bold text-[#0F172A] leading-tight tracking-tight">Add Note</h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Form Area */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8">
                            {/* Date and Time Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Note Date</label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button
                                                type="button"
                                                className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-100 transition-all font-sans flex items-center justify-between"
                                            >
                                                <span>{format(noteDate, "dd/MM/yyyy")}</span>
                                                <CalendarIcon className="w-5 h-5 text-slate-300" />
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 rounded-3xl border-slate-100 shadow-2xl" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={noteDate}
                                                onSelect={(date) => date && setNoteDate(date)}
                                                initialFocus
                                                className="rounded-3xl border-none"
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Note Time</label>
                                    <Popover onOpenChange={(open) => !open && setIsClockMinutes(false)}>
                                        <PopoverTrigger asChild>
                                            <button
                                                type="button"
                                                className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-100 transition-all font-sans flex items-center justify-between"
                                            >
                                                <span>{noteTime}</span>
                                                <div className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center">
                                                    <ClockIcon className="w-4 h-4 text-slate-400" />
                                                </div>
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[320px] p-0 rounded-[2.5rem] border-slate-100 shadow-2xl z-[100]" align="start">
                                            <div className="p-8 space-y-6 flex flex-col items-center">
                                                <div className="flex items-center justify-between w-full border-b border-slate-50 pb-4">
                                                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                                        {isClockMinutes ? 'Select Minutes' : 'Select Hour'}
                                                    </h4>
                                                    <div className="flex gap-1 items-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => setIsClockMinutes(false)}
                                                            className={cn("text-xl font-black", !isClockMinutes ? "text-orange-500" : "text-slate-300")}
                                                        >
                                                            {noteTime.split(':')[0]}
                                                        </button>
                                                        <span className="text-xl font-black text-slate-300">:</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => setIsClockMinutes(true)}
                                                            className={cn("text-xl font-black", isClockMinutes ? "text-orange-500" : "text-slate-300")}
                                                        >
                                                            {noteTime.split(':')[1]}
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Clock Radial UI */}
                                                <div className="relative w-48 h-48 bg-slate-50 rounded-full flex items-center justify-center shadow-inner">
                                                    {/* Center point */}
                                                    <div className="w-2 h-2 rounded-full bg-orange-500 z-10" />

                                                    {isClockMinutes ? (
                                                        // Minutes Radial (0, 5, 10... 55)
                                                        Array.from({ length: 12 }).map((_, i) => {
                                                            const m = (i * 5).toString().padStart(2, '0');
                                                            const angle = (i * 30) - 90; // Adjust to start at top
                                                            const x = 50 + 38 * Math.cos(angle * Math.PI / 180);
                                                            const y = 50 + 38 * Math.sin(angle * Math.PI / 180);
                                                            const isSelected = noteTime.split(':')[1] === m;

                                                            return (
                                                                <button
                                                                    key={`m-${m}`}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const [h] = noteTime.split(':');
                                                                        setNoteTime(`${h}:${m}`);
                                                                    }}
                                                                    className={cn(
                                                                        "absolute w-8 h-8 rounded-full text-xs font-black transition-all flex items-center justify-center -translate-x-1/2 -translate-y-1/2",
                                                                        isSelected
                                                                            ? "bg-orange-500 text-white shadow-lg"
                                                                            : "text-slate-400 hover:bg-white hover:text-orange-500"
                                                                    )}
                                                                    style={{ left: `${x}%`, top: `${y}%` }}
                                                                >
                                                                    {m}
                                                                </button>
                                                            );
                                                        })
                                                    ) : (
                                                        // Hours Radial (1-12)
                                                        Array.from({ length: 12 }).map((_, i) => {
                                                            const h = (i === 0 ? 12 : i).toString().padStart(2, '0');
                                                            const angle = (i * 30) - 90; // Adjust to start at top
                                                            const x = 50 + 38 * Math.cos(angle * Math.PI / 180);
                                                            const y = 50 + 38 * Math.sin(angle * Math.PI / 180);
                                                            const isSelected = noteTime.split(':')[0] === h;

                                                            return (
                                                                <button
                                                                    key={`h-${h}`}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const [_, m] = noteTime.split(':');
                                                                        setNoteTime(`${h}:${m}`);
                                                                        setIsClockMinutes(true); // Auto switch to minutes
                                                                    }}
                                                                    className={cn(
                                                                        "absolute w-8 h-8 rounded-full text-sm font-black transition-all flex items-center justify-center -translate-x-1/2 -translate-y-1/2",
                                                                        isSelected
                                                                            ? "bg-orange-500 text-white shadow-lg"
                                                                            : "text-slate-400 hover:bg-white hover:text-orange-500"
                                                                    )}
                                                                    style={{ left: `${x}%`, top: `${y}%` }}
                                                                >
                                                                    {i === 0 ? 12 : i}
                                                                </button>
                                                            );
                                                        })
                                                    )}
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => setIsClockMinutes(!isClockMinutes)}
                                                    className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-orange-500 transition-colors"
                                                >
                                                    Switch to {isClockMinutes ? 'Hours' : 'Minutes'}
                                                </button>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full min-h-[200px] bg-slate-50 border-none rounded-[2rem] p-8 font-medium text-slate-700 outline-none focus:ring-4 focus:ring-orange-50 transition-all resize-none leading-relaxed font-sans"
                                    placeholder="Write your observation here..."
                                />
                            </div>

                            {/* Attachments Placeholder */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Attachments</label>
                                <div className="w-full h-32 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center gap-2 group hover:border-orange-300 transition-colors cursor-pointer bg-slate-50/50">
                                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Plus className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-400 group-hover:text-orange-500 transition-colors uppercase tracking-widest">Add Photos or Documents</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-4 pt-4">
                            <Button
                                type="button"
                                disabled={isSaving}
                                onClick={async () => {
                                    if (!description.trim()) {
                                        toast.error("Please enter a description");
                                        return;
                                    }

                                    if (!supabase) return;
                                    setIsSaving(true);
                                    try {
                                        const { error } = await supabase.from('notes' as any).insert({
                                            description,
                                            note_date: format(noteDate, 'yyyy-MM-dd'),
                                            note_time: noteTime + ":00", // Ensure HH:MM:SS format
                                            priority,
                                            category,
                                            apiary_id: selectedPlace?.id,
                                            hive_id: selectedHive?.id
                                        });

                                        if (error) throw error;

                                        toast.success("Note saved successfully");
                                        setIsAddingNote(false);
                                        // Reset form
                                        setDescription("");
                                        setPriority("medium");
                                        setCategory("General");
                                        // Refresh data
                                        const { data } = await supabase.from('notes' as any).select('*').order('created_at', { ascending: false });
                                        if (data) {
                                            const placesMap = new Map(places.map(p => [p.id, p.name]));
                                            const hivesMap = new Map(hives.map(h => [h.id, h.hive_code]));

                                            setNotes(data.map((note: any) => ({
                                                ...note,
                                                place_name: note.apiary_id ? placesMap.get(note.apiary_id) : undefined,
                                                hive_code: note.hive_id ? hivesMap.get(note.hive_id) : undefined
                                            })));
                                        }

                                    } catch (err: any) {
                                        console.error("Error saving note:", err);
                                        toast.error("Failed to save note: " + err.message);
                                    } finally {
                                        setIsSaving(false);
                                    }
                                }}
                                className="flex-1 h-16 rounded-2xl bg-[#1E293B] hover:bg-[#0F172A] text-white font-bold text-lg shadow-xl shadow-slate-200 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSaving ? <Loader2 className="animate-spin" /> : "SAVE NOTE"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsAddingNote(false)}
                                className="px-10 h-16 rounded-2xl border-2 border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
                            >
                                BACK
                            </Button>
                        </div>
                    </div>

                    {/* Meta Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8">
                            {/* Priority Selection */}
                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority</label>
                                <div className="grid grid-cols-1 gap-3">
                                    {['low', 'medium', 'high'].map((p) => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setPriority(p as any)}
                                            className={cn(
                                                "flex items-center gap-3 px-5 py-3 rounded-xl border-2 transition-all font-bold text-xs uppercase tracking-widest outline-none cursor-pointer flex-1",
                                                priority === p
                                                    ? cn(
                                                        p === 'low' && "border-emerald-200 bg-emerald-50 text-emerald-600",
                                                        p === 'medium' && "border-amber-200 bg-amber-50 text-amber-600",
                                                        p === 'high' && "border-rose-200 bg-rose-50 text-rose-600"
                                                    )
                                                    : "border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-2 h-2 rounded-full",
                                                p === 'low' && "bg-emerald-500",
                                                p === 'medium' && "bg-amber-500",
                                                p === 'high' && "bg-rose-500"
                                            )} />
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Category Selection */}
                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                                <div className="flex flex-wrap gap-2">
                                    {['General', 'Inspection', 'Feeding', 'Harvest'].map((cat) => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => setCategory(cat)}
                                            className={cn(
                                                "px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all outline-none cursor-pointer",
                                                category === cat
                                                    ? "bg-orange-500 text-white shadow-lg shadow-orange-200"
                                                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                            )}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Information Box */}
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Linked Context</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <MapPin className="w-3.5 h-3.5" />
                                        <span className="text-xs font-bold">{selectedPlace ? selectedPlace.name : "Global"}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Box className="w-3.5 h-3.5" />
                                        <span className="text-xs font-bold">{selectedHive ? selectedHive.hive_code : "All Hives"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-24 relative min-h-[600px]">
            {/* Title Section */}
            <div className="flex items-center gap-4">
                <h1 className="text-[2.5rem] font-bold text-[#0F172A] tracking-tight">My Notes</h1>
                {loading && <div className="w-5 h-5 border-2 border-[#B48428] border-t-transparent rounded-full animate-spin opacity-60" />}
            </div>

            {/* Filter Buttons / Dropdowns */}
            <div className="flex flex-wrap gap-4 mt-8">
                {/* My Places Dropdown */}
                <div className="relative group/dropdown min-w-[190px]">
                    <button
                        type="button"
                        onClick={() => {
                            setIsPlacesOpen(!isPlacesOpen);
                            setIsHivesOpen(false);
                        }}
                        className={cn(
                            "flex items-center gap-3 px-6 py-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-orange-200 transition-all w-full",
                            isPlacesOpen && "border-orange-200 ring-2 ring-orange-50"
                        )}
                    >
                        <div className="w-8 h-8 rounded-md bg-[#B48428]/10 flex items-center justify-center">
                            <LayoutGrid className="w-4 h-4 text-[#B48428]" strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col items-start flex-1 min-w-0">
                            <span className="text-[11px] font-black text-[#B48428] uppercase tracking-widest text-left">My Places</span>
                            <span className="text-[13px] font-bold text-slate-600 truncate w-full text-left">
                                {selectedPlace ? selectedPlace.name : "All Places"}
                            </span>
                        </div>
                        <ChevronDown className={cn("w-4 h-4 text-[#B48428] transition-transform duration-300", isPlacesOpen && "rotate-180")} />
                    </button>

                    <AnimatePresence>
                        {isPlacesOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden"
                            >
                                <div className="p-2 max-h-[300px] overflow-y-auto">
                                    <button
                                        onClick={() => {
                                            setSelectedPlace(null);
                                            setIsPlacesOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 rounded-lg transition-colors group"
                                    >
                                        <div className="w-2 h-2 rounded-full bg-slate-300 group-hover:bg-orange-400" />
                                        <span className="text-sm font-semibold text-slate-700">All Places</span>
                                        {!selectedPlace && <Check className="w-4 h-4 ml-auto text-orange-500" />}
                                    </button>
                                    {places.map((place) => (
                                        <button
                                            key={place.id}
                                            onClick={() => {
                                                setSelectedPlace(place);
                                                setIsPlacesOpen(false);
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 rounded-lg transition-colors group"
                                        >
                                            <MapPin className="w-4 h-4 text-slate-400 group-hover:text-orange-500" />
                                            <span className="text-sm font-semibold text-slate-700">{place.name}</span>
                                            {selectedPlace?.id === place.id && <Check className="w-4 h-4 ml-auto text-orange-500" />}
                                        </button>
                                    ))}
                                    {places.length === 0 && !loading && (
                                        <div className="px-4 py-8 text-center text-slate-400 text-sm">
                                            No places found
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Hive Dropdown */}
                <div className="relative group/dropdown min-w-[170px]">
                    <button
                        type="button"
                        onClick={() => {
                            setIsHivesOpen(!isHivesOpen);
                            setIsPlacesOpen(false);
                        }}
                        disabled={loading}
                        className={cn(
                            "flex items-center gap-3 px-6 py-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-orange-200 transition-all w-full disabled:opacity-50",
                            isHivesOpen && "border-orange-200 ring-2 ring-orange-50"
                        )}
                    >
                        <div className="w-8 h-8 rounded-md bg-[#B48428]/10 flex items-center justify-center">
                            <Box className="w-4 h-4 text-[#B48428]" strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col items-start flex-1 min-w-0 font-montserrat">
                            <span className="text-[11px] font-black text-[#B48428] uppercase tracking-widest text-left">Hive</span>
                            <span className="text-[13px] font-bold text-slate-600 truncate w-full text-left">
                                {selectedHive ? selectedHive.hive_code : "All Hives"}
                            </span>
                        </div>
                        <ChevronDown className={cn("w-4 h-4 text-[#B48428] transition-transform duration-300", isHivesOpen && "rotate-180")} />
                    </button>

                    <AnimatePresence>
                        {isHivesOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden"
                            >
                                <div className="p-2 max-h-[303px] overflow-y-auto">
                                    <button
                                        onClick={() => {
                                            setSelectedHive(null);
                                            setIsHivesOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 rounded-lg transition-colors group"
                                    >
                                        <div className="w-2 h-2 rounded-full bg-slate-300 group-hover:bg-orange-400" />
                                        <span className="text-sm font-semibold text-slate-700">All Hives</span>
                                        {!selectedHive && <Check className="w-4 h-4 ml-auto text-orange-500" />}
                                    </button>

                                    {hives
                                        .filter(h => !selectedPlace || (h as any).apiary_id === selectedPlace.id)
                                        .map((hive) => (
                                            <motion.button
                                                initial={{ opacity: 0, x: -5 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                key={hive.id}
                                                onClick={() => {
                                                    setSelectedHive(hive);
                                                    setIsHivesOpen(false);
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 rounded-lg transition-colors group"
                                            >
                                                <Box className="w-4 h-4 text-slate-400 group-hover:text-orange-500" />
                                                <span className="text-sm font-semibold text-slate-700">{hive.hive_code}</span>
                                                {selectedHive?.id === hive.id && <Check className="w-4 h-4 ml-auto text-orange-500" />}
                                            </motion.button>
                                        ))}

                                    {hives.filter(h => !selectedPlace || (h as any).apiary_id === selectedPlace.id).length === 0 && !loading && (
                                        <div className="px-4 py-8 text-center text-slate-400 text-sm">
                                            {selectedPlace ? `No hives in ${selectedPlace.name}` : "No hives found"}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Notes List */}
            <div className="mt-12 space-y-4">
                {notes.length === 0 ? (
                    <div className="bg-[#FEF2F2] dark:bg-red-950/20 border border-[#FEE2E2] dark:border-red-900/40 rounded-[2rem] py-20 flex items-center justify-center shadow-sm">
                        <div className="flex flex-col items-center gap-4">
                            <span className="text-[#F87171] dark:text-red-400 font-extrabold text-center text-lg tracking-[0.15em] px-8 uppercase">
                                You don't have any notes yet.
                            </span>
                            <p className="text-slate-400 text-sm font-medium">Click the + button to create your first note</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {notes.map((note) => (
                            <div key={note.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-2">
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                            note.priority === 'low' && "bg-emerald-50 text-emerald-600",
                                            note.priority === 'medium' && "bg-amber-50 text-amber-600",
                                            note.priority === 'high' && "bg-rose-50 text-rose-600"
                                        )}>
                                            {note.priority}
                                        </span>
                                        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                                            {note.category}
                                        </span>
                                    </div>
                                    <span className="text-xs font-bold text-slate-400">
                                        {format(new Date(note.note_date), 'dd MMM')}
                                    </span>
                                </div>
                                <p className="text-slate-700 font-medium line-clamp-3 leading-relaxed">
                                    {note.description}
                                </p>
                                <div className="pt-4 border-t border-slate-50 flex items-center gap-4 text-slate-400">
                                    {note.place_name && (
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="w-3.5 h-3.5" />
                                            <span className="text-[10px] font-bold uppercase tracking-wide">{note.place_name}</span>
                                        </div>
                                    )}
                                    {note.hive_code && (
                                        <div className="flex items-center gap-1.5">
                                            <Box className="w-3.5 h-3.5" />
                                            <span className="text-[10px] font-bold uppercase tracking-wide">{note.hive_code}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Floating Action Button */}
            <motion.div
                className="fixed bottom-12 right-12 z-50"
                animate={{ y: [0, -10, 0] }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                <Button
                    type="button"
                    onClick={() => setIsAddingNote(true)}
                    className="w-16 h-16 rounded-full bg-[#FBBF24] hover:bg-[#F59E0B] text-black shadow-2xl shadow-amber-500/40 flex items-center justify-center p-0 border-none transition-transform hover:scale-110 active:scale-95"
                >
                    <Plus className="w-8 h-8 stroke-[2.5]" />
                </Button>
            </motion.div>

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

export default MyNotesView;


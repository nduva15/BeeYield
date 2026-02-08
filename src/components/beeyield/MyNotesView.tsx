import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Plus, ChevronDown, Box, MapPin, Loader2, Check, Clock as ClockIcon, StickyNote, Trash2, Edit } from 'lucide-react';
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
import { useLanguage } from '@/contexts/LanguageContext';
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote } from '@/hooks/useNotes';
import { useHives, useApiaries } from '@/hooks/useHives';
import { debounce } from 'lodash';
import { Note } from '@/services/beeyieldService';
import { Badge } from '@/components/ui/badge';

interface MyNotesViewProps {
    onTabChange?: (tab: string, message?: string, action?: string) => void;
    initialAction?: 'add';
    onInitialActionConsumed?: () => void;
}

const MyNotesView: React.FC<MyNotesViewProps> = ({
    onTabChange = () => { },
    initialAction,
    onInitialActionConsumed
}) => {
    const { t } = useLanguage();

    // Hooks
    const { data: notes = [], isLoading: loadingNotes } = useNotes();
    const { data: apiaries = [] } = useApiaries();
    const { data: hives = [] } = useHives();

    const createNoteMutation = useCreateNote();
    const updateNoteMutation = useUpdateNote();
    const deleteNoteMutation = useDeleteNote();

    // UI States
    const [isPlacesOpen, setIsPlacesOpen] = useState(false);
    const [isHivesOpen, setIsHivesOpen] = useState(false);
    const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
    const [selectedHiveId, setSelectedHiveId] = useState<string | null>(null);
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [isEditingNote, setIsEditingNote] = useState<Note | null>(null);

    // Form States
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [noteDate, setNoteDate] = useState<Date>(new Date());
    const [noteTime, setNoteTime] = useState(format(new Date(), "HH:mm"));
    const [priority, setPriority] = useState<string>("Medium");
    const [category, setCategory] = useState("General");
    const [isSaving, setIsSaving] = useState(false);

    // Derived
    const selectedPlace = apiaries.find(a => a.id === selectedPlaceId);
    const selectedHive = hives.find(h => h.id === selectedHiveId);

    useEffect(() => {
        if (initialAction === 'add') {
            setIsAddingNote(true);
            onInitialActionConsumed?.();
        }
    }, [initialAction]);

    // Handle initial state for editing
    useEffect(() => {
        if (isEditingNote) {
            setTitle(isEditingNote.title || "");
            setDescription(isEditingNote.content || isEditingNote.description || "");
            setNoteDate(isEditingNote.note_date ? new Date(isEditingNote.note_date) : new Date());
            setNoteTime(isEditingNote.note_time?.substring(0, 5) || format(new Date(), "HH:mm"));
            setPriority(isEditingNote.priority || "Medium");
            setCategory(isEditingNote.category || "General");
            setSelectedPlaceId(isEditingNote.apiary_id || null);
            setSelectedHiveId(isEditingNote.hive_id || null);
        }
    }, [isEditingNote]);

    // Debounced Auto-save for content
    const debouncedSave = useCallback(
        debounce(async (id: string, content: string) => {
            await updateNoteMutation.mutateAsync({
                id,
                data: { content }
            });
        }, 1000),
        []
    );

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setDescription(val);
        if (isEditingNote) {
            debouncedSave(isEditingNote.id, val);
        }
    };

    const handleSaveNote = async () => {
        if (!description.trim() && !title.trim()) {
            toast.error("Please enter a title or description");
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                title,
                content: description,
                description, // Backward compatibility
                note_date: format(noteDate, 'yyyy-MM-dd'),
                note_time: noteTime + ":00",
                priority,
                category,
                apiary_id: selectedPlaceId || undefined,
                hive_id: selectedHiveId || undefined
            };

            if (isEditingNote) {
                await updateNoteMutation.mutateAsync({ id: isEditingNote.id, data: payload });
            } else {
                await createNoteMutation.mutateAsync(payload);
            }

            setIsAddingNote(false);
            setIsEditingNote(null);
            // Reset
            setTitle("");
            setDescription("");
            setPriority("Medium");
            setCategory("General");
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteNote = async (id: string) => {
        if (confirm("Are you sure you want to delete this note?")) {
            await deleteNoteMutation.mutateAsync(id);
        }
    };

    const filteredNotes = notes.filter(note => {
        if (selectedPlaceId && note.apiary_id !== selectedPlaceId) return false;
        if (selectedHiveId && note.hive_id !== selectedHiveId) return false;
        return true;
    });

    if (isAddingNote || isEditingNote) {
        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 relative">
                <div className="flex items-center justify-between px-2">
                    <div className="flex flex-col gap-1">
                        <button
                            type="button"
                            onClick={() => { setIsAddingNote(false); setIsEditingNote(null); }}
                            className="text-sm font-bold text-slate-400 hover:text-[#1B9157] transition-colors flex items-center gap-1 mb-2 uppercase tracking-widest outline-none border-none bg-transparent cursor-pointer"
                        >
                            <ChevronDown className="w-4 h-4 rotate-90" /> {t('back_to_notes')}
                        </button>
                        <h1 className="text-[2.5rem] font-black text-[#1B9157] leading-tight tracking-tight">
                            {isEditingNote ? "EDIT OBSERVATION" : t('add_note')}
                        </h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Form Area */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-[#111111] p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-white/5 space-y-8">
                            {/* Title Field */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Title / Summary</label>
                                <input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full h-14 bg-slate-50 dark:bg-white/5 border-none rounded-2xl px-6 font-bold text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-[#1B9157]/10 transition-all"
                                    placeholder="e.g. Varroa check in Kibwezi Main"
                                />
                            </div>

                            {/* Date and Time Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('note_date')}</label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button
                                                type="button"
                                                className="w-full h-14 bg-slate-50 dark:bg-white/5 border-none rounded-2xl px-6 font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-[#1B9157]/10 transition-all font-sans flex items-center justify-between"
                                            >
                                                <span>{format(noteDate, "dd/MM/yyyy")}</span>
                                                <CalendarIcon className="w-5 h-5 text-[#1B9157]" />
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
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('note_time')}</label>
                                    <input
                                        type="time"
                                        value={noteTime}
                                        onChange={(e) => setNoteTime(e.target.value)}
                                        className="w-full h-14 bg-slate-50 dark:bg-white/5 border-none rounded-2xl px-6 font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-[#1B9157]/10 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Detailed Body / Observations</label>
                                <textarea
                                    value={description}
                                    onChange={handleDescriptionChange}
                                    className="w-full min-h-[250px] bg-slate-50 dark:bg-white/5 border-none rounded-[2rem] p-8 font-medium text-slate-700 dark:text-white outline-none focus:ring-4 focus:ring-[#1B9157]/10 transition-all resize-none leading-relaxed font-sans"
                                    placeholder="Describe your findings in detail..."
                                />
                                {updateNoteMutation.isPending && (
                                    <div className="flex items-center gap-2 text-[10px] font-black text-[#1B9157] uppercase tracking-widest animate-pulse">
                                        <Loader2 className="w-3 h-3 animate-spin" /> Auto-syncing...
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-4 pt-4">
                            <Button
                                type="button"
                                disabled={isSaving}
                                onClick={handleSaveNote}
                                className="flex-1 h-16 rounded-2xl bg-[#1B9157] hover:bg-[#167d4a] text-white font-black uppercase tracking-widest text-sm shadow-xl shadow-green-500/10"
                            >
                                {isSaving ? <Loader2 className="animate-spin" /> : (isEditingNote ? "Sync Changes" : t('save_note'))}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => { setIsAddingNote(false); setIsEditingNote(null); }}
                                className="px-10 h-16 rounded-2xl border-2 border-[#1B9157]/20 font-black text-[#1B9157] hover:bg-[#1B9157]/5 uppercase tracking-widest text-xs"
                            >
                                {t('back_button')}
                            </Button>
                        </div>
                    </div>

                    {/* Meta Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-[#111111] p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-white/5 space-y-8">
                            {/* Priority Selection */}
                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('priority_label')}</label>
                                <div className="grid grid-cols-1 gap-3">
                                    {['Low', 'Medium', 'High'].map((p) => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setPriority(p as any)}
                                            className={cn(
                                                "flex items-center gap-3 px-5 py-3 rounded-xl border-2 transition-all font-black text-[10px] uppercase tracking-widest outline-none cursor-pointer flex-1",
                                                priority === p
                                                    ? cn(
                                                        p === 'Low' && "border-green-200 bg-green-50 text-[#1B9157]",
                                                        p === 'Medium' && "border-[#F4D03F]/20 bg-[#F4D03F]/5 text-[#7a6820]",
                                                        p === 'High' && "border-rose-200 bg-rose-50 text-rose-600"
                                                    )
                                                    : "border-slate-50 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-slate-400 hover:border-slate-200"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-2 h-2 rounded-full",
                                                p === 'Low' && "bg-[#1B9157]",
                                                p === 'Medium' && "bg-[#F4D03F]",
                                                p === 'High' && "bg-rose-500"
                                            )} />
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Category Selection */}
                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('category_label')}</label>
                                <div className="flex flex-wrap gap-2">
                                    {['General', 'Health', 'Queen Seen', 'Harvest', 'Varroa'].map((cat) => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => setCategory(cat)}
                                            className={cn(
                                                "px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all outline-none cursor-pointer",
                                                category === cat
                                                    ? "bg-[#1B9157] text-white shadow-lg shadow-[#1B9157]/40"
                                                    : "bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10"
                                            )}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Entity Link */}
                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Link to Hive / Apiary</label>
                                <select
                                    value={selectedPlaceId || ""}
                                    onChange={(e) => setSelectedPlaceId(e.target.value || null)}
                                    className="w-full h-12 bg-slate-50 dark:bg-white/5 border-none rounded-xl px-4 font-bold text-xs outline-none"
                                >
                                    <option value="">Select Apiary</option>
                                    {apiaries.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                                <select
                                    value={selectedHiveId || ""}
                                    onChange={(e) => setSelectedHiveId(e.target.value || null)}
                                    className="w-full h-12 bg-slate-50 dark:bg-white/5 border-none rounded-xl px-4 font-bold text-xs outline-none"
                                >
                                    <option value="">Select Hive</option>
                                    {hives.filter(h => !selectedPlaceId || h.apiary_id === selectedPlaceId).map(h => (
                                        <option key={h.id} value={h.id}>{h.hive_code}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in duration-500 pb-24 relative min-h-[600px]">
            {/* Title Section */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-3 h-12 bg-[#1B9157] rounded-full" />
                    <div>
                        <h1 className="text-[3rem] font-black text-[#1B9157] dark:text-white tracking-tighter uppercase leading-none">MY NOTES</h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">{filteredNotes.length} Observations Indexed</p>
                    </div>
                </div>
                {loadingNotes && <Loader2 className="w-6 h-6 border-t-transparent animate-spin text-[#1B9157]" />}
            </div>

            {/* Filter Hub */}
            <div className="flex flex-wrap gap-4">
                <div className="relative min-w-[220px]">
                    <button
                        type="button"
                        onClick={() => { setIsPlacesOpen(!isPlacesOpen); setIsHivesOpen(false); }}
                        className={cn(
                            "flex items-center gap-4 px-8 py-5 bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/5 rounded-3xl shadow-sm hover:border-[#F4D03F]/40 transition-all w-full",
                            isPlacesOpen && "ring-2 ring-[#1B9157]/20 border-[#1B9157]/40"
                        )}
                    >
                        <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", selectedPlaceId ? "bg-[#1B9157] text-white" : "bg-slate-50 dark:bg-white/5 text-slate-400")}>
                            <MapPin className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest underline decoration-[#F4D03F] decoration-2 underline-offset-4">MY PLACES</span>
                            <span className="text-[14px] font-black text-slate-700 dark:text-slate-200 uppercase truncate">
                                {selectedPlace ? selectedPlace.name : "All Places"}
                            </span>
                        </div>
                        <ChevronDown className={cn("w-4 h-4 ml-auto text-slate-300 transition-transform", isPlacesOpen && "rotate-180")} />
                    </button>

                    <AnimatePresence>
                        {isPlacesOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/5 rounded-[2rem] shadow-2xl z-50 overflow-hidden"
                            >
                                <div className="p-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                                    {apiaries.filter(a => a.name.includes('Kibwezi')).map((place) => (
                                        <button
                                            key={place.id}
                                            onClick={() => { setSelectedPlaceId(place.id); setIsPlacesOpen(false); }}
                                            className="w-full flex items-center gap-3 px-5 py-4 hover:bg-[#1B9157]/5 rounded-2xl transition-colors font-black text-[11px] uppercase tracking-widest text-slate-600 dark:text-slate-300"
                                        >
                                            <MapPin className="w-4 h-4" /> {place.name}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="relative min-w-[200px]">
                    <button
                        type="button"
                        onClick={() => { setIsHivesOpen(!isHivesOpen); setIsPlacesOpen(false); }}
                        className={cn(
                            "flex items-center gap-4 px-8 py-5 bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/5 rounded-3xl shadow-sm hover:border-[#F4D03F]/40 transition-all w-full",
                            isHivesOpen && "ring-2 ring-[#1B9157]/20 border-[#1B9157]/40"
                        )}
                    >
                        <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", selectedHiveId ? "bg-[#F4D03F] text-black" : "bg-slate-50 dark:bg-white/5 text-slate-400")}>
                            <Box className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">HIVE</span>
                            <span className="text-[14px] font-black text-slate-700 dark:text-slate-200 uppercase truncate">
                                {selectedHive ? selectedHive.hive_code : "All Hives"}
                            </span>
                        </div>
                        <ChevronDown className={cn("w-4 h-4 ml-auto text-slate-300 transition-transform", isHivesOpen && "rotate-180")} />
                    </button>

                    <AnimatePresence>
                        {isHivesOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/5 rounded-[2rem] shadow-2xl z-50 overflow-hidden"
                            >
                                <div className="p-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                                    {hives
                                        .filter(h => !selectedPlaceId || h.apiary_id === selectedPlaceId)
                                        .slice(0, 184) // Limit to 184 if needed, though data should already be correct
                                        .map((hive) => (
                                            <button
                                                key={hive.id}
                                                onClick={() => { setSelectedHiveId(hive.id); setIsHivesOpen(false); }}
                                                className="w-full flex items-center gap-3 px-5 py-4 hover:bg-[#F4D03F]/10 rounded-2xl transition-colors font-black text-[11px] uppercase tracking-widest text-slate-600 dark:text-slate-300"
                                            >
                                                <Box className="w-4 h-4" /> {hive.hive_code}
                                            </button>
                                        ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Notes Grid */}
            <div className="mt-12">
                {filteredNotes.length === 0 ? (
                    <div className="bg-slate-50 dark:bg-white/[0.02] border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[3rem] py-32 flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 bg-white dark:bg-white/5 rounded-[2rem] shadow-sm flex items-center justify-center mb-8">
                            <StickyNote className="w-10 h-10 text-slate-200" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">No Notes Found</h3>
                        <p className="text-slate-400 font-bold text-sm max-w-xs uppercase tracking-widest">No observations recorded for this selection.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredNotes.map((note) => (
                            <motion.div
                                key={note.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="group"
                            >
                                <div className="bg-white dark:bg-[#111111] p-8 rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full relative overflow-hidden">
                                    <div className={cn("absolute top-0 right-0 w-3 h-full",
                                        note.priority === 'High' ? "bg-rose-500" :
                                            note.priority === 'Medium' ? "bg-[#F4D03F]" : "bg-[#1B9157]"
                                    )} />

                                    <div className="flex items-center justify-between mb-6">
                                        <Badge className="bg-slate-50 dark:bg-white/5 text-[8px] font-black uppercase tracking-widest py-1 px-3 border-none text-slate-400">
                                            {note.category || "General"}
                                        </Badge>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-slate-50 dark:bg-white/5" onClick={() => setIsEditingNote(note)}>
                                                <Edit className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-rose-50 dark:bg-rose-900/20 text-rose-600" onClick={() => handleDeleteNote(note.id)}>
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </div>

                                    <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase mb-4 line-clamp-2 leading-tight">
                                        {note.title || "Observation Log"}
                                    </h4>

                                    <p className="text-slate-500 dark:text-slate-400 font-bold text-sm leading-relaxed line-clamp-4 flex-1">
                                        {note.content || note.description}
                                    </p>

                                    <div className="mt-8 pt-6 border-t border-slate-50 dark:border-white/5 flex flex-wrap gap-4">
                                        <div className="flex items-center gap-2">
                                            <CalendarIcon className="w-3.5 h-3.5 text-[#1B9157]" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase">{format(new Date(note.note_date || note.created_at!), "dd MMM yyyy")}</span>
                                        </div>
                                        {note.hive_id && (
                                            <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 dark:bg-white/5 rounded-full">
                                                <Box className="w-3 h-3 text-[#F4D03F]" />
                                                <span className="text-[9px] font-black uppercase text-slate-600 dark:text-slate-300 tracking-widest">
                                                    {hives.find(h => h.id === note.hive_id)?.hive_code || "Unit"}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Floating Action Button */}
            <motion.div
                className="fixed bottom-12 right-12 z-50"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
                <Button
                    type="button"
                    onClick={() => setIsAddingNote(true)}
                    className="w-20 h-20 rounded-[2.5rem] bg-[#1B9157] hover:bg-[#167d4a] text-white shadow-[0_20px_50px_rgba(27,145,87,0.3)] flex items-center justify-center p-0 border-4 border-white dark:border-[#141414] transition-all hover:scale-110 active:scale-95"
                >
                    <Plus className="w-10 h-10 stroke-[3]" />
                </Button>
            </motion.div>

            {/* Backdrop for click-away */}
            {(isPlacesOpen || isHivesOpen) && (
                <div className="fixed inset-0 z-40 bg-transparent" onClick={() => { setIsPlacesOpen(false); setIsHivesOpen(false); }} />
            )}
        </div>
    );
};

export default MyNotesView;

import React from 'react';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Plus, ChevronDown, ChevronLeft, Box, MapPin, Loader2, Check, Clock as ClockIcon, StickyNote, Trash2, Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { spring } from '@/lib/motion';
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
import { glass, GlassStatCard } from './GlassTheme';
import {
    BeeYieldCard,
    BeeYieldFormField,
    BeeYieldPageHeader,
    BeeYieldPageShell,
    BeeYieldTextInput,
} from '@/components/beeyield/BeeYieldUI';

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
    const [selectedPlaceId, setSelectedPlaceId] = React.useState<string | null>(null);
    const [selectedHiveId, setSelectedHiveId] = React.useState<string | null>(null);
    const [isAddingNote, setIsAddingNote] = React.useState(false);
    const [isEditingNote, setIsEditingNote] = React.useState<Note | null>(null);

    // Form States
    const [title, setTitle] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [noteDate, setNoteDate] = React.useState<Date>(new Date());
    const [noteTime, setNoteTime] = React.useState(format(new Date(), "HH:mm"));
    const [priority, setPriority] = React.useState<'low' | 'medium' | 'high'>("medium");
    const [category, setCategory] = React.useState("General");
    const [isSaving, setIsSaving] = React.useState(false);

    React.useEffect(() => {
        if (initialAction === 'add') {
            setIsAddingNote(true);
            onInitialActionConsumed?.();
        }
    }, [initialAction]);

    // Handle initial state for editing
    React.useEffect(() => {
        if (isEditingNote) {
            setTitle(isEditingNote.title || "");
            setDescription(isEditingNote.content || "");
            setNoteDate(isEditingNote.note_date ? new Date(isEditingNote.note_date) : new Date());
            setNoteTime(isEditingNote.created_at ? format(new Date(isEditingNote.created_at), "HH:mm") : format(new Date(), "HH:mm"));
            setPriority(isEditingNote.priority || "medium");
            setCategory(isEditingNote.category || "General");
            setSelectedPlaceId(isEditingNote.apiary_id || null);
            setSelectedHiveId(isEditingNote.hive_id || null);
        }
    }, [isEditingNote]);

    // Debounced Auto-save for content
    const debouncedSave = React.useCallback(
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
                note_date: format(noteDate, 'yyyy-MM-dd'),
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
            setPriority("medium");
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
            <BeeYieldPageShell>
                <BeeYieldPageHeader
                    icon={StickyNote}
                    label="Notes"
                    title={isEditingNote ? "Edit note" : "New note"}
                    subtitle="Save observations from apiary visits."
                    actions={
                        <button
                            onClick={() => { setIsAddingNote(false); setIsEditingNote(null); }}
                            className={cn(glass.btnSecondary, "px-4 h-8 rounded-xl text-[12px] font-semibold flex items-center gap-2 border-[#F4D03F]/10")}
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            Back
                        </button>
                    }
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
                    {/* Main Form Area */}
                    <div className="lg:col-span-8 space-y-6">
                        <BeeYieldCard className={cn("p-5 space-y-6 bg-white/40 border-white/20 shadow-xl relative overflow-hidden")}>
                            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#F4D03F 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                            
                            {/* Title Field */}
                            <BeeYieldFormField id="note_title" label="Title (optional)" hint="Short summary">
                                <BeeYieldTextInput
                                    id="note_title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Varroa check"
                                    inputClassName="bg-white/50"
                                />
                            </BeeYieldFormField>

                            {/* Date and Time Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
                                <div className="space-y-3">
                                    <label htmlFor="note_date" className="text-[12px] font-semibold text-[#1A1A1A]/70 ml-1">Date</label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button
                                                id="note_date"
                                                name="note_date"
                                                type="button"
                                                aria-label="Select note date"
                                                className={cn(glass.btnSecondary, "w-full justify-between h-10 px-4 rounded-xl border-white/40 bg-white/40 hover:bg-white/60 group shadow-sm transition-colors")}
                                            >
                                                <span className="font-semibold text-[12px] text-[#1A1A1A]">{format(noteDate, "dd/MM/yyyy")}</span>
                                                <CalendarIcon className="w-3.5 h-3.5 text-[#F4D03F] group-hover:scale-110 transition-transform" />
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className={glass.selectContent} align="start">
                                            <Calendar
                                                mode="single"
                                                selected={noteDate}
                                                onSelect={(date) => date && setNoteDate(date)}
                                                initialFocus
                                                className="rounded-xl border-none"
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-3">
                                    <BeeYieldFormField id="note_time" label="Time" className="space-y-3">
                                        <BeeYieldTextInput
                                            id="note_time"
                                            type="time"
                                            value={noteTime}
                                            onChange={(e) => setNoteTime(e.target.value)}
                                            inputClassName="bg-white/40"
                                        />
                                    </BeeYieldFormField>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-3 relative z-10">
                                <label htmlFor="note_details" className="text-[12px] font-semibold text-[#1A1A1A]/70 ml-1">Details</label>
                                <textarea
                                    id="note_details"
                                    name="note_details"
                                    autoComplete="off"
                                    value={description}
                                    onChange={handleDescriptionChange}
                                    className={cn(glass.input, "w-full min-h-[260px] p-4 leading-relaxed resize-none bg-white/40 border-white/40 hover:bg-white/60 focus:bg-white transition-colors text-[13px] font-medium shadow-sm")}
                                    placeholder="Write what you observed…"
                                />
                                {updateNoteMutation.isPending && (
                                    <div className="flex items-center gap-2 text-[11px] font-semibold text-[#F4D03F] animate-pulse">
                                        <Loader2 className="w-3 h-3 animate-spin" /> Saving…
                                    </div>
                                )}
                            </div>
                        </BeeYieldCard>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-4 pt-2">
                            <button
                                type="button"
                                disabled={isSaving}
                                onClick={handleSaveNote}
                                className={cn(glass.btnPrimary, "flex-1 h-9 text-[12px] font-semibold shadow-lg rounded-xl group")}
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : (isEditingNote ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />)}
                                {isEditingNote ? "Save changes" : "Save note"}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setIsAddingNote(false); setIsEditingNote(null); }}
                                className={cn(glass.btnSecondary, "px-8 h-9 text-[12px] font-semibold rounded-xl border-white/40 shadow-sm")}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>

                    {/* Meta Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        <BeeYieldCard className={cn("p-5 space-y-6 bg-white/40 border-white/20 shadow-lg")}>
                            {/* Priority Selection */}
                            <div className="space-y-4">
                                <label className="text-[12px] font-semibold text-[#1A1A1A]/70 ml-1">Priority</label>
                                <div className="grid grid-cols-1 gap-2.5">
                                    {['low', 'medium', 'high'].map((p) => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setPriority(p as any)}
                                            className={cn(
                                                "flex items-center gap-3 h-10 px-4 rounded-xl border transition-all outline-none cursor-pointer relative overflow-hidden",
                                                priority === p
                                                    ? cn(
                                                        p === 'low' && "bg-[#1B9157]/10 text-[#1B9157] border-[#1B9157]/20 shadow-md",
                                                        p === 'medium' && "bg-[#F4D03F]/10 text-[#F4D03F] border-[#F4D03F]/20 shadow-md",
                                                        p === 'high' && "bg-red-500/10 text-red-500 border-red-500/20 shadow-md"
                                                    )
                                                    : "bg-white/30 border-gray-100 text-gray-400 hover:bg-white/50"
                                            )}
                                        >
                                            {priority === p && <div className={cn("absolute left-0 top-0 bottom-0 w-1", p === 'low' ? "bg-[#1B9157]" : p === 'medium' ? "bg-[#F4D03F]" : "bg-red-500")} />}
                                            <div className={cn(
                                                "w-2 h-2 rounded-full",
                                                p === 'low' && "bg-[#1B9157]",
                                                p === 'medium' && "bg-[#F4D03F]",
                                                p === 'high' && "bg-red-500"
                                            )} />
                                            <span className="text-[12px] font-semibold capitalize">{p}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Category Selection */}
                            <div className="space-y-4">
                                <label className="text-[12px] font-semibold text-[#1A1A1A]/70 ml-1">Category</label>
                                <div className="flex flex-wrap gap-2">
                                    {['General', 'Health', 'Queen Seen', 'Harvest', 'Varroa'].map((cat) => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => setCategory(cat)}
                                            className={cn(
                                                "px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all outline-none cursor-pointer border",
                                                category === cat
                                                    ? "bg-[#F4D03F] text-[#1A1A1A] border-[#F4D03F] shadow-lg shadow-[#F4D03F]/20"
                                                    : "bg-white/30 border-gray-100 text-gray-400 hover:text-[#1A1A1A] hover:bg-white/50"
                                            )}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Entity Link */}
                            <div className="space-y-4">
                                <label className="text-[12px] font-semibold text-[#1A1A1A]/70 ml-1">Link to location (optional)</label>
                                <div className="space-y-3">
                                    <div className="relative group">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#F4D03F] opacity-30 group-focus-within:opacity-100 transition-opacity" />
                                        <select
                                            id="note_apiary"
                                            name="note_apiary"
                                            autoComplete="off"
                                            aria-label="Select apiary"
                                            value={selectedPlaceId || ""}
                                            onChange={(e) => setSelectedPlaceId(e.target.value || null)}
                                            className={cn(glass.select, "w-full pl-10 text-[12px] font-medium bg-white/40 h-10")}
                                        >
                                            <option value="">All apiaries</option>
                                            {apiaries.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="relative group">
                                        <Box className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#F4D03F] opacity-30 group-focus-within:opacity-100 transition-opacity" />
                                        <select
                                            id="note_hive"
                                            name="note_hive"
                                            autoComplete="off"
                                            aria-label="Select hive"
                                            value={selectedHiveId || ""}
                                            onChange={(e) => setSelectedHiveId(e.target.value || null)}
                                            className={cn(glass.select, "w-full pl-10 text-[12px] font-medium bg-white/40 h-10")}
                                        >
                                            <option value="">All hives</option>
                                            {hives.filter(h => !selectedPlaceId || h.apiary_id === selectedPlaceId).map(h => (
                                                <option key={h.id} value={h.id}>{h.hive_code}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </BeeYieldCard>
                    </div>
                </div>
            </BeeYieldPageShell>
        );
    }

    return (
        <BeeYieldPageShell>
            <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-[#F4D03F][0.03] rounded-full blur-[120px] -mr-20 -mt-20 pointer-events-none" />

            {/* Title Section */}
            <BeeYieldPageHeader
                icon={StickyNote}
                label="Notes"
                onBack={() => onTabChange?.('home')}
                title={<>Your <span className="text-[#F4D03F]">notes</span></>}
                subtitle="Write down observations and link them to an apiary or hive."
                actions={
                    <button
                        onClick={() => setIsAddingNote(true)}
                        className={cn(glass.btnPrimary, "px-5 h-8 text-[12px] font-semibold flex items-center gap-2 shadow-sm rounded-xl")}
                    >
                        <Plus className="w-4 h-4" />
                        Add note
                    </button>
                }
            />

            {/* Filter Hub */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(glass.filterBar, "p-1.5 flex items-center gap-2 bg-white/40 backdrop-blur-md rounded-2xl border-white/20")}
            >
                <div className="flex flex-col md:flex-row gap-2 items-center w-full">
                    <div className="relative flex-1 group/sel w-full">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#F4D03F] opacity-30 group-focus-within/sel:opacity-100 transition-opacity" />
                        <select
                            id="notes-filter-apiary"
                            name="filter_apiary"
                            autoComplete="off"
                            value={selectedPlaceId || ""}
                            onChange={(e) => setSelectedPlaceId(e.target.value || null)}
                            className={cn(glass.select, "w-full pl-10 h-10 text-[12px] font-medium bg-white/20")}
                            aria-label="Filter by apiary"
                        >
                            <option value="">All apiaries</option>
                            {apiaries.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                    </div>

                    <div className="relative flex-1 group/sel w-full">
                        <Box className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#F4D03F] opacity-30 group-focus-within/sel:opacity-100 transition-opacity" />
                        <select
                            id="notes-filter-hive"
                            name="filter_hive"
                            autoComplete="off"
                            value={selectedHiveId || ""}
                            onChange={(e) => setSelectedHiveId(e.target.value || null)}
                            className={cn(glass.select, "w-full pl-10 h-10 text-[12px] font-medium bg-white/20")}
                            aria-label="Filter by hive"
                        >
                            <option value="">All hives</option>
                            {hives.filter(h => !selectedPlaceId || h.apiary_id === selectedPlaceId).map(h => (
                                <option key={h.id} value={h.id}>{h.hive_code}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-3 px-4 h-10 bg-white/40 rounded-xl border border-white/40 shadow-sm shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#1B9157] shadow-sm shadow-[#1B9157]/50 animate-pulse" />
                        <span className="text-[11px] font-semibold text-gray-600 whitespace-nowrap">
                            {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* Notes Grid */}
            <div className="relative z-10 pt-6">
                {filteredNotes.length === 0 ? (
                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className={glass.emptyState}>
                        <div className="w-20 h-20 rounded-xl bg-[#F4D03F]/5 border border-[#F4D03F]/20 flex items-center justify-center mb-6">
                            <StickyNote className="w-8 h-8 text-[#F4D03F] opacity-30" />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-[#1A1A1A] tracking-tight">No notes yet</h3>
                            <p className="text-sm text-gray-500 max-w-md mx-auto">No notes match these filters.</p>
                        </div>
                        <button onClick={() => setIsAddingNote(true)} className={cn(glass.btnPrimary, "mt-8 px-6")}>
                            <Plus className="w-4 h-4" /> Add your first note
                        </button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredNotes.map((note, i) => (
                                <motion.div
                                    key={note.id}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: i * 0.05 }}
                                    className={cn(glass.card, "p-5 hover:border-[#F4D03F]/40 group flex flex-col h-full bg-white/40 border-white/20 shadow-xl relative overflow-hidden")}
                                >
                                    <div className={cn("absolute left-0 top-0 w-1.5 h-full transition-colors",
                                        note.priority === 'high' ? "bg-red-500" :
                                            note.priority === 'medium' ? "bg-[#F4D03F]" : "bg-[#1B9157]"
                                    )} />

                                    <div className="flex items-center justify-between mb-5 relative z-10">
                                        <div className={cn("px-3 py-1 text-[11px] font-semibold rounded-lg border", 
                                            note.priority === 'high' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                            note.priority === 'medium' ? "bg-[#F4D03F]/10 text-[#F4D03F] border-[#F4D03F]/20" : 
                                            "bg-[#1B9157]/10 text-[#1B9157] border-[#1B9157]/20"
                                        )}>
                                            {note.category || "General"}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setIsEditingNote(note)}
                                                className="w-9 h-9 rounded-xl bg-white/60 border border-white/20 flex items-center justify-center hover:bg-[#F4D03F] hover:text-white transition-all shadow-sm"
                                                aria-label="Edit note"
                                                title="Edit note"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteNote(note.id)}
                                                className="w-9 h-9 rounded-xl bg-white/60 border border-white/20 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                                aria-label="Delete note"
                                                title="Delete note"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-4 relative z-10 flex-1">
                                        <h4 className="text-[14px] font-bold text-[#1A1A1A] tracking-tight line-clamp-2 group-hover:text-[#F4D03F] transition-colors leading-snug">
                                            {note.title?.trim() || "Untitled note"}
                                        </h4>

                                        <div className="bg-white/40 rounded-2xl p-5 border border-white/40 flex-1 min-h-[100px] shadow-inner relative overflow-hidden">
                                            <div className="absolute top-2 right-2 opacity-10"><StickyNote className="w-8 h-8" /></div>
                                            <p className="text-[12px] font-medium text-gray-600 leading-relaxed line-clamp-4 relative z-10">
                                                {note.content?.trim() || "No details yet."}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-5 border-t border-[#F4D03F]/5 flex flex-wrap gap-4 mt-6 relative z-10">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-white/60 border border-white/20 flex items-center justify-center shadow-sm">
                                                <ClockIcon className="w-3.5 h-3.5 text-[#F4D03F]" />
                                            </div>
                                            <span className="text-[12px] font-medium text-gray-600 tabular-nums">{format(new Date(note.note_date || note.created_at!), "dd MMM yyyy")}</span>
                                        </div>
                                        {note.hive_id && (
                                            <div className="flex items-center gap-2 ml-auto">
                                                <span className="text-[12px] font-semibold text-white bg-[#1B9157] px-3 py-1.5 rounded-xl border border-white/20 shadow-sm transition-colors">
                                                    Hive {hives.find(h => h.id === note.hive_id)?.hive_code || "Unknown"}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </BeeYieldPageShell>
    );
};

export default MyNotesView;

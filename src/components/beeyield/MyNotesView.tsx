import React from 'react';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Plus, ChevronDown, Box, MapPin, Loader2, Check, Clock as ClockIcon, StickyNote, Trash2, Edit } from 'lucide-react';
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
import { glass, PageHeader, GlassStatCard } from './GlassTheme';

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
    const [isPlacesOpen, setIsPlacesOpen] = React.useState(false);
    const [isHivesOpen, setIsHivesOpen] = React.useState(false);
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

    // Derived
    const selectedPlace = apiaries.find(a => a.id === selectedPlaceId);
    const selectedHive = hives.find(h => h.id === selectedHiveId);

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
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={glass.page}
            >
                <PageHeader
                    icon={StickyNote}
                    label="Observation Log"
                    title={<>{isEditingNote ? "Edit" : "New"} <span className="text-honey">Observation</span></>}
                    subtitle="Record detailed findings from your apiary visits. Capturing data ensures long-term colony health and high productivity."
                    actions={
                        <button
                            onClick={() => { setIsAddingNote(false); setIsEditingNote(null); }}
                            className={glass.btnSecondary}
                        >
                            <ChevronDown className="w-6 h-6 rotate-90" />
                            Return
                        </button>
                    }
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 relative z-10">
                    {/* Main Form Area */}
                    <div className="lg:col-span-8 space-y-12">
                        <div className={cn(glass.card, "p-16 space-y-12 bg-white/60 dark:bg-[#0D0D0D]/60 backdrop-blur-3xl")}>
                            {/* Title Field */}
                            <div className="space-y-6">
                                <label className={glass.microLabel}>Title / Summary</label>
                                <input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className={cn(glass.input, "w-full min-h-24 px-10")}
                                    placeholder="e.g. Varroa check in main apiary"
                                />
                            </div>

                            {/* Date and Time Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-6">
                                    <label className={glass.microLabel}>{t('note_date')}</label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button
                                                type="button"
                                                className={cn(glass.btnSecondary, "w-full justify-between h-24 px-10 rounded-[2.5rem]")}
                                            >
                                                <span className="font-black italic text-xl">{format(noteDate, "dd/MM/yyyy")}</span>
                                                <CalendarIcon className="w-8 h-8 text-honey" />
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className={glass.selectContent} align="start">
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
                                <div className="space-y-6">
                                    <label htmlFor="note-time-input" className={glass.microLabel}>{t('note_time')}</label>
                                    <input
                                        id="note-time-input"
                                        type="time"
                                        value={noteTime}
                                        onChange={(e) => setNoteTime(e.target.value)}
                                        className={cn(glass.input, "w-full")}
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-6">
                                <label className={glass.microLabel}>Detailed Body / Observations</label>
                                <textarea
                                    value={description}
                                    onChange={handleDescriptionChange}
                                    className={cn(glass.input, "w-full min-h-[400px] p-10 py-12 leading-relaxed resize-none lowercase placeholder:normal-case")}
                                    placeholder="Describe your findings in detail..."
                                />
                                {updateNoteMutation.isPending && (
                                    <div className="flex items-center gap-4 text-[11px] font-black text-honey uppercase tracking-[0.3em] animate-pulse">
                                        <Loader2 className="w-5 h-5 animate-spin" /> Auto-syncing...
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-8 pt-4">
                            <button
                                type="button"
                                disabled={isSaving}
                                onClick={handleSaveNote}
                                className={cn(glass.btnPrimary, "flex-1")}
                            >
                                {isSaving ? <Loader2 className="w-10 h-10 animate-spin" /> : (isEditingNote ? <Check className="w-10 h-10" /> : <Plus className="w-10 h-10" />)}
                                {isEditingNote ? "Sync Changes" : t('save_note')}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setIsAddingNote(false); setIsEditingNote(null); }}
                                className={cn(glass.btnSecondary, "px-16")}
                            >
                                {t('back_button')}
                            </button>
                        </div>
                    </div>

                    {/* Meta Sidebar */}
                    <div className="lg:col-span-4 space-y-12">
                        <div className={cn(glass.card, "p-12 space-y-12 bg-white/60 dark:bg-[#0D0D0D]/60 backdrop-blur-3xl")}>
                            {/* Priority Selection */}
                            <div className="space-y-8">
                                <label className={glass.microLabel}>{t('priority_label')}</label>
                                <div className="grid grid-cols-1 gap-6">
                                    {['low', 'medium', 'high'].map((p) => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setPriority(p as any)}
                                            className={cn(
                                                "flex items-center gap-6 h-20 px-10 rounded-[2.5rem] border border-white/5 transition-all font-black text-lg uppercase tracking-widest italic outline-none cursor-pointer",
                                                priority === p
                                                    ? cn(
                                                        p === 'low' && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                                                        p === 'medium' && "bg-honey/10 text-honey border-honey/20",
                                                        p === 'high' && "bg-red-500/10 text-red-500 border-red-500/20"
                                                    )
                                                    : "bg-black/5 dark:bg-black/40 text-foreground/30 hover:text-honey hover:border-honey/40"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-4 h-4 rounded-full shadow-4xl animate-pulse",
                                                p === 'low' && "bg-emerald-500",
                                                p === 'medium' && "bg-honey",
                                                p === 'high' && "bg-red-500"
                                            )} />
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Category Selection */}
                            <div className="space-y-8">
                                <label className={glass.microLabel}>{t('category_label')}</label>
                                <div className="flex flex-wrap gap-4">
                                    {['General', 'Health', 'Queen Seen', 'Harvest', 'Varroa'].map((cat) => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => setCategory(cat)}
                                            className={cn(
                                                "px-8 py-4 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all outline-none cursor-pointer italic border border-white/5 shadow-4xl",
                                                category === cat
                                                    ? "bg-honey text-black border-honey"
                                                    : "bg-black/5 dark:bg-black/40 text-foreground/40 hover:text-honey hover:border-honey/40"
                                            )}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Entity Link */}
                            <div className="space-y-8">
                                <label className={glass.microLabel}>Link to Entity</label>
                                <div className="space-y-6">
                                    <select
                                        aria-label="Select Apiary"
                                        value={selectedPlaceId || ""}
                                        onChange={(e) => setSelectedPlaceId(e.target.value || null)}
                                        className={cn(glass.select, "w-full h-20 text-lg rounded-[2.5rem]")}
                                    >
                                        <option value="">Select Apiary</option>
                                        {apiaries.map(a => <option key={a.id} value={a.id}>{a.name.toUpperCase()}</option>)}
                                    </select>
                                    <select
                                        aria-label="Select Hive"
                                        value={selectedHiveId || ""}
                                        onChange={(e) => setSelectedHiveId(e.target.value || null)}
                                        className={cn(glass.select, "w-full h-20 text-lg rounded-[2.5rem]")}
                                    >
                                        <option value="">Select Hive</option>
                                        {hives.filter(h => !selectedPlaceId || h.apiary_id === selectedPlaceId).map(h => (
                                            <option key={h.id} value={h.id}>{h.hive_code.toUpperCase()}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={glass.page}
        >
            <div className="absolute top-0 right-0 w-[60rem] h-[60rem] bg-honey/[0.04] rounded-full blur-[150px] -mr-40 -mt-20 pointer-events-none" />

            {/* Title Section */}
            <PageHeader
                icon={StickyNote}
                label="Observation Repository"
                title={<>Apiary <span className="text-honey">Notes</span></>}
                subtitle="Archive biometric observations, environmental data, and colony health logs in a high-fidelity glass framework."
                actions={
                    <button
                        onClick={() => setIsAddingNote(true)}
                        className={glass.btnPrimary}
                    >
                        <Plus className="w-10 h-10 group-hover:rotate-90 transition-transform duration-1000" />
                        Capture Note
                    </button>
                }
            />

            {/* Filter Hub */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className={glass.filterBar}
            >
                <div className="flex flex-col md:flex-row gap-12 items-center">
                    <div className="relative flex-1 group/sel">
                        <MapPin className="absolute left-10 top-1/2 -translate-y-1/2 w-8 h-8 text-honey opacity-20 group-focus-within/sel:opacity-100 transition-opacity" />
                        <select
                            value={selectedPlaceId || ""}
                            onChange={(e) => setSelectedPlaceId(e.target.value || null)}
                            className={cn(glass.select, "w-full pl-24")}
                        >
                            <option value="">All Locations</option>
                            {apiaries.map(a => <option key={a.id} value={a.id}>{a.name.toUpperCase()}</option>)}
                        </select>
                    </div>

                    <div className="relative flex-1 group/sel">
                        <Box className="absolute left-10 top-1/2 -translate-y-1/2 w-8 h-8 text-honey opacity-20 group-focus-within/sel:opacity-100 transition-opacity" />
                        <select
                            value={selectedHiveId || ""}
                            onChange={(e) => setSelectedHiveId(e.target.value || null)}
                            className={cn(glass.select, "w-full pl-24")}
                        >
                            <option value="">All Hives</option>
                            {hives.filter(h => !selectedPlaceId || h.apiary_id === selectedPlaceId).map(h => (
                                <option key={h.id} value={h.id}>{h.hive_code.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-6 px-10 py-4 bg-black/5 dark:bg-white/5 rounded-full border border-white/5 shadow-4xl skew-x-[-15deg]">
                        <span className="text-[12px] font-black uppercase tracking-[0.4em] skew-x-[15deg] italic text-foreground/40">
                            {filteredNotes.length} Observations
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* Notes Grid */}
            <div className="relative z-10">
                {filteredNotes.length === 0 ? (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={glass.emptyState}>
                        <div className="w-56 h-56 rounded-[4rem] bg-honey/5 border border-honey/20 flex items-center justify-center mb-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-1000 shadow-4xl">
                            <StickyNote className="w-28 h-28 text-honey opacity-20" />
                        </div>
                        <div className="space-y-6">
                            <h3 className="text-6xl font-black italic text-foreground tracking-tighter uppercase leading-none opacity-40">Zero Observations</h3>
                            <p className={cn(glass.microLabel, "max-w-xl mx-auto")}>No logs found for this selection. Initiate a new record to begin tracking.</p>
                        </div>
                        <button onClick={() => setIsAddingNote(true)} className={cn(glass.btnPrimary, "mt-16")}>
                            <Plus className="w-10 h-10 mr-6" /> Record First Note
                        </button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-14">
                        <AnimatePresence>
                            {filteredNotes.map((note, i) => (
                                <motion.div
                                    key={note.id}
                                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 30 }}
                                    transition={{ delay: i * 0.05, duration: 0.8 }}
                                    className={cn(glass.card, "p-12 hover:border-honey/60 group cursor-default")}
                                >
                                    <div className={cn("absolute top-0 right-0 w-3 h-full group-hover:w-4 transition-all duration-700",
                                        note.priority === 'high' ? "bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]" :
                                            note.priority === 'medium' ? "bg-honey shadow-[0_0_20px_rgba(251,191,36,0.4)]" : "bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                                    )} />

                                    <div className="flex items-center justify-between mb-10">
                                        <div className={cn(glass.badge, "bg-black/5 dark:bg-white/5 text-foreground/40 border-white/5")}>
                                            <span className="skew-x-[15deg] block">{note.category?.toUpperCase() || "GENERAL"}</span>
                                        </div>
                                        <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-all duration-700 translate-x-4 group-hover:translate-x-0">
                                            <button onClick={() => setIsEditingNote(note)} className="w-14 h-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center hover:bg-honey/20 hover:text-honey transition-all">
                                                <Edit className="w-7 h-7" />
                                            </button>
                                            <button onClick={() => handleDeleteNote(note.id)} className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/10 flex items-center justify-center hover:bg-red-500/20 hover:text-red-500 transition-all">
                                                <Trash2 className="w-7 h-7" />
                                            </button>
                                        </div>
                                    </div>

                                    <h4 className="text-4xl font-black italic text-foreground tracking-tighter uppercase mb-6 line-clamp-2 leading-none group-hover:text-honey transition-colors duration-700">
                                        {note.title || "Observation Log"}
                                    </h4>

                                    <div className="bg-black/5 dark:bg-black/30 rounded-[2.5rem] p-8 border border-white/5 shadow-inner mb-8 group-hover:border-honey/20 transition-all duration-1000">
                                        <p className="text-xl font-black text-foreground/40 italic leading-relaxed line-clamp-4 lowercase first-letter:uppercase">
                                            {note.content}
                                        </p>
                                    </div>

                                    <div className="pt-8 border-t border-white/5 flex flex-wrap gap-8">
                                        <div className="flex items-center gap-4">
                                            <CalendarIcon className="w-6 h-6 text-honey opacity-30" />
                                            <span className="text-[12px] font-black text-foreground/20 italic uppercase tracking-[0.2em]">{format(new Date(note.note_date || note.created_at!), "dd MMM yyyy").toUpperCase()}</span>
                                        </div>
                                        {note.hive_id && (
                                            <div className="flex items-center gap-4 px-6 py-2 bg-honey/5 border border-honey/10 rounded-full skew-x-[-15deg]">
                                                <Box className="w-5 h-5 text-honey skew-x-[15deg]" />
                                                <span className="text-[10px] font-black uppercase text-honey tracking-[0.3em] skew-x-[15deg] italic">
                                                    HIVE: {hives.find(h => h.id === note.hive_id)?.hive_code.toUpperCase() || "UNIT"}
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
        </motion.div>
    );
};

export default MyNotesView;

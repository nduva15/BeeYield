import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Calendar as CalendarIcon,
    Clock as ClockIcon,
    MapPin,
    Box,
    Check,
    ChevronDown,
    ArrowLeft,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isToday,
    getDate
} from 'date-fns';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { beeyieldService, Apiary, Hive, Task } from '@/services/beeyieldService';
import { useAuth } from '@/contexts/AuthContext';

interface MyTaskViewProps {
    onTabChange: (tab: string, message?: string, action?: string) => void;
    initialAction?: 'add';
    onInitialActionConsumed?: () => void;
}



const MyTaskView: React.FC<MyTaskViewProps> = ({
    onTabChange,
    initialAction,
    onInitialActionConsumed
}) => {
    const { t } = useLanguage();
    const [view, setView] = React.useState<'list' | 'month'>('month');
    const [currentDate, setCurrentDate] = React.useState(new Date());
    const [isAddingTask, setIsAddingTask] = React.useState(false);

    // Form States
    const [title, setTitle] = React.useState("");
    const [taskDate, setTaskDate] = React.useState<Date>(new Date());
    const [taskTime, setTaskTime] = React.useState("00:00");
    const [priority, setPriority] = React.useState<"Low" | "Medium" | "High">("Medium");
    const [taskType, setTaskType] = React.useState<"Inspection" | "Feeding" | "Treatment" | "Harvest" | "Other">("Inspection");
    const [category, setCategory] = React.useState("General");
    const [description, setDescription] = React.useState("");
    const [isRecurring, setIsRecurring] = React.useState(false);
    const [recurrenceDays, setRecurrenceDays] = React.useState("7");
    const [selectedApiary, setSelectedApiary] = React.useState<Apiary | null>(null);
    const [selectedHive, setSelectedHive] = React.useState<Hive | null>(null);
    const [isApiaryOpen, setIsApiaryOpen] = React.useState(false);
    const [isHiveOpen, setIsHiveOpen] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);

    // Data States
    const [apiaries, setApiaries] = React.useState<Apiary[]>([]);
    const [hives, setHives] = React.useState<Hive[]>([]);
    const [tasks, setTasks] = React.useState<Task[]>([]);
    const { user, beeyieldUser } = useAuth();
    const userId = beeyieldUser?.id || user?.id;

    // Clock UI State
    const [isClockMinutes, setIsClockMinutes] = React.useState(false);

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    React.useEffect(() => {
        const fetchAllData = async () => {
            try {
                const [apiariesData, hivesData, tasksData] = await Promise.all([
                    beeyieldService.getApiaries(),
                    beeyieldService.getHives(),
                    beeyieldService.getTasks()
                ]);

                if (userId) {
                    setApiaries(apiariesData.filter(a => !a.user_id || a.user_id === userId));
                    setHives(hivesData.filter(h => !h.user_id || h.user_id === userId));
                    setTasks(tasksData.filter(t => !t.user_id || t.user_id === userId));
                } else {
                    setApiaries(apiariesData);
                    setHives(hivesData);
                    setTasks(tasksData);
                }
            } catch (error) {
                console.error("Error fetching data", error);
                toast.error(t('error_load_apiary'));
            }
        };

        if (initialAction === 'add') {
            setIsAddingTask(true);
            onInitialActionConsumed?.();
        }
        fetchAllData();
    }, [initialAction, userId]);

    const generateCalendarDays = () => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

        return eachDayOfInterval({
            start: startDate,
            end: endDate
        });
    };

    const handleSave = async () => {
        if (!title.trim()) {
            toast.error(t('error_title_required'));
            return;
        }

        setIsSaving(true);

        try {
            // Construct timestamp
            const [hours, minutes] = taskTime.split(':').map(Number);
            const due = new Date(taskDate);
            due.setHours(hours, minutes);

            const { error } = await beeyieldService.createTask({
                title,
                description,
                status: 'pending',
                priority,
                type: taskType,
                category,
                due_date: due.toISOString(),
                apiary_id: selectedApiary?.id,
                hive_id: selectedHive?.id,
                is_completed: false,
                recurrence: isRecurring ? JSON.stringify({ days: parseInt(recurrenceDays) || 7 }) : "None"
            });

            if (error) throw error;

            toast.success(t('task_saved_success'));
            setIsAddingTask(false);

            // Refresh tasks
            const latestTasks = await beeyieldService.getTasks();
            setTasks(latestTasks);

            // Reset form
            setTitle("");
            setTaskDate(new Date());
            setTaskTime("00:00");
            setSelectedApiary(null);
            setSelectedHive(null);
            setPriority("Medium");
            setCategory("General");
            setDescription("");
        } catch (error) {
            console.error(error);
            toast.error(t('task_saved_error'));
        } finally {
            setIsSaving(false);
        }
    };

    if (isAddingTask) {
        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 relative min-h-[600px]">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsAddingTask(false)}
                        className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <ArrowLeft className="w-6 h-6 text-slate-700 dark:text-slate-300" />
                    </Button>
                    <h1 className="text-[2.5rem] font-bold text-[#1B9157] dark:text-[#F4D03F] tracking-tight">{t('add_task')}</h1>
                </div>

                <div className="bg-white dark:bg-[#09090b] p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 space-y-8 max-w-4xl">

                    {/* Title */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('task_title_label')}<span className="text-red-500">*</span></label>
                        <input
                            id="task-title"
                            name="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={t('task_title_placeholder')}
                            className="w-full h-14 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-6 font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#1B9157]/10 transition-all font-sans text-lg placeholder:text-slate-300"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Task Type */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('task_type_label') || "Task Type"}<span className="text-red-500">*</span></label>
                            <div className="flex flex-wrap gap-2">
                                {['Inspection', 'Feeding', 'Treatment', 'Harvest', 'Other'].map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setTaskType(type as any)}
                                        className={cn(
                                            "flex-1 px-4 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all outline-none cursor-pointer border-2",
                                            taskType === type
                                                ? "bg-[#1B9157] text-white border-[#1B9157] shadow-lg shadow-[#1B9157]/40"
                                                : "bg-slate-50 text-slate-400 border-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-500"
                                        )}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Recurring Toggle */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('recurring_task_label') || "Recurring Task"}</label>
                            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900 h-14 rounded-2xl px-6">
                                <label htmlFor="task-recurring-checkbox" className="text-sm font-bold text-slate-600 dark:text-slate-300 flex-1">Repeat this task?</label>
                                <input
                                    id="task-recurring-checkbox"
                                    name="is_recurring"
                                    type="checkbox"
                                    checked={isRecurring}
                                    onChange={(e) => setIsRecurring(e.target.checked)}
                                    className="w-5 h-5 accent-[#1B9157]"
                                />
                                {isRecurring && (
                                    <div className="flex items-center gap-2 ml-4 border-l border-slate-200 dark:border-slate-700 pl-4">
                                        <label htmlFor="task-recurrence-days" className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Every</label>
                                        <input
                                            id="task-recurrence-days"
                                            name="recurrence_days"
                                            type="number"
                                            value={recurrenceDays}
                                            onChange={(e) => setRecurrenceDays(e.target.value)}
                                            className="w-12 bg-transparent border-none text-center font-black text-[#1B9157] focus:ring-0"
                                        />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Days</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Date */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('task_date')}<span className="text-red-500">*</span></label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button
                                        type="button"
                                        className="w-full h-14 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-6 font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#1B9157]/10 transition-all font-sans flex items-center justify-between group"
                                    >
                                        <span>{format(taskDate, "dd MMM yyyy")}</span>
                                        <CalendarIcon className="w-5 h-5 text-[#1B9157] group-hover:text-[#1B9157]/80" />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 rounded-3xl border-slate-100 shadow-2xl" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={taskDate}
                                        onSelect={(date) => date && setTaskDate(date)}
                                        initialFocus
                                        className="rounded-3xl border-none"
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Time */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('task_time')}</label>
                            <Popover onOpenChange={(open) => !open && setIsClockMinutes(false)}>
                                <PopoverTrigger asChild>
                                    <button
                                        type="button"
                                        className="w-full h-14 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-6 font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#1B9157]/10 transition-all font-sans flex items-center justify-between group"
                                    >
                                        <span>{taskTime}</span>
                                        <ClockIcon className="w-5 h-5 text-[#1B9157]" />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[320px] p-0 rounded-[2.5rem] border-slate-100 shadow-2xl z-[100]" align="start">
                                    <div className="p-8 space-y-6 flex flex-col items-center select-none">
                                        <div className="flex items-center justify-between w-full border-b border-slate-50 pb-4">
                                            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                                {isClockMinutes ? t('select_minutes') : t('select_hour')}
                                            </h4>
                                            <div className="flex gap-1 items-center">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsClockMinutes(false)}
                                                    className={cn("text-xl font-black", !isClockMinutes ? "text-[#1B9157]" : "text-slate-300")}
                                                >
                                                    {taskTime.split(':')[0]}
                                                </button>
                                                <span className="text-xl font-black text-slate-300">:</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsClockMinutes(true)}
                                                    className={cn("text-xl font-black", isClockMinutes ? "text-[#1B9157]" : "text-slate-300")}
                                                >
                                                    {taskTime.split(':')[1]}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="relative w-48 h-48 bg-slate-50 rounded-full flex items-center justify-center shadow-inner">
                                            <div className="w-2 h-2 rounded-full bg-[#1B9157] z-10" />
                                            {isClockMinutes ? (
                                                Array.from({ length: 12 }).map((_, i) => {
                                                    const m = (i * 5).toString().padStart(2, '0');
                                                    const angle = (i * 30) - 90;
                                                    const x = 50 + 38 * Math.cos(angle * Math.PI / 180);
                                                    const y = 50 + 38 * Math.sin(angle * Math.PI / 180);
                                                    const isSelected = taskTime.split(':')[1] === m;
                                                    return (
                                                        <button
                                                            key={`m-${m}`}
                                                            type="button"
                                                            onClick={() => {
                                                                const [h] = taskTime.split(':');
                                                                setTaskTime(`${h}:${m}`);
                                                            }}
                                                            className={cn(
                                                                "absolute w-8 h-8 rounded-full text-xs font-black transition-all flex items-center justify-center -translate-x-1/2 -translate-y-1/2",
                                                                isSelected ? "bg-[#F4D03F] text-slate-900 shadow-lg" : "text-slate-400 hover:bg-white hover:text-[#F4D03F]"
                                                            )}
                                                            style={{ left: `${x}%`, top: `${y}%` }}
                                                        >
                                                            {m}
                                                        </button>
                                                    );
                                                })
                                            ) : (
                                                Array.from({ length: 12 }).map((_, i) => {
                                                    const h = (i === 0 ? 12 : i).toString().padStart(2, '0');
                                                    const angle = (i * 30) - 90;
                                                    const x = 50 + 38 * Math.cos(angle * Math.PI / 180);
                                                    const y = 50 + 38 * Math.sin(angle * Math.PI / 180);
                                                    const isSelected = taskTime.split(':')[0] === h;
                                                    return (
                                                        <button
                                                            key={`h-${h}`}
                                                            type="button"
                                                            onClick={() => {
                                                                const [_, m] = taskTime.split(':');
                                                                setTaskTime(`${h}:${m}`);
                                                                setIsClockMinutes(true);
                                                            }}
                                                            className={cn(
                                                                "absolute w-8 h-8 rounded-full text-sm font-black transition-all flex items-center justify-center -translate-x-1/2 -translate-y-1/2",
                                                                isSelected ? "bg-[#F4D03F] text-slate-900 shadow-lg" : "text-slate-400 hover:bg-white hover:text-[#F4D03F]"
                                                            )}
                                                            style={{ left: `${x}%`, top: `${y}%` }}
                                                        >
                                                            {i === 0 ? 12 : i}
                                                        </button>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Apiary */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('apiary_label')}</label>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => { setIsApiaryOpen(!isApiaryOpen); setIsHiveOpen(false); }}
                                    className="w-full h-14 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-6 font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#1B9157]/10 transition-all font-sans flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-3">
                                        <MapPin className="w-5 h-5 text-[#1B9157]" />
                                        <span>{selectedApiary ? selectedApiary.name : t('none_label')}</span>
                                    </div>
                                    <ChevronDown className={cn("w-4 h-4 text-slate-300 transition-transform", isApiaryOpen && "rotate-180")} />
                                </button>
                                <AnimatePresence>
                                    {isApiaryOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-2 max-h-[250px] overflow-y-auto"
                                        >
                                            <button
                                                onClick={() => { setSelectedApiary(null); setIsApiaryOpen(false); }}
                                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F4D03F]/10 dark:hover:bg-[#F4D03F]/20 rounded-xl transition-colors text-slate-600 dark:text-slate-300 font-bold text-sm"
                                            >
                                                <span>{t('none_label')}</span>
                                                {!selectedApiary && <Check className="w-4 h-4 ml-auto text-[#1B9157]" />}
                                            </button>
                                            {apiaries.map(apiary => (
                                                <button
                                                    key={apiary.id}
                                                    onClick={() => { setSelectedApiary(apiary); setIsApiaryOpen(false); }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F4D03F]/10 dark:hover:bg-[#F4D03F]/20 rounded-xl transition-colors text-slate-600 dark:text-slate-300 font-bold text-sm"
                                                >
                                                    <span>{apiary.name}</span>
                                                    {selectedApiary?.id === apiary.id && <Check className="w-4 h-4 ml-auto text-[#1B9157]" />}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Hive */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('hive_label')}</label>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => { setIsHiveOpen(!isHiveOpen); setIsApiaryOpen(false); }}
                                    className="w-full h-14 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-6 font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#1B9157]/10 transition-all font-sans flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-3">
                                        <Box className="w-5 h-5 text-[#1B9157]" />
                                        <span>{selectedHive ? selectedHive.hive_code : t('none_label')}</span>
                                    </div>
                                    <ChevronDown className={cn("w-4 h-4 text-slate-300 transition-transform", isHiveOpen && "rotate-180")} />
                                </button>
                                <AnimatePresence>
                                    {isHiveOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-2 max-h-[250px] overflow-y-auto"
                                        >
                                            <button
                                                onClick={() => { setSelectedHive(null); setIsHiveOpen(false); }}
                                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F4D03F]/10 dark:hover:bg-[#F4D03F]/20 rounded-xl transition-colors text-slate-600 dark:text-slate-300 font-bold text-sm"
                                            >
                                                <span>{t('none_label')}</span>
                                                {!selectedHive && <Check className="w-4 h-4 ml-auto text-[#1B9157]" />}
                                            </button>
                                            {hives
                                                .filter(h => !selectedApiary || h.apiary_id === selectedApiary.id)
                                                .map(hive => (
                                                    <button
                                                        key={hive.id}
                                                        onClick={() => { setSelectedHive(hive); setIsHiveOpen(false); }}
                                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F4D03F]/10 dark:hover:bg-[#F4D03F]/20 rounded-xl transition-colors text-slate-600 dark:text-slate-300 font-bold text-sm"
                                                    >
                                                        <span>{hive.hive_code}</span>
                                                        {selectedHive?.id === hive.id && <Check className="w-4 h-4 ml-auto text-[#1B9157]" />}
                                                    </button>
                                                ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Priority */}
                        <div className="space-y-4">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('priority_label')}</label>
                            <div className="flex gap-2">
                                {['Low', 'Medium', 'High'].map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setPriority(p as any)}
                                        className={cn(
                                            "flex-1 flex items-center justify-center gap-2 h-12 rounded-xl border-2 transition-all font-bold text-[10px] uppercase tracking-widest outline-none cursor-pointer",
                                            priority === p
                                                ? cn(
                                                    p === 'Low' && "border-green-200 bg-green-50 text-[#1B9157]",
                                                    p === 'Medium' && "border-[#F4D03F]/20 bg-[#F4D03F]/5 text-[#7a6820]",
                                                    p === 'High' && "border-rose-200 bg-rose-50 text-rose-600"
                                                )
                                                : "border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-500"
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

                        {/* Category */}
                        <div className="space-y-4">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('category_label')}</label>
                            <div className="flex flex-wrap gap-2">
                                {['Inspection', 'Feeding', 'Harvest', 'General'].map((cat) => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setCategory(cat)}
                                        className={cn(
                                            "px-4 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all outline-none cursor-pointer flex-1",
                                            category === cat
                                                ? "bg-[#1B9157] text-white shadow-lg shadow-[#1B9157]/40"
                                                : "bg-slate-50 text-slate-400 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-500"
                                        )}
                                    >
                                        {t(`category_${cat.toLowerCase()}`)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('description_label')}</label>
                        <textarea
                            id="task-description"
                            name="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full min-h-[120px] bg-slate-50 dark:bg-slate-900 border-none rounded-[2rem] p-6 font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-4 focus:ring-[#1B9157]/10 transition-all resize-none leading-relaxed font-sans placeholder:text-slate-300"
                            placeholder="Add any additional details about this task..."
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 pt-6">
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex-1 h-14 rounded-xl bg-[#1B9157] hover:bg-[#167d4a] text-white font-bold text-lg shadow-lg shadow-green-500/10 dark:shadow-none disabled:opacity-70"
                        >
                            {isSaving ? <Loader2 className="animate-spin" /> : t('save_task')}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setIsAddingTask(false)}
                            className="px-8 h-14 rounded-xl border-2 border-[#1B9157]/20 font-bold text-[#1B9157] dark:text-[#F4D03F] hover:bg-[#1B9157]/5 dark:hover:bg-slate-800"
                        >
                            {t('go_back')}
                        </Button>
                    </div>
                </div>

                {/* Backdrop for click-away */}
                {(isApiaryOpen || isHiveOpen) && (
                    <div
                        className="fixed inset-0 z-40 bg-transparent"
                        onClick={() => {
                            setIsApiaryOpen(false);
                            setIsHiveOpen(false);
                        }}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20 relative">

            <div className="flex justify-between items-end px-2">
                <h1 className="text-[2.5rem] font-bold text-[#1B9157] dark:text-[#F4D03F] tracking-tight">{t('tasks_title')}</h1>
            </div>

            <div className="relative">
                <Card className="rounded-[2rem] border-none bg-white dark:bg-[#09090b] shadow-2xl overflow-hidden ring-1 ring-slate-100 dark:ring-gray-800">
                    <CardContent className="p-0">
                        {/* Calendar Header */}
                        <div className="flex items-center justify-between p-6 bg-[#FEF9E7] dark:bg-[#1a1a1a]">
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                                    size="icon"
                                    className="w-10 h-10 rounded-lg bg-[#F4D03F] hover:bg-[#F4D03F] text-slate-800 border-none"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </Button>
                                <Button
                                    onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                                    size="icon"
                                    className="w-10 h-10 rounded-lg bg-[#F4D03F] hover:bg-[#F4D03F] text-slate-800 border-none"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </Button>
                            </div>

                            <h2 className="text-3xl font-semibold text-slate-800 dark:text-white">
                                {format(currentDate, "MMMM yyyy")}
                            </h2>

                            <div className="flex bg-[#F4D03F] dark:bg-[#1e1e1e] p-1 rounded-lg">
                                <Button
                                    onClick={() => setView('list')}
                                    className={cn(
                                        view === 'list' ? "bg-[#1B9157] text-white" : "bg-transparent text-slate-700 dark:text-slate-400"
                                    )}
                                >
                                    {t('list_view')}
                                </Button>
                                <Button
                                    onClick={() => setView('month')}
                                    className={cn(
                                        "px-6 h-9 rounded-md text-xs font-bold transition-all border-none",
                                        view === 'month' ? "bg-[#1B9157] text-white" : "bg-transparent text-slate-700 dark:text-slate-400"
                                    )}
                                >
                                    {t('month_view')}
                                </Button>
                            </div>
                        </div>

                        {/* Calendar Content */}
                        <div className="bg-[#FEF9E7] dark:bg-[#0c0c0c] min-h-[400px]">
                            {view === 'month' ? (
                                <div className="grid grid-cols-7">
                                    {/* Day Labels */}
                                    {days.map((day) => (
                                        <div key={day} className="h-10 flex items-center justify-center border-r border-b border-[#F4D03F]/20 dark:border-gray-800">
                                            <span className="text-sm font-medium text-[#F4D03F]">
                                                {day}
                                            </span>
                                        </div>
                                    ))}

                                    {/* Date Cells */}
                                    {generateCalendarDays().map((day, i) => {
                                        const isCurrentMonth = isSameMonth(day, currentDate);
                                        const isTodayDate = isToday(day);

                                        return (
                                            <div
                                                key={i}
                                                className={cn(
                                                    "min-h-[100px] p-2 text-right border-r border-b border-[#F4D03F]/20 dark:border-gray-800 relative group cursor-pointer hover:bg-white/50 transition-colors",
                                                    !isCurrentMonth && "bg-slate-50/50 dark:bg-black/20"
                                                )}
                                            >
                                                <span className={cn(
                                                    "text-sm font-medium block",
                                                    isCurrentMonth ? "text-[#1A1A1A] dark:text-white" : "text-gray-300 dark:text-gray-700",
                                                    isTodayDate && "bg-[#F4D03F] text-[#1A1A1A] w-7 h-7 rounded-full flex items-center justify-center ml-auto"
                                                )}>
                                                    {getDate(day)}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-6 space-y-4">
                                    {eachDayOfInterval({
                                        start: startOfMonth(currentDate),
                                        end: endOfMonth(currentDate)
                                    })
                                        .filter(date => date.getDay() === 1) // Get all Mondays
                                        .map((monday, i) => {
                                            const sunday = endOfWeek(monday, { weekStartsOn: 1 });
                                            return (
                                                <div key={i} className="bg-white dark:bg-[#1a1a1a] p-4 rounded-xl border border-[#F4D03F]/10 dark:border-gray-800 shadow-sm">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">
                                                            Week {format(monday, 'do')} - {format(sunday, 'do')}
                                                        </h3>
                                                        <span className="text-xs font-semibold text-[#1B9157] bg-[#1B9157]/10 px-3 py-1 rounded-full uppercase tracking-wider">
                                                            {format(monday, 'MMM yyyy')}
                                                        </span>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {tasks
                                                            .filter(t => {
                                                                if (!t.due_date) return false;
                                                                const d = new Date(t.due_date);
                                                                return d >= monday && d <= sunday;
                                                            })
                                                            .map(task => (
                                                                <div key={task.id} className="p-4 bg-slate-50 dark:bg-black/20 rounded-lg flex items-center justify-between group hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className={cn(
                                                                            "w-2 h-2 rounded-full",
                                                                            task.priority === 'High' ? "bg-red-500" : task.priority === 'Medium' ? "bg-[#F4D03F]" : "bg-[#1B9157]"
                                                                        )} />
                                                                        <div>
                                                                            <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm">{task.title}</h4>
                                                                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                                                                {task.type} • {format(new Date(task.due_date!), 'h:mm a')}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    {task.hive && (
                                                                        <span className="text-[10px] font-mono bg-white dark:bg-black px-2 py-1 rounded border border-slate-100 dark:border-gray-800 text-slate-500">
                                                                            {task.hive.hive_code}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ))
                                                        }
                                                        {tasks.filter(t => t.due_date && new Date(t.due_date) >= monday && new Date(t.due_date) <= sunday).length === 0 && (
                                                            <div className="p-4 bg-slate-50 dark:bg-black/20 rounded-lg text-center">
                                                                <span className="text-slate-400 text-sm font-medium">{t('no_tasks_week')}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Floating Action Button */}
                {/* Floating Action Button */}
                <motion.div
                    className="fixed top-1/2 right-8 z-50"
                    initial={{ y: "-50%" }}
                    animate={{ y: ["-50%", "-60%", "-50%"] }} // Gentle bobbing effect
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <Button
                        onClick={() => setIsAddingTask(true)}
                        size="icon"
                        className="w-16 h-16 rounded-full bg-[#F4D03F] hover:bg-[#F4D03F] transition-colors text-slate-800 border-none shadow-xl flex items-center justify-center"
                    >
                        <Plus className="w-8 h-8" />
                    </Button>
                </motion.div>
            </div>
        </div>
    );
};

export default MyTaskView;

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
    Loader2,
    Repeat,
    PauseCircle,
    StopCircle,
    LayoutGrid,
    CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { glass, PageHeader, GlassStatCard } from './GlassTheme';
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
import {
    MoreVertical,
    Pause,
    Play,
    StopCircle as StopIcon
} from 'lucide-react';

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
                is_recurring: isRecurring,
                recurrence_days: isRecurring ? parseInt(recurrenceDays) : undefined,
                recurrence_status: isRecurring ? 'active' : undefined,
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

    const toggleTaskCompletion = async (task: Task) => {
        try {
            const { error } = await beeyieldService.updateTask(task.id, {
                is_completed: !task.is_completed,
                status: !task.is_completed ? 'completed' : 'pending'
            });
            if (error) throw error;

            toast.success(task.is_completed ? 'Task reopened' : 'Task completed');

            // Refresh tasks
            const latestTasks = await beeyieldService.getTasks();
            setTasks(latestTasks);
        } catch (error) {
            console.error(error);
            toast.error('Failed to update task');
        }
    };

    const updateRecurrenceStatus = async (task: Task, status: 'active' | 'paused' | 'stopped') => {
        try {
            const { error } = await beeyieldService.updateTask(task.id, {
                recurrence_status: status
            });
            if (error) throw error;

            toast.success(`Recurrence ${status}`);

            // Refresh tasks
            const latestTasks = await beeyieldService.getTasks();
            setTasks(latestTasks);
        } catch (error) {
            console.error(error);
            toast.error('Failed to update status');
        }
    };

    if (isAddingTask) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className={glass.page}
            >
                <PageHeader
                    icon={LayoutGrid}
                    label="Operations Protocol"
                    title={<>Schedule <span className="text-[#F4D03F]">Task</span></>}
                    subtitle="Coordinate apiary logistics and maintenance schedules with precision-timed operational logs."
                    actions={
                        <button
                            onClick={() => setIsAddingTask(false)}
                            className={glass.btnSecondary}
                        >
                            <ChevronDown className="w-6 h-6 rotate-90" />
                            Return
                        </button>
                    }
                />

                <div className="max-w-4xl mx-auto relative z-10">
                    <div className={cn(glass.card, "p-16 space-y-12 bg-[#FFF9F0]/60 backdrop-blur-3xl")}>
                        <div className="space-y-6">
                            <label className={glass.microLabel}>{t('task_title_label')}</label>
                            <input
                                placeholder={t('task_title_placeholder')}
                                className={glass.input}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <label className={glass.microLabel}>{t('task_date')}</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <button className={cn(glass.btnSecondary, "w-full justify-between h-24 px-10 rounded-[2.5rem]")}>
                                            <span className="font-black italic text-xl">{format(taskDate, "dd MMM yyyy")}</span>
                                            <CalendarIcon className="w-8 h-8 text-[#F4D03F]" />
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent className={glass.selectContent} align="start">
                                        <Calendar
                                            mode="single"
                                            selected={taskDate}
                                            onSelect={(date) => date && setTaskDate(date)}
                                            className="rounded-3xl border-none"
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-6">
                                <label className={glass.microLabel}>{t('priority_label')}</label>
                                <select
                                    className={glass.select}
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value as any)}
                                >
                                    <option value="Low">Low Priority</option>
                                    <option value="Medium">Medium Priority</option>
                                    <option value="High">High Priority</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <label className={glass.microLabel}>{t('description_label')}</label>
                            <textarea
                                placeholder="Operational details..."
                                className={cn(glass.input, "min-h-[200px] p-10 py-12")}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-8 pt-4">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className={cn(glass.btnPrimary, "flex-1")}
                            >
                                {isSaving ? <Loader2 className="w-10 h-10 animate-spin" /> : <CheckCircle2 className="w-10 h-10" />}
                                Initiate Protocol
                            </button>
                            <button
                                onClick={() => setIsAddingTask(false)}
                                className={cn(glass.btnSecondary, "px-16")}
                            >
                                {t('go_back')}
                            </button>
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
            <div className="absolute top-0 right-0 w-[60rem] h-[60rem] bg-[#F4D03F]/[0.04] rounded-full blur-[150px] -mr-40 -mt-20 pointer-events-none" />

            {/* Header */}
            <PageHeader
                icon={CalendarIcon}
                label="Operational Schedule"
                title={<>Fleet <span className="text-[#F4D03F]">Logistics</span></>}
                subtitle="Track and coordinate maintenance, inspections, and logistics across your entire apiary network."
                actions={
                    <div className="flex gap-8 relative z-10">
                        <div className="flex bg-[#F9F7F2] p-3 rounded-[2.5rem] border border-[#F4D03F]/10 shadow-inner">
                            <button
                                onClick={() => setView('list')}
                                className={cn(
                                    "px-10 py-4 rounded-[2rem] font-black italic text-lg uppercase tracking-tight transition-all duration-500",
                                    view === 'list' ? "bg-[#F4D03F] text-[#1A1A1A] shadow-4xl" : "text-foreground/40 hover:text-[#F4D03F]"
                                )}
                            >
                                List
                            </button>
                            <button
                                onClick={() => setView('month')}
                                className={cn(
                                    "px-10 py-4 rounded-[2rem] font-black italic text-lg uppercase tracking-tight transition-all duration-500",
                                    view === 'month' ? "bg-[#F4D03F] text-[#1A1A1A] shadow-4xl" : "text-foreground/40 hover:text-[#F4D03F]"
                                )}
                            >
                                Calendar
                            </button>
                        </div>
                        <button
                            onClick={() => setIsAddingTask(true)}
                            className={glass.btnPrimary}
                        >
                            <Plus className="w-10 h-10 group-hover:rotate-90 transition-transform duration-1000" />
                            Schedule Task
                        </button>
                    </div>
                }
            />

            {/* Content Hub */}
            <div className="relative z-10">
                {view === 'month' ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={cn(glass.card, "p-12 bg-[#FFF9F0]/60 backdrop-blur-3xl min-h-[800px]")}
                    >
                        {/* Month Navigation */}
                        <div className="flex items-center justify-between mb-12">
                            <h3 className="text-6xl font-black italic text-foreground tracking-tighter uppercase leading-none">
                                {format(currentDate, "MMMM")} <span className="text-[#F4D03F]">{format(currentDate, "yyyy")}</span>
                            </h3>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                                    className={cn(glass.btnSecondary, "w-16 h-16 p-0 flex items-center justify-center")}
                                >
                                    <ChevronLeft className="w-8 h-8" />
                                </button>
                                <button
                                    onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                                    className={cn(glass.btnSecondary, "w-16 h-16 p-0 flex items-center justify-center")}
                                >
                                    <ChevronRight className="w-8 h-8" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-6">
                            {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(d => (
                                <div key={d} className="text-center py-6">
                                    <span className="text-[12px] font-black text-foreground/20 italic tracking-[0.4em] uppercase">{d}</span>
                                </div>
                            ))}
                            {generateCalendarDays().map((date, i) => {
                                const dateStr = format(date, 'yyyy-MM-dd');
                                const isCurrentMonth = isSameMonth(date, currentDate);
                                const isTodayDate = isToday(date);
                                const dayTasks = tasks.filter(t => t.due_date?.startsWith(dateStr));

                                return (
                                    <div
                                        key={i}
                                        className={cn(
                                            "min-h-[160px] rounded-[3rem] p-6 border transition-all duration-500 group/day relative",
                                            isCurrentMonth ? "bg-gray-400 border-[#F4D03F]/10" : "opacity-10 pointer-events-none",
                                            isTodayDate ? "ring-4 ring-[#F4D03F]/40 border-[#F4D03F]/40" : "hover:border-[#F4D03F]/20"
                                        )}
                                    >
                                        <span className={cn(
                                            "text-4xl font-black italic tracking-tighter tabular-nums",
                                            isTodayDate ? "text-[#F4D03F]" : "text-foreground/20"
                                        )}>
                                            {format(date, 'd')}
                                        </span>

                                        <div className="mt-4 space-y-2">
                                            {dayTasks.map(task => (
                                                <div
                                                    key={task.id}
                                                    className={cn(
                                                        "px-4 py-2 rounded-full border border-[#F4D03F]/10 flex items-center gap-2 overflow-hidden",
                                                        task.priority === 'High' ? "bg-red-500/10 text-red-500" :
                                                            task.priority === 'Medium' ? "bg-[#F4D03F]/10 text-[#F4D03F]" : "bg-[#1B9157]/ text-[#1B9157]"
                                                    )}
                                                >
                                                    <div className={cn("w-2 h-2 rounded-full",
                                                        task.priority === 'High' ? "bg-red-500" :
                                                            task.priority === 'Medium' ? "bg-[#F4D03F]" : "bg-[#1B9157]"
                                                    )} />
                                                    <span className="text-[10px] font-black uppercase tracking-tight truncate italic">{task.title}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                ) : (
                    <div className="space-y-16">
                        {/* Task List Grid */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                            <AnimatePresence>
                                {tasks.sort((a, b) => new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime()).map((task, i) => (
                                    <motion.div
                                        key={task.id}
                                        initial={{ opacity: 0, x: -30 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05, duration: 0.8 }}
                                        className={cn(
                                            glass.card,
                                            "p-12 pl-20 relative group hover:border-[#F4D03F]/60 cursor-default",
                                            task.is_completed && "opacity-60"
                                        )}
                                    >
                                        <div className={cn(
                                            "absolute left-0 top-0 w-4 h-full transition-all duration-700",
                                            task.is_completed ? "bg-[#1B9157] shadow-[0_0_20px_rgba(16,185,129,0.4)]" :
                                                task.priority === 'High' ? "bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]" :
                                                    task.priority === 'Medium' ? "bg-[#F4D03F] shadow-[0_0_20px_rgba(251,191,36,0.4)]" : "bg-slate-400"
                                        )} />

                                        <div className="flex items-center justify-between mb-8">
                                            <div className="flex items-center gap-6">
                                                <button
                                                    onClick={() => toggleTaskCompletion(task)}
                                                    className={cn(
                                                        "w-14 h-14 rounded-2xl border flex items-center justify-center transition-all duration-700",
                                                        task.is_completed
                                                            ? "bg-[#1B9157] border-emerald-500 text-[#1A1A1A] shadow-4xl"
                                                            : "bg-[#F4D03F]/10 border-[#F4D03F]/20 text-gray-400 hover:border-[#F4D03F] hover:text-[#F4D03F]"
                                                    )}
                                                >
                                                    <CheckCircle2 className="w-8 h-8" />
                                                </button>
                                                <div className="flex flex-col">
                                                    <h3 className={cn(
                                                        "text-4xl font-black italic tracking-tighter uppercase leading-none truncate max-w-[400px] transition-all",
                                                        task.is_completed ? "text-foreground/30 line-through" : "text-foreground group-hover:text-[#F4D03F]"
                                                    )}>
                                                        {task.title}
                                                    </h3>
                                                    <div className="flex items-center gap-4 mt-2">
                                                        <ClockIcon className="w-4 h-4 text-[#F4D03F] opacity-30" />
                                                        <span className="text-[11px] font-black text-foreground/20 italic tracking-[0.2em] uppercase">
                                                            DUE: {task.due_date ? format(new Date(task.due_date), "dd MMM yyyy").toUpperCase() : "Indefinite"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-3">
                                                <div className={cn(
                                                    "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] skew-x-[-15deg] shadow-4xl border",
                                                    task.priority === 'High' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                                        task.priority === 'Medium' ? "bg-[#F4D03F]/10 text-[#F4D03F] border-[#F4D03F]/20" : "bg-[#F9F7F2] text-foreground/20 border-[#F4D03F]/10"
                                                )}>
                                                    <span className="skew-x-[15deg] block">{task.priority?.toUpperCase()} PRIORITY</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-[#F9F7F2] rounded-[3rem] p-8 border border-[#F4D03F]/10 shadow-inner group-hover:border-[#F4D03F]/20 transition-all duration-1000">
                                            <p className="text-xl font-black text-foreground/30 italic leading-relaxed line-clamp-2 uppercase tracking-tight">
                                                {task.description || "No operational notes provided for this mission protocol."}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default MyTaskView;

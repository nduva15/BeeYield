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
    const [isSaving, setIsSaving] = React.useState(false);

    // Data States
    const [apiaries, setApiaries] = React.useState<Apiary[]>([]);
    const [hives, setHives] = React.useState<Hive[]>([]);
    const [tasks, setTasks] = React.useState<Task[]>([]);
    const { user, beeyieldUser } = useAuth();
    const userId = beeyieldUser?.id || user?.id;

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

    if (isAddingTask) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(glass.page, "p-8 -m-8 space-y-8 animate-in fade-in duration-500 pb-12 min-h-screen")}
            >
                <PageHeader
                    icon={LayoutGrid}
                    label="OPERATIONS_PROTOCOL"
                    title={<>Schedule <span className="text-[#F4D03F]">Task</span></>}
                    subtitle="COORDINATE_APIARY_LOGISTICS_AND_MAINTENANCE_SCHEDULES"
                    actions={
                        <button
                            onClick={() => setIsAddingTask(false)}
                            className={cn(glass.btnSecondary, "px-4 h-8 text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 rounded-xl border-white/20 shadow-sm")}
                        >
                            <ChevronDown className="w-4 h-4 rotate-90" />
                            Return
                        </button>
                    }
                />

                <div className="max-w-3xl mx-auto relative z-10">
                    <div className={cn(glass.card, "p-8 space-y-8 bg-white/40 backdrop-blur-xl border-white/20 rounded-[2.5rem] shadow-2xl relative overflow-hidden")}>
                        <div className="space-y-2">
                            <label className={glass.microLabel}>TASK_TITLE_ENTRY</label>
                            <input
                                placeholder="ENTER_TASK_IDENTIFICATION"
                                className={cn(glass.input, "px-4 h-12 w-full text-[11px] font-black tracking-widest uppercase bg-white/50 border-white/40 focus:bg-white rounded-2xl")}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className={glass.microLabel}>TEMPORAL_ASSIGNMENT</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <button className={cn(glass.btnSecondary, "w-full justify-between h-12 px-5 rounded-2xl border-white/40 bg-white/40 hover:bg-white/60 group transition-all shadow-sm")}>
                                            <span className="font-black text-[10px] uppercase tracking-widest">{format(taskDate, "dd/MM/yyyy")}</span>
                                            <CalendarIcon className="w-4 h-4 text-[#F4D03F] group-hover:scale-110 transition-transform" />
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent className={cn(glass.selectContent, "p-0 rounded-3xl overflow-hidden border-white/20")} align="start">
                                        <Calendar
                                            mode="single"
                                            selected={taskDate}
                                            onSelect={(date) => date && setTaskDate(date)}
                                            className="bg-white/90 backdrop-blur-xl"
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-2">
                                <label className={glass.microLabel}>PRIORITY_VALUATION</label>
                                <select
                                    className={cn(glass.select, "h-12 w-full text-[10px] font-black uppercase tracking-widest px-5 rounded-2xl bg-white/50 border-white/40 focus:bg-white transition-all")}
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value as any)}
                                >
                                    <option value="Low">LOW_SEVERITY</option>
                                    <option value="Medium">MEDIUM_SEVERITY</option>
                                    <option value="High">HIGH_SEVERITY</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className={glass.microLabel}>OPERATIONAL_LOGS</label>
                            <textarea
                                placeholder="DETAILED_LOGISTIC_DESCRIPTION..."
                                className={cn(glass.input, "min-h-[160px] p-6 leading-relaxed resize-none bg-white/40 border-white/40 hover:bg-white/60 focus:bg-white transition-all text-[11px] font-bold shadow-sm rounded-3xl placeholder:text-gray-300 placeholder:italic")}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-4 pt-4">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className={cn(glass.btnPrimary, "flex-1 h-12 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-lg hover:shadow-[#F4D03F]/20 active:scale-[0.98] transition-all")}
                            >
                                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                EXECUTE_SCHEDULE
                            </button>
                            <button
                                onClick={() => setIsAddingTask(false)}
                                className={cn(glass.btnSecondary, "px-10 h-12 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl border-white/40 bg-white/20 hover:bg-white/40 transition-all")}
                            >
                                ABORT
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
            className={cn(glass.page, "p-8 -m-8 space-y-8 animate-in fade-in duration-500 pb-12 min-h-screen")}
        >
            <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-[#F4D03F]/[0.05] rounded-full blur-[140px] -mr-32 -mt-32 pointer-events-none" />

            {/* Header */}
            <PageHeader
                icon={CalendarIcon}
                label="OPERATIONAL_SCHEDULE"
                title={<>Fleet <span className="text-[#F4D03F]">Logistics</span></>}
                subtitle="TRACK_AND_COORDINATE_MAINTENANCE_ACROSS_THE_REGISTRY"
                actions={
                    <div className="flex gap-4 relative z-10 items-center">
                        <div className="flex bg-white/30 p-1.5 rounded-2xl border border-white/40 shadow-inner backdrop-blur-xl">
                            <button
                                onClick={() => setView('list')}
                                className={cn(
                                    "px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] transition-all",
                                    view === 'list' ? "bg-white text-[#1A1A1A] shadow-md" : "text-gray-400 hover:text-[#1A1A1A]"
                                )}
                            >
                                ARCHIVE
                            </button>
                            <button
                                onClick={() => setView('month')}
                                className={cn(
                                    "px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] transition-all",
                                    view === 'month' ? "bg-white text-[#1A1A1A] shadow-md" : "text-gray-400 hover:text-[#1A1A1A]"
                                )}
                            >
                                CALENDAR
                            </button>
                        </div>
                        <button
                            onClick={() => setIsAddingTask(true)}
                            className={cn(glass.btnPrimary, "px-6 h-10 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 rounded-2xl shadow-lg shadow-[#F4D03F]/10")}
                        >
                            <Plus className="w-4 h-4" />
                            SCHEDULE_TASK
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
                        className={cn(glass.card, "p-8 bg-white/40 backdrop-blur-xl border-white/20 rounded-[2.5rem] shadow-2xl min-h-[700px] relative overflow-hidden")}
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#F4D03F]/40 to-transparent" />
                        
                        {/* Month Navigation */}
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex flex-col">
                                <h3 className="text-4xl font-black text-foreground tracking-tighter uppercase leading-none">
                                    {format(currentDate, "MMMM")} <span className="text-[#F4D03F] opacity-60">{format(currentDate, "yyyy")}</span>
                                </h3>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-2">CHRONIC_FLEET_INTERVAL</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                                    className={cn(glass.btnSecondary, "w-12 h-12 p-0 flex items-center justify-center rounded-2xl bg-white/40 border-white/40 hover:bg-white/60 shadow-sm")}
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                                    className={cn(glass.btnSecondary, "w-12 h-12 p-0 flex items-center justify-center rounded-2xl bg-white/40 border-white/40 hover:bg-white/60 shadow-sm")}
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-4">
                            {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(d => (
                                <div key={d} className="text-center py-4">
                                    <span className="text-[10px] font-black text-gray-300 tracking-[0.25em]">{d}</span>
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
                                            "min-h-[120px] rounded-[1.8rem] p-4 border transition-all duration-500 group/day relative overflow-hidden",
                                            isCurrentMonth ? "bg-white/20 border-white/40 hover:bg-white/50 hover:border-[#F4D03F]/40" : "bg-transparent border-transparent opacity-[0.05] pointer-events-none",
                                            isTodayDate ? "ring-2 ring-[#F4D03F]/50 border-[#F4D03F]/60 bg-white/60 shadow-lg shadow-[#F4D03F]/5" : "shadow-sm"
                                        )}
                                    >
                                        <span className={cn(
                                            "text-2xl font-black tracking-tighter tabular-nums transition-all",
                                            isTodayDate ? "text-[#F4D03F]" : "text-gray-200 group-hover/day:text-gray-400"
                                        )}>
                                            {format(date, 'd')}
                                        </span>

                                        <div className="mt-4 space-y-1.5">
                                            {dayTasks.map(task => (
                                                <div
                                                    key={task.id}
                                                    className={cn(
                                                        "px-2.5 py-1.5 rounded-xl border flex items-center gap-2 group/task transition-all hover:scale-[1.05] relative z-10",
                                                        task.priority === 'High' ? "bg-red-500/10 border-red-500/20 text-red-600" :
                                                            task.priority === 'Medium' ? "bg-[#F4D03F]/10 border-[#F4D03F]/20 text-[#1A1A1A]" : "bg-[#1B9157]/10 border-[#1B9157]/20 text-[#1B9157]"
                                                    )}
                                                >
                                                    <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse",
                                                        task.priority === 'High' ? "bg-red-500" :
                                                            task.priority === 'Medium' ? "bg-[#F4D03F]" : "bg-[#1B9157]"
                                                    )} />
                                                    <span className="text-[8px] font-black uppercase tracking-tight truncate italic">{task.title}</span>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        {isTodayDate && (
                                            <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-[#F4D03F]/10 rounded-full blur-xl animate-pulse" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                ) : (
                    <div className="space-y-6 pt-6">
                        {/* Task List Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <AnimatePresence mode="popLayout">
                                {tasks.sort((a, b) => new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime()).map((task, i) => (
                                    <motion.div
                                        key={task.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 30 }}
                                        className={cn(
                                            glass.card,
                                            "p-8 relative group hover:border-[#F4D03F]/60 cursor-default bg-white/40 backdrop-blur-xl border-white/20 shadow-xl overflow-hidden rounded-[2.5rem] transition-all duration-500 hover:shadow-2xl hover:shadow-[#F4D03F]/5",
                                            task.is_completed && "opacity-40 grayscale-[0.5]"
                                        )}
                                    >
                                        <div className={cn(
                                            "absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-transparent to-white/10 blur-2xl pointer-events-none"
                                        )} />

                                        <div className="flex items-start justify-between mb-6 relative z-10">
                                            <div className="flex items-center gap-5">
                                                <button
                                                    onClick={() => toggleTaskCompletion(task)}
                                                    className={cn(
                                                        "w-12 h-12 rounded-2xl border flex items-center justify-center transition-all duration-300 relative overflow-hidden group/btn shadow-sm",
                                                        task.is_completed
                                                            ? "bg-[#1B9157] border-[#1B9157] text-white"
                                                            : "bg-white/60 border-white/60 text-gray-300 hover:border-[#F4D03F]/60 hover:text-[#F4D03F]"
                                                    )}
                                                >
                                                    <CheckCircle2 className={cn("w-6 h-6 transition-transform", task.is_completed ? "scale-110" : "scale-90 group-hover/btn:scale-110")} />
                                                </button>
                                                <div className="flex flex-col">
                                                    <h3 className={cn(
                                                        "text-xl font-black tracking-tighter uppercase leading-tight truncate max-w-[200px] transition-all duration-300",
                                                        task.is_completed ? "text-gray-400 line-through" : "text-foreground group-hover:text-[#1A1A1A]"
                                                    )}>
                                                        {task.title}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <ClockIcon className="w-3.5 h-3.5 text-[#F4D03F] opacity-40" />
                                                        <span className="text-[10px] font-black text-gray-400 tracking-[0.2em]">
                                                            DUE_{task.due_date ? format(new Date(task.due_date), "dd/MM/yyyy").toUpperCase() : "INDEFINITE"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={cn(
                                                "px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all duration-300 shadow-sm",
                                                task.priority === 'High' ? "bg-red-500 text-white border-transparent" :
                                                    task.priority === 'Medium' ? "bg-[#F4D03F] text-[#1A1A1A] border-transparent" : "bg-white/60 text-gray-400 border-white/60"
                                            )}>
                                                {task.priority || "LOW"}
                                            </div>
                                        </div>

                                        <div className="bg-white/30 backdrop-blur-md rounded-[2rem] p-6 border border-white/40 transition-all group-hover:bg-white/50 relative z-10">
                                            <p className="text-[12px] font-medium text-gray-500 leading-relaxed line-clamp-3 uppercase tracking-tight italic">
                                                {task.description || "NO_OPERATIONAL_LOGS_AVAILABLE"}
                                            </p>
                                        </div>
                                        
                                        <div className="mt-6 flex items-center justify-between relative z-10 px-2">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-2 h-2 rounded-full bg-[#1B9157] shadow-sm animate-pulse" />
                                                <span className="text-[8px] font-black text-gray-300 tracking-[0.2em]">{task.is_completed ? "SYSTEM_SYNC_OFFLINE" : "LIVE_TRACKING_SYNC"}</span>
                                            </div>
                                            <button className="text-[9px] font-black text-gray-400 hover:text-[#F4D03F] transition-colors tracking-widest uppercase">DETAILS_&rarr;</button>
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

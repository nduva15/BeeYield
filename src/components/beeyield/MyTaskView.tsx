import React, { useMemo, useState } from 'react';
import { 
  ClipboardList, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Filter,
  Search,
  Download,
  Trash2,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  glass, 
  GlassModal 
} from './GlassTheme';
import { 
  BeeYieldBadge,
  BeeYieldPageHeader,
  BeeYieldPageShell,
} from '@/components/beeyield/BeeYieldUI';
import { useTasks, useUpdateTask, useCreateTask, useDeleteTask } from '@/hooks/useTasks';
import { useApiaries } from '@/hooks/useHives';
import { useHives } from '@/hooks/useHives';
import { 
  format, 
  isSameDay, 
  parseISO, 
  startOfDay, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addDays,
  subDays
} from 'date-fns';
import { Task } from '@/services/beeyieldService';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type MyTaskViewProps = {
  onTabChange?: (tab: string, message?: string, action?: string) => void;
};

const MyTaskView: React.FC<MyTaskViewProps> = ({ onTabChange }) => {
  const emptyTaskForm = React.useCallback((): Partial<Task> => ({
    status: 'pending',
    priority: 'medium',
    due_date: format(new Date(), 'yyyy-MM-dd'),
    apiary_id: '',
    hive_id: '',
    description: '',
    title: '',
  }), []);

  const [viewMode, setViewMode] = useState<'day' | 'list' | 'week' | 'month'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'in_progress'>('all');
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>('all_places');
  const [selectedHiveId, setSelectedHiveId] = useState<string>('all_hives');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const { data: tasks = [], isLoading: tasksLoading } = useTasks();
  const { data: apiaries = [] } = useApiaries();
  const { data: hives = [] } = useHives();
  const updateTask = useUpdateTask();
  const createTask = useCreateTask();
  const deleteTask = useDeleteTask();

  const [newTaskForm, setNewTaskForm] = useState<Partial<Task>>(emptyTaskForm);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = !searchQuery || 
                           task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           task.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesPlace = selectedPlaceId === 'all_places' || task.apiary_id === selectedPlaceId;
      const matchesHive = selectedHiveId === 'all_hives' || task.hive_id === selectedHiveId;
      
      return matchesSearch && matchesStatus && matchesPlace && matchesHive;
    });
  }, [tasks, searchQuery, statusFilter, selectedPlaceId, selectedHiveId]);

  const stats = useMemo(() => {
    const pending = tasks.filter(t => t.status === 'pending').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const overdue = tasks.filter(t => {
      if (t.status === 'completed' || !t.due_date) return false;
      return parseISO(t.due_date) < startOfDay(new Date());
    }).length;

    return { pending, inProgress, completed, overdue };
  }, [tasks]);

  const handleToggleStatus = (task: Task, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    updateTask.mutate({ id: task.id, updates: { status: newStatus, is_completed: newStatus === 'completed' } });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-50 text-red-600 border-red-100';
      case 'medium': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'low': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const generateMonthDays = () => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  };

  const generateWeekDays = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  };

  const exportIcs = () => {
    // Basic ICS generation placeholder
    const calendarHeader = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//BeeYield//NONSGML Tasks//EN\n";
    const calendarFooter = "END:VCALENDAR";
    const events = tasks.filter(t => t.due_date).map(t => {
      const dateStr = format(parseISO(t.due_date!), "yyyyMMdd");
      return `BEGIN:VEVENT\nSUMMARY:${t.title}\nDESCRIPTION:${t.description || ""}\nDTSTART:${dateStr}\nEND:VEVENT\n`;
    }).join("");
    
    const blob = new Blob([calendarHeader + events + calendarFooter], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'beeyield-tasks.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateTask = () => {
    if (!newTaskForm.title) return;
    createTask.mutate({
      ...newTaskForm,
      title: String(newTaskForm.title || '').trim(),
      description: String(newTaskForm.description || '').trim() || undefined,
      apiary_id: newTaskForm.apiary_id || undefined,
      hive_id: newTaskForm.hive_id || undefined,
    } as any, {
      onSuccess: () => {
        setIsTaskModalOpen(false);
        setEditingTask(null);
        setNewTaskForm(emptyTaskForm());
      }
    });
  };

  const handleSaveTask = () => {
    if (!editingTask) return;
    if (!editingTask.title?.trim()) return;

    updateTask.mutate({
      id: editingTask.id,
      updates: {
        title: editingTask.title.trim(),
        description: editingTask.description?.trim() || undefined,
        status: editingTask.status,
        priority: editingTask.priority,
        type: editingTask.type,
        category: editingTask.category,
        due_date: editingTask.due_date || undefined,
        apiary_id: editingTask.apiary_id || undefined,
        hive_id: editingTask.hive_id || undefined,
        is_completed: editingTask.status === 'completed',
        completed_at: editingTask.status === 'completed'
          ? (editingTask.completed_at || new Date().toISOString())
          : undefined,
        recurrence_days: editingTask.recurrence_days,
        recurrence_status: editingTask.recurrence_status,
        recurrence: editingTask.recurrence,
      },
    }, {
      onSuccess: () => {
        setIsTaskModalOpen(false);
        setEditingTask(null);
      }
    });
  };

  const handleDeleteTask = () => {
    if (!editingTask) return;
    if (!window.confirm(`Delete task "${editingTask.title}"?`)) return;

    deleteTask.mutate(editingTask.id, {
      onSuccess: () => {
        setIsTaskModalOpen(false);
        setEditingTask(null);
      },
    });
  };

  const renderTaskCard = (task: Task) => (
    <div 
      key={task.id}
      onClick={() => {
        setEditingTask(task);
        setIsTaskModalOpen(true);
      }}
      className="group flex items-start gap-4 p-4 rounded-2xl border border-[#F4D03F]/10 bg-white/60 hover:bg-white hover:border-[#F4D03F]/30 hover:shadow-lg transition-all cursor-pointer"
    >
      <button 
        onClick={(e) => handleToggleStatus(task, e)}
        className={cn(
          "mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0",
          task.status === 'completed' 
            ? "bg-emerald-500 border-emerald-500 text-white" 
            : "border-gray-200 hover:border-[#F4D03F]"
        )}
      >
        {task.status === 'completed' && <Check className="w-3.5 h-3.5" />}
      </button>

      <div className="flex-1 space-y-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4 className={cn(
            "text-[13px] font-bold tracking-tight truncate",
            task.status === 'completed' ? "text-gray-400 line-through" : "text-[#1A1A1A]"
          )}>
            {task.title}
          </h4>
          <BeeYieldBadge className={getPriorityColor(task.priority)}>
            {task.priority}
          </BeeYieldBadge>
        </div>

        {task.description && (
          <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}

        <div className="flex items-center gap-3 pt-1 flex-wrap">
          {task.due_date && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
              <Clock className="w-3 h-3" />
              {format(parseISO(task.due_date), 'MMM d, yyyy')}
            </div>
          )}
          {task.apiary_id && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-[#F4D03F]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#F4D03F]" />
              {apiaries.find(a => a.id === task.apiary_id)?.name || 'Apiary'}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <BeeYieldPageShell className="pb-24">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={glass.page}
      >
      <BeeYieldPageHeader
        icon={ClipboardList}
        label="Operational Control"
        title={<>My <span className="text-[#F4D03F]">Tasks</span></>}
        subtitle="Manage your apiary work plan and schedules."
        onBack={() => onTabChange?.('home')}
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => {
                setEditingTask(null);
                setIsTaskModalOpen(true);
              }}
              className={cn(glass.btnPrimary)}
            >
              <Plus className="w-4 h-4" />
              New Task
            </button>
          </div>
        }
      />

      <div className="space-y-6">
        {/* Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Overdue', value: stats.overdue, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'In Progress', value: stats.inProgress, icon: Filter, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          ].map((stat, i) => (
            <div key={i} className={cn(glass.card, "p-4 flex items-center gap-4 bg-white/60")}>
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", stat.bg)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-gray-400 ml-1 uppercase tracking-wider">{stat.label}</p>
                <div className="text-xl font-black text-[#1A1A1A] tabular-nums">{stat.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Interface Card */}
        <div className={cn(glass.section, "p-6 space-y-6")}>
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* View Switching */}
            <div className="flex items-center gap-2 bg-[#F9F7F2] p-1.5 rounded-2xl border border-[#F4D03F]/10">
              {(['day', 'list', 'week', 'month'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
                    viewMode === mode 
                      ? "bg-white text-[#1A1A1A] shadow-md scale-105" 
                      : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Navigation & Search */}
            <div className="flex items-center gap-4 w-full lg:w-auto">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentDate(viewMode === 'month' ? subMonths(currentDate, 1) : subDays(currentDate, 7))}
                  className="w-10 h-10 rounded-xl bg-white border border-[#F4D03F]/10 flex items-center justify-center hover:bg-gray-50 transition-all text-gray-600"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h3 className="text-sm font-black text-[#1A1A1A] min-w-[140px] text-center">
                  {format(currentDate, viewMode === 'day' ? 'MMMM d, yyyy' : 'MMMM yyyy')}
                </h3>
                <button 
                  onClick={() => setCurrentDate(viewMode === 'month' ? addMonths(currentDate, 1) : addDays(currentDate, 7))}
                  className="w-10 h-10 rounded-xl bg-white border border-[#F4D03F]/10 flex items-center justify-center hover:bg-gray-50 transition-all text-gray-600"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="relative flex-1 lg:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Filter tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(glass.input, "h-11 pl-10 text-[12px]")}
                />
              </div>
            </div>
          </div>

          <div className="relative min-h-[500px]">
            {/* View Modes Rendering */}
            <AnimatePresence mode="wait">
              {viewMode === 'month' && (
                <motion.div
                  key="month"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-7 gap-px bg-[#F4D03F]/10 border border-[#F4D03F]/10 rounded-[2rem] overflow-hidden shadow-2xl shadow-black/[0.03]"
                >
                  {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
                    <div key={day} className="bg-white/40 p-4 text-center">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{day}</span>
                    </div>
                  ))}
                  {generateMonthDays().map((date, i) => {
                    const dayTasks = tasks.filter(t => t.due_date && isSameDay(parseISO(t.due_date), date));
                    const isOtherMonth = !isSameMonth(date, currentDate);
                    const isTodayDate = isToday(date);

                    return (
                      <div 
                        key={i} 
                        onClick={() => setSelectedDate(date)}
                        className={cn(
                          "min-h-[120px] p-2 bg-white/60 relative group transition-all hover:bg-white",
                          isOtherMonth && "bg-[#F9F7F2]/30 text-gray-300",
                          isTodayDate && "ring-1 ring-inset ring-[#F4D03F]/40"
                        )}
                      >
                        <div className={cn(
                          "text-[12px] font-black mb-1 flex items-center justify-center w-6 h-6 rounded-lg",
                          isTodayDate ? "bg-[#F4D03F] text-[#1A1A1A]" : "text-gray-400"
                        )}>
                          {format(date, 'd')}
                        </div>
                        
                        <div className="space-y-1 mt-1">
                          {dayTasks.slice(0, 3).map(t => (
                            <div 
                              key={t.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingTask(t);
                                setIsTaskModalOpen(true);
                              }}
                              className={cn(
                                "px-2 py-1 rounded-lg text-[10px] font-bold truncate border",
                                t.status === 'completed' 
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-100 opacity-60" 
                                  : "bg-[#F4D03F]/5 border-[#F4D03F]/10 text-gray-700 hover:border-[#F4D03F]/30"
                              )}
                            >
                              {t.title}
                            </div>
                          ))}
                          {dayTasks.length > 3 && (
                            <div className="text-[9px] font-black text-gray-400 text-center uppercase py-0.5">
                              + {dayTasks.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}

              {viewMode === 'week' && (
                <motion.div
                  key="week"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="grid grid-cols-7 gap-4"
                >
                  {generateWeekDays().map((date, i) => {
                    const dayTasks = filteredTasks.filter(t => t.due_date && isSameDay(parseISO(t.due_date), date));
                    return (
                      <div key={i} className="space-y-3">
                        <div className="p-4 bg-[#F9F7F2]/60 rounded-2xl border border-[#F4D03F]/10 text-center">
                          <p className="text-[10px] font-black text-gray-400 uppercase mb-1">{format(date, 'EEE')}</p>
                          <p className={cn(
                            "text-lg font-black",
                            isToday(date) ? "text-[#F4D03F]" : "text-[#1A1A1A]"
                          )}>{format(date, 'd')}</p>
                        </div>
                        <div className="space-y-2">
                          {dayTasks.map(renderTaskCard)}
                          {dayTasks.length === 0 && (
                            <div className="p-8 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                              <p className="text-[10px] text-gray-300 font-bold italic">Clear</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}

              {viewMode === 'list' && (
                <motion.div
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTasks.length > 0 ? (
                      filteredTasks.map(renderTaskCard)
                    ) : (
                      <div className="col-span-full p-20 text-center space-y-4 bg-white/40 rounded-[2.5rem] border border-dashed border-[#F4D03F]/20">
                        <div className="w-20 h-20 rounded-[2rem] bg-[#F9F7F2] flex items-center justify-center mx-auto">
                          <ClipboardList className="w-10 h-10 text-[#F4D03F]/40" />
                        </div>
                        <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No matching tasks found</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {viewMode === 'day' && (
                <motion.div
                  key="day"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="max-w-3xl mx-auto space-y-6"
                >
                  <div className={cn(glass.card, "p-8 space-y-6 bg-white/60")}>
                    <div className="flex items-center justify-between border-b border-[#F4D03F]/10 pb-6">
                      <div className="flex flex-col">
                        <h2 className="text-2xl font-black text-[#1A1A1A] tracking-tighter">
                          Plan for {format(currentDate, 'EEEE')}
                        </h2>
                        <p className="text-[11px] font-bold text-gray-400">{format(currentDate, 'MMMM d, yyyy')}</p>
                      </div>
                      <BeeYieldBadge className="bg-emerald-50 text-emerald-600 border-emerald-100">
                        {tasks.filter(t => t.due_date && isSameDay(parseISO(t.due_date), currentDate)).length} Tasks Scheduled
                      </BeeYieldBadge>
                    </div>

                    <div className="space-y-4">
                      {tasks
                        .filter(t => t.due_date && isSameDay(parseISO(t.due_date), currentDate))
                        .map(renderTaskCard)}
                      {tasks.filter(t => t.due_date && isSameDay(parseISO(t.due_date), currentDate)).length === 0 && (
                        <div className="py-20 text-center opacity-40">
                          <p className="text-sm font-black text-gray-300 uppercase tracking-widest">No activities today</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Action Strip */}
          <div className="pt-6 border-t border-[#F4D03F]/10 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#F4D03F]" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Standard Task</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Completed</span>
              </div>
            </div>
            
            <button 
              onClick={exportIcs}
              className={cn(glass.btnSecondary, "gap-2 h-10 px-6")}
            >
              <Download className="w-4 h-4" />
              Export .ics
            </button>
          </div>
        </div>
      </div>

      {/* Task Creation/Editing Modal */}
      <GlassModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
          setNewTaskForm(emptyTaskForm());
        }}
        title={editingTask ? "Update Task" : "Quick Task Entry"}
        subtitle={editingTask ? `Refining ${editingTask.title}` : "Outline your next operational move."}
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className={cn(glass.microLabel)}>Task Title</Label>
              <Input 
                value={editingTask ? editingTask.title : newTaskForm.title || ''}
                onChange={(e) => {
                  if (editingTask) setEditingTask({...editingTask, title: e.target.value});
                  else setNewTaskForm({...newTaskForm, title: e.target.value});
                }}
                placeholder="e.g., Varroa Treatment - Yard A"
                className={cn(glass.input)} 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className={cn(glass.microLabel)}>Plan Date</Label>
                <Input 
                  type="date"
                  value={editingTask ? (editingTask.due_date?.split('T')[0] || '') : (newTaskForm.due_date || '')}
                  onChange={(e) => {
                    if (editingTask) setEditingTask({...editingTask, due_date: e.target.value});
                    else setNewTaskForm({...newTaskForm, due_date: e.target.value});
                  }}
                  className={cn(glass.input)}
                />
              </div>
              <div className="space-y-2">
                <Label className={cn(glass.microLabel)}>Priority</Label>
                <Select
                  value={editingTask ? editingTask.priority : newTaskForm.priority}
                  onValueChange={(val: any) => {
                    if (editingTask) setEditingTask({...editingTask, priority: val});
                    else setNewTaskForm({...newTaskForm, priority: val});
                  }}
                >
                  <SelectTrigger className={cn(glass.select)}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={glass.selectContent}>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className={cn(glass.microLabel)}>Target Location</Label>
                <Select
                  value={editingTask ? (editingTask.apiary_id || 'none') : (newTaskForm.apiary_id || 'none')}
                  onValueChange={(val) => {
                    const nextApiaryId = val === 'none' ? '' : val;
                    if (editingTask) setEditingTask({...editingTask, apiary_id: nextApiaryId, hive_id: ''});
                    else setNewTaskForm({...newTaskForm, apiary_id: nextApiaryId, hive_id: ''});
                  }}
                >
                  <SelectTrigger className={cn(glass.select)}>
                    <SelectValue placeholder="All/General" />
                  </SelectTrigger>
                  <SelectContent className={glass.selectContent}>
                    <SelectItem value="none">All/General</SelectItem>
                    {apiaries.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className={cn(glass.microLabel)}>Target Hive</Label>
                <Select
                  value={editingTask ? (editingTask.hive_id || 'none') : (newTaskForm.hive_id || 'none')}
                  onValueChange={(val) => {
                    const nextHiveId = val === 'none' ? '' : val;
                    if (editingTask) setEditingTask({...editingTask, hive_id: nextHiveId});
                    else setNewTaskForm({...newTaskForm, hive_id: nextHiveId});
                  }}
                >
                  <SelectTrigger className={cn(glass.select)}>
                    <SelectValue placeholder="All/General" />
                  </SelectTrigger>
                  <SelectContent className={glass.selectContent}>
                    <SelectItem value="none">All/General</SelectItem>
                    {hives
                      .filter((hive) => {
                        const activeApiaryId = editingTask ? editingTask.apiary_id : newTaskForm.apiary_id;
                        return !activeApiaryId || hive.apiary_id === activeApiaryId;
                      })
                      .map(h => <SelectItem key={h.id} value={h.id}>{h.hive_code}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className={cn(glass.microLabel)}>Status</Label>
                <Select
                  value={editingTask ? editingTask.status : newTaskForm.status}
                  onValueChange={(val: any) => {
                    if (editingTask) setEditingTask({...editingTask, status: val});
                    else setNewTaskForm({...newTaskForm, status: val});
                  }}
                >
                  <SelectTrigger className={cn(glass.select)}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={glass.selectContent}>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className={cn(glass.microLabel)}>Notes & Context</Label>
              <Textarea 
                value={editingTask ? editingTask.description : newTaskForm.description || ''}
                onChange={(e) => {
                  if (editingTask) setEditingTask({...editingTask, description: e.target.value});
                  else setNewTaskForm({...newTaskForm, description: e.target.value});
                }}
                className={cn(glass.input, "min-h-[100px] text-[12px] py-3")}
                placeholder="Specific instructions, tool list, or observation requirements..."
              />
            </div>
          </div>

          <div className="flex gap-3">
            {editingTask && (
              <button
                onClick={handleDeleteTask}
                disabled={deleteTask.isPending}
                className={cn(glass.btnSecondary, "h-12 px-4 text-red-600 border-red-200 hover:bg-red-500 hover:text-white")}
              >
                <Trash2 className={cn("w-4 h-4", deleteTask.isPending && "animate-pulse")} />
                Delete
              </button>
            )}
            <button 
              onClick={() => {
                setIsTaskModalOpen(false);
                setEditingTask(null);
                setNewTaskForm(emptyTaskForm());
              }}
              className={cn(glass.btnSecondary, "flex-1 h-12")}
            >
              Cancel
            </button>
            <button 
              onClick={editingTask ? handleSaveTask : handleCreateTask}
              className={cn(glass.btnPrimary, "flex-1 h-12 shadow-xl shadow-[#F4D03F]/20")}
              disabled={createTask.isPending || updateTask.isPending}
            >
              <Check className="w-4 h-4" />
              {editingTask ? 'Save Updates' : 'Schedule Move'}
            </button>
          </div>
        </div>
      </GlassModal>

      {/* Floating Action Button for Mobile/Quick Access */}
      <button 
        onClick={() => {
          setEditingTask(null);
          setIsTaskModalOpen(true);
        }}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-2xl bg-[#F4D03F] text-[#1A1A1A] border-4 border-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 lg:hidden"
      >
        <Plus className="w-6 h-6" />
      </button>
      </motion.div>
    </BeeYieldPageShell>
  );
};

export default MyTaskView;

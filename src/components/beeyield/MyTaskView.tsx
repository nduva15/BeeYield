import React, { useState, useMemo } from 'react';
import { 
  ClipboardList, 
  ArrowRight, 
  Calendar as CalendarIcon, 
  List, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ChevronRight,
  Filter,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  BeeYieldCard, 
  BeeYieldPageHeader, 
  BeeYieldPageShell,
  BeeYieldBadge
} from '@/components/beeyield/BeeYieldUI';
import { useTasks, useUpdateTask } from '@/hooks/useTasks';
import { useApiaries } from '@/hooks/useApiaries';
import { useHives } from '@/hooks/useHives';
import { Calendar } from '@/components/ui/calendar';
import { format, isSameDay, parseISO, startOfDay } from 'date-fns';
import { Task } from '@/services/beeyieldService';

type MyTaskViewProps = {
  onTabChange?: (tab: string, message?: string, action?: string) => void;
};

const MyTaskView: React.FC<MyTaskViewProps> = ({ onTabChange }) => {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'in_progress'>('all');
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>('all_places');
  const [selectedHiveId, setSelectedHiveId] = useState<string>('all_hives');

  const { data: tasks = [], isLoading: tasksLoading } = useTasks();
  const { data: apiaries = [] } = useApiaries();
  const { data: hives = [] } = useHives();
  const updateTask = useUpdateTask();

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = !searchQuery || 
                           task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           task.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesPlace = selectedPlaceId === 'all_places' || task.apiary_id === selectedPlaceId;
      const matchesHive = selectedHiveId === 'all_hives' || task.hive_id === selectedHiveId;
      
      if (viewMode === 'calendar' && selectedDate) {
        if (!task.due_date) return false;
        try {
          const taskDate = parseISO(task.due_date);
          return isSameDay(taskDate, selectedDate) && matchesSearch && matchesStatus && matchesPlace && matchesHive;
        } catch {
          return false;
        }
      }
      
      return matchesSearch && matchesStatus && matchesPlace && matchesHive;
    });
  }, [tasks, searchQuery, statusFilter, viewMode, selectedDate, selectedPlaceId, selectedHiveId]);

  const taskDates = useMemo(() => {
    return tasks
      .filter(t => t.due_date && t.status !== 'completed')
      .map(t => parseISO(t.due_date!));
  }, [tasks]);

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

  const handleToggleStatus = (task: Task) => {
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

  const renderTaskItem = (task: Task) => (
    <div 
      key={task.id}
      className="group flex items-start gap-4 p-4 rounded-2xl border border-gray-100 bg-white hover:border-[#F4D03F]/30 hover:shadow-sm transition-all"
    >
      <button 
        onClick={() => handleToggleStatus(task)}
        className={cn(
          "mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
          task.status === 'completed' 
            ? "bg-[#1B9157] border-[#1B9157] text-white" 
            : "border-gray-200 hover:border-[#F4D03F]"
        )}
      >
        {task.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
      </button>

      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <h4 className={cn(
            "text-[13px] font-bold tracking-tight",
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

        <div className="flex items-center gap-3 pt-1">
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

      <button className="opacity-0 group-hover:opacity-100 p-2 rounded-xl hover:bg-gray-50 text-gray-400 transition-all">
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <BeeYieldPageShell className={cn('p-0')}>
      <div className="p-4 lg:p-6 space-y-6 pb-20 max-w-7xl mx-auto">
        <BeeYieldPageHeader
          icon={ClipboardList}
          label="Operations"
          onBack={() => onTabChange?.('home')}
          title={
            <>
              My <span className="text-[#F4D03F]">Tasks</span>
            </>
          }
          subtitle="Your operational queue (real tasks only; no mock data)."
          actions={
            <div className="flex items-center gap-2">
              <div className="flex p-1 bg-gray-100 rounded-xl">
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-2",
                    viewMode === 'list' ? "bg-white text-[#1A1A1A] shadow-sm" : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  <List className="w-3.5 h-3.5" /> List
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-2",
                    viewMode === 'calendar' ? "bg-white text-[#1A1A1A] shadow-sm" : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  <CalendarIcon className="w-3.5 h-3.5" /> Calendar
                </button>
              </div>
              <button
                className="h-9 px-4 rounded-xl bg-[#1A1A1A] text-white text-[10px] font-bold tracking-wider hover:bg-[#2A2A2A] transition-all flex items-center gap-2 shadow-lg shadow-black/5"
              >
                <Plus className="w-4 h-4" /> New Task
              </button>
            </div>
          }
        />

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Overdue', value: stats.overdue, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'In Progress', value: stats.inProgress, icon: Filter, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-[#1B9157]', bg: 'bg-emerald-50' },
          ].map((stat, i) => (
            <BeeYieldCard key={i} className="p-4 bg-white border-gray-100">
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center shrink-0", stat.bg)}>
                  <stat.icon className={cn("w-5 h-5", stat.color)} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-xl font-black text-[#1A1A1A]">{stat.value}</p>
                </div>
              </div>
            </BeeYieldCard>
          ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* Main Content Area */}
          <div className={cn(
            "space-y-4",
            viewMode === 'list' ? "lg:col-span-8" : "lg:col-span-4"
          )}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative flex-1 group w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#F4D03F] transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-2xl bg-gray-50 border-gray-100 text-[13px] font-medium placeholder:text-gray-400 focus:bg-white focus:border-[#F4D03F]/30 focus:ring-0 transition-all"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <select
                  value={selectedPlaceId}
                  onChange={(e) => {
                    setSelectedPlaceId(e.target.value);
                    setSelectedHiveId('all_hives');
                  }}
                  className="h-9 px-3 rounded-xl border-gray-100 bg-gray-50 text-[11px] font-bold outline-none focus:bg-white"
                >
                  <option value="all_places">All Locations</option>
                  {apiaries.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>

                <select
                  value={selectedHiveId}
                  onChange={(e) => setSelectedHiveId(e.target.value)}
                  className="h-9 px-3 rounded-xl border-gray-100 bg-gray-50 text-[11px] font-bold outline-none focus:bg-white"
                >
                  <option value="all_hives">All Hives</option>
                  {hives.filter(h => selectedPlaceId === 'all_places' || h.apiary_id === selectedPlaceId).map(h => (
                    <option key={h.id} value={h.id}>{h.hive_code}</option>
                  ))}
                </select>

                <div className="flex shrink-0 p-1 bg-gray-100 rounded-xl">
                  {(['all', 'pending', 'completed'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[10px] font-bold capitalize transition-all",
                        statusFilter === s ? "bg-white text-[#1A1A1A] shadow-sm" : "text-gray-500"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {tasksLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-24 bg-gray-50 animate-pulse rounded-2xl" />
                ))
              ) : filteredTasks.length > 0 ? (
                filteredTasks.map(renderTaskItem)
              ) : (
                <BeeYieldCard className="p-12 bg-white">
                  <div className="flex flex-col items-center justify-center text-center space-y-3">
                    <div className="w-16 h-16 rounded-3xl bg-gray-50 flex items-center justify-center mb-2">
                      <ClipboardList className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-sm font-bold text-[#1A1A1A]">No tasks found</p>
                    <p className="text-[11px] font-medium text-gray-500 max-w-xs leading-relaxed">
                      {searchQuery || statusFilter !== 'all' 
                        ? "Try adjusting your filters or search terms." 
                        : "Your operational queue is clear."}
                    </p>
                  </div>
                </BeeYieldCard>
              )}
            </div>
          </div>

          {/* Calendar Pane */}
          <div className={cn(
            "lg:sticky lg:top-6 space-y-6",
            viewMode === 'list' ? "lg:col-span-4" : "lg:col-span-8 h-full"
          )}>
            <BeeYieldCard className="p-6 bg-white overflow-hidden border-transparent shadow-xl shadow-black/[0.02]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-sm font-black text-[#1A1A1A] uppercase tracking-widest">Schedule</h3>
                  <p className="text-[10px] font-bold text-gray-400">Task distribution tracker</p>
                </div>
                <CalendarIcon className="w-5 h-5 text-[#F4D03F]" />
              </div>
              
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                modifiers={{
                  hasTask: taskDates
                }}
                modifiersClassNames={{
                  hasTask: "after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-[#F4D03F]"
                }}
                className={cn(
                  "p-0 mx-auto",
                  viewMode === 'calendar' ? "w-full max-w-2xl" : "w-full"
                )}
              />

              {viewMode === 'list' && selectedDate && (
                <div className="mt-8 pt-8 border-t border-dashed border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                      {format(selectedDate, 'MMM d, yyyy')}
                    </h4>
                    <span className="text-[10px] font-black text-[#1A1A1A] bg-[#F4D03F] px-2 py-0.5 rounded-full">
                      {tasks.filter(t => t.due_date && isSameDay(parseISO(t.due_date), selectedDate)).length} Tasks
                    </span>
                  </div>
                  <div className="space-y-3">
                    {tasks
                      .filter(t => t.due_date && isSameDay(parseISO(t.due_date), selectedDate))
                      .map(t => (
                        <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 group transition-all cursor-default">
                          <div className={cn("w-1.5 h-6 rounded-full", getPriorityColor(t.priority).split(' ')[0].replace('bg-', 'bg-'))} />
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-bold text-[#1A1A1A] truncate">{t.title}</p>
                            <p className="text-[10px] font-medium text-gray-500">{t.status}</p>
                          </div>
                        </div>
                      ))}
                    {tasks.filter(t => t.due_date && isSameDay(parseISO(t.due_date), selectedDate)).length === 0 && (
                      <div className="p-4 text-center rounded-2xl bg-gray-50/50 border border-dashed border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 italic">No tasks scheduled for this day</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </BeeYieldCard>

            {/* Quick Action Suggestion */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] text-white relative overflow-hidden group">
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-2 text-[#F4D03F]">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Efficiency Tip</span>
                </div>
                <p className="text-[13px] font-bold leading-tight">
                  Regular inspections help prevent swarming and disease outbreaks.
                </p>
                <button 
                  onClick={() => onTabChange?.('inspections')}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#F4D03F] hover:gap-3 transition-all"
                >
                  Schedule an Inspection <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-[#F4D03F]/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
            </div>
          </div>
        </div>
      </div>
    </BeeYieldPageShell>
  );
};

export default MyTaskView;

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, CheckCircle2, Clock, AlertCircle, Plus, Calendar as CalendarIcon, Filter, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

const MyTaskView: React.FC = () => {
    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Tasks</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your daily beekeeping routine and checklists.</p>
                </div>
                <Button className="bg-[#B48428] hover:bg-[#966b1d] text-white rounded-xl px-6 h-12 gap-2 border-none shadow-lg shadow-amber-500/20">
                    <Plus className="w-5 h-5" />
                    Add New Task
                </Button>
            </div>

            {/* Task Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Tasks', value: 12, icon: ClipboardList, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                    { label: 'Completed', value: 8, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
                    { label: 'In Progress', value: 3, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                    { label: 'Overdue', value: 1, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
                ].map((stat, i) => (
                    <Card key={i} className="rounded-3xl border border-gray-100 dark:border-[#1e1e1e] bg-white dark:bg-[#09090b] shadow-sm">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", stat.bg)}>
                                <stat.icon className={cn("w-6 h-6", stat.color)} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Task Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-[#09090b] p-4 rounded-3xl border border-gray-100 dark:border-[#1e1e1e] shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#1e1e1e] border-none rounded-xl text-sm focus:ring-1 focus:ring-amber-500 outline-none"
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="rounded-xl gap-2 h-10 border-gray-100 dark:border-gray-800">
                        <CalendarIcon className="w-4 h-4" /> Today
                    </Button>
                    <Button variant="outline" className="rounded-xl gap-2 h-10 border-gray-100 dark:border-gray-800">
                        <Filter className="w-4 h-4" /> Filters
                    </Button>
                </div>
            </div>

            {/* Task List */}
            <div className="space-y-4">
                {[
                    { title: 'Check North Orchard Hive 04', category: 'Inspection', priority: 'High', due: 'Today, 2:00 PM', status: 'In Progress' },
                    { title: 'Honey Extraction - Backyard Apiary', category: 'Production', priority: 'Medium', due: 'Tomorrow', status: 'Pending' },
                    { title: 'Treat Hives for Varroa Mites', category: 'Maintenance', priority: 'High', due: 'Jan 18, 2026', status: 'Pending' },
                    { title: 'Inventory Check - New Supers', category: 'Inventory', priority: 'Low', due: 'Jan 20, 2026', status: 'Completed' },
                ].map((task, i) => (
                    <Card key={i} className="rounded-3xl border border-gray-100 dark:border-[#1e1e1e] bg-white dark:bg-[#09090b] shadow-sm hover:shadow-md transition-all cursor-pointer group">
                        <CardContent className="p-6 flex items-center gap-6">
                            <div className={cn(
                                "w-1.5 h-12 rounded-full",
                                task.priority === 'High' ? "bg-red-500" : task.priority === 'Medium' ? "bg-amber-500" : "bg-blue-500"
                            )} />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full uppercase">{task.category}</span>
                                    <span className="text-xs text-gray-400 font-medium">{task.due}</span>
                                </div>
                                <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-[#B48428] transition-colors">{task.title}</h4>
                            </div>
                            <div className="flex items-center gap-4">
                                <Badge className={cn(
                                    "rounded-md text-[10px] font-bold tracking-widest uppercase border-none",
                                    task.status === 'Completed' ? "bg-green-100 text-green-700" : task.status === 'In Progress' ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"
                                )}>
                                    {task.status}
                                </Badge>
                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-50 dark:hover:bg-white/5">
                                    <CheckCircle2 className="w-5 h-5 text-gray-300 group-hover:text-green-500 transition-colors" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default MyTaskView;

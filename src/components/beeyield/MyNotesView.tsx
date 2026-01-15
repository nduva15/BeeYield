import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Notebook, Search, Plus, Filter, MoreVertical, MapPin, Calendar, Clock, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const MyNotesView: React.FC = () => {
    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Notes</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Field notes, observation logs, and pocket reminders for your apiaries.</p>
                </div>
                <Button className="bg-[#B48428] hover:bg-[#966b1d] text-white rounded-xl px-10 h-14 font-black text-lg gap-2 border-none shadow-lg shadow-amber-500/20 translate-y-[-10px]">
                    <Plus className="w-5 h-5 stroke-[3]" />
                    Create Note
                </Button>
            </div>

            {/* Note Stats & Search */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                    <div className="relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search your field notes by hive ID, location, or keyword..."
                            className="w-full pl-16 pr-6 h-16 bg-white dark:bg-[#09090b] border border-gray-100 dark:border-[#1e1e1e] rounded-[2rem] text-lg shadow-sm outline-none focus:ring-1 focus:ring-amber-500/20 transition-all font-medium"
                        />
                    </div>
                </div>
                <Button variant="outline" className="h-16 rounded-[2rem] gap-2 border-gray-100 dark:border-gray-800 font-bold bg-white dark:bg-[#09090b]">
                    <Filter className="w-5 h-5" />
                    Advanced Filters
                </Button>
            </div>

            {/* Notes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                    { title: 'Queen Spotted - North Hive 02', tag: 'Inspection', location: 'North Orchard', date: 'Jan 14, 2026', time: '14:21', color: 'bg-green-50 text-green-700', content: 'The queen was spotted on the 4th frame. She looks healthy and the brood pattern is excellent. Added one more super today.' },
                    { title: 'Varroa Treatment Application', tag: 'Treatment', location: 'Backyard Apiary', date: 'Jan 12, 2026', time: '09:45', color: 'bg-red-50 text-red-700', content: 'Applied Apiguard treatment to all hives in the backyard. Weather was ideal (18°C). Next check in 7 days.' },
                    { title: 'Swarm Warning! High Activity', tag: 'Warning', location: 'Hillside Apiary', date: 'Jan 10, 2026', time: '16:10', color: 'bg-amber-50 text-amber-700', content: 'Significant build-up of bees at the entrance of Hive 07. Queen cells detected on bottom of frames. Need to perform split tomorrow.' },
                    { title: 'Honey Harvest Planning', tag: 'Planning', location: 'General', date: 'Jan 08, 2026', time: '11:00', color: 'bg-blue-50 text-blue-700', content: 'Estimate harvest for next week. Capping is around 80% on most hives. Need to sanitize extractor and prepare jars.' },
                ].map((note, i) => (
                    <Card key={i} className="rounded-[2.5rem] border border-gray-100 dark:border-[#1e1e1e] bg-white dark:bg-[#09090b] shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col min-h-[300px]">
                        <div className="p-8 flex-1">
                            <div className="flex justify-between items-start mb-6">
                                <Badge className={cn("rounded-md font-black text-[9px] uppercase tracking-[0.15em] border-none px-2", note.color, note.color.replace('bg-', 'dark:bg-').replace('text-', 'dark:text-'))}>
                                    {note.tag}
                                </Badge>
                                <Button variant="ghost" size="icon" className="rounded-full w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreVertical className="w-4 h-4 text-gray-400" />
                                </Button>
                            </div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4 group-hover:text-amber-500 transition-colors leading-tight">{note.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed line-clamp-4 italic">
                                "{note.content}"
                            </p>
                        </div>
                        <div className="px-8 py-6 bg-gray-50/50 dark:bg-white/5 border-t border-gray-50 dark:border-white/5 rounded-b-[2.5rem] flex items-center justify-between">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    <MapPin className="w-3 h-3 text-amber-500" />
                                    {note.location}
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    <Calendar className="w-3 h-3" />
                                    {note.date}
                                </div>
                            </div>
                            <div className="bg-white dark:bg-[#1e1e1e] w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border border-gray-100 dark:border-gray-800">
                                <ImageIcon className="w-5 h-5 text-gray-300" />
                            </div>
                        </div>
                    </Card>
                ))}

                {/* Create New Note Placeholder */}
                <Card className="rounded-[2.5rem] border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/30 dark:bg-white/5 flex flex-col items-center justify-center p-12 text-center group cursor-pointer hover:bg-[#FFF8F0] dark:hover:bg-amber-950/10 hover:border-amber-200 transition-all">
                    <div className="w-16 h-16 bg-white dark:bg-[#09090b] rounded-[1.5rem] flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                        <Plus className="w-8 h-8 text-gray-300 group-hover:text-amber-500 transition-colors" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-400 group-hover:text-amber-600 transition-colors">Capture an observation</h4>
                    <p className="text-xs text-gray-400 font-medium mt-1">Add photos and details from the field.</p>
                </Card>
            </div>
        </div>
    );
};

export default MyNotesView;

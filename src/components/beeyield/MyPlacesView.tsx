import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Plus, Navigation, Maximize2, Layers } from 'lucide-react';

const MyPlacesView: React.FC = () => {
    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Places</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your apiaries and geographical locations.</p>
                </div>
                <Button className="bg-[#4ADE80] hover:bg-[#22c55e] text-black rounded-xl px-6 h-12 font-bold shadow-lg shadow-green-500/20 border-none">
                    <Plus className="w-5 h-5 mr-2" /> Add Apiary
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Map Sidebar */}
                <div className="space-y-6">
                    {['North Orchard', 'Backyard', 'River Side'].map((place) => (
                        <Card key={place} className="rounded-3xl border border-gray-100 dark:border-[#1e1e1e] bg-white dark:bg-[#09090b] shadow-sm hover:shadow-md transition-all cursor-pointer group">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-50 dark:bg-[#1e1e1e] rounded-2xl flex items-center justify-center group-hover:bg-[#F8F2E4] dark:group-hover:bg-[#27272a] transition-colors">
                                        <MapPin className="w-6 h-6 text-[#B48428]" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900 dark:text-white">{place}</h3>
                                        <p className="text-xs text-gray-400">4 Hives • Active</p>
                                    </div>
                                    <Navigation className="w-4 h-4 text-gray-300 group-hover:text-[#B48428] transition-colors" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Map Visualization Placeholder */}
                <div className="lg:col-span-2">
                    <Card className="rounded-[2.5rem] border border-gray-100 dark:border-[#1e1e1e] bg-white dark:bg-[#09090b] shadow-sm h-full min-h-[500px] overflow-hidden relative border-none">
                        <div className="absolute inset-0 bg-[#f0f0f0] dark:bg-[#1e1e1e] flex items-center justify-center">
                            {/* Mock map style background */}
                            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_2px_2px,rgba(0,0,0,0.1)_1px,transparent_0)] dark:bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.05)_1px,transparent_0)] [background-size:24px_24px]" />
                            <div className="relative flex flex-col items-center">
                                <div className="w-20 h-20 bg-white dark:bg-[#09090b] rounded-3xl flex items-center justify-center shadow-2xl mb-4 border border-gray-100 dark:border-gray-800">
                                    <MapPin className="w-10 h-10 text-amber-500 animate-bounce" />
                                </div>
                                <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-sm">Interactive Map View</p>
                            </div>
                        </div>

                        {/* Map UI Controls */}
                        <div className="absolute top-6 right-6 flex flex-col gap-2">
                            <Button size="icon" variant="secondary" className="rounded-xl bg-white dark:bg-[#09090b] shadow-xl border-none">
                                <Maximize2 className="w-5 h-5" />
                            </Button>
                            <Button size="icon" variant="secondary" className="rounded-xl bg-white dark:bg-[#09090b] shadow-xl border-none">
                                <Layers className="w-5 h-5" />
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default MyPlacesView;

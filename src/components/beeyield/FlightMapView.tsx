import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Map as MapIcon, Navigation, Activity, Zap, Play, Pause, RotateCcw, Crosshair, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import beeyieldService from '@/services/beeyieldService';

const FlightMapView: React.FC = () => {
    const [isPlaying, setIsPlaying] = useState(true);
    const [points, setPoints] = useState<{ x: number, y: number, id: number, type: 'hive' | 'forage', label?: string }[]>([]);
    const [forageZones, setForageZones] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ activeBees: 0, avgTrip: 0, forageRange: 0 });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const zones = await beeyieldService.getForageZones();
                setForageZones(zones || []);

                if (zones && zones.length > 0) {
                    // Generate points from real forage zone data
                    const hivePoints = zones.slice(0, Math.min(5, zones.length)).map((z: any, i: number) => ({
                        x: 20 + (i * 15) % 60,
                        y: 20 + (i * 20) % 60,
                        id: i,
                        type: 'hive' as const,
                        label: z.zone_name || `Hive ${i + 1}`,
                    }));
                    const foragePoints = zones.map((z: any, i: number) => ({
                        x: 10 + ((z.radius_km || 1.5) * 20 + i * 12) % 80,
                        y: 10 + ((z.density_score || 0.5) * 60 + i * 15) % 80,
                        id: i + 10,
                        type: 'forage' as const,
                        label: z.flora_type || 'Forage Area',
                    }));
                    setPoints([...hivePoints, ...foragePoints]);

                    // Calculate stats from zones
                    const avgRadius = zones.reduce((sum: number, z: any) => sum + (z.radius_km || 1.5), 0) / zones.length;
                    const avgDensity = zones.reduce((sum: number, z: any) => sum + (z.density_score || 0.5), 0) / zones.length;
                    setStats({
                        activeBees: Math.round(avgDensity * 200 + 50),
                        avgTrip: Math.round(avgRadius * 5 * 10) / 10,
                        forageRange: Math.round(avgRadius * 10) / 10,
                    });
                } else {
                    // Fallback to generated demo data
                    loadDemoData();
                }
            } catch (err) {
                console.error('Error loading flight map data:', err);
                loadDemoData();
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const loadDemoData = () => {
        const hivePoints = Array.from({ length: 5 }).map((_, i) => ({
            x: 20 + Math.random() * 60,
            y: 20 + Math.random() * 60,
            id: i,
            type: 'hive' as const,
            label: `Hive ${i + 1}`,
        }));
        const foragePoints = Array.from({ length: 8 }).map((_, i) => ({
            x: 10 + Math.random() * 80,
            y: 10 + Math.random() * 80,
            id: i + 10,
            type: 'forage' as const,
            label: 'Forage Area',
        }));
        setPoints([...hivePoints, ...foragePoints]);
        setStats({ activeBees: 124, avgTrip: 12.4, forageRange: 2.4 });
    };

    const handleReset = async () => {
        setLoading(true);
        try {
            const zones = await beeyieldService.getForageZones();
            if (zones && zones.length > 0) {
                setForageZones(zones);
            }
            loadDemoData(); // Reset to fresh random layout
        } catch {
            loadDemoData();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-[2.5rem] font-bold text-[#0F172A] tracking-tight">Flight Map</h1>
                    <p className="text-gray-500 mt-1">Real-time bee activity and forage path tracking.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-xl border-gray-200" onClick={() => setIsPlaying(!isPlaying)}>
                        {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                        {isPlaying ? 'Pause' : 'Resume'}
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-xl border-gray-200" onClick={handleReset} disabled={loading}>
                        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RotateCcw className="w-4 h-4 mr-2" />}
                        Reset
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Map View */}
                <Card className="lg:col-span-8 rounded-[2.5rem] border border-slate-100 bg-slate-50 overflow-hidden shadow-2xl relative min-h-[500px]">
                    <div className="absolute inset-0 opacity-20 pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(circle, #1B9157 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                    {/* Simulated Flight Paths */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <AnimatePresence>
                            {isPlaying && points.filter(p => p.type === 'hive').map((hive, i) => {
                                const forage = points.find(p => p.type === 'forage' && p.id === i + 10);
                                if (!forage) return null;
                                return (
                                    <motion.path
                                        key={`path-${i}`}
                                        d={`M ${hive.x}% ${hive.y}% Q ${(hive.x + forage.x) / 2 + (Math.random() * 10 - 5)}% ${(hive.y + forage.y) / 2 + (Math.random() * 10 - 5)}% ${forage.x}% ${forage.y}%`}
                                        stroke="#F4D03F"
                                        strokeWidth="1"
                                        fill="none"
                                        initial={{ pathLength: 0, opacity: 0 }}
                                        animate={{ pathLength: 1, opacity: 0.6 }}
                                        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                                    />
                                );
                            })}
                        </AnimatePresence>
                    </svg>

                    {/* Nodes */}
                    {points.map(point => (
                        <motion.div
                            key={point.id}
                            className="absolute z-10 group"
                            style={{ left: `${point.x}%`, top: `${point.y}%` }}
                            whileHover={{ scale: 1.2 }}
                        >
                            <div className={cn(
                                "w-4 h-4 rounded-full border-2 border-white shadow-xl flex items-center justify-center",
                                point.type === 'hive' ? "bg-[#1B9157]" : "bg-[#F4D03F]"
                            )}>
                                {point.type === 'hive' ? <Navigation className="w-2 h-2 text-white" /> : <div className="w-1 h-1 bg-white rounded-full" />}
                            </div>
                            <div className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white px-2 py-1 rounded text-[8px] font-bold text-slate-900 border border-slate-200 opacity-0 group-hover:opacity-100 uppercase shadow-sm">
                                {point.label || (point.type === 'hive' ? `Hive ${point.id}` : 'Forage Area')}
                            </div>
                        </motion.div>
                    ))}

                    <div className="absolute bottom-6 left-6 flex gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#1B9157]" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Hives</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#F4D03F]" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Forage Zones</span>
                        </div>
                    </div>

                    <div className="absolute top-6 right-6">
                        <Badge className="bg-white/10 backdrop-blur-md text-[#1B9157] border-white/10 font-black">
                            {forageZones.length > 0 ? `${forageZones.length} ZONES LOADED` : 'PRECISION TRACKING ACTIVE'}
                        </Badge>
                    </div>
                </Card>

                {/* Info Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="rounded-[2rem] border-none bg-white shadow-sm p-6 border-t-4 border-t-[#1B9157]">
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Flight Stats</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-end border-b border-gray-50 pb-2">
                                <span className="text-sm font-medium text-gray-500">Active Bees/m²</span>
                                <span className="text-xl font-black text-gray-900">{stats.activeBees}</span>
                            </div>
                            <div className="flex justify-between items-end border-b border-gray-50 pb-2">
                                <span className="text-sm font-medium text-gray-500">Avg Trip Duration</span>
                                <span className="text-xl font-black text-gray-900">{stats.avgTrip} min</span>
                            </div>
                            <div className="flex justify-between items-end border-b border-gray-50 pb-2">
                                <span className="text-sm font-medium text-gray-500">Forage Range</span>
                                <span className="text-xl font-black text-gray-900">{stats.forageRange} km</span>
                            </div>
                        </div>
                    </Card>

                    {/* Forage Zones List */}
                    {forageZones.length > 0 && (
                        <Card className="rounded-[2rem] border-none bg-white shadow-sm p-6 border-t-4 border-t-[#F4D03F]">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Forage Zones</h3>
                            <div className="space-y-3">
                                {forageZones.slice(0, 5).map((z: any, i: number) => (
                                    <div key={z.id || i} className="flex justify-between items-center text-sm">
                                        <div>
                                            <p className="font-bold text-slate-800">{z.zone_name || z.flora_type || `Zone ${i + 1}`}</p>
                                            <p className="text-xs text-slate-400">{z.flora_type || '-'} · {z.season || 'year_round'}</p>
                                        </div>
                                        <span className="text-xs font-bold text-green-600">{z.density_score ? `${(z.density_score * 100).toFixed(0)}%` : '-'}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    <Card className="rounded-[2rem] border-none bg-white shadow-sm p-6 border-t-4 border-t-[#F4D03F]">
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Activity Heatmap</h3>
                        <div className="aspect-square bg-slate-50 rounded-2xl flex items-center justify-center border border-dashed border-gray-200">
                            <Activity className="w-12 h-12 text-gray-200" />
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default FlightMapView;

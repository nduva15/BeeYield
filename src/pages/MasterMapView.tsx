import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Map as MapIcon,
    Layers,
    Navigation,
    Locate,
    MousePointer2,
    Hexagon,
    Shield,
    Trash2,
    Save,
    Maximize2,
    Plus,
    Search,
    Compass,
    Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { glass, PageHeader } from '@/components/beeyield/GlassTheme';

const MasterMapView: React.FC = () => {
    const [activeTool, setActiveTool] = React.useState<'select' | 'draw' | 'pallet'>('select');
    const [showGeofences, setShowGeofences] = React.useState(true);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(glass.page, "flex flex-col h-[calc(100vh-140px)] relative overflow-hidden")}
        >
            {/* Background Accents */}
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#F4D03F]/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute -left-20 top-1/2 w-64 h-64 bg-[#1B9157]/5 blur-[100px] rounded-full pointer-events-none" />

            <PageHeader
                icon={MapIcon}
                label="Master GIS Kernel"
                title={<>Master <span className="text-[#F4D03F]">GIS Map</span></>}
                subtitle="Precision Asset Positioning · Orchard Geofencing · Spatial Intelligence"
                actions={
                    <div className="flex gap-3">
                        <Button variant="outline" className="rounded-xl border border-gray-100 bg-white/50 text-gray-600 font-bold uppercase text-[10px] tracking-widest h-9 px-4 hover:bg-gray-50">
                            <Layers className="w-3.5 h-3.5 mr-2" />
                            Terrain Overlay
                        </Button>
                        <Button className={cn(glass.btnPrimary, "h-9 px-4 text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-[#1B9157]/10")}>
                            <Save className="w-3.5 h-3.5 mr-2" />
                            Sync Changes
                        </Button>
                    </div>
                }
            />

            {/* Main GIS Container */}
            <div className="flex-1 flex gap-6 min-h-0">
                {/* Left Toolbar */}
                <div className="w-14 flex flex-col gap-3">
                    {[
                        { id: 'select', icon: MousePointer2, label: 'SELECT' },
                        { id: 'draw', icon: Hexagon, label: 'BOUND' },
                        { id: 'pallet', icon: MapIcon, label: 'PALLET' },
                    ].map((tool) => (
                        <button
                            key={tool.id}
                            onClick={() => setActiveTool(tool.id as any)}
                            className={cn(
                                "w-full aspect-square flex flex-col items-center justify-center rounded-xl border transition-all group",
                                activeTool === tool.id
                                    ? "bg-[#1A1A1A] border-[#1A1A1A] text-white shadow-md shadow-gray-200"
                                    : "bg-white border-gray-100 text-gray-400 hover:border-[#F4D03F]/40 hover:text-gray-600"
                            )}
                        >
                            <tool.icon className="w-4 h-4" />
                            <span className="text-[6px] font-bold mt-1 tracking-widest">{tool.label}</span>
                        </button>
                    ))}
                    <div className="mt-auto space-y-3">
                        <button className="w-full aspect-square bg-[#F4D03F] rounded-xl border border-[#F4D03F]/20 flex items-center justify-center text-[#1A1A1A] hover:opacity-90 transition-opacity">
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Map Interface */}
                <div className={cn(glass.card, "flex-1 rounded-3xl bg-neutral-900 border-gray-200 shadow-sm relative overflow-hidden group")}>
                    {/* Map Mock Background */}
                    <div
                        className="absolute inset-0 opacity-40 grayscale"
                        style={{
                            backgroundImage: 'url("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/-74.5,40,9/1200x800?access_token=mock")',
                            backgroundSize: 'cover'
                        }}
                    />

                    {/* SVG Layer for Drawings */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <polygon points="200,100 600,150 550,450 150,400" className="fill-[#1B9157]/10 stroke-[#1B9157] stroke-2 stroke-dasharray-4" />
                        <circle cx="350" cy="280" r="8" className="fill-[#F4D03F] stroke-white stroke-2" />
                        <circle cx="450" cy="220" r="8" className="fill-[#F4D03F] stroke-white stroke-2" />
                    </svg>

                    {/* Digital Hud */}
                    <div className="absolute top-6 left-6 space-y-4 pointer-events-none">
                        <div className="p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-gray-100 shadow-sm pointer-events-auto">
                            <div className="flex items-center gap-3 mb-3">
                                <Compass className="w-4 h-4 text-gray-500" />
                                <span className="text-[10px] font-bold text-gray-700 uppercase tracking-widest">Feed</span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-mono text-gray-400">LAT: -1.2921°</p>
                                <p className="text-[9px] font-mono text-gray-400">LON: 36.8219°</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#1B9157] animate-pulse" />
                                    <p className="text-[8px] font-bold text-[#1B9157] uppercase tracking-widest">Satellite Lock</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Geofence Status */}
                    <AnimatePresence>
                        {showGeofences && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="absolute top-6 right-6 w-60 p-5 bg-[#1A1A1A] text-white rounded-2xl shadow-xl border border-white/10"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-3.5 h-3.5 text-[#F4D03F]" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#F4D03F]">Fence Active</span>
                                    </div>
                                    <button onClick={() => setShowGeofences(false)} className="text-white/40 hover:text-white">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg border border-white/10">
                                        <span className="text-[9px] font-bold uppercase tracking-wider">Main Orchard</span>
                                        <Badge className="bg-[#1B9157] text-[8px] font-bold tracking-widest rounded-md h-5">SECURE</Badge>
                                    </div>
                                    <p className="text-[8px] font-bold text-white/50 uppercase leading-snug tracking-wider">
                                        Tamper alert will trigger if pallet GPS drifts more than 5m outside polygon.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Map Controls */}
                    <div className="absolute bottom-6 right-6 flex gap-3">
                        <Button className="w-10 h-10 rounded-xl bg-white border border-gray-100 p-0 hover:bg-gray-50 transition-colors shadow-sm">
                            <Locate className="w-4 h-4 text-gray-600" />
                        </Button>
                        <Button className="w-10 h-10 rounded-xl bg-white border border-gray-100 p-0 hover:bg-gray-50 transition-colors shadow-sm">
                            <Maximize2 className="w-4 h-4 text-gray-600" />
                        </Button>
                    </div>
                </div>

                {/* Properties Panel */}
                <div className="w-80 flex flex-col gap-6">
                    <div className={cn(glass.card, "p-6 space-y-6 bg-white/80 backdrop-blur-md rounded-3xl border-gray-100 shadow-sm")}>
                        <div className="border-b border-gray-100 pb-4">
                            <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-tight">Active Selection</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-bold uppercase text-gray-400 tracking-widest ml-1">Block Name</label>
                                <Input value="Honey Block Alpha" className="h-9 rounded-xl border-gray-100 bg-gray-50 font-bold text-xs" readOnly />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-bold uppercase text-gray-400 tracking-widest ml-1">Acreage</label>
                                    <Input value="14.2 AC" className="h-9 rounded-xl border-gray-100 bg-gray-50 font-bold text-[10px]" readOnly />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-bold uppercase text-gray-400 tracking-widest ml-1">Crop</label>
                                    <Input value="Macadamia" className="h-9 rounded-xl border-gray-100 bg-gray-50 font-bold text-[10px]" readOnly />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={cn(glass.card, "flex-1 p-6 space-y-6 bg-[#1A1A1A] text-white rounded-3xl border-white/5 relative overflow-hidden group")}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                            <Settings className="w-4 h-4 text-[#F4D03F]" />
                            <h3 className="text-sm font-bold uppercase tracking-tight">Asset Overlay</h3>
                        </div>
                        <div className="space-y-3">
                            {[
                                { label: 'Hive Pallets', active: true },
                                { label: 'Weather Stations', active: true },
                                { label: 'Saturation Heatmap', active: false },
                                { label: 'Geofences', active: true },
                            ].map((row, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 border border-white/10 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer group">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/70 group-hover:text-white transition-colors">{row.label}</span>
                                    <div className={cn("w-8 h-4 rounded-full border border-white/20 relative transition-all", row.active ? "bg-[#1B9157]" : "bg-transparent")}>
                                        <div className={cn("absolute top-[2px] w-2.5 h-2.5 rounded-full bg-white transition-all shadow-sm", row.active ? "right-[2px]" : "left-[2px]")} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default MasterMapView;

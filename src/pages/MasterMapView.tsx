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
import { glass } from '@/components/beeyield/GlassTheme';
import { BeeYieldPageHeader, BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';
import { fadeInUp } from '@/lib/motion';

const MasterMapView: React.FC = () => {
    const [activeTool, setActiveTool] = React.useState<'select' | 'draw' | 'pallet'>('select');
    const [showGeofences, setShowGeofences] = React.useState(true);

    return (
        <motion.div
            {...fadeInUp}
            className="h-[calc(100vh-140px)]"
        >
            <BeeYieldPageShell className={cn("flex flex-col h-full relative overflow-hidden")}>
            {/* Background Accents */}
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#F4D03F]/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute -left-20 top-1/2 w-64 h-64 bg-[#1B9157]/5 blur-[100px] rounded-full pointer-events-none" />

            <BeeYieldPageHeader
                icon={MapIcon}
                label="Map"
                title={<>Master <span className="text-[#F4D03F]">GIS Map</span></>}
                subtitle="View locations, boundaries, and placements."
                actions={
                    <div className="flex gap-3">
                        <Button variant="outline" className="rounded-xl border border-gray-100 bg-white/50 text-gray-600 font-bold text-[10px] h-9 px-4 hover:bg-gray-50">
                            <Layers className="w-3.5 h-3.5 mr-2" />
                            Terrain Overlay
                        </Button>
                        <Button className={cn(glass.btnPrimary, "h-9 px-4 text-[10px] font-bold shadow-lg shadow-[#1B9157]/10")}>
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
                        { id: 'select', icon: MousePointer2, label: 'Select' },
                        { id: 'draw', icon: Hexagon, label: 'Bound' },
                        { id: 'pallet', icon: MapIcon, label: 'Pallet' },
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
                            <span className="text-[6px] font-bold mt-1">{tool.label}</span>
                        </button>
                    ))}
                    <div className="mt-auto space-y-3">
                        <button
                            className="w-full aspect-square bg-[#F4D03F] rounded-xl border border-[#F4D03F]/20 flex items-center justify-center text-[#1A1A1A] hover:opacity-90 transition-opacity"
                            aria-label="Add new map asset"
                            title="Add new map asset"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Map Interface */}
                <div className={cn(glass.card, "flex-1 rounded-3xl bg-neutral-900 border-gray-200 shadow-sm relative overflow-hidden group")}>
                    <div className="absolute inset-0 flex items-center justify-center p-12">
                        <div className="text-center space-y-2">
                            <MapIcon className="w-10 h-10 text-white/20 mx-auto" />
                            <p className="text-sm font-bold text-white/80">No GIS layer connected</p>
                            <p className="text-xs font-medium text-white/40 max-w-xl">
                                This map previously used a mock satellite background and demo drawings. Connect a real map provider and backend GIS assets
                                (boundaries, hive placements, geofences) to enable this view.
                            </p>
                        </div>
                    </div>

                    {/* Digital Hud */}
                    <div className="absolute top-6 left-6 space-y-4 pointer-events-none">
                        <div className="p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-gray-100 shadow-sm pointer-events-auto">
                            <div className="flex items-center gap-3 mb-3">
                                <Compass className="w-4 h-4 text-gray-500" />
                                <span className="text-[10px] font-bold text-gray-700">Feed</span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-mono text-gray-400">LAT: —</p>
                                <p className="text-[9px] font-mono text-gray-400">LON: —</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                                    <p className="text-[8px] font-bold text-gray-400">No fix</p>
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
                                        <span className="text-[10px] font-bold text-[#F4D03F]">Fence Active</span>
                                    </div>
                                    <button
                                        onClick={() => setShowGeofences(false)}
                                        className="text-white/40 hover:text-white"
                                        aria-label="Hide geofences"
                                        title="Hide geofences"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg border border-white/10">
                                        <span className="text-[9px] font-bold tracking-wider">Main Orchard</span>
                                        <Badge className="bg-[#1B9157] text-[8px] font-bold rounded-md h-5">Secure</Badge>
                                    </div>
                                    <p className="text-[8px] font-bold text-white/50 leading-snug tracking-wider">
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
                                <label className="text-[9px] font-bold text-gray-400 ml-1">Block Name</label>
                                <Input value="Honey Block Alpha" className="h-9 rounded-xl border-gray-100 bg-gray-50 font-bold text-xs" readOnly />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-bold text-gray-400 ml-1">Acreage</label>
                                    <Input value="14.2 AC" className="h-9 rounded-xl border-gray-100 bg-gray-50 font-bold text-[10px]" readOnly />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-bold text-gray-400 ml-1">Crop</label>
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
                                    <span className="text-[10px] font-bold text-white/70 group-hover:text-white transition-colors">{row.label}</span>
                                    <div className={cn("w-8 h-4 rounded-full border border-white/20 relative transition-all", row.active ? "bg-[#1B9157]" : "bg-transparent")}>
                                        <div className={cn("absolute top-[2px] w-2.5 h-2.5 rounded-full bg-white transition-all shadow-sm", row.active ? "right-[2px]" : "left-[2px]")} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            </BeeYieldPageShell>
        </motion.div>
    );
};

export default MasterMapView;

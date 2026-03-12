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

const MasterMapView: React.FC = () => {
    const [activeTool, setActiveTool] = React.useState<'select' | 'draw' | 'pallet'>('select');
    const [showGeofences, setShowGeofences] = React.useState(true);

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex items-center justify-between mb-8 border-b-4 border-[#064e3b] pb-6">
                <div>
                    <h1 className="text-4xl font-black text-[#064e3b] uppercase tracking-tighter">
                        Master <span className="text-[#10b981]">GIS Map</span>
                    </h1>
                    <p className="text-[10px] font-black uppercase text-[#064e3b]/40 tracking-widest mt-1">
                        Precision Asset Positioning · Orchard Geofencing · Spatial Intelligence
                    </p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="rounded-none border-2 border-[#064e3b] font-black uppercase text-[10px] tracking-widest h-12 px-6">
                        <Layers className="w-4 h-4 mr-2" />
                        Terrain Overlay
                    </Button>
                    <Button className="rounded-none bg-[#064e3b] text-gray-900 font-black uppercase text-[10px] tracking-widest h-12 px-6 shadow-[4px_4px_0px_0px_rgba(16,185,129,1)] hover:translate-y-1 hover:shadow-none transition-all">
                        <Save className="w-4 h-4 mr-2" />
                        Sync Changes
                    </Button>
                </div>
            </div>

            {/* Main GIS Container */}
            <div className="flex-1 flex gap-8 min-h-0">
                {/* Left Toolbar */}
                <div className="w-20 flex flex-col gap-4">
                    {[
                        { id: 'select', icon: MousePointer2, label: 'Select' },
                        { id: 'draw', icon: Hexagon, label: 'Boundary' },
                        { id: 'pallet', icon: MapIcon, label: 'Drop Pallet' },
                    ].map((tool) => (
                        <button
                            key={tool.id}
                            onClick={() => setActiveTool(tool.id as any)}
                            className={cn(
                                "w-full aspect-square flex flex-col items-center justify-center border-4 transition-all group",
                                activeTool === tool.id
                                    ? "bg-[#064e3b] border-[#064e3b] text-gray-900 shadow-[4px_4px_0px_0px_rgba(16,185,129,1)]"
                                    : "bg-white border-[#064e3b]/10 text-[#064e3b]/40 hover:border-[#064e3b]/40"
                            )}
                        >
                            <tool.icon className="w-6 h-6" />
                            <span className="text-[7px] font-black uppercase mt-1 tracking-tighter">{tool.label}</span>
                        </button>
                    ))}
                    <div className="mt-auto space-y-4">
                        <button className="w-full aspect-square bg-[#facc15] border-4 border-[#064e3b] flex items-center justify-center text-[#064e3b] hover:bg-white transition-colors">
                            <Plus className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Map Interface */}
                <Card className="flex-1 rounded-none border-4 border-[#064e3b] bg-neutral-900 shadow-[12px_12px_0px_0px_rgba(6,78,59,1)] relative overflow-hidden group">
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
                        <polygon points="200,100 600,150 550,450 150,400" className="fill-[#10b981]/10 stroke-[#10b981] stroke-4 stroke-dasharray-4" />
                        <circle cx="350" cy="280" r="10" className="fill-[#facc15] stroke-[#064e3b] stroke-2" />
                        <circle cx="450" cy="220" r="10" className="fill-[#facc15] stroke-[#064e3b] stroke-2" />
                    </svg>

                    {/* Digital Hud */}
                    <div className="absolute top-8 left-8 space-y-4 pointer-events-none">
                        <div className="p-4 bg-white border-4 border-[#064e3b] shadow-[4px_4px_0px_0px_rgba(6,78,59,1)] pointer-events-auto">
                            <div className="flex items-center gap-3 mb-3">
                                <Compass className="w-5 h-5 text-[#064e3b]" />
                                <span className="text-sm font-black text-[#064e3b] uppercase tracking-tighter">Coordinate Feed</span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-mono text-[#064e3b]/60">LAT: -1.2921°</p>
                                <p className="text-[9px] font-mono text-[#064e3b]/60">LON: 36.8219°</p>
                                <p className="text-[9px] font-mono text-red-500 font-black mt-2">SATELLITE LOCK: ACTIVE</p>
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
                                className="absolute top-8 right-8 w-64 p-6 bg-[#064e3b] border-4 border-[#10b981] text-gray-900 shadow-[8px_8px_0px_0px_rgba(250,204,21,1)]"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-[#facc15]" />
                                        <span className="text-xs font-black uppercase tracking-tighter text-[#facc15]">VIRTUAL GEOFENCE</span>
                                    </div>
                                    <button onClick={() => setShowGeofences(false)} className="text-gray-600 hover:text-gray-900">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center bg-white/5 p-3 border border-gray-200">
                                        <span className="text-[9px] font-black uppercase">Main Orchard</span>
                                        <Badge className="bg-[#10b981] text-xs rounded-none">SECURE</Badge>
                                    </div>
                                    <p className="text-[8px] font-bold text-gray-600 uppercase leading-snug">
                                        Tamper alert will trigger if pallet GPS drifts more than 5m outside polygon.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Map Controls */}
                    <div className="absolute bottom-8 right-8 flex gap-4">
                        <Button className="w-14 h-14 rounded-none border-4 border-[#064e3b] bg-white p-0 hover:bg-[#facc15] transition-colors">
                            <Locate className="w-6 h-6 text-[#064e3b]" />
                        </Button>
                        <Button className="w-14 h-14 rounded-none border-4 border-[#064e3b] bg-white p-0 hover:bg-[#facc15] transition-colors">
                            <Maximize2 className="w-6 h-6 text-[#064e3b]" />
                        </Button>
                    </div>
                </Card>

                {/* Properties Panel */}
                <div className="w-96 flex flex-col gap-8">
                    <Card className="rounded-none border-4 border-[#064e3b] bg-white shadow-[8px_8px_0px_0px_rgba(6,78,59,1)]">
                        <CardHeader className="p-8 border-b-4 border-[#064e3b]/5">
                            <CardTitle className="text-xl font-black text-[#064e3b] uppercase tracking-tighter">Active Selection</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[9px] font-black uppercase text-[#064e3b]/40 tracking-widest block mb-2">Block Name</label>
                                    <Input value="Honey Block Alpha" className="h-12 rounded-none border-4 border-[#064e3b] font-black uppercase text-xs" readOnly />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[9px] font-black uppercase text-[#064e3b]/40 tracking-widest block mb-2">Acreage</label>
                                        <Input value="14.2 AC" className="h-12 rounded-none border-4 border-[#064e3b] font-black uppercase text-xs" readOnly />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black uppercase text-[#064e3b]/40 tracking-widest block mb-2">Crop</label>
                                        <Input value="Macadamia" className="h-12 rounded-none border-4 border-[#064e3b] font-black uppercase text-xs" readOnly />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="flex-1 rounded-none border-4 border-[#064e3b] bg-[#064e3b] text-gray-900 shadow-[8px_8px_0px_0px_rgba(250,204,21,1)] overflow-hidden">
                        <div className="p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <Settings className="w-6 h-6 text-[#facc15]" />
                                <CardTitle className="text-xl font-black uppercase tracking-tighter">Asset Overlay</CardTitle>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { label: 'Show Hive Pallets', active: true },
                                    { label: 'Show Weather Stations', active: true },
                                    { label: 'Saturation Heatmap', active: false },
                                    { label: 'Grower Geofences', active: true },
                                ].map((row, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 border-2 border-gray-200 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                                        <span className="text-[10px] font-black uppercase">{row.label}</span>
                                        <div className={cn("w-10 h-5 border-2 border-white relative transition-colors", row.active ? "bg-[#10b981]" : "bg-transparent")}>
                                            <div className={cn("absolute top-1 bottom-1 w-3 bg-white transition-all", row.active ? "right-1" : "left-1")} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default MasterMapView;

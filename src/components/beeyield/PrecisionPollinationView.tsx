import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Map as MapIcon,
    Layers,
    Search,
    Info,
    Smartphone,
    Signal,
    Activity,
    Thermometer,
    Droplets,
    Wind,
    ArrowRight,
    Target,
    Hexagon,
    Zap,
    Terminal
} from 'lucide-react';
import { IoTDevice, SensorReading } from '@/services/beeyieldService';
import { cn } from '@/lib/utils';

interface PrecisionPollinationViewProps {
    devices: IoTDevice[];
    readings: SensorReading[];
    onTabChange: (tab: string, message?: string, action?: string) => void;
}

const PrecisionPollinationView: React.FC<PrecisionPollinationViewProps> = ({ devices, readings, onTabChange }) => {
    const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredDevices = useMemo(() => {
        return devices.filter(d =>
            d.device_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (d.location_name || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [devices, searchTerm]);

    useEffect(() => {
        if (filteredDevices.length > 0 && !selectedDeviceId) {
            setSelectedDeviceId(filteredDevices[0].id);
        }
    }, [filteredDevices, selectedDeviceId]);

    const selectedDevice = useMemo(() =>
        devices.find(d => d.id === selectedDeviceId),
        [devices, selectedDeviceId]
    );

    const deviceReadings = useMemo(() =>
        readings.filter(r => r.device_id === selectedDeviceId)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
        [readings, selectedDeviceId]
    );

    const latestReading = deviceReadings[0];

    return (
        <div className="p-8 space-y-12 bg-white min-h-screen text-[#064e3b] antialiased">
            {/* Header - Tactical Map Registry */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b-4 border-[#064e3b] pb-8">
                <div className="space-y-4">
                    <h1 className="text-5xl font-black tracking-tighter uppercase leading-[0.8]">
                        Pollination <span className="text-[#10b981]">Grid</span>
                    </h1>
                    <p className="text-[#10b981] font-black uppercase text-[10px] tracking-[0.4em] mt-4">
                        Geospatial Node Density and Coverage Map
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 border-2 border-[#064e3b] bg-[#facc15] font-black text-[10px] uppercase tracking-widest">
                        Scale: 1:5000
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Node Selector - Sidebar Registry style */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="flex items-center gap-4 mb-4">
                        <Hexagon className="w-6 h-6 text-[#10b981]" />
                        <h3 className="text-2xl font-black uppercase tracking-tight">Active Nodes</h3>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#064e3b]/30" />
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="INPUT ID..."
                            className="w-full h-12 pl-12 pr-4 border-2 border-[#064e3b] bg-white font-black text-xs uppercase focus:bg-[#facc15]/5 outline-none"
                        />
                    </div>
                    <div className="border-4 border-[#064e3b] divide-y-2 divide-[#064e3b]/10 bg-white overflow-y-auto max-h-[600px]">
                        {filteredDevices.map(device => (
                            <button
                                key={device.id}
                                onClick={() => setSelectedDeviceId(device.id)}
                                className={cn(
                                    "w-full p-5 text-left transition-none flex items-center justify-between group",
                                    selectedDeviceId === device.id ? "bg-[#10b981] text-white" : "hover:bg-[#facc15]/10"
                                )}
                            >
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest">{device.device_code}</p>
                                    <p className={cn("text-[8px] font-bold uppercase", selectedDeviceId === device.id ? "text-white/60" : "text-[#064e3b]/40")}>
                                        {device.location_name || 'N/A'}
                                    </p>
                                </div>
                                <div className={cn(
                                    "px-2 py-0.5 border text-[8px] font-black uppercase",
                                    device.status === 'active' ? (selectedDeviceId === device.id ? "bg-white text-[#10b981] border-white" : "bg-[#10b981] text-white border-[#064e3b]") : "bg-red-500 text-white border-[#064e3b]"
                                )}>
                                    {device.status}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Map/Telemetry View */}
                <div className="lg:col-span-8 space-y-10">
                    {/* Simulated Map Grid */}
                    <div className="aspect-video border-4 border-[#064e3b] bg-white relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[#facc15]/5 opacity-20" style={{ backgroundImage: 'radial-gradient(#064e3b 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

                        <div className="absolute inset-0 flex items-center justify-center grayscale opacity-40 contrast-125">
                            <MapIcon className="w-1/2 h-1/2 text-[#064e3b]" />
                        </div>

                        {/* Node Pulse Overlay */}
                        {selectedDevice && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                <div className="relative">
                                    <div className="absolute inset-0 w-20 h-20 border-2 border-[#10b981] animate-ping opacity-20" />
                                    <div className="w-6 h-6 bg-[#10b981] border-4 border-white shadow-[0_0_0_2px_#064e3b]" />
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 bg-white border-2 border-[#064e3b] p-3 shadow-[4px_4px_0px_0px_rgba(6,78,59,1)] whitespace-nowrap">
                                        <p className="text-[10px] font-black uppercase">{selectedDevice.device_code}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="absolute bottom-6 left-6 flex items-center gap-4">
                            <div className="px-3 py-1 bg-white border-2 border-[#064e3b] text-[10px] font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(6,78,59,1)]">
                                X: 34.223 Y: 1.455
                            </div>
                        </div>
                    </div>

                    {/* Node Telemetry Card */}
                    {selectedDevice && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="border-4 border-[#064e3b] p-6 bg-white space-y-4">
                                <div className="flex items-center gap-3">
                                    <Thermometer className="w-5 h-5 text-[#10b981]" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Temperature</span>
                                </div>
                                <h4 className="text-4xl font-black leading-none">24.5<span className="text-xl">°C</span></h4>
                            </div>
                            <div className="border-4 border-[#064e3b] p-6 bg-white space-y-4">
                                <div className="flex items-center gap-3">
                                    <Droplets className="w-5 h-5 text-[#10b981]" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Humidity</span>
                                </div>
                                <h4 className="text-4xl font-black leading-none">62<span className="text-xl">%</span></h4>
                            </div>
                            <div className="border-4 border-[#064e3b] p-6 bg-white space-y-4">
                                <div className="flex items-center gap-3">
                                    <Zap className="w-5 h-5 text-[#facc15] fill-current" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Signal</span>
                                </div>
                                <h4 className="text-4xl font-black leading-none">98<span className="text-xl">%</span></h4>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PrecisionPollinationView;

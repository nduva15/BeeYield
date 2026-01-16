import React, { useState, useEffect } from 'react';
import { IoTDevice, SensorReading } from '@/services/beeyieldService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Plus, Battery, Signal, Clock, MapPin, X, MoreHorizontal,
    Thermometer, Droplets, Search, Filter, Cpu, Wifi
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AddDeviceModal from './AddDeviceModal';
import { toast } from 'sonner';
import FirstStepsBanner from './FirstStepsBanner'; // We can keep or remove this, let's keep for utility
import { motion, AnimatePresence } from 'framer-motion';

// Modern Stat Card
const StatCard = ({ label, value, color, icon: Icon }: { label: string, value: number | string, color: string, icon?: any }) => (
    <motion.div
        whileHover={{ y: -4, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)" }}
        className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md p-5 rounded-3xl border border-white/20 dark:border-white/10 shadow-sm relative overflow-hidden group"
    >
        <div className={cn("absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity", color)}>
            {Icon && <Icon className="w-16 h-16" />}
        </div>
        <p className="text-[11px] font-bold text-muted-foreground/80 uppercase tracking-widest mb-2">{label}</p>
        <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
        <div className={cn("absolute bottom-0 left-0 w-full h-1", color.replace('text-', 'bg-'))} />
    </motion.div>
);

interface MyDevicesViewProps {
    devices: IoTDevice[];
    readings: SensorReading[];
    onTabChange: (tab: string) => void;
}

const MyDevicesView: React.FC<MyDevicesViewProps> = ({ devices: initialDevices, readings, onTabChange }) => {
    const [localDevices, setLocalDevices] = useState<IoTDevice[]>(initialDevices);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Sync local devices when initialDevices changes
    useEffect(() => {
        setLocalDevices(initialDevices);
    }, [initialDevices]);

    const handleAddDevice = (newDevice: IoTDevice) => {
        setLocalDevices([newDevice, ...localDevices]);
        toast.success(`Device ${newDevice.device_code} added successfully!`);
    };

    // Filter Logic
    const filteredDevices = localDevices.filter(d =>
        d.device_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.device_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.location_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Derived Stats
    const totalDevices = localDevices.length;
    const withMeasurement = localDevices.filter(d => readings.some(r => r.device_id === d.id)).length;
    const lowBattery = localDevices.filter(d => d.battery_level < 20).length;

    // Animation Variants
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <div className="space-y-8 pb-12">

            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-2"
                >
                    <h1 className="text-4xl font-black text-foreground tracking-tight">Device Command</h1>
                    <p className="text-lg text-muted-foreground max-w-lg">
                        Monitor active sensor arrays, check signal latency, and manage hardware deployment.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-3"
                >
                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className="rounded-2xl h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 font-bold"
                    >
                        <Plus className="w-5 h-5 mr-2" /> Deploy Sensor
                    </Button>
                </motion.div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Active Units" value={totalDevices} color="text-blue-500" icon={Cpu} />
                <StatCard label="Online" value={withMeasurement} color="text-emerald-500" icon={Wifi} />
                <StatCard label="Low Battery" value={lowBattery} color="text-red-500" icon={Battery} />
                <StatCard label="Network Load" value="98%" color="text-purple-500" icon={Signal} />
            </div>

            {/* Filter Bar */}
            <div className="bg-white/40 dark:bg-black/20 backdrop-blur-sm p-4 rounded-3xl border border-white/20 dark:border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search device ID, name or location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-11 h-12 rounded-2xl bg-white dark:bg-black/40 border-transparent focus:bg-white dark:focus:bg-black focus:border-primary/20 transition-all font-medium"
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <Select defaultValue="all">
                        <SelectTrigger className="w-full md:w-[180px] h-12 rounded-2xl bg-white dark:bg-black/40 border-transparent">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="offline">Offline</SelectItem>
                            <SelectItem value="warning">Warning</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="ghost" className="h-12 w-12 rounded-2xl hover:bg-white/50">
                        <Filter className="w-5 h-5 text-muted-foreground" />
                    </Button>
                </div>
            </div>

            {/* Devices Grid */}
            {filteredDevices.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-24 text-center bg-white/40 dark:bg-white/5 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-white/10"
                >
                    <div className="w-24 h-24 bg-gray-50 dark:bg-white/5 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                        <Search className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">No devices found</h3>
                    <p className="text-muted-foreground max-w-sm mb-8">
                        We couldn't find any devices matching your search. Try adjusting the filters or add a new device.
                    </p>
                    <Button onClick={() => setIsAddModalOpen(true)} variant="outline" className="rounded-xl h-12 px-8 border-primary text-primary hover:bg-primary/5">
                        Add New Device
                    </Button>
                </motion.div>
            ) : (
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                >
                    {filteredDevices.map((device) => {
                        // Find latest reading for this device logic placeholder
                        // For demo, we assume readings prop connects here
                        const hasReading = readings.some(r => r.device_id === device.id);

                        return (
                            <motion.div
                                key={device.id}
                                variants={item}
                                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                                className="group bg-white dark:bg-[#09090b] rounded-[2.5rem] p-6 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-[#1e1e1e] relative overflow-hidden"
                            >
                                {/* Floating Status Pill */}
                                <div className="absolute top-6 right-6">
                                    <div className={cn(
                                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm",
                                        device.status === 'active'
                                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                                            : "bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400"
                                    )}>
                                        <div className={cn(
                                            "w-1.5 h-1.5 rounded-full",
                                            device.status === 'active' ? "bg-emerald-500 animate-pulse" : "bg-gray-400"
                                        )} />
                                        {device.status === 'active' ? 'Online' : 'Offline'}
                                    </div>
                                </div>

                                {/* Icon & Name */}
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-500/20 dark:to-indigo-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-inner">
                                        <Cpu className="w-8 h-8" />
                                    </div>
                                    <div className="mt-1">
                                        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{device.device_name}</h3>
                                        <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mt-1">{device.device_code}</p>
                                    </div>
                                </div>

                                {/* Metrics Area */}
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    <div className="bg-gray-50/80 dark:bg-white/5 rounded-2xl p-4 flex flex-col justify-between h-24 border border-gray-100 dark:border-white/5">
                                        <Thermometer className="w-5 h-5 text-orange-400 mb-2" />
                                        <div>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Temp</p>
                                            <p className="text-xl font-bold text-foreground">24.5°C</p>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50/80 dark:bg-white/5 rounded-2xl p-4 flex flex-col justify-between h-24 border border-gray-100 dark:border-white/5">
                                        <Droplets className="w-5 h-5 text-blue-400 mb-2" />
                                        <div>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Humidity</p>
                                            <p className="text-xl font-bold text-foreground">62%</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Info */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <MapPin className="w-4 h-4" />
                                        <span className="truncate max-w-[120px]">{device.location_name || 'Unassigned'}</span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                                            <Battery className={cn("w-4 h-4", device.battery_level > 20 ? "text-green-500" : "text-red-500")} />
                                            {device.battery_level}%
                                        </div>
                                    </div>
                                </div>

                                <Button variant="ghost" size="icon" className="absolute bottom-4 right-4 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreHorizontal className="w-5 h-5" />
                                </Button>
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}

            <AddDeviceModal
                open={isAddModalOpen}
                onOpenChange={setIsAddModalOpen}
                onAdd={handleAddDevice}
            />
        </div>
    );
};

export default MyDevicesView;

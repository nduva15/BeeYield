import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
    Shield,
    Bell,
    MapPin,
    Move,
    AlertTriangle,
    Box,
    CheckCircle2,
    Lock,
    Unlock,
    Activity,
    Smartphone,
    Signal,
    MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface Pallet {
    id: string;
    hives: number;
    location: string;
    lastMoved: string;
    status: 'secured' | 'warning' | 'critical';
    vibration: number;
}

const FleetSecurity: React.FC = () => {
    const [pallets, setPallets] = useState<Pallet[]>([
        { id: 'PAL-001', hives: 12, location: 'North Block', lastMoved: '2h ago', status: 'secured', vibration: 0.02 },
        { id: 'PAL-002', hives: 12, location: 'East Corridor', lastMoved: '10m ago', status: 'warning', vibration: 0.15 },
        { id: 'PAL-003', hives: 8, location: 'Hillside Apiary', lastMoved: '5d ago', status: 'secured', vibration: 0.01 },
    ]);

    const [globalAlert, setGlobalAlert] = useState(false);

    // Simulate real-time alerts
    useEffect(() => {
        const interval = setInterval(() => {
            setPallets(prev => prev.map(p => {
                if (p.id === 'PAL-002') {
                    const newVib = Math.random() * 0.4;
                    const newStatus = newVib > 0.3 ? 'critical' : (newVib > 0.1 ? 'warning' : 'secured');
                    if (newStatus === 'critical') setGlobalAlert(true);
                    return { ...p, vibration: newVib, status: newStatus };
                }
                return p;
            }));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-10">
            {/* Global Alert Banner */}
            <AnimatePresence>
                {globalAlert && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-red-600 border-b-4 border-black p-8 flex items-center justify-between text-white overflow-hidden"
                    >
                        <div className="flex items-center gap-6">
                            <div className="animate-ping p-2 bg-white rounded-full">
                                <AlertTriangle className="w-8 h-8 text-red-600" />
                            </div>
                            <div>
                                <h2 className="text-4xl font-black uppercase tracking-tighter">Theft Protocol Active</h2>
                                <p className="text-xs font-black uppercase tracking-widest text-red-100">Boundary violation detected on Pallet PAL-002. High intensity accelerometer data triggered.</p>
                            </div>
                        </div>
                        <Button
                            onClick={() => setGlobalAlert(false)}
                            className="h-12 border-2 border-white bg-transparent hover:bg-white hover:text-red-600 font-black uppercase tracking-widest text-[10px]"
                        >
                            Acknowledge Alert
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            <Card className="rounded-none border-4 border-[#064e3b] bg-white shadow-[12px_12px_0px_0px_rgba(6,78,59,1)] overflow-hidden">
                <CardHeader className="border-b-4 border-[#064e3b] bg-white p-10">
                    <div className="flex justify-between items-center">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 border-2 border-[#10b981] bg-[#064e3b]">
                                <Shield className="w-3.5 h-3.5 text-[#facc15]" />
                                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Fleet Integrity Protection v2.2</span>
                            </div>
                            <CardTitle className="text-5xl font-black text-[#064e3b] tracking-tighter uppercase leading-none">
                                Fleet <span className="text-[#10b981]">Security</span>
                            </CardTitle>
                            <p className="text-[10px] font-bold text-[#064e3b]/40 uppercase tracking-[0.4em]">Active Anti-Theft & Pallet Logistics</p>
                        </div>

                        <div className="flex gap-4">
                            <Button variant="outline" className="h-14 border-4 border-[#064e3b] bg-neutral-50 px-8 font-black uppercase tracking-widest text-xs">
                                Geofence Settings
                            </Button>
                            <Button variant="outline" className="h-14 border-4 border-[#064e3b] bg-[#064e3b] text-white px-8 font-black uppercase tracking-widest text-xs flex items-center gap-3">
                                <Lock className="w-4 h-4" />
                                Arm All Pallets
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <div className="grid grid-cols-1 xl:grid-cols-3 divide-y-4 xl:divide-y-0 xl:divide-x-4 divide-[#064e3b]">
                        {/* Live Status Table */}
                        <div className="xl:col-span-2 p-10 bg-white space-y-8">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-black uppercase tracking-tighter">Asset Registry</h3>
                                <div className="flex items-center gap-2">
                                    <Signal className="w-4 h-4 text-[#10b981]" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">All Nodes Online</span>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b-4 border-[#064e3b]">
                                            <th className="py-4 text-[10px] font-black uppercase tracking-widest">Pallet ID</th>
                                            <th className="py-4 text-[10px] font-black uppercase tracking-widest">Location</th>
                                            <th className="py-4 text-[10px] font-black uppercase tracking-widest">Strength</th>
                                            <th className="py-4 text-[10px] font-black uppercase tracking-widest">Vibration</th>
                                            <th className="py-4 text-[10px] font-black uppercase tracking-widest text-right">Protection</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y-2 divide-[#064e3b10]">
                                        {pallets.map(p => (
                                            <tr key={p.id} className={cn(
                                                "transition-colors",
                                                p.status === 'critical' ? "bg-red-50" : (p.status === 'warning' ? "bg-yellow-50" : "bg-white")
                                            )}>
                                                <td className="py-6">
                                                    <div className="flex items-center gap-3">
                                                        <Box className="w-4 h-4 text-[#064e3b]/30" />
                                                        <span className="font-black text-sm">{p.id}</span>
                                                    </div>
                                                </td>
                                                <td className="py-6 font-bold text-xs text-gray-400 uppercase tracking-widest">{p.location}</td>
                                                <td className="py-6">
                                                    <Badge className="rounded-none border-2 border-[#064e3b] bg-white text-[#064e3b] font-black px-3 py-1 text-[9px]">
                                                        {p.hives} HIVES
                                                    </Badge>
                                                </td>
                                                <td className="py-6">
                                                    <div className="flex items-center gap-2">
                                                        <Activity className={cn(
                                                            "w-4 h-4",
                                                            p.vibration > 0.1 ? "text-red-500 animate-pulse" : "text-[#10b981]"
                                                        )} />
                                                        <span className="font-mono text-[10px] font-bold text-gray-500">
                                                            {p.vibration.toFixed(2)}σ
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-6 text-right">
                                                    <Badge className={cn(
                                                        "rounded-none px-4 py-1 font-black text-[9px] uppercase tracking-widest border-2",
                                                        p.status === 'secured' ? "bg-green-100 text-[#10b981] border-[#10b981]" :
                                                            p.status === 'warning' ? "bg-yellow-100 text-[#064e3b] border-[#facc15]" :
                                                                "bg-red-500 text-white border-red-500"
                                                    )}>
                                                        {p.status}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Detail/Action Panel */}
                        <div className="p-10 bg-neutral-50 flex flex-col gap-10">
                            <section className="space-y-6">
                                <div className="flex items-center gap-3 border-[#064e3b] border-l-8 pl-6">
                                    <Smartphone className="w-5 h-5 text-[#064e3b]" />
                                    <h3 className="text-xl font-black uppercase tracking-tighter">Mobile Alerts</h3>
                                </div>
                                <div className="p-6 border-4 border-[#064e3b] bg-white space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase text-gray-400">SMS Notification</span>
                                        <div className="w-12 h-6 border-2 border-[#064e3b] relative bg-[#10b981]">
                                            <div className="absolute right-0 top-0 bottom-0 w-6 bg-[#064e3b]" />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase text-gray-400">Push Protocol</span>
                                        <div className="w-12 h-6 border-2 border-[#064e3b] relative bg-[#10b981]">
                                            <div className="absolute right-0 top-0 bottom-0 w-6 bg-[#064e3b]" />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <Separator className="bg-[#064e3b]/10 h-1" />

                            <section className="space-y-6">
                                <h4 className="text-xl font-black uppercase tracking-tighter">Theft Deterrence</h4>
                                <div className="space-y-3">
                                    <Button className="w-full h-14 border-4 border-[#064e3b] bg-white text-[#064e3b] hover:bg-neutral-100 rounded-none font-black uppercase tracking-widest text-[10px] flex items-center justify-between px-6">
                                        Test Audio Alarm <Bell className="w-4 h-4" />
                                    </Button>
                                    <Button className="w-full h-14 border-4 border-[#064e3b] bg-white text-[#064e3b] hover:bg-neutral-100 rounded-none font-black uppercase tracking-widest text-[10px] flex items-center justify-between px-6">
                                        Remote Lock All Locks <Lock className="w-4 h-4" />
                                    </Button>
                                </div>
                            </section>

                            <div className="mt-auto p-6 border-4 border-[#064e3b] bg-neutral-900 text-white space-y-4 shadow-[8px_8px_0px_0px_rgba(250,204,21,1)]">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-red-500">Auto-Defense Logic</p>
                                </div>
                                <p className="text-[9px] font-bold text-white/50 leading-relaxed uppercase">
                                    System detects high-g lateral movements. If pallet displacement exceeds 2 meters from drop point without tech-override, police notifications will bypass tech validation.
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default FleetSecurity;

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Wifi,
    Battery,
    Thermometer,
    Zap,
    Cpu,
    Radio,
    Clock,
    AlertTriangle,
    Shield,
    RefreshCw,
    HardDrive,
    SignalHigh,
    SignalMedium,
    SignalLow
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Gateway {
    mac: string;
    alias: string;
    status: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE';
    battery: number;
    rssi: number; // dBm
    temp: number; // Celsius
    deploymentDate: string;
    lastPing: string;
    type: 'PALLET_GATEWAY' | 'ORCHARD_STATION';
}

const gateways: Gateway[] = [
    { mac: '00:0A:95:9D:68:16', alias: 'GW-Alpha-Kibwezi', status: 'ONLINE', battery: 92, rssi: -62, temp: 24.5, deploymentDate: '2023-04-12', lastPing: '2s ago', type: 'PALLET_GATEWAY' },
    { mac: '00:0A:95:9D:68:17', alias: 'GW-Beta-Kibwezi', status: 'ONLINE', battery: 88, rssi: -58, temp: 25.2, deploymentDate: '2023-05-15', lastPing: '15s ago', type: 'PALLET_GATEWAY' },
    { mac: '00:0A:95:9D:72:01', alias: 'Station-North-01', status: 'ONLINE', battery: 45, rssi: -78, temp: 22.1, deploymentDate: '2023-01-20', lastPing: '1m ago', type: 'ORCHARD_STATION' },
    { mac: '00:0A:95:9D:88:F2', alias: 'GW-Gamma-South', status: 'OFFLINE', battery: 0, rssi: 0, temp: 0, deploymentDate: '2024-01-10', lastPing: '4h ago', type: 'PALLET_GATEWAY' },
    { mac: '00:0A:95:8E:44:A3', alias: 'GW-Delta-East', status: 'MAINTENANCE', battery: 12, rssi: -82, temp: 28.4, deploymentDate: '2023-03-05', lastPing: '10m ago', type: 'PALLET_GATEWAY' },
];

const GatewayHub: React.FC = () => {
    const getBatteryColor = (level: number) => {
        if (level > 70) return 'text-[#10b981]';
        if (level > 30) return 'text-[#facc15]';
        return 'text-red-500';
    };

    const getSignalIcon = (rssi: number) => {
        if (rssi > -65) return <SignalHigh className="w-5 h-5 text-[#10b981]" />;
        if (rssi > -80) return <SignalMedium className="w-5 h-5 text-[#facc15]" />;
        return <SignalLow className="w-5 h-5 text-red-500" />;
    };

    const calculateLifespan = (date: string) => {
        const deployed = new Date(date);
        const now = new Date();
        const diffMonths = (now.getFullYear() - deployed.getFullYear()) * 12 + (now.getMonth() - deployed.getMonth());
        return diffMonths;
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header / Metrics */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-[#064e3b] pb-10">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 border-2 border-[#10b981] bg-[#064e3b]">
                        <Cpu className="w-3.5 h-3.5 text-[#facc15]" />
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Mesh Network Infrastructure</span>
                    </div>
                    <h1 className="text-6xl font-black text-[#064e3b] tracking-tighter uppercase leading-none">
                        Gateway <span className="text-[#10b981]">Hub</span>
                    </h1>
                    <p className="text-[#064e3b]/40 font-black text-sm uppercase tracking-widest mt-2 px-1">
                        Localized Orchard Mesh · Lifecycle Monitoring · Asset Integrity
                    </p>
                </div>

                <div className="flex gap-4">
                    <div className="px-8 py-5 border-4 border-[#064e3b] bg-white flex flex-col items-end">
                        <span className="text-[9px] font-black uppercase text-[#064e3b]/40 tracking-widest mb-1">Network Load</span>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-black text-[#064e3b] uppercase tracking-tighter">8.2 GB / Mo</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Asset Lifecycle Alerts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {gateways.some(g => calculateLifespan(g.deploymentDate) >= 30) && (
                    <div className="p-8 border-4 border-[#facc15] bg-[#facc15]/5 flex items-start gap-6 animate-pulse">
                        <AlertTriangle className="w-12 h-12 text-[#facc15] shrink-0" />
                        <div>
                            <h3 className="text-2xl font-black text-[#064e3b] uppercase tracking-tighter">Maintenance Interval Warning</h3>
                            <p className="text-sm font-bold text-[#064e3b]/60 uppercase leading-snug mt-1">
                                Multiple sensors (30+ months) approaching the end of their 3-year reliability protocol. Preventive maintenance required.
                            </p>
                            <Button className="mt-4 rounded-none bg-[#064e3b] text-white font-black uppercase text-[10px] tracking-widest h-10 px-6 transition-none translate-y-[-2px] hover:translate-y-0 shadow-[4px_4px_0px_0px_rgba(6,78,59,1)]">
                                Schedule Bulk Replacement
                            </Button>
                        </div>
                    </div>
                )}
                <div className="p-8 border-4 border-[#10b981] bg-[#10b981]/5 flex items-start gap-6">
                    <Shield className="w-12 h-12 text-[#10b981] shrink-0" />
                    <div>
                        <h3 className="text-2xl font-black text-[#064e3b] uppercase tracking-tighter">Encryption Pulse: Active</h3>
                        <p className="text-sm font-bold text-[#064e3b]/60 uppercase leading-snug mt-1">
                            BIP-32 Payload verification active on all gateways. Duplex integrity confirmed across 84% of nodes.
                        </p>
                    </div>
                </div>
            </div>

            {/* Gateway Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {gateways.map((gw) => {
                    const monthsActive = calculateLifespan(gw.deploymentDate);
                    const isOld = monthsActive >= 30;

                    return (
                        <Card key={gw.mac} className={cn(
                            "rounded-none border-4 bg-white shadow-[8px_8px_0px_0px_rgba(6,78,59,1)] overflow-hidden transition-all group hover:translate-x-1 hover:translate-y-1 hover:shadow-none",
                            gw.status === 'OFFLINE' ? "border-red-500 opacity-60" : gw.status === 'MAINTENANCE' ? "border-[#facc15]" : "border-[#064e3b]"
                        )}>
                            <CardHeader className="p-6 border-b-4 border-[#064e3b]/5">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <Badge className={cn(
                                            "rounded-none px-3 font-black text-[9px] tracking-widest uppercase",
                                            gw.status === 'ONLINE' ? "bg-[#10b981]" : gw.status === 'MAINTENANCE' ? "bg-[#facc15] text-[#064e3b]" : "bg-red-500"
                                        )}>
                                            {gw.status}
                                        </Badge>
                                        <h3 className="text-xl font-black text-[#064e3b] uppercase tracking-tighter truncate max-w-[180px]">
                                            {gw.alias}
                                        </h3>
                                    </div>
                                    <div className="p-2 bg-neutral-50 border-2 border-[#064e3b]/5">
                                        {gw.type === 'PALLET_GATEWAY' ? <Radio className="w-5 h-5 text-[#064e3b]" /> : <Wifi className="w-5 h-5 text-[#064e3b]" />}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="p-6 grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Battery className={cn("w-3.5 h-3.5", getBatteryColor(gw.battery))} />
                                            <span className="text-sm font-black text-[#064e3b]">{gw.battery}%</span>
                                        </div>
                                        <p className="text-[8px] font-black text-[#064e3b]/30 uppercase tracking-widest">Power Level</p>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            {getSignalIcon(gw.rssi)}
                                            <span className="text-sm font-black text-[#064e3b]">{gw.rssi} dBm</span>
                                        </div>
                                        <p className="text-[8px] font-black text-[#064e3b]/30 uppercase tracking-widest">Signal (RSSI)</p>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Thermometer className="w-3.5 h-3.5 text-[#064e3b]" />
                                            <span className="text-sm font-black text-[#064e3b]">{gw.temp}°C</span>
                                        </div>
                                        <p className="text-[8px] font-black text-[#064e3b]/30 uppercase tracking-widest">Internal Amb.</p>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3.5 h-3.5 text-[#064e3b]/30" />
                                            <span className="text-[10px] font-black text-[#064e3b]">{gw.lastPing}</span>
                                        </div>
                                        <p className="text-[8px] font-black text-[#064e3b]/30 uppercase tracking-widest">Last Payload</p>
                                    </div>
                                </div>

                                <div className="px-6 py-4 bg-neutral-50 border-y-2 border-[#064e3b]/5 flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <p className="text-[8px] font-black uppercase text-[#064e3b]/30">Deployment Age</p>
                                        <p className={cn("text-xs font-black uppercase", isOld ? "text-red-500" : "text-[#064e3b]")}>
                                            {monthsActive} Months
                                        </p>
                                    </div>
                                    {isOld && (
                                        <div className="p-2 bg-red-50 border-2 border-red-200">
                                            <AlertTriangle className="w-4 h-4 text-red-500" />
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 grid grid-cols-2 gap-4">
                                    <Button variant="outline" className="h-10 rounded-none border-2 border-[#064e3b] font-black text-[9px] uppercase tracking-widest hover:bg-[#064e3b] hover:text-white transition-none">
                                        <RefreshCw className="w-3 h-3 mr-2" />
                                        Reset
                                    </Button>
                                    <Button className="h-10 rounded-none bg-[#064e3b] text-white font-black text-[9px] uppercase tracking-widest hover:bg-[#10b981] transition-none">
                                        <HardDrive className="w-3 h-3 mr-2" />
                                        Logs
                                    </Button>
                                </div>
                            </CardContent>
                            {/* MAC Address Footer */}
                            <div className="px-6 py-2 bg-neutral-100/50 border-t-2 border-[#064e3b]/5">
                                <span className="text-[7px] font-mono text-[#064e3b]/30 tracking-widest">{gw.mac}</span>
                            </div>
                        </Card>
                    );
                })}

                {/* Provision New Gateway */}
                <button className="border-4 border-dashed border-[#064e3b]/20 p-10 flex flex-col items-center justify-center hover:border-[#064e3b] hover:bg-[#064e3b]/3 transition-all min-h-[350px]">
                    <div className="w-20 h-20 border-4 border-dashed border-[#064e3b]/20 flex items-center justify-center mb-6">
                        <span className="text-6xl font-light text-[#064e3b]/30">+</span>
                    </div>
                    <h3 className="text-xl font-black text-[#064e3b]/40 uppercase tracking-tighter">Pair Gateway</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#064e3b]/30 mt-2">Provision via Bluetooth</p>
                </button>
            </div>
        </div>
    );
};

export default GatewayHub;

import React from 'react';
import { Button } from '@/components/ui/button';
import {
    Cpu,
    AlertTriangle,
    Shield,
    Server
} from 'lucide-react';
import { cn } from '@/lib/utils';
import GatewayStatusCard from '@/components/telemetry/GatewayStatusCard';
import { glass, PageHeader } from './GlassTheme';
import { motion } from 'framer-motion';

interface Gateway {
    mac: string;
    alias: string;
    status: 'Online' | 'Offline' | 'Maintenance';
    battery: number;
    rssi: number; // dBm
    temp: number; // Celsius
    deploymentDate: string;
    lastPing: string;
    type: 'Pallet Gateway' | 'Orchard Station';
}

const gateways: Gateway[] = [
    { mac: '00:0A:95:9D:68:16', alias: 'GW-Alpha-Kibwezi', status: 'Online', battery: 92, rssi: -62, temp: 24.5, deploymentDate: '2023-04-12', lastPing: '2s ago', type: 'Pallet Gateway' },
    { mac: '00:0A:95:9D:68:17', alias: 'GW-Beta-Kibwezi', status: 'Online', battery: 88, rssi: -58, temp: 25.2, deploymentDate: '2023-05-15', lastPing: '15s ago', type: 'Pallet Gateway' },
    { mac: '00:0A:95:9D:72:01', alias: 'Station-North-01', status: 'Online', battery: 45, rssi: -78, temp: 22.1, deploymentDate: '2023-01-20', lastPing: '1m ago', type: 'Orchard Station' },
    { mac: '00:0A:95:9D:88:F2', alias: 'GW-Gamma-South', status: 'Offline', battery: 0, rssi: 0, temp: 0, deploymentDate: '2024-01-10', lastPing: '4h ago', type: 'Pallet Gateway' },
    { mac: '00:0A:95:8E:44:A3', alias: 'GW-Delta-East', status: 'Maintenance', battery: 12, rssi: -82, temp: 28.4, deploymentDate: '2023-03-05', lastPing: '10m ago', type: 'Pallet Gateway' },
];

const GatewayHub: React.FC = () => {
    const calculateLifespan = (date: string) => {
        const deployed = new Date(date);
        const now = new Date();
        const diffMonths = (now.getFullYear() - deployed.getFullYear()) * 12 + (now.getMonth() - deployed.getMonth());
        return diffMonths;
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(glass.page, "p-4 lg:p-6 space-y-6 pb-20")}
        >
            <PageHeader
                icon={Server}
                label="Mesh Network Infrastructure"
                title={<>Gateway <span className="text-[#1B9157]">Hub</span></>}
                subtitle="Localized Orchard Mesh · Lifecycle Monitoring · Asset Integrity"
                actions={
                    <div className={cn(glass.card, "px-4 py-2 bg-white flex flex-col items-end shadow-sm")}>
                        <span className="text-[10px] font-bold text-gray-500 tracking-wider mb-0.5">Network Load</span>
                        <span className="text-[16px] font-bold text-[#1A1A1A] tracking-tight">8.2 GB / Mo</span>
                    </div>
                }
            />

            {/* Asset Lifecycle Alerts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gateways.some(g => calculateLifespan(g.deploymentDate) >= 30) && (
                    <div className={cn(glass.card, "p-5 bg-amber-50/50 border-amber-200/50 flex flex-col sm:flex-row items-start gap-4")}>
                        <div className="w-10 h-10 rounded-xl bg-amber-100/50 flex items-center justify-center shrink-0 border border-amber-200/50">
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                        </div>
                        <div className="flex-1 space-y-2">
                            <h3 className="text-sm font-bold text-[#1A1A1A] tracking-tight">Maintenance Interval Warning</h3>
                            <p className="text-xs font-medium text-gray-600 leading-relaxed">
                                Multiple sensors (30+ months) approaching the end of their 3-year reliability protocol. Preventive maintenance required.
                            </p>
                            <button className={cn(glass.btnSecondary, "mt-2 h-8 px-3 text-[11px] font-bold border-amber-200 hover:bg-amber-100/50")}>
                                Schedule Bulk Replacement
                            </button>
                        </div>
                    </div>
                )}
                <div className={cn(glass.card, "p-5 bg-emerald-50/50 border-emerald-200/50 flex flex-col sm:flex-row items-start gap-4")}>
                    <div className="w-10 h-10 rounded-xl bg-emerald-100/50 flex items-center justify-center shrink-0 border border-emerald-200/50">
                        <Shield className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="flex-1 space-y-2">
                        <h3 className="text-sm font-bold text-[#1A1A1A] tracking-tight">Encryption Pulse: Active</h3>
                        <p className="text-xs font-medium text-gray-600 leading-relaxed">
                            BIP-32 Payload verification active on all gateways. Duplex integrity confirmed across 84% of nodes.
                        </p>
                    </div>
                </div>
            </div>

            {/* Gateway Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {gateways.map((gw) => (
                    <GatewayStatusCard
                        key={gw.mac}
                        gatewayId={gw.alias}
                        status={gw.status === 'Online' ? 'Online' : 'Offline'}
                        battery={gw.battery}
                        signal={gw.rssi}
                        lastPing={gw.lastPing}
                    />
                ))}

                {/* Provision New Gateway */}
                <button className={cn(glass.card, "p-6 flex flex-col items-center justify-center border-dashed border-2 hover:bg-gray-50 transition-all min-h-[200px]")}>
                    <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 mb-3 shadow-sm">
                        <span className="text-2xl font-light text-gray-400">+</span>
                    </div>
                    <h3 className="text-sm font-bold text-[#1A1A1A]">Pair Gateway</h3>
                    <p className="text-[10px] font-bold tracking-wider text-gray-500 mt-1">Provision via Bluetooth</p>
                </button>
            </div>
        </motion.div>
    );
};

export default GatewayHub;

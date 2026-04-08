import React from 'react';
import { AlertTriangle, Cpu, Plus, Server, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import GatewayStatusCard from '@/components/telemetry/GatewayStatusCard';
import { useDevices } from '@/hooks/useDevices';
import type { IoTDevice } from '@/services/beeyieldService';
import { cn } from '@/lib/utils';
import { glass, PageHeader } from './GlassTheme';

const GatewayHub: React.FC = () => {
    const { data: devices = [], isLoading } = useDevices();
    const [currentTime, setCurrentTime] = React.useState(() => Date.now());

    React.useEffect(() => {
        const intervalId = window.setInterval(() => {
            setCurrentTime(Date.now());
        }, 60 * 1000);

        return () => {
            window.clearInterval(intervalId);
        };
    }, []);

    const formatLastPing = React.useCallback((lastPing?: string) => {
        if (!lastPing) return 'Never';

        const pingedAt = new Date(lastPing);
        if (Number.isNaN(pingedAt.getTime())) {
            return 'Unknown';
        }

        const diffMs = currentTime - pingedAt.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));

        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes}m ago`;

        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) return `${diffHours}h ago`;

        return `${Math.floor(diffHours / 24)}d ago`;
    }, [currentTime]);

    const gateways = React.useMemo(
        () => devices.filter((device) => device.device_type === 'inland'),
        [devices],
    );

    const staleGateways = React.useMemo(
        () =>
            gateways.filter((gateway) => {
                if (!gateway.last_ping) return true;

                const pingedAt = new Date(gateway.last_ping);
                if (Number.isNaN(pingedAt.getTime())) return true;

                return currentTime - pingedAt.getTime() > 30 * 24 * 60 * 60 * 1000;
            }),
        [currentTime, gateways],
    );

    const networkLoadLabel = React.useMemo(() => {
        if (isLoading) return 'Loading';
        if (gateways.length === 0) return '0 gateways';
        return `${gateways.length} gateway${gateways.length === 1 ? '' : 's'}`;
    }, [gateways.length, isLoading]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(glass.page, 'p-4 lg:p-6 space-y-6 pb-20')}
        >
            <PageHeader
                icon={Server}
                label="Mesh Network Infrastructure"
                title={<>Gateway <span className="text-[#1B9157]">Hub</span></>}
                subtitle="Localized Orchard Mesh | Lifecycle Monitoring | Asset Integrity"
                actions={
                    <div className={cn(glass.card, 'px-4 py-2 bg-white flex flex-col items-end shadow-sm')}>
                        <span className="text-[10px] font-bold text-gray-500 tracking-wider mb-0.5">Network Load</span>
                        <span className="text-[16px] font-bold text-[#1A1A1A] tracking-tight">{networkLoadLabel}</span>
                    </div>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {staleGateways.length > 0 && (
                    <div className={cn(glass.card, 'p-5 bg-amber-50/50 border-amber-200/50 flex flex-col sm:flex-row items-start gap-4')}>
                        <div className="w-10 h-10 rounded-xl bg-amber-100/50 flex items-center justify-center shrink-0 border border-amber-200/50">
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                        </div>
                        <div className="flex-1 space-y-2">
                            <h3 className="text-sm font-bold text-[#1A1A1A] tracking-tight">Gateway Attention Needed</h3>
                            <p className="text-xs font-medium text-gray-600 leading-relaxed">
                                {staleGateways.length} gateway{staleGateways.length === 1 ? '' : 's'} have not checked in recently. Review connectivity and field power before relying on telemetry.
                            </p>
                            <button className={cn(glass.btnSecondary, 'mt-2 h-8 px-3 text-[11px] font-bold border-amber-200 hover:bg-amber-100/50')}>
                                Review gateway fleet
                            </button>
                        </div>
                    </div>
                )}

                <div className={cn(glass.card, 'p-5 bg-emerald-50/50 border-emerald-200/50 flex flex-col sm:flex-row items-start gap-4')}>
                    <div className="w-10 h-10 rounded-xl bg-emerald-100/50 flex items-center justify-center shrink-0 border border-emerald-200/50">
                        <Shield className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="flex-1 space-y-2">
                        <h3 className="text-sm font-bold text-[#1A1A1A] tracking-tight">Encryption Pulse: Active</h3>
                        <p className="text-xs font-medium text-gray-600 leading-relaxed">
                            Gateway security status now reflects live registered devices only. No seeded demo nodes are shown on this screen.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {gateways.map((gateway: IoTDevice) => (
                    <GatewayStatusCard
                        key={gateway.id}
                        gatewayId={gateway.device_name || gateway.device_code}
                        status={gateway.status === 'active' ? 'ONLINE' : 'OFFLINE'}
                        battery={gateway.battery_level}
                        lastPing={formatLastPing(gateway.last_ping)}
                    />
                ))}

                {!isLoading && gateways.length === 0 && (
                    <div className={cn(glass.card, 'p-6 flex min-h-[200px] flex-col items-center justify-center text-center')}>
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-[#F4D03F]/10 bg-[#F9F7F2]">
                            <Cpu className="h-5 w-5 text-[#F4D03F]" />
                        </div>
                        <h3 className="text-sm font-bold text-[#1A1A1A]">No registered gateways</h3>
                        <p className="mt-1 max-w-xs text-[11px] font-medium text-gray-500">
                            This hub now shows live gateway inventory only. Pair a real gateway to populate the fleet.
                        </p>
                    </div>
                )}

                <button className={cn(glass.card, 'p-6 flex flex-col items-center justify-center border-dashed border-2 hover:bg-gray-50 transition-all min-h-[200px]')}>
                    <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 mb-3 shadow-sm">
                        <Plus className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-sm font-bold text-[#1A1A1A]">Pair Gateway</h3>
                    <p className="text-[10px] font-bold tracking-wider text-gray-500 mt-1">Provision via Bluetooth</p>
                </button>
            </div>
        </motion.div>
    );
};

export default GatewayHub;

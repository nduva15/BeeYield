import React from 'react';
import {
    Wifi,
    Battery,
    Clock,
    SignalHigh,
    CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { glass } from '../beeyield/GlassTheme';

interface GatewayProps {
    status?: 'ONLINE' | 'OFFLINE';
    battery?: number;
    signal?: number;
    lastPing?: string;
    gatewayId?: string;
}

const GatewayStatusCard: React.FC<GatewayProps> = ({
    status = 'ONLINE',
    battery = 84,
    signal = -64,
    lastPing = '2m ago',
    gatewayId = 'GW-ALPHA-01'
}) => {
    return (
        <div className={cn(glass.card, "p-0 overflow-hidden flex flex-col group w-full")}>
            <div className="p-4 border-b border-gray-100 flex flex-row items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-2">
                    <Wifi className={cn("w-4 h-4", status === 'ONLINE' ? "text-[#1B9157]" : "text-red-500")} />
                    <span className="text-xs font-bold text-[#1A1A1A]">{gatewayId}</span>
                </div>
                <div className={cn(
                    "w-2 h-2 rounded-full",
                    status === 'ONLINE' ? "bg-[#1B9157] shadow-[0_0_8px_rgba(27,145,87,0.4)] animate-pulse" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                )} />
            </div>
            
            <div className="p-4 space-y-4 flex-1">
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white border border-gray-100 rounded-xl flex flex-col justify-between h-20 shadow-sm transition-all hover:bg-gray-50">
                        <Battery className="w-4 h-4 text-gray-400" />
                        <div>
                            <span className="text-lg font-bold text-[#1A1A1A] tracking-tight">{battery}%</span>
                            <p className="text-[9px] font-bold uppercase text-gray-500 tracking-wider">BATTERY LEVEL</p>
                        </div>
                    </div>
                    <div className="p-3 bg-white border border-gray-100 rounded-xl flex flex-col justify-between h-20 shadow-sm transition-all hover:bg-gray-50">
                        <SignalHigh className="w-4 h-4 text-gray-400" />
                        <div className="flex items-baseline gap-1">
                            <span className="text-lg font-bold text-[#1A1A1A] tracking-tight">{signal}</span>
                            <span className="text-[10px] font-medium text-gray-400 leading-none">dBm</span>
                        </div>
                        <p className="text-[9px] font-bold uppercase text-gray-500 tracking-wider mt-1">RSSI STRENGTH</p>
                    </div>
                </div>

                <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">LAST PING</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#1A1A1A] uppercase">{lastPing}</span>
                </div>

                <div className="flex items-center gap-2 transition-transform group-hover:translate-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1B9157]" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#1B9157]">SECURE LINK</span>
                </div>
            </div>
        </div>
    );
};

export default GatewayStatusCard;

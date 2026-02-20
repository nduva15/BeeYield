import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Wifi,
    Battery,
    Zap,
    Clock,
    Shield,
    SignalHigh,
    AlertTriangle,
    CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
        <Card className="rounded-none border-4 border-[#064e3b] bg-white shadow-[6px_6px_0px_0px_rgba(6,78,59,1)] overflow-hidden group">
            <CardHeader className="p-4 border-b-4 border-[#064e3b]/5 bg-neutral-50/30 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                    <Wifi className={cn("w-4 h-4", status === 'ONLINE' ? "text-[#10b981]" : "text-red-500")} />
                    <span className="text-[10px] font-black uppercase text-[#064e3b]">{gatewayId}</span>
                </div>
                <div className={cn(
                    "w-2 h-2 rounded-full",
                    status === 'ONLINE' ? "bg-[#10b981] animate-pulse" : "bg-red-500"
                )} />
            </CardHeader>
            <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-neutral-50 border-2 border-[#064e3b]/5 flex flex-col justify-between h-20">
                        <Battery className="w-3.5 h-3.5 text-[#064e3b]/40" />
                        <div>
                            <span className="text-lg font-black text-[#064e3b] leading-none">{battery}%</span>
                            <p className="text-[7px] font-black uppercase text-[#064e3b]/40 tracking-tighter">BATTERY LEVEL</p>
                        </div>
                    </div>
                    <div className="p-3 bg-neutral-50 border-2 border-[#064e3b]/5 flex flex-col justify-between h-20">
                        <SignalHigh className="w-3.5 h-3.5 text-[#064e3b]/40" />
                        <div>
                            <span className="text-lg font-black text-[#064e3b] leading-none">{signal} <span className="text-[10px]">dBm</span></span>
                            <p className="text-[7px] font-black uppercase text-[#064e3b]/40 tracking-tighter">RSSI STRENGTH</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between px-3 py-2 border-2 border-[#064e3b]/5 bg-[#facc15]/5">
                    <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-[#064e3b]/40" />
                        <span className="text-[8px] font-black uppercase text-[#064e3b]/60">LAST PING</span>
                    </div>
                    <span className="text-[8px] font-black uppercase text-[#064e3b]">{lastPing}</span>
                </div>

                <div className="flex items-center gap-2 pt-1 transition-transform group-hover:translate-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#10b981]">SECURE LINK</span>
                </div>
            </CardContent>
            <div className="h-1 w-full bg-[#064e3b]" />
        </Card>
    );
};

export default GatewayStatusCard;

import React from 'react';
import { Wifi, WifiOff, RefreshCw, AlertTriangle, Radio } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IoTConnectionState } from '@/hooks/useIoTConnection';

interface LiveStreamStatusBadgeProps {
    status: IoTConnectionState;
    timeSinceLastPacketSec: number;
    onReconnect?: () => void;
    className?: string;
    protocolLabel?: string;
}

export const LiveStreamStatusBadge: React.FC<LiveStreamStatusBadgeProps> = ({
    status,
    timeSinceLastPacketSec,
    onReconnect,
    className,
    protocolLabel = 'LoRaWAN / 433MHz'
}) => {
    const formatElapsed = (sec: number) => {
        if (sec < 60) return `${sec}s ago`;
        const mins = Math.floor(sec / 60);
        return `${mins}m ago`;
    };

    return (
        <div className={cn("inline-flex items-center gap-2", className)}>
            {status === 'CONNECTED' && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold shadow-xs">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span>LIVE STREAM</span>
                    <span className="text-[10px] opacity-75 font-mono">({protocolLabel})</span>
                </div>
            )}

            {status === 'STALE' && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-800 dark:text-amber-200 text-xs font-bold shadow-xs">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>STALE DATA</span>
                    <span className="text-[10px] font-mono text-amber-700 dark:text-amber-300">
                        (Last packet {formatElapsed(timeSinceLastPacketSec)})
                    </span>
                    {onReconnect && (
                        <button
                            type="button"
                            onClick={onReconnect}
                            className="ml-1 p-1 hover:bg-amber-500/20 rounded transition-colors text-amber-900 dark:text-amber-100"
                            title="Reconnect telemetry stream"
                        >
                            <RefreshCw className="w-3 h-3" />
                        </button>
                    )}
                </div>
            )}

            {status === 'RECONNECTING' && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-700 dark:text-blue-300 text-xs font-bold">
                    <RefreshCw className="w-3 h-3 animate-spin text-blue-600 dark:text-blue-400" />
                    <span>RECONNECTING...</span>
                </div>
            )}

            {status === 'DISCONNECTED' && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/40 text-red-700 dark:text-red-300 text-xs font-bold shadow-xs">
                    <WifiOff className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span>OFFLINE STREAM</span>
                    {onReconnect && (
                        <button
                            type="button"
                            onClick={onReconnect}
                            className="underline text-[11px] hover:text-red-900 dark:hover:text-red-100 ml-1"
                        >
                            Reconnect
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

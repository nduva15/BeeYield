import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { offlineTelemetry } from '@/services/offlineTelemetryCache';

export const OfflineStatusBanner: React.FC = () => {
    const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
    const [showRestoredNotice, setShowRestoredNotice] = useState<boolean>(false);
    const [queuedCount, setQueuedCount] = useState<number>(0);

    useEffect(() => {
        const updateQueue = () => {
            setQueuedCount(offlineTelemetry.getQueuedActions().length);
        };

        updateQueue();

        const handleOffline = () => {
            setIsOnline(false);
            setShowRestoredNotice(false);
            updateQueue();
        };

        const handleOnline = () => {
            setIsOnline(true);
            setShowRestoredNotice(true);
            updateQueue();
            const timer = setTimeout(() => setShowRestoredNotice(false), 4500);
            return () => clearTimeout(timer);
        };

        window.addEventListener('offline', handleOffline);
        window.addEventListener('online', handleOnline);
        window.addEventListener('beeyield:offline-action-queued', updateQueue);

        return () => {
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('beeyield:offline-action-queued', updateQueue);
        };
    }, []);

    if (isOnline && !showRestoredNotice) {
        return null;
    }

    if (showRestoredNotice) {
        return (
            <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between shadow-md transition-all animate-in slide-in-from-top duration-300 z-50">
                <div className="flex items-center gap-2 mx-auto">
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    <span>Connection Restored: Syncing telemetry and queued field logs with cloud database...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-amber-600 text-white px-4 py-2 text-xs font-bold flex flex-col sm:flex-row items-center justify-between gap-2 shadow-md transition-all z-50">
            <div className="flex items-center gap-2">
                <WifiOff className="w-4 h-4 text-amber-200 shrink-0" />
                <span>
                    <strong>Offline Field Mode:</strong> Weak or no cellular signal. Showing last cached hive health data.
                </span>
            </div>
            {queuedCount > 0 && (
                <div className="flex items-center gap-2 bg-amber-700/80 px-2.5 py-0.5 rounded-full text-[11px]">
                    <RefreshCw className="w-3 h-3 text-amber-200 animate-spin" />
                    <span>{queuedCount} changes queued to sync</span>
                </div>
            )}
        </div>
    );
};

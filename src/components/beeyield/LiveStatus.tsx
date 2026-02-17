import React from 'react';
import { cn } from '@/lib/utils';

export interface LiveStatusProps {
    label?: string;
    status?: 'online' | 'offline' | 'warning';
    showPulse?: boolean;
    className?: string;
}

const LiveStatus: React.FC<LiveStatusProps> = ({
    label = 'Live',
    status = 'online',
    showPulse = true,
    className
}) => {
    const statusColors = {
        online: 'bg-[hsl(var(--honey-gold))]',
        offline: 'bg-gray-400',
        warning: 'bg-[hsl(var(--varroa-red))]'
    };

    return (
        <div className={cn("inline-flex items-center gap-2", className)}>
            <div className="relative">
                <div
                    className={cn(
                        "status-dot",
                        statusColors[status],
                        showPulse && status === 'online' && "animate-pulse-gold"
                    )}
                />
            </div>
            {label && (
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {label}
                </span>
            )}
        </div>
    );
};

export default LiveStatus;

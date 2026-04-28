import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { glass } from './GlassTheme';

interface MetricCardProps {
    title?: string;
    label?: string; // Support both naming conventions
    value: string | number;
    trend?: string;
    description?: string;
    detail?: string; // Support both naming conventions
    icon: LucideIcon | React.ReactNode;
    accent?: string;
    className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
    title,
    label,
    value,
    trend,
    description,
    detail,
    icon: Icon,
    accent,
    className
}) => {
    const displayLabel = label || title;
    const displayDetail = detail || description;

    return (
        <div className={cn(
            glass.card,
            "flex flex-col h-full transition-all duration-300 hover:border-primary/30 min-h-[140px]",
            className
        )}>
            <div className="flex items-center justify-between mb-4 shrink-0">
                <span className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground/70">
                    {displayLabel}
                </span>
                <div className={cn(
                    "p-2 rounded-lg shrink-0",
                    accent || "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(242,185,15,0.1)]"
                )}>
                    {React.isValidElement(Icon) ? (
                        React.cloneElement(Icon as React.ReactElement, { className: "h-4 w-4" })
                    ) : (
                        Icon && <Icon className="h-4 w-4" />
                    )}
                </div>
            </div>
            
            <div className="flex-1 flex flex-col justify-end">
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black tracking-tighter text-foreground tabular-nums">
                        {value}
                    </span>
                    {trend && (
                        <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                            {trend}
                        </span>
                    )}
                </div>
                {displayDetail && (
                    <p className="text-[10px] font-bold text-muted-foreground/60 mt-2 uppercase tracking-wider line-clamp-1">
                        {displayDetail}
                    </p>
                )}
            </div>
        </div>
    );
};

export default MetricCard;

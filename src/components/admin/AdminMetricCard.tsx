import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
    title?: string;
    value: string | number;
    trend?: string;
    trendDirection?: 'up' | 'down';
    description: string;
    icon: LucideIcon;
    className?: string;
}

const AdminMetricCard: React.FC<MetricCardProps> = ({
    title,
    value,
    trend,
    trendDirection = 'up',
    description,
    icon: Icon,
    className
}) => {
    return (
        <div className={cn(
            "bg-card rounded-xl border border-border p-6 flex flex-col justify-between h-full transition-all hover:border-primary/50 relative overflow-hidden",
            className
        )}>
            <div className="relative z-10 flex justify-between items-start">
                <div className="p-2 bg-muted/50 rounded-lg text-muted-foreground">
                    <Icon className="w-5 h-5" />
                </div>
                {trend && (
                    <div className={cn(
                        "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                        trendDirection === 'up'
                            ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                            : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                    )}>
                        {trendDirection === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {trend}
                    </div>
                )}
            </div>

            <div className="relative z-10 mt-4 space-y-1">
                <h3 className="text-2xl font-bold tracking-tight text-foreground">{value}</h3>
                <p className="text-sm font-medium text-muted-foreground">
                    {description || title}
                </p>
            </div>
        </div>
    );
};

export default AdminMetricCard;

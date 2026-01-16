import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp } from 'lucide-react';

interface MetricCardProps {
    title?: string;
    value: string | number;
    trend?: string;
    description: string;
    icon: LucideIcon;
    className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
    title,
    value,
    trend,
    description,
    icon: Icon,
    className
}) => {
    return (
        <div className={cn("bg-card border border-border rounded-2xl p-6 relative overflow-hidden group shadow-sm hover:shadow-md transition-all duration-300", className)}>
            <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-muted rounded-xl text-muted-foreground group-hover:text-primary transition-colors">
                    <Icon className="w-5 h-5" />
                </div>
                {trend && (
                    <div className="flex items-center gap-1 text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full text-xs font-bold">
                        <TrendingUp className="w-3 h-3" />
                        {trend}
                    </div>
                )}
            </div>

            <div className="space-y-1">
                <h3 className="text-2xl font-bold text-foreground tracking-tight">{value}</h3>
                <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                    {description}
                </p>
            </div>

            {/* Subtle gloss effect for 'clear' aesthetic */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    );
};

export default MetricCard;

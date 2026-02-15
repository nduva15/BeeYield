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
            "bg-white rounded-[32px] border border-beeyield-green/5 p-8 flex flex-col justify-between h-full transition-all hover:shadow-2xl hover:shadow-beeyield-green/[0.03] hover:border-beeyield-gold/20 hover:-translate-y-1 relative overflow-hidden",
            className
        )}>
            <div className="relative z-10 flex justify-between items-start">
                <div className="p-3 bg-beeyield-cream/50 rounded-2xl text-beeyield-green shadow-sm border border-beeyield-green/5">
                    <Icon className="w-5 h-5 stroke-[2.5]" />
                </div>
                {trend && (
                    <div className={cn(
                        "flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm",
                        trendDirection === 'up'
                            ? "bg-beeyield-green/10 text-beeyield-green border border-beeyield-green/5"
                            : "bg-beeyield-orange/10 text-beeyield-orange border border-beeyield-orange/5"
                    )}>
                        {trendDirection === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {trend}
                    </div>
                )}
            </div>

            <div className="relative z-10 mt-6 pt-2">
                <h3 className="text-3xl font-black tracking-tighter text-beeyield-green leading-none">{value}</h3>
                <p className="text-[11px] font-black uppercase tracking-[0.15em] text-beeyield-green/30 mt-3 whitespace-nowrap overflow-hidden text-ellipsis">
                    {description || title}
                </p>
            </div>
        </div>
    );
};

export default AdminMetricCard;

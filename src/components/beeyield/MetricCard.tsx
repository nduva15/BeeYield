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
        <div className={cn("bg-[#09090b] border border-[#1e1e1e] rounded-2xl p-6 relative overflow-hidden group", className)}>
            <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-[#1e1e1e] rounded-xl text-[#71717a] group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                </div>
                {trend && (
                    <div className="flex items-center gap-1 text-[#22c55e] bg-[#22c55e11] px-2 py-0.5 rounded-full text-xs font-bold">
                        <TrendingUp className="w-3 h-3" />
                        {trend}
                    </div>
                )}
            </div>

            <div className="space-y-1">
                <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
                <p className="text-[#a1a1aa] text-[10px] font-bold uppercase tracking-wider">
                    {description}
                </p>
            </div>
        </div>
    );
};

export default MetricCard;

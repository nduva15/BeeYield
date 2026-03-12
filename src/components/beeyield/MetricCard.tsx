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
        <div className={cn("bg-white border-2 border-black rounded-none p-6 relative overflow-hidden group shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-none", className)}>
            <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-black text-gray-900 rounded-none">
                    <Icon className="w-6 h-6" />
                </div>
                {trend && (
                    <div className="flex items-center gap-1 text-gray-900 bg-[#FF4F00] px-2 py-1 border-2 border-black font-black text-[10px] uppercase">
                        <TrendingUp className="w-3 h-3" />
                        {trend}
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <h3 className="text-4xl font-black text-black tracking-tighter uppercase leading-none">{value}</h3>
                <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest">
                    {description}
                </p>
            </div>
        </div>
    );
};

export default MetricCard;

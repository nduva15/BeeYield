import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    trend?: string;
    trendType?: 'positive' | 'negative' | 'neutral';
    icon: React.ElementType;
    className?: string;
    subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    trend,
    trendType = 'neutral',
    icon: Icon,
    className,
    subtitle
}) => {
    return (
        <div className={cn("h-full", className)}>
            <Card className="h-full border-2 border-black bg-white rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col transition-none hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">
                <CardContent className="p-6 flex flex-col justify-between h-full bg-white">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-10 h-10 border-2 border-black flex items-center justify-center bg-black text-white">
                            <Icon className="w-5 h-5 stroke-[2.5]" />
                        </div>
                        {trend && (
                            <div className={cn(
                                "flex items-center gap-1.5 px-2 py-1 border-2 border-black font-black text-[10px] uppercase",
                                trendType === 'positive' ? "bg-[#FF4F00] text-white" :
                                    trendType === 'negative' ? "bg-black text-white" :
                                        "bg-white text-black"
                            )}>
                                {trendType === 'positive' && <ArrowUpRight className="w-3 h-3" />}
                                {trendType === 'negative' && <ArrowDownRight className="w-3 h-3" />}
                                {trendType === 'neutral' && <Minus className="w-3 h-3" />}
                                {trend}
                            </div>
                        )}
                    </div>

                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                            {title}
                        </p>
                        <h3 className="text-4xl font-black text-black uppercase tracking-tighter leading-none py-1">
                            {value}
                        </h3>
                        {subtitle && <p className="text-[10px] text-black font-black uppercase border-t-2 border-black pt-2 mt-4">{subtitle}</p>}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default StatCard;

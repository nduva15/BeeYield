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
            <Card className="h-full border-4 border-[#064e3b] bg-white rounded-none shadow-[6px_6px_0px_0px_rgba(6,78,59,1)] flex flex-col transition-none hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">
                <CardContent className="p-6 flex flex-col justify-between h-full bg-white">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-10 h-10 border-2 border-[#10b981] flex items-center justify-center bg-[#064e3b] text-white">
                            <Icon className="w-5 h-5 stroke-[2] text-[#facc15]" />
                        </div>
                        {trend && (
                            <div className={cn(
                                "flex items-center gap-1.5 px-2 py-1 border-2 border-[#064e3b] font-black text-[10px] uppercase",
                                trendType === 'positive' ? "bg-[#10b981] text-white border-[#10b981]" :
                                    trendType === 'negative' ? "bg-red-500 text-white border-red-500" :
                                        "bg-neutral-50 text-[#064e3b]"
                            )}>
                                {trendType === 'positive' && <ArrowUpRight className="w-3 h-3" />}
                                {trendType === 'negative' && <ArrowDownRight className="w-3 h-3" />}
                                {trendType === 'neutral' && <Minus className="w-3 h-3" />}
                                {trend}
                            </div>
                        )}
                    </div>

                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-[0.2em]">
                            {title}
                        </p>
                        <h3 className="text-4xl font-black text-[#064e3b] uppercase tracking-tighter leading-none py-1">
                            {value}
                        </h3>
                        {subtitle && <p className="text-[10px] text-[#064e3b] font-black uppercase border-t-2 border-[#064e3b]/10 pt-2 mt-4">{subtitle}</p>}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default StatCard;

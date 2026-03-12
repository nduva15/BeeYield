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
            <Card className="h-full border border-border bg-[#FFF9F0]/80 backdrop-blur-md rounded-[2.5rem] shadow-xl shadow-black/5 flex flex-col transition-all duration-300 hover:scale-[1.02] hover:border-[#F4D03F]/30 hover:shadow-honey/5 group overflow-hidden">
                <CardContent className="p-8 flex flex-col justify-between h-full bg-transparent">
                    <div className="flex justify-between items-start mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-[#F4D03F]/10 flex items-center justify-center border border-[#F4D03F]/20 group-hover:scale-110 transition-transform">
                            <Icon className="w-7 h-7 text-[#F4D03F] stroke-[2] transition-colors" />
                        </div>
                        {trend && (
                            <div className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest border backdrop-blur-sm",
                                trendType === 'positive' ? "bg-[#1B9157]/ text-[#1B9157] border-[#1B9157]/" :
                                    trendType === 'negative' ? "bg-red-500/10 text-red-600 border-red-500/20" :
                                        "bg-muted/30 text-muted-foreground border-border"
                            )}>
                                {trendType === 'positive' && <ArrowUpRight className="w-3.5 h-3.5" />}
                                {trendType === 'negative' && <ArrowDownRight className="w-3.5 h-3.5" />}
                                {trendType === 'neutral' && <Minus className="w-3.5 h-3.5" />}
                                {trend}
                            </div>
                        )}
                    </div>

                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-70">
                            {title}
                        </p>
                        <h3 className="text-4xl font-serif font-black text-foreground uppercase tracking-tight leading-none pb-1">
                            {value}
                        </h3>
                        {subtitle && <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest border-t border-border pt-4 mt-6">{subtitle}</p>}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default StatCard;

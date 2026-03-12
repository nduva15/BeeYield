import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, Shield, Crown, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import beeyieldService from '@/services/beeyieldService';
import { toast } from 'sonner';
import { glass } from './GlassTheme';

interface Plan {
    id: string;
    name: string;
    price: string;
    period: string;
    description: string;
    features: string[];
    color: string;
    icon: React.ElementType;
}

const plans: Plan[] = [
    {
        id: 'Free',
        name: 'Basic Beekeeper',
        price: 'KES 0',
        period: '/month',
        description: 'Perfect for hobbyists managing 1-5 hives.',
        features: [
            'Basic hive logging',
            'Manual inspection records',
            'Community forum access',
            'Weather alerts'
        ],
        color: 'border-muted-foreground/20 text-muted-foreground bg-muted/20',
        icon: Shield
    },
    {
        id: 'Pro',
        name: 'Precision Pro',
        price: 'KES 2,500',
        period: '/month',
        description: 'Advanced analytics for commercial beekeepers.',
        features: [
            'Unlimited hives & apiaries',
            'Real-time weight & audio alerts',
            'BeeYield Brood analysis (100/mo)',
            'Pollination contract management',
            'E-TIMS integration'
        ],
        color: 'border-[#1B9157]/ text-[#1B9157] bg-[#1B9157]/ shadow-lg shadow-emerald-500/10',
        icon: Zap
    },
    {
        id: 'Enterprise',
        name: 'Colony Core',
        price: 'KES 15,000',
        period: '/month',
        description: 'Fleet management for commercial pollination services.',
        features: [
            'Full IoT gateway management',
            'Custom spatial API access',
            'Unlimited BeeYield analysis',
            'Dedicated account manager',
            'White-label reporting'
        ],
        color: 'border-[#F4D03F]/30 text-[#F4D03F] bg-[#F4D03F]/10 shadow-lg shadow-honey/10',
        icon: Crown
    }
];

const SubscriptionPlans: React.FC<{ currentTier: string; onUpgrade?: (tier: string) => void }> = ({ currentTier, onUpgrade }) => {
    const [loading, setLoading] = React.useState<string | null>(null);

    const handleUpgrade = async (tier: string) => {
        setLoading(tier);
        try {
            const result = await beeyieldService.processPayment({
                amount: tier === 'Pro' ? 2500 : 15000,
                currency: 'KES',
                payment_method: 'Stripe',
                subscription_tier: tier
            });

            if (result.success) {
                toast.success(`Successfully upgraded to ${tier} tier!`);
                if (onUpgrade) onUpgrade(tier);
            } else {
                toast.error(result.error?.message || 'Payment failed');
            }
        } catch (err) {
            console.error('Upgrade error:', err);
            toast.error('An error occurred during payment');
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8">
            {plans.map((plan) => {
                const Icon = plan.icon;
                const isCurrent = currentTier === plan.id;

                return (
                    <div
                        key={plan.id}
                        className={cn(
                            glass.card,
                            "flex flex-col h-full rounded-[2.5rem] p-0 overflow-hidden backdrop-blur-md transition-all duration-500",
                            plan.color,
                            isCurrent ? "scale-[1.02] border-[#F4D03F] shadow-2xl shadow-honey/20 ring-1 ring-[#F4D03F]/50" : "hover:border-foreground/20 hover:shadow-xl"
                        )}
                    >
                        <div className="p-8 border-b border-[#F4D03F]/20 bg-gray-400">
                            <div className="flex justify-between items-start mb-6">
                                <div className={cn("p-4 rounded-2xl flex items-center justify-center border", plan.color)}>
                                    <Icon className="w-8 h-8" />
                                </div>
                                {isCurrent && (
                                    <Badge className="bg-[#F4D03F] text-white rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-honey/20">
                                        Current Plan
                                    </Badge>
                                )}
                            </div>
                            <h3 className={cn(glass.sectionTitle, "text-3xl normal-case mb-2 leading-none", plan.id === 'Free' ? 'text-foreground' : plan.color.split(' ')[1])}>{plan.name}</h3>
                            <p className={cn(glass.microLabel, "normal-case italic font-semibold opacity-80 leading-relaxed")}>{plan.description}</p>
                        </div>
                        <div className="p-8 flex-1 flex flex-col bg-gray-200">
                            <div className="mb-8">
                                <span className={cn(glass.sectionTitle, "text-4xl tabular-nums leading-none tracking-tight", plan.id === 'Free' ? 'text-foreground' : plan.color.split(' ')[1])}>{plan.price}</span>
                                <span className={cn(glass.microLabel, "opacity-60 ml-2 normal-case font-semibold")}>{plan.period}</span>
                            </div>
                            <ul className="space-y-4 mb-10 flex-1">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-4">
                                        <div className="w-5 h-5 rounded-full bg-[#1B9157]/ flex items-center justify-center mt-0.5 shrink-0">
                                            <Check className="w-3 h-3 text-[#1B9157]" />
                                        </div>
                                        <span className={cn(glass.microLabel, "normal-case font-bold tracking-tight text-foreground/80")}>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <button
                                disabled={isCurrent || (loading !== null)}
                                onClick={() => handleUpgrade(plan.id)}
                                className={cn(
                                    glass.btnPrimary,
                                    "w-full h-16 rounded-2xl",
                                    isCurrent
                                        ? "bg-muted text-muted-foreground border-border hover:bg-muted cursor-default shadow-none"
                                        : "bg-foreground text-background border-foreground hover:bg-foreground/90 shadow-xl",
                                    plan.id === 'Pro' && !isCurrent ? "bg-[#1B9157] text-white border-emerald-500 hover:bg-[#145A32] shadow-emerald-500/20" : "",
                                    plan.id === 'Enterprise' && !isCurrent ? "bg-[#F4D03F] text-white border-[#F4D03F] hover:bg-amber-600 shadow-honey/20" : ""
                                )}
                            >
                                {loading === plan.id ? <Loader2 className="w-5 h-5 animate-spin" /> : isCurrent ? 'Active Plan' : 'Select Plan'}
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default SubscriptionPlans;

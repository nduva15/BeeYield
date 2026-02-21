import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, Shield, Crown, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import beeyieldService from '@/services/beeyieldService';
import { toast } from 'sonner';

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
        color: 'border-[#064e3b] text-[#064e3b]',
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
            'AI Brood analysis (100/mo)',
            'Pollination contract management',
            'E-TIMS integration'
        ],
        color: 'border-[#10b981] text-[#10b981] bg-[#10b981]/5',
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
            'Unlimited AI analysis',
            'Dedicated account manager',
            'White-label reporting'
        ],
        color: 'border-[#facc15] text-[#064e3b] bg-[#facc15]/5',
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
                    <Card
                        key={plan.id}
                        className={cn(
                            "rounded-none border-4 transition-all flex flex-col h-full",
                            plan.color,
                            isCurrent ? "shadow-[8px_8px_0px_0px_rgba(6,78,59,1)] scale-[1.02]" : "shadow-none hover:shadow-[4px_4px_0px_0px_rgba(6,78,59,0.5)]"
                        )}
                    >
                        <CardHeader className="p-8 border-b-4 border-current">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 border-2 border-current">
                                    <Icon className="w-6 h-6" />
                                </div>
                                {isCurrent && (
                                    <Badge className="bg-[#064e3b] text-white rounded-none px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                                        Current Plan
                                    </Badge>
                                )}
                            </div>
                            <CardTitle className="text-2xl font-black uppercase tracking-tighter mb-2">{plan.name}</CardTitle>
                            <p className="text-[10px] font-black uppercase opacity-60 leading-tight">{plan.description}</p>
                        </CardHeader>
                        <CardContent className="p-8 flex-1 flex flex-col">
                            <div className="mb-8">
                                <span className="text-4xl font-black italic">{plan.price}</span>
                                <span className="text-xs font-black uppercase opacity-40 ml-1">{plan.period}</span>
                            </div>
                            <ul className="space-y-4 mb-10 flex-1">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <Check className="w-4 h-4 shrink-0 mt-0.5 text-[#10b981]" />
                                        <span className="text-[10px] font-bold uppercase tracking-tight">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <Button
                                disabled={isCurrent || (loading !== null)}
                                onClick={() => handleUpgrade(plan.id)}
                                className={cn(
                                    "w-full h-14 rounded-none font-black uppercase tracking-[0.2em] text-xs transition-all",
                                    isCurrent
                                        ? "bg-neutral-100 text-neutral-400 border-2 border-neutral-200"
                                        : "bg-[#064e3b] text-white shadow-[4px_4px_0px_0px_rgba(16,185,129,1)] hover:translate-y-1 hover:shadow-none"
                                )}
                            >
                                {loading === plan.id ? <Loader2 className="w-4 h-4 animate-spin" /> : isCurrent ? 'Active' : 'Upgrade Plan'}
                            </Button>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
};

export default SubscriptionPlans;

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react';

interface ShopForgotPasswordFormProps {
    onBackToLogin: () => void;
}

const ShopForgotPasswordForm: React.FC<ShopForgotPasswordFormProps> = ({
    onBackToLogin
}) => {
    const { resetPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await resetPassword(email, 'shop');

        if (error) {
            toast.error('Recovery Failed', { description: error.message });
        } else {
            setEmailSent(true);
            toast.success('Check your email! 🍯');
        }
        setLoading(false);
    };

    if (emailSent) {
        return (
            <div className="space-y-6 text-center">
                <div className="w-20 h-20 rounded-[2rem] bg-beeyield-gold/10 flex items-center justify-center mx-auto border border-beeyield-gold/20">
                    <CheckCircle className="h-10 w-10 text-beeyield-gold" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-black text-beeyield-green uppercase tracking-tighter">Check Your Hive</h3>
                    <p className="text-sm text-beeyield-green/60 font-medium leading-relaxed">
                        We've sent a recovery link to <span className="font-bold text-beeyield-green">{email}</span>. Click it to reset your access.
                    </p>
                </div>
                <Button
                    variant="outline"
                    className="w-full h-12 border-beeyield-green/10 text-beeyield-green font-bold"
                    onClick={onBackToLogin}
                >
                    Back to Sign In
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-[1.5rem] bg-beeyield-gold/10 flex items-center justify-center mx-auto border border-beeyield-gold/20">
                    <Mail className="h-8 w-8 text-beeyield-gold" />
                </div>
                <h3 className="text-xl font-black text-beeyield-green uppercase tracking-tighter">Account Recovery</h3>
                <p className="text-xs font-medium text-beeyield-green/60 uppercase tracking-widest">
                    Enter your email to receive a secure link
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="shop-reset-email" className="text-beeyield-green font-bold text-[10px] uppercase tracking-widest">Email Address</Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-beeyield-green/30" />
                    <Input
                        id="shop-reset-email"
                        type="email"
                        placeholder="honey_lover@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12 border-beeyield-green/10 focus:border-beeyield-gold focus:ring-beeyield-gold/10 rounded-xl"
                        required
                        autoFocus
                    />
                </div>
            </div>

            <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-beeyield-gold to-beeyield-orange text-white font-black uppercase tracking-widest rounded-xl shadow-glow transition-all"
                disabled={loading}
            >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Recovery Link'}
            </Button>

            <button
                type="button"
                onClick={onBackToLogin}
                className="w-full flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-beeyield-green/40 hover:text-beeyield-gold transition-colors"
            >
                <ArrowLeft className="h-3 w-3" />
                Return to Login
            </button>
        </form>
    );
};

export default ShopForgotPasswordForm;

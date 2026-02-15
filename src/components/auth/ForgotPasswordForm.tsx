import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react';

interface ForgotPasswordFormProps {
    onBackToLogin?: () => void;
    variant?: 'admin' | 'shop' | 'professional';
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
    onBackToLogin,
    variant = 'shop'
}) => {
    const { resetPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const backendMap: Record<string, 'shop' | 'beeyield' | 'ceba'> = {
            'shop': 'shop',
            'professional': 'beeyield',
            'admin': 'ceba'
        };
        const activeBackend = backendMap[variant] || 'shop';

        const { error } = await resetPassword(email, activeBackend);

        if (error) {
            toast.error('Could not reset password', { description: error.message });
        } else {
            setEmailSent(true);
            toast.success('Link sent! 📧', {
                description: 'Check your email to reset your password.',
            });
        }

        setLoading(false);
    };

    // Success state - email has been sent
    if (emailSent) {
        return (
            <div className="space-y-6">
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 rounded-full bg-beeyield-green/10 flex items-center justify-center mx-auto border-2 border-beeyield-green/20">
                        <CheckCircle className="h-10 w-10 text-beeyield-green" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-black text-beeyield-green">Check your inbox</h3>
                        <p className="text-sm text-beeyield-green/70 max-w-sm mx-auto font-medium">
                            We've sent a password reset link to <span className="font-bold text-beeyield-green">{email}</span>.
                            Click the link in the email to reset your password.
                        </p>
                    </div>
                </div>

                <div className="space-y-3 pt-4">
                    <p className="text-xs text-center text-beeyield-green/50">
                        Didn't receive the email? Check your spam folder or try again.
                    </p>

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full border-2 border-beeyield-green/20 hover:border-beeyield-green hover:text-beeyield-green text-beeyield-green/60 font-bold"
                        onClick={() => {
                            setEmailSent(false);
                            setEmail('');
                        }}
                    >
                        Try a different email
                    </Button>

                    {onBackToLogin && (
                        <button
                            type="button"
                            onClick={onBackToLogin}
                            className="w-full flex items-center justify-center gap-2 text-sm text-beeyield-gold hover:text-beeyield-orange transition-colors font-bold"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to login
                        </button>
                    )}
                </div>
            </div>
        );
    }

    const isAdminVariant = variant === 'admin';

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-beeyield-gold/10 flex items-center justify-center mx-auto border border-beeyield-gold/20">
                    <Mail className="h-8 w-8 text-beeyield-gold" />
                </div>
                <h3 className="text-xl font-black text-beeyield-green">Forgot your password?</h3>
                <p className="text-sm text-beeyield-green/60 font-medium">
                    No worries! Enter your email and we'll send you a reset link.
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="reset-email" className="text-beeyield-green font-bold">Email Address</Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-beeyield-green/40" />
                    <Input
                        id="reset-email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`pl-10 border-beeyield-green/20 focus:border-beeyield-gold focus:ring-beeyield-gold/20 ${isAdminVariant ? 'bg-white text-beeyield-black' : 'bg-white/50 text-beeyield-black'}`}
                        required
                        autoFocus
                    />
                </div>
            </div>

            <Button
                type="submit"
                className="w-full h-12 text-sm font-black uppercase tracking-widest text-white shadow-soft hover:shadow-glow transition-all bg-gradient-to-r from-beeyield-gold to-beeyield-orange hover:from-beeyield-orange hover:to-beeyield-gold"
                disabled={loading}
            >
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                    </>
                ) : (
                    'Reset Password'
                )}
            </Button>

            {onBackToLogin && (
                <button
                    type="button"
                    onClick={onBackToLogin}
                    className="w-full flex items-center justify-center gap-2 text-sm text-beeyield-green/60 hover:text-beeyield-green transition-colors font-bold"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to login
                </button>
            )}
        </form>
    );
};

export default ForgotPasswordForm;

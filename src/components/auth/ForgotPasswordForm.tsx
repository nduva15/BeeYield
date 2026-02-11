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
            toast.error('Password reset failed', { description: error.message });
        } else {
            setEmailSent(true);
            toast.success('Reset link sent! 📧', {
                description: 'Check your email for the password reset link.',
            });
        }

        setLoading(false);
    };

    // Success state - email has been sent
    if (emailSent) {
        return (
            <div className="space-y-6">
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                        <CheckCircle className="h-10 w-10 text-green-500" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold">Check your inbox</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                            We've sent a password reset link to <span className="font-medium text-foreground">{email}</span>.
                            Click the link in the email to reset your password.
                        </p>
                    </div>
                </div>

                <div className="space-y-3 pt-4">
                    <p className="text-xs text-center text-muted-foreground">
                        Didn't receive the email? Check your spam folder or try again.
                    </p>

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
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
                            className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to login
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Mail className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Forgot your password?</h3>
                <p className="text-sm text-muted-foreground">
                    No worries! Enter your email and we'll send you a reset link.
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="reset-email">Email Address</Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="reset-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                        autoFocus
                    />
                </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending reset link...
                    </>
                ) : (
                    'Send Reset Link'
                )}
            </Button>

            {onBackToLogin && (
                <button
                    type="button"
                    onClick={onBackToLogin}
                    className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to login
                </button>
            )}
        </form>
    );
};

export default ForgotPasswordForm;

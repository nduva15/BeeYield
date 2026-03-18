import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2, Mail, ArrowLeft, CheckCircle, LogIn } from 'lucide-react';

interface BeeYieldForgotPasswordFormProps {
    onBackToLogin: () => void;
}

const BeeYieldForgotPasswordForm: React.FC<BeeYieldForgotPasswordFormProps> = ({
    onBackToLogin
}) => {
    const { resetPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await resetPassword(email, 'beeyield');

        if (error) {
            toast.error('Error', { description: error.message });
        } else {
            setEmailSent(true);
            toast.success('Reset email sent');
        }
        setLoading(false);
    };

    if (emailSent) {
        return (
            <div className="space-y-6 text-center">
                <div className="w-16 h-16 rounded-full bg-beeyield-green/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-10 w-10 text-beeyield-green" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-900">Check your email</h3>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed">
                        We've sent a password reset link to <span className="text-beeyield-green font-bold">{email}</span>.
                    </p>
                </div>
                <Button
                    variant="outline"
                    className="w-full h-12 bg-gray-50 border-gray-200 text-gray-600 hover:text-gray-900 font-bold rounded-xl transition-all"
                    onClick={onBackToLogin}
                >
                    Return to login
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-honey/10 flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-6 w-6 text-honey" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Reset your password</h3>
                <p className="text-sm text-gray-500 font-medium">
                    Enter your email to receive a password reset link
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="by-reset-email" className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Email Address</Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        id="by-reset-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12 bg-gray-50 border-gray-200 focus:border-honey focus:ring-honey/20 rounded-xl font-medium"
                        required
                        autoFocus
                    />
                </div>
            </div>

            <Button
                type="submit"
                className="w-full h-12 bg-beeyield-green hover:bg-beeyield-green/90 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                disabled={loading}
            >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
                Send Reset Link
            </Button>

            <button
                type="button"
                onClick={onBackToLogin}
                className="w-full text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors py-2 flex items-center justify-center gap-2"
            >
                <ArrowLeft className="h-4 w-4" /> Back to login
            </button>
        </form>
    );
};

export default BeeYieldForgotPasswordForm;

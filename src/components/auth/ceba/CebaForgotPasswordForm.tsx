import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2, Mail, ArrowLeft } from "lucide-react";

interface CebaForgotPasswordFormProps {
    onBackToLogin?: () => void;
}

const CebaForgotPasswordForm: React.FC<CebaForgotPasswordFormProps> = ({
    onBackToLogin
}) => {
    const { resetPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            toast.error('Please enter your email');
            return;
        }

        setLoading(true);

        try {
            const { error } = await resetPassword(email, 'ceba');

            if (error) {
                toast.error('Password reset failed', { description: error.message });
            } else {
                toast.success('Check your email!', { description: 'We sent a password reset link.' });
                setSent(true);
            }
        } catch (error: any) {
            toast.error('Password reset failed', { description: error.message });
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="text-center space-y-6">
                <div className="w-12 h-12 rounded-full bg-honey/10 flex items-center justify-center mx-auto">
                    <Mail className="h-6 w-6 text-honey" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-lg font-bold text-gray-900">Check your email</h3>
                    <p className="text-sm text-gray-500 font-medium">
                        We sent a password reset link to <span className="font-bold">{email}</span>
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onBackToLogin}
                    className="w-full flex items-center justify-center gap-2 h-12 text-honey font-bold hover:bg-gray-50 rounded-xl transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to login
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center space-y-2 mb-8">
                <div className="w-12 h-12 rounded-full bg-honey/10 flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-6 w-6 text-honey" />
                </div>
                <p className="text-sm text-gray-500 font-medium">
                    Enter your email and we'll send you a link to reset your password.
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="ceba-forgot-email" className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Email Address</Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        id="ceba-forgot-email"
                        name="email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12 bg-gray-50 border-gray-200 focus:border-honey focus:ring-honey/20 rounded-xl font-medium"
                        required
                        autoComplete="email"
                    />
                </div>
            </div>

            <Button
                type="submit"
                className="w-full h-12 bg-honey hover:bg-honey/90 text-gray-900 font-bold rounded-xl shadow-lg shadow-honey/20 transition-all active:scale-95"
                disabled={loading || !email}
            >
                {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                    'Send Reset Link'
                )}
            </Button>

            {onBackToLogin && (
                <button
                    type="button"
                    onClick={onBackToLogin}
                    className="w-full flex items-center justify-center gap-2 text-honey font-bold hover:bg-gray-50 py-2 rounded-xl transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to login
                </button>
            )}
        </form>
    );
};

export default CebaForgotPasswordForm;

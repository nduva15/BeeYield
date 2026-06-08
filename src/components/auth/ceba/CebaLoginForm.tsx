import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2, Mail, Lock as LockIcon, LogIn } from "lucide-react";
import { buildAuthCallbackUrl, persistAuthRedirectState } from '@/lib/authRedirect';
import { completeLoginFlow, getBackendStorageKey } from '@/services/backendAuth';

interface CebaLoginFormProps {
    onSuccess?: () => void;
    onForgotPassword?: () => void;
    onSwitchToRegister?: () => void;
}

const CebaLoginForm: React.FC<CebaLoginFormProps> = ({
    onSuccess,
    onForgotPassword,
    onSwitchToRegister
}) => {
    const { signInWithGoogle, verifyMFAChallenge } = useAuth();
    const [email, setEmail] = useState(() => localStorage.getItem(getBackendStorageKey('ceba', 'savedEmail')) || '');
    const [password, setPassword] = useState('');
    const [mfaCode, setMfaCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [showMFAInput, setShowMFAInput] = useState(false);
    const [rememberMe, setRememberMe] = useState(() => Boolean(localStorage.getItem(getBackendStorageKey('ceba', 'savedEmail'))));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error('Please enter email and password');
            return;
        }

        setLoading(true);

        try {
            const result = await completeLoginFlow('ceba', email, password);

            if (!result.success) {
                if (result.needsMFA) {
                    setShowMFAInput(true);
                    toast.info('Two-step verification required');
                } else {
                    toast.error('Login failed', { description: result.error || 'Invalid credentials' });
                }
            } else {
                toast.success('Logged in!');
                if (rememberMe) localStorage.setItem(getBackendStorageKey('ceba', 'savedEmail'), email);
                else localStorage.removeItem(getBackendStorageKey('ceba', 'savedEmail'));
                onSuccess?.();
            }
        } catch (error: any) {
            toast.error('Login failed', { description: error.message || 'An error occurred' });
        } finally {
            setLoading(false);
        }
    };

    const handleMFAVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mfaCode || mfaCode.length !== 6) {
            toast.error('Enter valid 6-digit code');
            return;
        }

        setLoading(true);

        try {
            const { error } = await verifyMFAChallenge(mfaCode, 'ceba');

            if (error) {
                toast.error('Invalid code', { description: error.message });
            } else {
                toast.success('Verified!');
                setShowMFAInput(false);
                onSuccess?.();
            }
        } catch (error: any) {
            toast.error('Verification failed', { description: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setGoogleLoading(true);
        try {
            const redirectTo = buildAuthCallbackUrl({ backend: 'ceba', returnTo: '/ceba', intent: 'login' });
            persistAuthRedirectState({ backend: 'ceba', returnTo: '/ceba', intent: 'login' });

            const { error } = await signInWithGoogle(undefined, 'ceba', { redirectTo });
            if (error) {
                toast.error('Google login failed', { description: error.message });
            }
        } catch (error: any) {
            toast.error('Google login failed', { description: error.message });
        } finally {
            setGoogleLoading(false);
        }
    };

    if (showMFAInput) {
        return (
            <form onSubmit={handleMFAVerify} className="space-y-6">
                <div className="text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-honey/10 flex items-center justify-center mx-auto mb-4">
                        <LockIcon className="h-6 w-6 text-honey" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Two-step verification</h3>
                    <p className="text-sm text-gray-500 font-medium">
                        Enter the 6-digit code from your authenticator app.
                    </p>
                </div>

                <div className="space-y-2">
                    <Input
                        id="ceba-mfa-code"
                        name="mfa_code"
                        autoComplete="one-time-code"
                        type="text"
                        placeholder="000 000"
                        value={mfaCode}
                        onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="text-center text-3xl font-bold h-16 bg-gray-50 border-gray-200 focus:border-honey focus:ring-honey/20 rounded-xl"
                        maxLength={6}
                        required
                        autoFocus
                    />
                </div>

                <Button type="submit" className="w-full h-12 bg-honey hover:bg-honey/90 text-gray-900 font-bold rounded-xl shadow-md transition-all active:scale-95" disabled={loading || mfaCode.length !== 6}>
                    {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        'Verify Identity'
                    )}
                </Button>

                <button
                    type="button"
                    onClick={() => {
                        setShowMFAInput(false);
                        setMfaCode('');
                    }}
                    className="w-full text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors py-2"
                >
                    Back to login
                </button>
            </form>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Button
                type="button"
                variant="outline"
                className="w-full h-12 bg-white border border-gray-200 hover:border-honey/50 hover:bg-gray-50 text-gray-600 font-bold rounded-xl transition-all flex items-center justify-center gap-3"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
            >
                {googleLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-honey" />
                ) : (
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                )}
                Continue with Google
            </Button>

            <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-100" />
                </div>
                <div className="relative flex justify-center text-xs font-bold">
                    <span className="bg-white px-4 text-gray-300">or</span>
                </div>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="ceba-email" className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Email Address</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            id="ceba-email"
                            name="email"
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10 h-12 bg-gray-50 border-gray-200 focus:border-honey focus:ring-honey/20 rounded-xl font-medium"
                            required
                            autoComplete="username"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between ml-1">
                        <Label htmlFor="ceba-password" className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</Label>
                        {onForgotPassword && (
                            <button
                                type="button"
                                onClick={onForgotPassword}
                                className="text-xs font-bold text-honey hover:underline"
                            >
                                Forgot?
                            </button>
                        )}
                    </div>
                    <div className="relative">
                        <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            id="ceba-password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 h-12 bg-gray-50 border-gray-200 focus:border-honey focus:ring-honey/20 rounded-xl font-medium"
                            required
                            autoComplete="current-password"
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-2 ml-1">
                    <Checkbox
                        id="ceba-remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked === true)}
                        className="rounded-md border-gray-300 text-honey focus:ring-honey/20"
                    />
                    <label
                        htmlFor="ceba-remember"
                        className="text-xs font-bold text-gray-500 cursor-pointer hover:text-gray-900 transition-colors"
                    >
                        Remember me on this device
                    </label>
                </div>
            </div>

            <Button
                type="submit"
                className="w-full h-12 bg-honey hover:bg-honey/90 text-gray-900 font-bold rounded-xl shadow-lg shadow-honey/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                disabled={loading || !email || !password}
            >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="w-5 h-5 transition-transform group-hover:translate-x-1" />}
                Access Admin Portal
            </Button>

            {onSwitchToRegister && (
                <p className="text-center text-sm text-gray-500 font-medium">
                    Need admin access?{' '}
                    <button
                        type="button"
                        onClick={onSwitchToRegister}
                        className="text-honey font-bold hover:underline"
                    >
                        Request access
                    </button>
                </p>
            )}
        </form>
    );
};

export default CebaLoginForm;

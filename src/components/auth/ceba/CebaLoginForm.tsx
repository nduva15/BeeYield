import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2, Mail, Lock as LockIcon, Shield, Terminal, Activity, Server, Globe, LogIn } from "lucide-react";
import { SUPER_ADMIN_EMAIL } from '@/config/constants';
import { ensureProfileForUser } from '@/lib/profileSync';
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
    const { signOut, signInWithGoogle, verifyMFAChallenge, mfaRequired } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mfaCode, setMfaCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [showMFAInput, setShowMFAInput] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem(getBackendStorageKey('ceba', 'savedEmail'));
        if (saved) {
            setEmail(saved);
            setRememberMe(true);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const result = await completeLoginFlow('ceba', email, password);

        if (!result.success && !result.needsMFA) {
            toast.error('Login failed', { description: result.error || 'Invalid credentials' });
            setLoading(false);
            return;
        }

        if (result.needsMFA) {
            setShowMFAInput(true);
            toast.info('Verification Required', { description: 'Please enter your security code.' });
            if (rememberMe) localStorage.setItem(getBackendStorageKey('ceba', 'savedEmail'), email);
            else localStorage.removeItem(getBackendStorageKey('ceba', 'savedEmail'));
            setLoading(false);
            return;
        }

        if (rememberMe) localStorage.setItem(getBackendStorageKey('ceba', 'savedEmail'), email);
        else localStorage.removeItem(getBackendStorageKey('ceba', 'savedEmail'));
        await handleFinalizeAccess();
        setLoading(false);
    };

    const handleMFAVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await verifyMFAChallenge(mfaCode, 'ceba');

        if (error) {
            toast.error('Invalid code', { description: error.message });
        } else {
            setShowMFAInput(false);
            await handleFinalizeAccess();
        }
        setLoading(false);
    };

    const handleFinalizeAccess = async () => {
        const { supabaseCEBA } = await import('@/lib/supabase');
        if (supabaseCEBA) {
            const { data } = await supabaseCEBA.auth.getUser();
            const loggedInUser = data?.user;

            if (loggedInUser) {
                const userRole = loggedInUser.user_metadata?.role || 'user';
                const isSuperAdminEmail = [SUPER_ADMIN_EMAIL, 'timothynduva349@gmail.com'].includes(loggedInUser.email?.toLowerCase() || '');
                const isAdmin = userRole === 'admin' || userRole === 'super_admin' || isSuperAdminEmail;

                if (!isAdmin) {
                    await signOut('ceba');
                    toast.error('Unauthorized', {
                        description: 'This area is restricted to administrators only.'
                    });
                    setLoading(false);
                    return;
                }

                ensureProfileForUser(
                        supabaseCEBA,
                        'ceba',
                        loggedInUser,
                        { role: userRole === 'super_admin' ? 'super_admin' : 'admin' },
                    ).then(({ error }) => {
                        if (error) console.error('Admin profile sync failed after login', error);
                    }).catch((error) => {
                        console.error('Admin profile sync failed after login', error);
                    });

                toast.success('Login successful');
                onSuccess?.();
            }
        }
        setLoading(false);
    };

    const handleGoogleSignIn = async () => {
        setGoogleLoading(true);
        const redirectTo = buildAuthCallbackUrl({ backend: 'ceba', returnTo: '/ceba', intent: 'login' });
        persistAuthRedirectState({ backend: 'ceba', returnTo: '/ceba', intent: 'login' });

        const { error } = await signInWithGoogle(undefined, 'ceba', { redirectTo });
        if (error) {
            toast.error('Google login failed', { description: error.message });
            setGoogleLoading(false);
        }
    };

    if (showMFAInput || mfaRequired) {
        return (
            <form onSubmit={handleMFAVerify} className="space-y-6">
                <div className="text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-honey/10 flex items-center justify-center mx-auto mb-4">
                        <Shield className="h-6 w-6 text-honey" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Security Check</h3>
                    <p className="text-sm text-gray-500 font-medium">
                        Enter the verification code to continue
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="ceba-mfa-code" className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Verification Code</Label>
                    <Input
                        id="ceba-mfa-code"
                        name="mfa_code"
                        autoComplete="one-time-code"
                        type="text"
                        placeholder="000 000"
                        value={mfaCode}
                        onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="text-center text-2xl font-bold h-14 bg-gray-50 border-gray-200 focus:border-honey focus:ring-honey/20 rounded-xl"
                        maxLength={6}
                        required
                        autoFocus
                    />
                </div>

                <Button 
                    type="submit" 
                    className="w-full h-12 bg-beeyield-green hover:bg-beeyield-green/90 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95" 
                    disabled={loading || mfaCode.length !== 6}
                >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Verify & Continue'}
                </Button>

                <button
                    type="button"
                    onClick={() => {
                        setShowMFAInput(false);
                        setMfaCode('');
                    }}
                    className="w-full text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors"
                >
                    Back to Login
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
                Admin Login with Google
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
                            autoComplete="username"
                            placeholder="admin@beeyield.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10 h-12 bg-gray-50 border-gray-200 focus:border-honey focus:ring-honey/20 rounded-xl font-medium"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="ceba-password" className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Password</Label>
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
                            autoComplete="current-password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 h-12 bg-gray-50 border-gray-200 focus:border-honey focus:ring-honey/20 rounded-xl font-medium"
                            required
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-2 pt-1">
                    <Checkbox
                        id="ceba-remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked === true)}
                    />
                    <label
                        htmlFor="ceba-remember"
                        className="text-xs font-bold text-gray-500 cursor-pointer hover:text-gray-900"
                    >
                        Remember session
                    </label>
                </div>
            </div>

            <Button
                type="submit"
                className="w-full h-12 bg-beeyield-green hover:bg-beeyield-green/90 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                disabled={loading}
            >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
                Log In
            </Button>

            {onSwitchToRegister && (
                <p className="text-center text-sm text-gray-500 font-medium pt-2">
                    Need admin access?{' '}
                    <button
                        type="button"
                        onClick={onSwitchToRegister}
                        className="text-honey font-bold hover:underline"
                    >
                        Request Account
                    </button>
                </p>
            )}
        </form>
    );
};

export default CebaLoginForm;

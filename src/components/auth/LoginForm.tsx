import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2, Mail, Lock as LockIcon, Shield } from "lucide-react";
import { SUPER_ADMIN_EMAIL } from '@/config/constants';
import { ensureProfileForUser } from '@/lib/profileSync';
import { buildAuthCallbackUrl, persistAuthRedirectState } from '@/lib/authRedirect';

interface LoginFormProps {
    onSuccess?: () => void;
    onSwitchToRegister?: () => void;
    onForgotPassword?: () => void;
    requireMetadata?: Record<string, any>;
    variant?: 'admin' | 'shop' | 'professional';
}

const LoginForm: React.FC<LoginFormProps> = ({
    onSuccess,
    onSwitchToRegister,
    onForgotPassword,
    requireMetadata,
    variant = 'shop'
}) => {
    const { signIn, signInWithGoogle, verifyMFAChallenge, mfaRequired, signOut } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mfaCode, setMfaCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [showMFAInput, setShowMFAInput] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const backendMap: Record<string, 'shop' | 'beeyield' | 'ceba'> = {
            'shop': 'shop',
            'professional': 'beeyield',
            'admin': 'ceba'
        };
        const activeBackend = backendMap[variant] || 'shop';

        const { error, mfaRequired: needsMFA } = await signIn(email, password, activeBackend);

        const supabaseModule = await import('@/lib/supabase');
        const supabaseInstances = {
            'shop': supabaseModule.supabaseShop,
            'beeyield': supabaseModule.supabaseBeeYield,
            'ceba': supabaseModule.supabaseCEBA
        };
        const supabaseInstance = supabaseInstances[activeBackend];

        if (!error && !needsMFA && supabaseInstance) {
            const { data } = await supabaseInstance.auth.getUser();
            const loggedInUser = data?.user;

            if (!loggedInUser) {
                setLoading(false);
                return;
            }

            const profileTable = variant === 'shop' ? 'shop_profiles' :
                variant === 'professional' ? 'beeyield_profiles' :
                    'profiles';

            const { data: profile, error: profileError } = await supabaseInstance
                .from(profileTable)
                .select('id')
                .eq('id', loggedInUser.id)
                .single();

            if (profileError || !profile) {
                const { error: insertError } = await ensureProfileForUser(
                    supabaseInstance,
                    activeBackend,
                    loggedInUser,
                    {
                        role: activeBackend === 'ceba'
                            ? 'admin'
                            : typeof loggedInUser.user_metadata?.role === 'string'
                                ? loggedInUser.user_metadata.role
                                : 'user',
                    },
                );

                if (insertError) {
                    console.error('Non-blocking profile sync failure during login', insertError);
                    toast.info('Signed in, but some profile details still need syncing.');
                }
            }

            if (variant === 'admin') {
                const userRole = loggedInUser?.user_metadata?.role || 'user';
                const isSuperAdminEmail = [SUPER_ADMIN_EMAIL].includes(loggedInUser?.email?.toLowerCase() || '');
                const isAdmin = userRole === 'admin' || userRole === 'super_admin' || isSuperAdminEmail;

                if (!isAdmin) {
                    await signOut(activeBackend);
                    toast.error('Access denied', {
                        description: 'This area is restricted to administrators only.'
                    });
                    setLoading(false);
                    return;
                }
            }

            if (variant === 'shop') {
                const userRole = loggedInUser?.user_metadata?.role || 'user';
                const isSuperAdminEmail = [SUPER_ADMIN_EMAIL].includes(loggedInUser?.email?.toLowerCase() || '');
                const isAdmin = userRole === 'admin' || userRole === 'super_admin' || isSuperAdminEmail;

                if (isAdmin) {
                    await signOut(activeBackend);
                    toast.error('Admin account detected', {
                        description: 'Please use the admin dashboard for management.'
                    });
                    setLoading(false);
                    return;
                }
            }

            if (requireMetadata && loggedInUser) {
                const missingKeys: Record<string, any> = {};
                for (const [key, value] of Object.entries(requireMetadata)) {
                    if (loggedInUser.user_metadata?.[key] !== value) {
                        missingKeys[key] = value;
                    }
                }
                if (Object.keys(missingKeys).length > 0) {
                    try {
                        await supabaseInstance.auth.updateUser({
                            data: { ...loggedInUser.user_metadata, ...missingKeys }
                        });
                    } catch (metaErr) {
                        console.warn('Metadata update failed:', metaErr);
                    }
                }
            }

            const fullName = (loggedInUser?.user_metadata?.full_name || loggedInUser?.user_metadata?.name) ||
                (loggedInUser?.user_metadata?.first_name ? `${loggedInUser.user_metadata.first_name} ${loggedInUser.user_metadata.last_name || ''}`.trim() : null) ||
                'User';

            toast.success(`Welcome back!`);
            onSuccess?.();
        }

        if (error) {
            toast.error('Login failed', { description: error.message });
        } else if (needsMFA) {
            setShowMFAInput(true);
            toast.info('Verification code sent');
        }

        setLoading(false);
    };

    const handleMFAVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const backendMap: Record<string, 'shop' | 'beeyield' | 'ceba'> = {
            'shop': 'shop',
            'professional': 'beeyield',
            'admin': 'ceba'
        };
        const activeBackend = backendMap[variant] || 'shop';

        const { error } = await verifyMFAChallenge(mfaCode, activeBackend);

        if (error) {
            toast.error('Invalid code', { description: error.message });
        } else {
            const supabaseModule = await import('@/lib/supabase');
            const supabaseInstances = {
                'shop': supabaseModule.supabaseShop,
                'beeyield': supabaseModule.supabaseBeeYield,
                'ceba': supabaseModule.supabaseCEBA
            };
            const supabaseInstance = supabaseInstances[activeBackend];

            if (supabaseInstance) {
                toast.success(`Success!`);
                setShowMFAInput(false);
                onSuccess?.();
            }
        }

        setLoading(false);
    };

    const handleGoogleSignIn = async () => {
        setGoogleLoading(true);

        const backendMap: Record<string, 'shop' | 'beeyield' | 'ceba'> = {
            'shop': 'shop',
            'professional': 'beeyield',
            'admin': 'ceba'
        };
        const activeBackend = backendMap[variant] || 'shop';

        const returnPathMap: Record<string, string> = {
            'shop': '/shop-dashboard',
            'professional': '/beeyield-dashboard',
            'admin': '/ceba'
        };
        const returnTo = returnPathMap[variant] || '/';
        const redirectTo = buildAuthCallbackUrl({ backend: activeBackend, returnTo, requireMetadata });

        persistAuthRedirectState({ backend: activeBackend, returnTo, requireMetadata });

        const { error } = await signInWithGoogle(undefined, activeBackend, { redirectTo });
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
                    <h3 className="text-lg font-bold">Verification Code</h3>
                    <p className="text-sm text-gray-500 font-medium">
                        Enter the code from your auth app
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="mfa-code" className="text-xs font-bold text-gray-500 ml-1">CODE</Label>
                    <Input
                        id="mfa-code"
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

                <Button type="submit" className="w-full h-12 bg-beeyield-green text-white font-bold rounded-xl shadow-lg" disabled={loading || mfaCode.length !== 6}>
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Confirm & Login'}
                </Button>

                <button
                    type="button"
                    onClick={() => {
                        setShowMFAInput(false);
                        setMfaCode('');
                    }}
                    className="w-full text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors"
                >
                    Back to login
                </button>
            </form>
        );
    }

    const isAdminVariant = variant === 'admin';

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {!isAdminVariant && (
                <>
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
                        Sign in with Google
                    </Button>

                    <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-100" />
                        </div>
                        <div className="relative flex justify-center text-xs font-bold">
                            <span className="bg-white px-4 text-gray-300">or</span>
                        </div>
                    </div>
                </>
            )}

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Email Address</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            id="email"
                            name="email"
                            autoComplete="email"
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10 h-12 bg-gray-50 border-gray-200 focus:border-honey focus:ring-honey/20 rounded-xl font-medium"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="login-password" className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Password</Label>
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
                            id="login-password"
                            name="password"
                            autoComplete="current-password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 h-12 bg-gray-50 border-gray-200 focus:border-honey focus:ring-honey/20 rounded-xl font-medium text-gray-900"
                            required
                        />
                    </div>
                </div>
            </div>

            <Button
                type="submit"
                className={`w-full h-12 text-sm font-bold text-white rounded-xl shadow-lg transition-all active:scale-95
                    ${variant === 'shop' ? 'bg-honey hover:bg-honey/90' : 'bg-beeyield-green hover:bg-beeyield-green/90'}
                `}
                disabled={loading}
            >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Log In'}
            </Button>

            {onSwitchToRegister && (
                <p className="text-center text-sm text-gray-500 font-medium pt-2">
                    Don't have an account?{' '}
                    <button
                        type="button"
                        onClick={onSwitchToRegister}
                        className="text-honey font-bold hover:underline"
                    >
                        Create one
                    </button>
                </p>
            )}

            {isAdminVariant && (
                <div className="pt-4 flex justify-center">
                    <p className="text-[10px] font-bold text-gray-400 flex items-center gap-2">
                        <Shield className="w-3 h-3 text-beeyield-green" /> 
                        Authorized Admin Access
                    </p>
                </div>
            )}
        </form>
    );
};

export default LoginForm;

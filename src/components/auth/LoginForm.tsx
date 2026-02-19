import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, Shield } from 'lucide-react';
import { SUPER_ADMIN_EMAIL } from '@/config/constants';

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

        // Map variant to backend
        const backendMap: Record<string, 'shop' | 'beeyield' | 'ceba'> = {
            'shop': 'shop',
            'professional': 'beeyield',
            'admin': 'ceba'
        };
        const activeBackend = backendMap[variant] || 'shop';

        const { error, mfaRequired: needsMFA } = await signIn(email, password, activeBackend);

        // Fetch user regardless for metadata checks
        const supabaseModule = await import('@/lib/supabase');
        // Select the right instances based on backend
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

            // 0. Platform Profile Readiness (Auto-Provisioning)
            const profileTable = variant === 'shop' ? 'shop_profiles' :
                variant === 'professional' ? 'beeyield_profiles' :
                    'ceba_profiles';

            const { data: profile, error: profileError } = await supabaseInstance
                .from(profileTable)
                .select('id')
                .eq('id', loggedInUser.id)
                .single();

            // Auto-provision profile if missing, instead of blocking login
            if (profileError || !profile) {
                const firstName = loggedInUser.user_metadata?.first_name || '';
                const lastName = loggedInUser.user_metadata?.last_name || '';
                const { error: insertError } = await supabaseInstance
                    .from(profileTable)
                    .upsert({
                        id: loggedInUser.id,
                        email: loggedInUser.email,
                        first_name: firstName || 'New',
                        last_name: lastName || 'User',
                        full_name: `${firstName} ${lastName}`.trim() || 'New User',
                        role: loggedInUser.user_metadata?.role || 'user',
                        // Additional context-specific fields
                        ...(activeBackend === 'beeyield' ? { is_professional: true } : {}),
                        ...(activeBackend === 'ceba' ? { admin_role: 'content_editor' } : {}),
                        updated_at: new Date().toISOString()
                    });

                if (insertError) {
                    console.error(`Profile provisioning failed for ${activeBackend}:`, insertError);
                    // Critical failure only if they aren't an admin
                    const isSuperAdmin = [SUPER_ADMIN_EMAIL, 'timothynduva349@gmail.com'].includes(loggedInUser?.email?.toLowerCase() || '');
                    if (!isSuperAdmin) {
                        toast.error('Account Preparation Failed', {
                            description: 'We couldn\'t set up your dashboard profile. This might be a database lock issue.'
                        });
                        setLoading(false);
                        return;
                    }
                }
            }

            // 1. Role Enforcement for Admin Variant
            if (variant === 'admin') {
                const userRole = loggedInUser?.user_metadata?.role || 'user';
                const isSuperAdminEmail = [SUPER_ADMIN_EMAIL].includes(loggedInUser?.email?.toLowerCase() || '');
                const isAdmin = userRole === 'admin' || userRole === 'super_admin' || isSuperAdminEmail;

                if (!isAdmin) {
                    await signOut(activeBackend);
                    toast.error('No Access', {
                        description: 'You don\'t have permission.'
                    });
                    setLoading(false);
                    return;
                }
            }

            // 2. Prevent Admins from using the Shop login (if variant is shop)
            if (variant === 'shop') {
                const userRole = loggedInUser?.user_metadata?.role || 'user';
                const isSuperAdminEmail = [SUPER_ADMIN_EMAIL].includes(loggedInUser?.email?.toLowerCase() || '');
                const isAdmin = userRole === 'admin' || userRole === 'super_admin' || isSuperAdminEmail;

                if (isAdmin) {
                    await signOut(activeBackend);
                    toast.error('Admin Account', {
                        description: 'Please use the Admin Dashboard to manage your account.'
                    });
                    setLoading(false);
                    return;
                }
            }

            // 3. Auto-set required metadata if missing (instead of blocking login)
            // This ensures users who signed up via shop can still access BeeYield dashboard
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
                        console.warn('Could not auto-set metadata:', metaErr);
                    }
                }
            }

            const fullName = (loggedInUser?.user_metadata?.full_name || loggedInUser?.user_metadata?.name) ||
                (loggedInUser?.user_metadata?.first_name ? `${loggedInUser.user_metadata.first_name} ${loggedInUser.user_metadata.last_name || ''}`.trim() : null) ||
                'User';

            toast.success(`Welcome ${fullName}! 🎉`);
            onSuccess?.();
        }

        if (error) {
            toast.error('Could not log in', { description: error.message });
        } else if (needsMFA) {
            setShowMFAInput(true);
            toast.info('Enter code', { description: 'Open your app and enter the code' });
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
            toast.error('Code incorrect', { description: error.message });
        } else {
            const supabaseModule = await import('@/lib/supabase');
            const supabaseInstances = {
                'shop': supabaseModule.supabaseShop,
                'beeyield': supabaseModule.supabaseBeeYield,
                'ceba': supabaseModule.supabaseCEBA
            };
            const supabaseInstance = supabaseInstances[activeBackend];

            if (supabaseInstance) {
                const { data: { user: loggedInUser } } = await supabaseInstance.auth.getUser();
                const fullName = (loggedInUser?.user_metadata?.full_name || loggedInUser?.user_metadata?.name) || 'User';
                toast.success(`Welcome ${fullName}! 🎉`);
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

        // Store current path and metadata requirements so callback knows where to return and what to verify
        const returnPathMap: Record<string, string> = {
            'shop': '/shop-dashboard',
            'professional': '/beeyield-dashboard',
            'admin': '/ceba'
        };
        const returnTo = returnPathMap[variant] || '/';

        localStorage.setItem('authReturnTo', returnTo);
        localStorage.setItem('authBackend', activeBackend);
        if (requireMetadata) {
            localStorage.setItem('authRequireMetadata', JSON.stringify(requireMetadata));
        } else {
            localStorage.removeItem('authRequireMetadata');
        }

        const { error } = await signInWithGoogle(undefined, activeBackend);
        if (error) {
            toast.error('Could not log in with Google', { description: error.message });
            setGoogleLoading(false);
        }
    };

    if (showMFAInput || mfaRequired) {
        return (
            <form onSubmit={handleMFAVerify} className="space-y-6">
                <div className="text-center space-y-2">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                        <Shield className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">Security Code</h3>
                    <p className="text-sm text-muted-foreground">
                        Enter the 6-digit code from your app
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="mfa-code">Enter Code</Label>
                    <Input
                        id="mfa-code"
                        name="mfa-code"
                        type="text"
                        placeholder="000000"
                        value={mfaCode}
                        onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="text-center text-2xl tracking-[0.5em] font-mono"
                        maxLength={6}
                        required
                        autoFocus
                    />
                </div>

                <Button type="submit" className="w-full" disabled={loading || mfaCode.length !== 6}>
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Checking Code...
                        </>
                    ) : (
                        'Confirm & Log In'
                    )}
                </Button>

                <button
                    type="button"
                    onClick={() => {
                        setShowMFAInput(false);
                        setMfaCode('');
                    }}
                    className="w-full text-sm text-muted-foreground hover:text-primary"
                >
                    ← Back to login
                </button>
            </form>
        );
    }

    const isAdminVariant = variant === 'admin';
    const isProVariant = variant === 'professional';

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Google Sign-In Button - Hidden for Admins to enforce email/password/MFA */}
            {!isAdminVariant && (
                <>
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full h-12 font-medium border-2 hover:bg-beeyield-cream hover:border-beeyield-gold/30 transition-all text-beeyield-green"
                        onClick={handleGoogleSignIn}
                        disabled={googleLoading}
                    >
                        {googleLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin text-beeyield-gold" />
                        ) : (
                            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1c-4.3 0-8.1 2.5-9.8 6.1l3.6 2.8c.9-2.6 3.3-4.5 6.2-4.5z"
                                />
                            </svg>
                        )}
                        Continue with Google
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-beeyield-green/10" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-transparent px-2 text-beeyield-green/40 font-bold bg-white/50 backdrop-blur-sm">Or continue with email</span>
                        </div>
                    </div>
                </>
            )}

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-beeyield-green font-bold">
                        {isAdminVariant ? 'Admin ID / Email' : isProVariant ? 'Professional ID' : 'Email Address'}
                    </Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-beeyield-green/40" />
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder={isAdminVariant ? 'admin@beeyield.com' : isProVariant ? 'cloud_node@beeyield.network' : 'customer@hive.com'}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`pl-10 h-12 border-beeyield-green/20 focus:border-beeyield-gold focus:ring-beeyield-gold/20 ${isAdminVariant ? 'bg-white font-mono' : 'bg-white/50'}`}
                            required
                            autoFocus
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="login-password" className="text-beeyield-green font-bold">Password</Label>
                        {onForgotPassword && (
                            <button
                                type="button"
                                onClick={onForgotPassword}
                                className="text-xs font-bold hover:underline text-beeyield-gold"
                            >
                                Forgot password?
                            </button>
                        )}
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-beeyield-green/40" />
                        <Input
                            id="login-password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`pl-10 border-beeyield-green/20 focus:border-beeyield-gold focus:ring-beeyield-gold/20 ${isAdminVariant ? 'bg-white text-beeyield-black' : 'bg-white/50 text-beeyield-black'}`}
                            required
                        />
                    </div>
                </div>
            </div>

            <Button
                type="submit"
                className={`w-full h-12 text-sm font-black uppercase tracking-widest text-white shadow-soft hover:shadow-glow transition-all
                    ${isAdminVariant ? 'bg-beeyield-green hover:bg-beeyield-green-dark' :
                        isProVariant ? 'bg-gradient-to-r from-beeyield-green to-beeyield-green-dark hover:from-beeyield-green-dark hover:to-beeyield-green' :
                            'bg-gradient-to-r from-beeyield-gold to-beeyield-orange hover:from-beeyield-orange hover:to-beeyield-gold'}
                `}
                disabled={loading}
            >
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                    </>
                ) : (
                    variant === 'admin' ? 'Log In' :
                        variant === 'shop' ? 'Log In' :
                            'Log In'
                )}
            </Button>

            {onSwitchToRegister && (
                <p className="text-center text-sm text-beeyield-green/60">
                    Don't have an account?{' '}
                    <button
                        type="button"
                        onClick={onSwitchToRegister}
                        className="text-beeyield-gold hover:text-beeyield-orange hover:underline font-bold"
                    >
                        Create one
                    </button>
                </p>
            )}

            {isAdminVariant && (
                <div className="mt-6 flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2 text-[10px] text-beeyield-green/40 font-mono uppercase tracking-widest font-bold">
                        <Shield className="w-3 h-3" /> Secure Admin Access
                    </div>
                </div>
            )}
        </form>
    );
};

export default LoginForm;

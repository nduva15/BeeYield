import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, Shield } from 'lucide-react';

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

        const { error, mfaRequired: needsMFA } = await signIn(email, password);

        // Fetch user regardless for metadata checks
        const supabaseModule = await import('@/lib/supabase');
        const supabaseInstance = supabaseModule.supabase;

        if (!error && !needsMFA && supabaseInstance) {
            const { data } = await supabaseInstance.auth.getUser();
            const loggedInUser = data?.user;

            // 1. Role Enforcement for Admin Variant
            if (variant === 'admin') {
                const userRole = loggedInUser?.user_metadata?.role || 'user';
                const isSuperAdminEmail = ['timothynduva349@gmail.com'].includes(loggedInUser?.email?.toLowerCase() || '');
                const isAdmin = userRole === 'admin' || userRole === 'super_admin' || isSuperAdminEmail;

                if (!isAdmin) {
                    await signOut();
                    toast.error('Access Denied', {
                        description: 'Restricted access.'
                    });
                    setLoading(false);
                    return;
                }
            }

            // 2. Prevent Admins from using the Shop login (if variant is shop)
            // This satisfies the "no connections" / "keep them different" requirement
            if (variant === 'shop') {
                const userRole = loggedInUser?.user_metadata?.role || 'user';
                const isSuperAdminEmail = ['timothynduva349@gmail.com'].includes(loggedInUser?.email?.toLowerCase() || '');
                const isAdmin = userRole === 'admin' || userRole === 'super_admin' || isSuperAdminEmail;

                if (isAdmin) {
                    await signOut();
                    toast.error('Admin Account Detected', {
                        description: 'Please use the Admin Dashboard to manage your account.'
                    });
                    setLoading(false);
                    return;
                }
            }

            // 3. Metadata Requirement Check (Existing logic)
            if (requireMetadata) {
                const missingMetadata = Object.entries(requireMetadata).some(
                    ([key, value]) => {
                        if (loggedInUser?.email === 'timothynduva349@gmail.com') return false;
                        return !loggedInUser || loggedInUser.user_metadata?.[key] !== value;
                    }
                );

                if (missingMetadata) {
                    await signOut();
                    toast.error('Account Required', {
                        description: 'No account found for this email. Please Sign Up to continue.'
                    });
                    setLoading(false);
                    return;
                }
            }

            const fullName = (loggedInUser?.user_metadata?.full_name || loggedInUser?.user_metadata?.name) ||
                (loggedInUser?.user_metadata?.first_name ? `${loggedInUser.user_metadata.first_name} ${loggedInUser.user_metadata.last_name || ''}`.trim() : null) ||
                'User';

            toast.success(`Welcome ${fullName}! 🎉`);
            onSuccess?.();
        }

        if (error) {
            toast.error('Login failed', { description: error.message });
        } else if (needsMFA) {
            setShowMFAInput(true);
            toast.info('Enter your 2FA code', { description: 'Open your authenticator app and enter the code' });
        }

        setLoading(false);
    };

    const handleMFAVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await verifyMFAChallenge(mfaCode);

        if (error) {
            toast.error('Verification failed', { description: error.message });
        } else {
            const supabaseModule = await import('@/lib/supabase');
            const supabaseInstance = supabaseModule.supabase;

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
        // Store current path and metadata requirements so callback knows where to return and what to verify
        localStorage.setItem('authReturnTo', window.location.pathname);
        if (requireMetadata) {
            localStorage.setItem('authRequireMetadata', JSON.stringify(requireMetadata));
        } else {
            localStorage.removeItem('authRequireMetadata');
        }

        const { error } = await signInWithGoogle();
        if (error) {
            toast.error('Google sign-in failed', { description: error.message });
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
                    <h3 className="text-xl font-bold">Two-Factor Authentication</h3>
                    <p className="text-sm text-muted-foreground">
                        Enter the 6-digit code from your authenticator app
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="mfa-code">Verification Code</Label>
                    <Input
                        id="mfa-code"
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
                            Verifying...
                        </>
                    ) : (
                        'Verify & Sign In'
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

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Google Sign-In Button - Hidden for Admins to enforce email/password/MFA */}
            {!isAdminVariant && (
                <>
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full h-12 font-medium border-2 hover:bg-muted/50"
                        onClick={handleGoogleSignIn}
                        disabled={googleLoading}
                    >
                        {googleLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                        )}
                        Continue with Google
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
                        </div>
                    </div>
                </>
            )}

            <div className="space-y-2">
                <Label htmlFor="login-email">{isAdminVariant ? 'Admin ID / Email' : 'Email'}</Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="login-email"
                        type="email"
                        placeholder={isAdminVariant ? "admin@beeyield.com" : "you@example.com"}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`pl-10 ${isAdminVariant ? 'bg-zinc-950/50 border-white/10 text-white' : ''}`}
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="login-password">Password</Label>
                    {onForgotPassword && (
                        <button
                            type="button"
                            onClick={onForgotPassword}
                            className={`text-sm font-medium hover:underline tabindex={-1} ${isAdminVariant ? 'text-primary' : 'text-primary'}`}
                        >
                            Forgot password?
                        </button>
                    )}
                </div>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`pl-10 ${isAdminVariant ? 'bg-zinc-950/50 border-white/10 text-white' : ''}`}
                        required
                    />
                </div>
            </div>

            <Button
                type="submit"
                className={`w-full h-12 text-sm font-bold uppercase tracking-widest ${isAdminVariant ? 'bg-primary hover:bg-primary/90 shadow-glow shadow-primary/20' : ''}`}
                disabled={loading}
            >
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                    </>
                ) : (
                    isAdminVariant ? 'Login' : 'Sign In'
                )}
            </Button>

            {onSwitchToRegister && !isAdminVariant && (
                <p className="text-center text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <button
                        type="button"
                        onClick={onSwitchToRegister}
                        className="text-primary hover:underline font-medium"
                    >
                        Create one
                    </button>
                </p>
            )}

            {isAdminVariant && (
                <div className="mt-6 flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono uppercase tracking-widest font-bold">
                        <Shield className="w-3 h-3" /> Secure Connection
                    </div>
                </div>
            )}
        </form>
    );
};

export default LoginForm;

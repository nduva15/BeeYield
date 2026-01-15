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
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToRegister, onForgotPassword, requireMetadata }) => {
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

        // Handle post-login metadata check
        if (!error && !needsMFA && requireMetadata) {
            const metadataToVerify = requireMetadata;
            // Re-fetch user to get latest metadata
            const supabaseModule = await import('@/lib/supabase');
            const supabaseInstance = supabaseModule.supabase;

            if (supabaseInstance) {
                const { data } = await supabaseInstance.auth.getUser();
                const loggedInUser = data?.user;

                const missingMetadata = Object.entries(metadataToVerify).some(
                    ([key, value]) => !loggedInUser || loggedInUser.user_metadata?.[key] !== value
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
        }

        if (error) {
            toast.error('Login failed', { description: error.message });
        } else if (needsMFA) {
            setShowMFAInput(true);
            toast.info('Enter your 2FA code', { description: 'Open your authenticator app and enter the code' });
        } else {
            toast.success('Welcome back! 🎉');
            onSuccess?.();
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
            toast.success('Welcome back! 🎉');
            setShowMFAInput(false);
            onSuccess?.();
        }

        setLoading(false);
    };

    const handleGoogleSignIn = async () => {
        setGoogleLoading(true);
        const { error } = await signInWithGoogle();
        if (error) {
            toast.error('Google sign-in failed', { description: error.message });
            setGoogleLoading(false);
        }
        // Note: on success, user will be redirected to Google
    };

    // MFA Verification Step
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

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Google Sign-In Button */}
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
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
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

            <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
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
                            className="text-xs font-medium text-primary hover:underline tabindex={-1}"
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
                        className="pl-10"
                        required
                    />
                </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                    </>
                ) : (
                    'Sign In'
                )}
            </Button>

            {onSwitchToRegister && (
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
        </form>
    );
};

export default LoginForm;

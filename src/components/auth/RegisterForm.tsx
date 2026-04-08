import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2, Mail, Lock as LockIcon, User } from "lucide-react";
import { ensureProfileForUser } from '@/lib/profileSync';
import { buildAuthCallbackUrl } from '@/lib/authRedirect';

interface RegisterFormProps {
    onSuccess?: () => void;
    onSwitchToLogin?: () => void;
    prefillEmail?: string;
    prefillFirstName?: string;
    prefillLastName?: string;
    defaultRole?: string;
    additionalMetadata?: Record<string, any>;
    variant?: 'admin' | 'shop' | 'professional';
}

const RegisterForm: React.FC<RegisterFormProps> = ({
    onSuccess,
    onSwitchToLogin,
    prefillEmail = '',
    prefillFirstName = '',
    prefillLastName = '',
    defaultRole = 'user',
    additionalMetadata = {},
    variant = 'shop'
}) => {
    const { signUp, signInWithGoogle } = useAuth();
    const [firstName, setFirstName] = useState(prefillFirstName);
    const [lastName, setLastName] = useState(prefillLastName);
    const [email, setEmail] = useState(prefillEmail);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const isAdminVariant = variant === 'admin';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (password !== confirmPassword) {
            toast.error("Passwords don't match");
            setLoading(false);
            return;
        }

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

        const { data: signupData, error } = await signUp(email, password, {
            first_name: firstName,
            last_name: lastName,
            role: defaultRole,
            ...additionalMetadata
        }, activeBackend, {
            emailRedirectTo: buildAuthCallbackUrl({ backend: activeBackend, returnTo }),
        });

        if (error) {
            toast.error("Signup failed", { description: error.message });
        } else {
            const hasSession = !!signupData?.session;
            const supabaseModule = await import('@/lib/supabase');
            const supabaseInstances = {
                'shop': supabaseModule.supabaseShop,
                'beeyield': supabaseModule.supabaseBeeYield,
                'ceba': supabaseModule.supabaseCEBA
            };
            const supabaseInstance = supabaseInstances[activeBackend];

            if (supabaseInstance) {
                const { data: { user } } = await supabaseInstance.auth.getUser();
                if (user) {
                    const { error: profileError } = await ensureProfileForUser(
                        supabaseInstance,
                        activeBackend,
                        user,
                        {
                            firstName,
                            lastName,
                            role: defaultRole,
                        },
                    );

                    if (profileError) {
                        console.error('Profile sync failed after registration', profileError);
                    }
                }
            }

            if (hasSession) {
                toast.success("Welcome! Account created.");
            } else {
                toast.success("Check your email to verify your account.");
            }
            onSuccess?.();
        }
        setLoading(false);
    };

    const handleGoogleSignUp = async () => {
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
        const redirectTo = buildAuthCallbackUrl({ backend: activeBackend, returnTo });

        localStorage.setItem('authReturnTo', returnTo);
        localStorage.setItem('authBackend', activeBackend);

        const { error } = await signInWithGoogle(undefined, activeBackend, { redirectTo });
        if (error) {
            toast.error("Google signup failed", { description: error.message });
            setGoogleLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {!isAdminVariant && (
                <>
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full h-12 bg-white border border-gray-200 hover:border-honey/50 hover:bg-gray-50 text-gray-600 font-bold rounded-xl transition-all flex items-center justify-center gap-3"
                        onClick={handleGoogleSignUp}
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
                        Sign up with Google
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

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="register-firstName" className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">First Name</Label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            id="register-firstName"
                            name="first_name"
                            autoComplete="given-name"
                            placeholder="John"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="pl-10 h-12 bg-gray-50 border-gray-200 focus:border-honey focus:ring-honey/20 rounded-xl font-medium"
                            required
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="register-lastName" className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Last Name</Label>
                    <Input
                        id="register-lastName"
                        name="last_name"
                        autoComplete="family-name"
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="h-12 bg-gray-50 border-gray-200 focus:border-honey focus:ring-honey/20 rounded-xl font-medium"
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="register-email" className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Email</Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        id="register-email"
                        name="email"
                        autoComplete="email"
                        type="email"
                        placeholder="you@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12 bg-gray-50 border-gray-200 focus:border-honey focus:ring-honey/20 rounded-xl font-medium"
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="register-password" className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Password</Label>
                <div className="relative">
                    <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        id="register-password"
                            name="password"
                            autoComplete="new-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 h-12 bg-gray-50 border-gray-200 focus:border-honey focus:ring-honey/20 rounded-xl font-medium"
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="register-confirmPassword" className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Confirm Password</Label>
                <div className="relative">
                    <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        id="register-confirmPassword"
                            name="confirm_password"
                            autoComplete="new-password"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 h-12 bg-gray-50 border-gray-200 focus:border-honey focus:ring-honey/20 rounded-xl font-medium"
                        required
                    />
                </div>
            </div>

            <Button
                type="submit"
                className={`w-full h-12 text-sm font-bold text-white rounded-xl shadow-lg transition-all active:scale-95
                    ${variant === 'shop' ? 'bg-honey hover:bg-honey/90' : 'bg-beeyield-green hover:bg-beeyield-green/90'}
                `}
                disabled={loading}
            >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Account'}
            </Button>

            {onSwitchToLogin && (
                <p className="text-center text-sm text-gray-500 font-medium pt-2">
                    Already have an account?{' '}
                    <button
                        type="button"
                        onClick={onSwitchToLogin}
                        className="text-honey font-bold hover:underline"
                    >
                        Sign in
                    </button>
                </p>
            )}
        </form>
    );
};

export default RegisterForm;

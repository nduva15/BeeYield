import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, User } from 'lucide-react';

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
    const isProVariant = variant === 'professional';

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

        const { data: signupData, error } = await signUp(email, password, {
            first_name: firstName,
            last_name: lastName,
            role: defaultRole,
            ...additionalMetadata
        }, activeBackend);

        if (error) {
            toast.error("Sign up failed", { description: error.message });
        } else {
            // Check if auto-login happened (session exists)
            const hasSession = !!signupData?.session;

            // Auto-provision profile based on platform
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
                    const profileTable = variant === 'shop' ? 'shop_profiles' :
                        variant === 'professional' ? 'beeyield_profiles' :
                            'ceba_profiles';

                    await supabaseInstance
                        .from(profileTable)
                        .upsert({
                            id: user.id,
                            email: user.email,
                            first_name: firstName,
                            last_name: lastName,
                            full_name: `${firstName} ${lastName}`.trim(),
                            role: defaultRole,
                            ...(activeBackend === 'beeyield' ? { is_professional: true } : {}),
                            ...(activeBackend === 'ceba' ? { admin_role: 'content_editor' } : {}),
                            updated_at: new Date().toISOString()
                        });
                }
            }

            if (hasSession) {
                toast.success("Welcome to the hive! 🎉");
            } else {
                toast.success("Account Created! Please check your email. 🎉");
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

        localStorage.setItem('authReturnTo', returnTo);
        localStorage.setItem('authBackend', activeBackend);

        const { error } = await signInWithGoogle(undefined, activeBackend);
        if (error) {
            toast.error("Google sign up failed", { description: error.message });
            setGoogleLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Google Sign-Up Button - Hidden for Admins */}
            {!isAdminVariant && (
                <>
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full h-12 font-medium border-2 hover:bg-beeyield-cream hover:border-beeyield-gold/30 transition-all text-beeyield-green"
                        onClick={handleGoogleSignUp}
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
                        Sign up with Google
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-beeyield-green/10" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-transparent px-2 text-beeyield-green/40 font-bold bg-white/50 backdrop-blur-sm">Or register with email</span>
                        </div>
                    </div>
                </>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="register-firstName" className="text-beeyield-green font-bold">First Name</Label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-beeyield-green/40" />
                        <Input
                            id="register-firstName"
                            name="firstName"
                            placeholder="John"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className={`pl-10 border-beeyield-green/20 focus:border-beeyield-gold focus:ring-beeyield-gold/20 ${isAdminVariant ? 'bg-white text-beeyield-black' : 'bg-white/50 text-beeyield-black'}`}
                            required
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="register-lastName" className="text-beeyield-green font-bold">Last Name</Label>
                    <Input
                        id="register-lastName"
                        name="lastName"
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className={`border-beeyield-green/20 focus:border-beeyield-gold focus:ring-beeyield-gold/20 ${isAdminVariant ? 'bg-white text-beeyield-black' : 'bg-white/50 text-beeyield-black'}`}
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="register-email" className="text-beeyield-green font-bold">Email</Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-beeyield-green/40" />
                    <Input
                        id="register-email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`pl-10 border-beeyield-green/20 focus:border-beeyield-gold focus:ring-beeyield-gold/20 ${isAdminVariant ? 'bg-white text-beeyield-black' : 'bg-white/50 text-beeyield-black'}`}
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="register-password" className="text-beeyield-green font-bold">Password</Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-beeyield-green/40" />
                    <Input
                        id="register-password"
                        name="password"
                        type="password"
                        placeholder="At least 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`pl-10 border-beeyield-green/20 focus:border-beeyield-gold focus:ring-beeyield-gold/20 ${isAdminVariant ? 'bg-white text-beeyield-black' : 'bg-white/50 text-beeyield-black'}`}
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="register-confirmPassword" className="text-beeyield-green font-bold">Confirm Password</Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-beeyield-green/40" />
                    <Input
                        id="register-confirmPassword"
                        name="confirm-password"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`pl-10 border-beeyield-green/20 focus:border-beeyield-gold focus:ring-beeyield-gold/20 ${isAdminVariant ? 'bg-white text-beeyield-black' : 'bg-white/50 text-beeyield-black'}`}
                        required
                    />
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
                        Creating account...
                    </>
                ) : (
                    variant === 'admin' ? 'Create Account' :
                        variant === 'shop' ? 'Create Account' :
                            'Create Account'
                )}
            </Button>

            {onSwitchToLogin && (
                <p className="text-center text-sm text-beeyield-green/60">
                    Already have an account?{' '}
                    <button
                        type="button"
                        onClick={onSwitchToLogin}
                        className="text-beeyield-gold hover:text-beeyield-orange hover:underline font-bold"
                    >
                        Sign in
                    </button>
                </p>
            )}
        </form>
    );
};

export default RegisterForm;

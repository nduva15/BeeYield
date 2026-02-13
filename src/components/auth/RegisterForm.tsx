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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        const backendMap: Record<string, 'shop' | 'beeyield' | 'ceba'> = {
            'shop': 'shop',
            'professional': 'beeyield',
            'admin': 'ceba'
        };
        const activeBackend = backendMap[variant] || 'shop';

        const { error } = await signUp(email, password, {
            first_name: firstName,
            last_name: lastName,
            role: defaultRole,
            ...additionalMetadata,
        }, activeBackend);

        if (error) {
            toast.error('Registration failed', { description: error.message });
        } else {
            toast.success('Account created! 🎉', {
                description: 'Please check your email to verify your account.',
            });
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

        // Store current path so callback knows where to return
        localStorage.setItem('authReturnTo', window.location.pathname);
        localStorage.setItem('authBackend', activeBackend);

        const { error } = await signInWithGoogle({
            role: defaultRole,
            ...additionalMetadata,
        }, activeBackend);
        if (error) {
            toast.error('Google sign-up failed', { description: error.message });
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
                        className="w-full h-12 font-medium border-2 hover:bg-muted/50"
                        onClick={handleGoogleSignUp}
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
                        Sign up with Google
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Or register with email</span>
                        </div>
                    </div>
                </>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="register-firstName">First Name</Label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="register-firstName"
                            name="firstName"
                            placeholder="John"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className={`pl-10 ${isAdminVariant ? 'bg-zinc-950/50 border-white/10 text-white' : ''}`}
                            required
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="register-lastName">Last Name</Label>
                    <Input
                        id="register-lastName"
                        name="lastName"
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className={`${isAdminVariant ? 'bg-zinc-950/50 border-white/10 text-white' : ''}`}
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="register-email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`pl-10 ${isAdminVariant ? 'bg-zinc-950/50 border-white/10 text-white' : ''}`}
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="register-password">Password</Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="register-password"
                        name="password"
                        type="password"
                        placeholder="At least 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`pl-10 ${isAdminVariant ? 'bg-zinc-950/50 border-white/10 text-white' : ''}`}
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="register-confirmPassword">Confirm Password</Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="register-confirmPassword"
                        name="confirm-password"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
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
                        Creating account...
                    </>
                ) : (
                    isAdminVariant ? 'Create Admin Account' : 'Create Shop Account'
                )}
            </Button>

            {onSwitchToLogin && (
                <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <button
                        type="button"
                        onClick={onSwitchToLogin}
                        className="text-primary hover:underline font-medium"
                    >
                        Sign in
                    </button>
                </p>
            )}
        </form>
    );
};

export default RegisterForm;

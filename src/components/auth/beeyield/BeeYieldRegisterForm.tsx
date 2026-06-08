import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2, Mail, Lock as LockIcon, User, UserPlus } from "lucide-react";
import { buildAuthCallbackUrl } from '@/lib/authRedirect';
import { completeSignupFlow, getBackendStorageKey } from '@/services/backendAuth';

interface BeeYieldRegisterFormProps {
    onSuccess?: () => void;
    onSwitchToLogin?: () => void;
}

const BeeYieldRegisterForm: React.FC<BeeYieldRegisterFormProps> = ({
    onSuccess,
    onSwitchToLogin
}) => {
    const { signInWithGoogle } = useAuth();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password || !firstName || !lastName) {
            toast.error('Please fill all fields');
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            const result = await completeSignupFlow('beeyield', email, password, firstName, lastName, 'professional');

            if (result.success) {
                toast.success("Account created! Logging you in...");
                localStorage.setItem(getBackendStorageKey('beeyield', 'newUser'), 'true');
                onSuccess?.();
            } else {
                toast.error("Signup failed", { description: result.error || 'Please try again' });
            }
        } catch (error: any) {
            toast.error("Signup failed", { description: error.message || 'An error occurred' });
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
        setGoogleLoading(true);
        try {
            localStorage.setItem(getBackendStorageKey('beeyield', 'authReturnTo'), '/beeyield-dashboard');
            localStorage.setItem(getBackendStorageKey('beeyield', 'authBackend'), 'beeyield');
            localStorage.setItem(getBackendStorageKey('beeyield', 'authIntent'), 'signup');
            const redirectTo = buildAuthCallbackUrl({ backend: 'beeyield', returnTo: '/beeyield-dashboard', intent: 'signup' });
            const { error } = await signInWithGoogle(undefined, 'beeyield', { redirectTo });
            if (error) {
                toast.error("Google signup failed", { description: error.message });
            }
        } catch (error: any) {
            toast.error("Google signup failed", { description: error.message });
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Button
                type="button"
                variant="outline"
                className="w-full h-12 bg-white border border-gray-200 hover:border-beeyield-green/50 hover:bg-gray-50 text-gray-600 font-bold rounded-xl transition-all flex items-center justify-center gap-3"
                onClick={handleGoogleSignUp}
                disabled={googleLoading}
            >
                {googleLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-beeyield-green" />
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

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="beeyield-reg-firstName" className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">First Name</Label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            id="beeyield-reg-firstName"
                            name="given-name"
                            autoComplete="given-name"
                            placeholder="John"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="pl-10 h-12 bg-gray-50 border-gray-200 focus:border-beeyield-green focus:ring-beeyield-green/20 rounded-xl font-medium"
                            required
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="beeyield-reg-lastName" className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Last Name</Label>
                    <Input
                        id="beeyield-reg-lastName"
                        name="family-name"
                        autoComplete="family-name"
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="h-12 bg-gray-50 border-gray-200 focus:border-beeyield-green focus:ring-beeyield-green/20 rounded-xl font-medium"
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="beeyield-reg-email" className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Email Address</Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        id="beeyield-reg-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12 bg-gray-50 border-gray-200 focus:border-beeyield-green focus:ring-beeyield-green/20 rounded-xl font-medium"
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="beeyield-reg-password" className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Password</Label>
                    <div className="relative">
                        <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            id="beeyield-reg-password"
                            name="new-password"
                            type="password"
                            autoComplete="new-password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 h-12 bg-gray-50 border-gray-200 focus:border-beeyield-green focus:ring-beeyield-green/20 rounded-xl font-medium"
                            required
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="beeyield-reg-confirm" className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Confirm</Label>
                    <div className="relative">
                        <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            id="beeyield-reg-confirm"
                            name="confirm-password"
                            type="password"
                            autoComplete="new-password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="pl-10 h-12 bg-gray-50 border-gray-200 focus:border-beeyield-green focus:ring-beeyield-green/20 rounded-xl font-medium"
                            required
                        />
                    </div>
                </div>
            </div>

            <Button
                type="submit"
                className="w-full h-12 bg-beeyield-green hover:bg-beeyield-green/90 text-white font-bold rounded-xl shadow-lg shadow-beeyield-green/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                disabled={loading || !email || !password || !firstName || !lastName}
            >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <UserPlus className="w-5 h-5 transition-transform group-hover:scale-110" />}
                Create Professional Account
            </Button>

            {onSwitchToLogin && (
                <p className="text-center text-sm text-gray-500 font-medium pt-2">
                    Already have an account?{' '}
                    <button
                        type="button"
                        onClick={onSwitchToLogin}
                        className="text-beeyield-green font-bold hover:underline"
                    >
                        Log in
                    </button>
                </p>
            )}
        </form>
    );
};

export default BeeYieldRegisterForm;

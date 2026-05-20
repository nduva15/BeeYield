import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2, Mail, Lock as LockIcon, User, UserPlus } from 'lucide-react';
import { buildAuthCallbackUrl, persistAuthRedirectState } from '@/lib/authRedirect';
import { clearBeeYieldPendingOnboarding, getBeeYieldDashboardPath, setBeeYieldPendingOnboarding } from '@/lib/beeyieldOnboarding';
import { completeSignupFlow, getBackendStorageKey } from '@/services/backendAuth';

interface BeeYieldRegisterFormProps {
    onSuccess?: () => void;
    onSwitchToLogin?: () => void;
}

const BeeYieldRegisterForm: React.FC<BeeYieldRegisterFormProps> = ({
    onSuccess,
    onSwitchToLogin,
}) => {
    const { signInWithGoogle } = useAuth();
    const navigate = useNavigate();
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
            toast.error('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        setBeeYieldPendingOnboarding({ step: 'apiary', email });

        try {
            const result = await completeSignupFlow('beeyield', email, password, firstName, lastName, 'professional', {
                beeyield_active: true,
            });

            if (!result.success) {
                clearBeeYieldPendingOnboarding();
                toast.error('Signup failed', { description: result.error || 'Please try again' });
                return;
            }

            localStorage.setItem(getBackendStorageKey('beeyield', 'newUser'), 'true');
            toast.success('Account created');
            onSuccess?.();
            navigate(getBeeYieldDashboardPath('apiary'), { replace: true });
        } catch (error: any) {
            clearBeeYieldPendingOnboarding();
            toast.error('Signup failed', { description: error.message || 'An error occurred' });
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
        setGoogleLoading(true);
        setBeeYieldPendingOnboarding({ step: 'apiary', email });

        try {
            const returnTo = getBeeYieldDashboardPath('apiary');
            const redirectTo = buildAuthCallbackUrl({ backend: 'beeyield', returnTo, intent: 'signup' });
            persistAuthRedirectState({ backend: 'beeyield', returnTo, intent: 'signup' });

            const { error } = await signInWithGoogle({ beeyield_active: true }, 'beeyield', { redirectTo });
            if (error) {
                clearBeeYieldPendingOnboarding();
                toast.error('Google signup failed', { description: error.message });
                setGoogleLoading(false);
            }
        } catch (error: any) {
            clearBeeYieldPendingOnboarding();
            toast.error('Google signup failed', { description: error.message || 'An error occurred' });
            setGoogleLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <Label htmlFor="by-reg-firstName" className="text-[10px] font-bold text-gray-500 ml-1 uppercase tracking-wider">First name</Label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            id="by-reg-firstName"
                            name="given-name"
                            autoComplete="given-name"
                            placeholder="John"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="pl-10 h-10 bg-gray-50 border-gray-200 rounded-xl font-medium text-xs"
                            required
                        />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="by-reg-lastName" className="text-[10px] font-bold text-gray-500 ml-1 uppercase tracking-wider">Last name</Label>
                    <Input
                        id="by-reg-lastName"
                        name="family-name"
                        autoComplete="family-name"
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="h-10 bg-gray-50 border-gray-200 rounded-xl font-medium text-xs"
                        required
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="by-reg-email" className="text-[10px] font-bold text-gray-500 ml-1 uppercase tracking-wider">Email</Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        id="by-reg-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-10 bg-gray-50 border-gray-200 rounded-xl font-medium text-xs"
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <Label htmlFor="by-reg-password" className="text-[10px] font-bold text-gray-500 ml-1 uppercase tracking-wider">Password</Label>
                    <div className="relative">
                        <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            id="by-reg-password"
                            name="new-password"
                            type="password"
                            autoComplete="new-password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 h-10 bg-gray-50 border-gray-200 rounded-xl font-medium text-xs"
                            required
                        />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="by-reg-confirm" className="text-[10px] font-bold text-gray-500 ml-1 uppercase tracking-wider">Confirm</Label>
                    <Input
                        id="by-reg-confirm"
                        name="confirm-password"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Confirm"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-10 bg-gray-50 border-gray-200 rounded-xl font-medium text-xs"
                        required
                    />
                </div>
            </div>

            <Button
                type="submit"
                className="w-full h-10 bg-[#F4D03F] hover:bg-[#F4D03F]/90 text-[#1A1A1A] font-bold text-xs uppercase rounded-xl flex items-center justify-center gap-2"
                disabled={loading}
            >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                Create BeeYield account
            </Button>

            <Button
                type="button"
                variant="outline"
                className="w-full h-10 bg-white border-gray-200 text-gray-600 font-bold text-xs uppercase rounded-xl"
                onClick={handleGoogleSignUp}
                disabled={googleLoading}
            >
                {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Continue with Google'}
            </Button>

            {onSwitchToLogin && (
                <div className="pt-2 text-center">
                    <button
                        type="button"
                        onClick={onSwitchToLogin}
                        className="text-[10px] font-bold text-gray-400 hover:text-[#F4D03F] transition-colors uppercase tracking-tight"
                    >
                        Already have an account? <span className="text-[#F4D03F] ml-1">Sign in</span>
                    </button>
                </div>
            )}
        </form>
    );
};

export default BeeYieldRegisterForm;

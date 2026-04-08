import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2, Mail, Lock as LockIcon, Hexagon, Zap, Activity, LogIn, ShieldCheck } from "lucide-react";
import { cn } from '@/lib/utils';
import { glass } from '@/components/beeyield/GlassTheme';
import { buildAuthCallbackUrl, persistAuthRedirectState } from '@/lib/authRedirect';

interface BeeYieldLoginFormProps {
    onSuccess?: () => void;
    onForgotPassword?: () => void;
    onSwitchToRegister?: () => void;
}

const BeeYieldLoginForm: React.FC<BeeYieldLoginFormProps> = ({
    onSuccess,
    onForgotPassword,
    onSwitchToRegister
}) => {
    const { signIn, signInWithGoogle, verifyMFAChallenge, mfaRequired } = useAuth();
    const [email, setEmail] = useState(() => localStorage.getItem('savedEmail_beeyield') || '');
    const [password, setPassword] = useState('');
    const [mfaCode, setMfaCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [showMFAInput, setShowMFAInput] = useState(false);
    const [rememberMe, setRememberMe] = useState(() => Boolean(localStorage.getItem('savedEmail_beeyield')));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error, mfaRequired: needsMFA } = await signIn(email, password, 'beeyield');

        if (error) {
            toast.error('Sign-in failed', { description: error.message });
        } else if (needsMFA) {
            setShowMFAInput(true);
            toast.info('Two-step verification', { description: 'Enter the 6-digit code from your authenticator app.' });
            if (rememberMe) localStorage.setItem('savedEmail_beeyield', email);
            else localStorage.removeItem('savedEmail_beeyield');
        } else {
            toast.success('Signed in');
            if (rememberMe) localStorage.setItem('savedEmail_beeyield', email);
            else localStorage.removeItem('savedEmail_beeyield');
            onSuccess?.();
        }
        setLoading(false);
    };

    const handleMFAVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await verifyMFAChallenge(mfaCode, 'beeyield');

        if (error) {
            toast.error('Invalid code', { description: error.message });
        } else {
            toast.success('Verified');
            setShowMFAInput(false);
            onSuccess?.();
        }
        setLoading(false);
    };

    const handleGoogleSignIn = async () => {
        setGoogleLoading(true);
        const redirectTo = buildAuthCallbackUrl({ backend: 'beeyield', returnTo: '/beeyield-dashboard' });
        persistAuthRedirectState({ backend: 'beeyield', returnTo: '/beeyield-dashboard' });

        const { error } = await signInWithGoogle({ beeyield_active: true }, 'beeyield', { redirectTo });
        if (error) {
            toast.error('Google sign-in failed', { description: error.message });
            setGoogleLoading(false);
        }
    };

    if (showMFAInput || mfaRequired) {
        return (
            <form onSubmit={handleMFAVerify} className="space-y-5">
                <div className="text-center space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-[#F4D03F]/10 flex items-center justify-center mx-auto mb-3 border border-[#F4D03F]/20">
                        <LockIcon className="h-5 w-5 text-[#F4D03F]" />
                    </div>
                    <h3 className="text-base font-bold text-[#1A1A1A] tracking-tight">Two-step verification</h3>
                    <p className="text-[11px] font-medium text-gray-500 max-w-[200px] mx-auto">
                        Enter the 6-digit code from your authenticator app.
                    </p>
                </div>

                <div className="space-y-1.5">
                    <Input
                        id="by-mfa-code"
                        name="mfa_code"
                        autoComplete="one-time-code"
                        type="text"
                        placeholder="000 000"
                        value={mfaCode}
                        onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="text-center text-xl font-bold h-12 bg-gray-50 border-gray-200 focus:border-[#F4D03F]/50 focus:ring-[#F4D03F]/10 rounded-xl"
                        maxLength={6}
                        required
                        autoFocus
                    />
                </div>

                <Button type="submit" className={cn(glass.btnPrimary, "w-full h-10 font-bold text-xs uppercase shadow-sm")} disabled={loading || mfaCode.length !== 6}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify'}
                </Button>

                <button
                    type="button"
                    onClick={() => {
                        setShowMFAInput(false);
                        setMfaCode('');
                    }}
                    className="w-full text-[10px] font-bold text-gray-400 hover:text-[#1A1A1A] transition-colors py-1"
                >
                    Back to sign in
                </button>
            </form>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-3.5">
                <div className="space-y-1.5">
                    <Label htmlFor="by-email" className="text-[10px] font-bold text-gray-500 ml-1 uppercase tracking-wider">Email</Label>
                    <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 transition-colors group-focus-within:text-[#F4D03F]" />
                        <Input
                            id="by-email"
                            name="email"
                            type="email"
                            placeholder="name@beeyield.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10 h-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-[#F4D03F]/50 focus:ring-[#F4D03F]/10 rounded-xl font-medium text-xs transition-all"
                            required
                            autoComplete="username"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <div className="flex items-center justify-between ml-1">
                        <Label htmlFor="by-password" className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Password</Label>
                        {onForgotPassword && (
                            <button
                                type="button"
                                onClick={onForgotPassword}
                                className="text-[10px] font-bold text-[#F4D03F] hover:underline uppercase tracking-tight"
                            >
                                Forgot?
                            </button>
                        )}
                    </div>
                    <div className="relative group">
                        <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 transition-colors group-focus-within:text-[#F4D03F]" />
                        <Input
                            id="by-password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 h-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-[#F4D03F]/50 focus:ring-[#F4D03F]/10 rounded-xl font-medium text-xs transition-all"
                            required
                            autoComplete="current-password"
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-2 ml-1">
                    <Checkbox
                        id="by-remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked === true)}
                        className="rounded-md border-gray-200 data-[state=checked]:bg-[#1B9157] data-[state=checked]:border-[#1B9157]"
                    />
                    <label
                        htmlFor="by-remember"
                        className="text-[10px] font-bold text-gray-400 cursor-pointer hover:text-gray-900 transition-colors uppercase tracking-tight"
                    >
                        Remember me
                    </label>
                </div>
            </div>

            <Button
                type="submit"
                className={cn(glass.btnPrimary, "w-full h-10 font-bold text-xs uppercase shadow-sm flex items-center justify-center gap-2")}
                disabled={loading}
            >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                Sign in
            </Button>

            <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-100" />
                </div>
                <div className="relative flex justify-center text-[9px] font-bold">
                    <span className="bg-white px-3 text-gray-300">or</span>
                </div>
            </div>

            <Button
                type="button"
                variant="outline"
                className={cn(glass.btnSecondary, "w-full h-10 bg-white border-gray-200 hover:border-[#F4D03F]/50 hover:bg-gray-50 text-gray-600 font-bold text-xs uppercase rounded-xl transition-all flex items-center justify-center gap-2.5")}
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
            >
                {googleLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-[#F4D03F]" />
                ) : (
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                        />
                    </svg>
                )}
                Continue with Google
            </Button>
            
            {onSwitchToRegister && (
               <div className="pt-2 text-center">
                   <button 
                        type="button" 
                        onClick={onSwitchToRegister}
                        className="text-[10px] font-bold text-gray-400 hover:text-[#F4D03F] transition-colors uppercase tracking-tight"
                    >
                        New here? <span className="text-[#F4D03F] ml-1">Create an account</span>
                    </button>
               </div>
            )}
        </form>
    );
};

export default BeeYieldLoginForm;


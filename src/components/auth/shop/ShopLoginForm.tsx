import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, ArrowRight } from 'lucide-react';

interface ShopLoginFormProps {
    onSuccess?: () => void;
    onForgotPassword?: () => void;
    onSwitchToRegister?: () => void;
}

const ShopLoginForm: React.FC<ShopLoginFormProps> = ({
    onSuccess,
    onForgotPassword,
    onSwitchToRegister
}) => {
    const { signIn, signInWithGoogle, verifyMFAChallenge, mfaRequired } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mfaCode, setMfaCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [showMFAInput, setShowMFAInput] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('savedEmail_shop');
        if (saved) {
            setEmail(saved);
            setRememberMe(true);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error, mfaRequired: needsMFA } = await signIn(email, password, 'shop');

        if (error) {
            toast.error('Login Failed', { description: error.message });
        } else if (needsMFA) {
            setShowMFAInput(true);
            toast.info('Security Code Required', { description: 'Please enter the code from your authenticator app.' });
            if (rememberMe) localStorage.setItem('savedEmail_shop', email);
            else localStorage.removeItem('savedEmail_shop');
        } else {
            toast.success('Welcome back to the hive! 🍯');
            if (rememberMe) localStorage.setItem('savedEmail_shop', email);
            else localStorage.removeItem('savedEmail_shop');
            onSuccess?.();
        }
        setLoading(false);
    };

    const handleMFAVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await verifyMFAChallenge(mfaCode, 'shop');

        if (error) {
            toast.error('Verification Failed', { description: error.message });
        } else {
            toast.success('Identity Verified! 🍯');
            setShowMFAInput(false);
            onSuccess?.();
        }
        setLoading(false);
    };

    const handleGoogleSignIn = async () => {
        setGoogleLoading(true);
        localStorage.setItem('authReturnTo', '/shop-dashboard');
        localStorage.setItem('authBackend', 'shop');

        const { error } = await signInWithGoogle(undefined, 'shop');
        if (error) {
            toast.error('Google login failed', { description: error.message });
            setGoogleLoading(false);
        }
    };

    if (showMFAInput || mfaRequired) {
        return (
            <form onSubmit={handleMFAVerify} className="space-y-6">
                <div className="text-center space-y-2">
                    <div className="w-16 h-16 rounded-[2rem] bg-beeyield-gold/10 flex items-center justify-center mx-auto border border-beeyield-gold/20">
                        <Lock className="h-8 w-8 text-beeyield-gold" />
                    </div>
                    <h3 className="text-xl font-black text-beeyield-green uppercase tracking-tighter">Secure Access</h3>
                    <p className="text-xs font-medium text-beeyield-green/60 uppercase tracking-widest">
                        Verify your identity
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="shop-mfa-code" className="text-beeyield-green font-bold text-[10px] uppercase tracking-widest">Authenticator Code</Label>
                    <Input
                        id="shop-mfa-code"
                        type="text"
                        placeholder="000000"
                        value={mfaCode}
                        onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="text-center text-2xl tracking-[0.5em] font-mono h-16 border-beeyield-green/10 focus:border-beeyield-gold focus:ring-beeyield-gold/10 rounded-2xl"
                        maxLength={6}
                        required
                        autoFocus
                    />
                </div>

                <Button type="submit" className="w-full h-14 bg-beeyield-green text-white font-black uppercase tracking-widest rounded-2xl shadow-glow transition-all" disabled={loading || mfaCode.length !== 6}>
                    {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        'Verify & Continue'
                    )}
                </Button>

                <button
                    type="button"
                    onClick={() => {
                        setShowMFAInput(false);
                        setMfaCode('');
                    }}
                    className="w-full text-[10px] font-black uppercase tracking-widest text-beeyield-green/40 hover:text-beeyield-gold transition-colors"
                >
                    ← Back to login
                </button>
            </form>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <Button
                type="button"
                variant="outline"
                className="w-full h-12 border-2 border-beeyield-gold/20 hover:bg-beeyield-cream hover:border-beeyield-gold/40 transition-all text-beeyield-green font-bold"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
            >
                {googleLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-beeyield-gold" />
                ) : (
                    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1c-4.3 0-8.1 2.5-9.8 6.1l3.6 2.8c.9-2.6 3.3-4.5 6.2-4.5z" />
                    </svg>
                )}
                Continue with Google
            </Button>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-beeyield-gold/10" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
                    <span className="bg-white px-4 text-beeyield-green/40">Or Shop Account</span>
                </div>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="shop-email" className="text-beeyield-green font-bold text-xs uppercase tracking-wider">Email Address</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-beeyield-green/30" />
                        <Input
                            id="shop-email"
                            type="email"
                            placeholder="honey_lover@gmail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10 h-12 border-beeyield-green/10 focus:border-beeyield-gold focus:ring-beeyield-gold/10 rounded-xl"
                            required
                            autoComplete="username"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="shop-password" className="text-beeyield-green font-bold text-xs uppercase tracking-wider">Password</Label>
                        {onForgotPassword && (
                            <button
                                type="button"
                                onClick={onForgotPassword}
                                className="text-[10px] font-bold text-beeyield-gold hover:underline"
                            >
                                Forgot?
                            </button>
                        )}
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-beeyield-green/30" />
                        <Input
                            id="shop-password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 h-12 border-beeyield-green/10 focus:border-beeyield-gold focus:ring-beeyield-gold/10 rounded-xl"
                            required
                            autoComplete="current-password"
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="shop-remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked === true)}
                    />
                    <label
                        htmlFor="shop-remember"
                        className="text-xs font-bold text-beeyield-green/80 cursor-pointer"
                    >
                        Remember Me
                    </label>
                </div>
            </div>

            <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-beeyield-gold to-beeyield-orange text-white font-black uppercase tracking-widest rounded-xl shadow-premium hover:shadow-glow transition-all"
                disabled={loading}
            >
                {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <div className="flex items-center gap-2">
                        Enter Shop <ArrowRight className="w-4 h-4" />
                    </div>
                )}
            </Button>

            {onSwitchToRegister && (
                <p className="text-center text-sm text-beeyield-green/60">
                    New here?{' '}
                    <button
                        type="button"
                        onClick={onSwitchToRegister}
                        className="text-beeyield-gold font-black hover:underline"
                    >
                        Create Shop Account
                    </button>
                </p>
            )}
        </form>
    );
};

export default ShopLoginForm;

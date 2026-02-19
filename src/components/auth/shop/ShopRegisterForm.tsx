import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, User, Sparkles } from 'lucide-react';

interface ShopRegisterFormProps {
    onSuccess?: () => void;
    onSwitchToLogin?: () => void;
}

const ShopRegisterForm: React.FC<ShopRegisterFormProps> = ({
    onSuccess,
    onSwitchToLogin
}) => {
    const { signUp, signInWithGoogle } = useAuth();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (password !== confirmPassword) {
            toast.error("Cloud-sync mismatch: Passwords do not match.");
            setLoading(false);
            return;
        }

        const { data: signupData, error } = await signUp(email, password, {
            first_name: firstName,
            last_name: lastName,
            role: 'user'
        }, 'shop');

        if (error) {
            toast.error("Honey, we have a problem", { description: error.message });
        } else {
            // Auto-provision profile
            const { supabaseShop } = await import('@/lib/supabase');
            if (supabaseShop && signupData?.user) {
                await supabaseShop.from('shop_profiles').upsert({
                    id: signupData.user.id,
                    email: signupData.user.email,
                    full_name: `${firstName} ${lastName}`.trim(),
                    first_name: firstName,
                    last_name: lastName,
                    updated_at: new Date().toISOString()
                });
            }

            toast.success("Welcome to the Hive! 🐝 Please check your email for a sweet confirmation link.");
            onSuccess?.();
        }
        setLoading(false);
    };

    const handleGoogleSignUp = async () => {
        setGoogleLoading(true);
        localStorage.setItem('authReturnTo', '/shop-dashboard');
        localStorage.setItem('authBackend', 'shop');
        const { error } = await signInWithGoogle(undefined, 'shop');
        if (error) {
            toast.error("Google sign up failed", { description: error.message });
            setGoogleLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <Button
                type="button"
                variant="outline"
                className="w-full h-12 border-2 border-beeyield-gold/20 hover:bg-beeyield-cream hover:border-beeyield-gold/40 transition-all text-beeyield-green font-bold"
                onClick={handleGoogleSignUp}
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
                Quick SignUp with Google
            </Button>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-beeyield-gold/10" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
                    <span className="bg-white px-4 text-beeyield-green/40">Or Email Registration</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="shop-reg-firstName" className="text-beeyield-green font-bold text-xs">First Name</Label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-beeyield-green/30" />
                        <Input
                            id="shop-reg-firstName"
                            placeholder="John"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="pl-10 h-12 border-beeyield-green/10 focus:border-beeyield-gold focus:ring-beeyield-gold/10 rounded-xl"
                            required
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="shop-reg-lastName" className="text-beeyield-green font-bold text-xs">Last Name</Label>
                    <Input
                        id="shop-reg-lastName"
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="h-12 border-beeyield-green/10 focus:border-beeyield-gold focus:ring-beeyield-gold/10 rounded-xl"
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="shop-reg-email" className="text-beeyield-green font-bold text-xs">Email</Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-beeyield-green/30" />
                    <Input
                        id="shop-reg-email"
                        type="email"
                        placeholder="honey@hive.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12 border-beeyield-green/10 focus:border-beeyield-gold focus:ring-beeyield-gold/10 rounded-xl"
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="shop-reg-password" className="text-beeyield-green font-bold text-xs">Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-beeyield-green/30" />
                        <Input
                            id="shop-reg-password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 h-12 border-beeyield-green/10 focus:border-beeyield-gold focus:ring-beeyield-gold/10 rounded-xl"
                            required
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="shop-reg-confirm" className="text-beeyield-green font-bold text-xs">Confirm</Label>
                    <Input
                        id="shop-reg-confirm"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-12 border-beeyield-green/10 focus:border-beeyield-gold focus:ring-beeyield-gold/10 rounded-xl"
                        required
                    />
                </div>
            </div>

            <Button
                type="submit"
                className="w-full h-12 bg-beeyield-green hover:bg-beeyield-green-dark text-white font-black uppercase tracking-widest rounded-xl shadow-premium hover:shadow-glow transition-all active:scale-95"
                disabled={loading}
            >
                {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" /> Create My Account
                    </div>
                )}
            </Button>

            {onSwitchToLogin && (
                <p className="text-center text-sm text-beeyield-green/60">
                    Already a member?{' '}
                    <button
                        type="button"
                        onClick={onSwitchToLogin}
                        className="text-beeyield-gold font-black hover:underline"
                    >
                        Sign In
                    </button>
                </p>
            )}
        </form>
    );
};

export default ShopRegisterForm;

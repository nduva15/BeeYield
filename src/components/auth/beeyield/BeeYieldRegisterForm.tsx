import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, User, ShieldCheck, Database, ArrowRight, Zap } from 'lucide-react';

interface BeeYieldRegisterFormProps {
    onSuccess?: () => void;
    onSwitchToLogin?: () => void;
}

const BeeYieldRegisterForm: React.FC<BeeYieldRegisterFormProps> = ({
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
            toast.error("Passwords mismatch.");
            setLoading(false);
            return;
        }

        const { data: signupData, error } = await signUp(email, password, {
            first_name: firstName,
            last_name: lastName,
            role: 'professional',
            beeyield_active: true
        }, 'beeyield');

        if (error) {
            toast.error("Registry error", { description: error.message });
        } else {
            const { supabaseBeeYield } = await import('@/lib/supabase');
            if (supabaseBeeYield && signupData?.user) {
                await supabaseBeeYield.from('beeyield_profiles').upsert({
                    id: signupData.user.id,
                    email: signupData.user.email,
                    full_name: `${firstName} ${lastName}`.trim(),
                    is_professional: true,
                    updated_at: new Date().toISOString()
                });
            }

            toast.success("Identity registered. Check email.");
            onSuccess?.();
        }
        setLoading(false);
    };

    const handleGoogleSignUp = async () => {
        setGoogleLoading(true);
        localStorage.setItem('authReturnTo', '/beeyield-dashboard');
        localStorage.setItem('authBackend', 'beeyield');
        const { error } = await signInWithGoogle({ beeyield_active: true }, 'beeyield');
        if (error) {
            toast.error("Sinc error", { description: error.message });
            setGoogleLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 border-2 border-[#064e3b]">
            <button
                type="button"
                onClick={handleGoogleSignUp}
                disabled={googleLoading}
                className="w-full h-14 bg-white border-2 border-[#064e3b] text-[#064e3b] font-black text-xs uppercase tracking-widest hover:bg-[#facc15] transition-all flex items-center justify-center gap-3"
            >
                {googleLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <ShieldCheck className="h-4 w-4" />
                )}
                Register with Google
            </button>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t-2 border-[#064e3b]/10" />
                </div>
                <div className="relative flex justify-center text-[10px] font-black tracking-[0.3em] uppercase">
                    <span className="bg-white px-6 text-[#064e3b]">Manual Input</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label className="text-[#064e3b] font-black text-[10px] uppercase tracking-widest">Given Name</Label>
                    <input
                        placeholder="INPUT FIRST"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full h-12 bg-white border-2 border-[#064e3b] focus:bg-[#facc15]/10 outline-none px-4 text-[#064e3b] font-bold text-xs uppercase placeholder:opacity-20"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-[#064e3b] font-black text-[10px] uppercase tracking-widest">Family Name</Label>
                    <input
                        placeholder="INPUT LAST"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full h-12 bg-white border-2 border-[#064e3b] focus:bg-[#facc15]/10 outline-none px-4 text-[#064e3b] font-bold text-xs uppercase placeholder:opacity-20"
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-[#064e3b] font-black text-[10px] uppercase tracking-widest">Network Email</Label>
                <input
                    type="email"
                    placeholder="E.G. USER@BEEYIELD.COM"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 bg-white border-2 border-[#064e3b] focus:bg-[#facc15]/10 outline-none px-4 text-[#064e3b] font-bold text-xs uppercase placeholder:opacity-20"
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label className="text-[#064e3b] font-black text-[10px] uppercase tracking-widest">Access Key</Label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full h-12 bg-white border-2 border-[#064e3b] focus:bg-[#facc15]/10 outline-none px-4 text-[#064e3b] font-bold text-xs uppercase"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-[#064e3b] font-black text-[10px] uppercase tracking-widest">Confirm Key</Label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full h-12 bg-white border-2 border-[#064e3b] focus:bg-[#facc15]/10 outline-none px-4 text-[#064e3b] font-bold text-xs uppercase"
                        required
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-[#10b981] border-2 border-[#064e3b] text-white font-black uppercase text-xs tracking-widest hover:bg-black hover:text-[#10b981] transition-all shadow-[6px_6px_0px_0px_rgba(6,78,59,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
            >
                <div className="flex items-center justify-center gap-3">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="w-4 h-4" />}
                    Initialize Account
                </div>
            </button>

            {onSwitchToLogin && (
                <p className="text-center text-[10px] font-black text-[#064e3b] uppercase tracking-widest pt-4">
                    Existing User?{' '}
                    <button
                        type="button"
                        onClick={onSwitchToLogin}
                        className="underline decoration-2 decoration-[#facc15] underline-offset-4 hover:text-[#10b981]"
                    >
                        Login Path
                    </button>
                </p>
            )}
        </form>
    );
};

export default BeeYieldRegisterForm;

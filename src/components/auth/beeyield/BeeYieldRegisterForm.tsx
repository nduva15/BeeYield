import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, User, ShieldCheck, Database } from 'lucide-react';

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
            toast.error("Encryption keys do not match. System abort.");
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
            toast.error("Node Provisioning Failed", { description: error.message });
        } else {
            // Auto-provision profile
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

            toast.success("System Node Initialized. Verify your identity via the secure link sent to your terminal.");
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
            toast.error("Cloud Node Sync Failed", { description: error.message });
            setGoogleLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Button
                type="button"
                variant="outline"
                className="w-full h-14 bg-[#0a0a0a] border border-white/10 hover:border-beeyield-gold/50 text-white/70 hover:text-white transition-all font-mono text-[10px] tracking-widest uppercase"
                onClick={handleGoogleSignUp}
                disabled={googleLoading}
            >
                {googleLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-beeyield-gold" />
                ) : (
                    <ShieldCheck className="mr-2 h-4 w-4 text-beeyield-gold" />
                )}
                Fast-Provision via Google
            </Button>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/5" />
                </div>
                <div className="relative flex justify-center text-[8px] uppercase font-bold tracking-[0.4em]">
                    <span className="bg-[#050505] px-4 text-white/20 italic">Manual Calibration</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="by-reg-firstName" className="text-white/40 font-bold text-[8px] uppercase tracking-widest pl-1">Primary Nom de Guerre</Label>
                    <div className="relative group">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/10 group-focus-within:text-beeyield-gold transition-colors" />
                        <Input
                            id="by-reg-firstName"
                            placeholder="OPERATOR_1"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="pl-10 h-14 bg-[#0a0a0a] border-white/5 focus:border-beeyield-gold/50 focus:ring-0 text-white font-mono text-xs rounded-none uppercase"
                            required
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="by-reg-lastName" className="text-white/40 font-bold text-[8px] uppercase tracking-widest pl-1">Secondary Tag</Label>
                    <Input
                        id="by-reg-lastName"
                        placeholder="SIGMA"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="h-14 bg-[#0a0a0a] border-white/5 focus:border-beeyield-gold/50 focus:ring-0 text-white font-mono text-xs rounded-none uppercase"
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="by-reg-email" className="text-white/40 font-bold text-[8px] uppercase tracking-widest pl-1">Secure Comms (Email)</Label>
                <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/10 group-focus-within:text-beeyield-gold transition-colors" />
                    <Input
                        id="by-reg-email"
                        type="email"
                        placeholder="ops@beeyield.agro"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-14 bg-[#0a0a0a] border-white/5 focus:border-beeyield-gold/50 focus:ring-0 text-white font-mono text-xs rounded-none"
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="by-reg-password" className="text-white/40 font-bold text-[8px] uppercase tracking-widest pl-1">Encryption Key</Label>
                    <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/10 group-focus-within:text-beeyield-gold transition-colors" />
                        <Input
                            id="by-reg-password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 h-14 bg-[#0a0a0a] border-white/5 focus:border-beeyield-gold/50 focus:ring-0 text-white font-mono text-xs rounded-none"
                            required
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="by-reg-confirm" className="text-white/40 font-bold text-[8px] uppercase tracking-widest pl-1">Verify Key</Label>
                    <Input
                        id="by-reg-confirm"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-14 bg-[#0a0a0a] border-white/5 focus:border-beeyield-gold/50 focus:ring-0 text-white font-mono text-xs rounded-none"
                        required
                    />
                </div>
            </div>

            <Button
                type="submit"
                className="w-full h-14 bg-beeyield-gold text-beeyield-black font-black uppercase tracking-[0.3em] text-[11px] rounded-none shadow-premium hover:shadow-glow-gold transition-all"
                disabled={loading}
            >
                <div className="flex items-center gap-2">
                    <Database className="w-4 h-4" /> Deploy Node
                </div>
            </Button>

            {onSwitchToLogin && (
                <p className="text-center text-[10px] font-bold text-white/30 uppercase tracking-widest">
                    Already operational?{' '}
                    <button
                        type="button"
                        onClick={onSwitchToLogin}
                        className="text-beeyield-gold hover:underline"
                    >
                        Secure Access
                    </button>
                </p>
            )}
        </form>
    );
};

export default BeeYieldRegisterForm;

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, Hexagon, Cpu, Zap, Activity } from 'lucide-react';

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
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mfaCode, setMfaCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [showMFAInput, setShowMFAInput] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error, mfaRequired: needsMFA } = await signIn(email, password, 'beeyield');

        if (error) {
            toast.error('System Access Denied', { description: error.message });
        } else if (needsMFA) {
            setShowMFAInput(true);
            toast.info('Layer 2 Verification Required', { description: 'Provide the secondary authentication token.' });
        } else {
            toast.success('BeeYield Analytics Online. Welcome.');
            onSuccess?.();
        }
        setLoading(false);
    };

    const handleMFAVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await verifyMFAChallenge(mfaCode, 'beeyield');

        if (error) {
            toast.error('Token Mismatch', { description: error.message });
        } else {
            toast.success('Satellite Link Verified. Interface Decrypted.');
            setShowMFAInput(false);
            onSuccess?.();
        }
        setLoading(false);
    };

    const handleGoogleSignIn = async () => {
        setGoogleLoading(true);
        localStorage.setItem('authReturnTo', '/beeyield-dashboard');
        localStorage.setItem('authBackend', 'beeyield');

        const { error } = await signInWithGoogle({ beeyield_active: true }, 'beeyield');
        if (error) {
            toast.error('Cloud Sync Failed', { description: error.message });
            setGoogleLoading(false);
        }
    };

    if (showMFAInput || mfaRequired) {
        return (
            <form onSubmit={handleMFAVerify} className="space-y-8">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-none bg-beeyield-gold/5 flex items-center justify-center mx-auto border border-beeyield-gold/20 relative">
                        <Lock className="h-6 w-6 text-beeyield-gold" />
                        <div className="absolute inset-0 border border-beeyield-gold/10 scale-125 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.4em]">Multifactor Token</h3>
                        <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest leading-loose">
                            Waiting for Layer 2 Decryption Code
                        </p>
                    </div>
                </div>

                <div className="space-y-3">
                    <Label htmlFor="by-mfa-code" className="text-white/20 font-bold text-[8px] uppercase tracking-[0.3em] pl-1">Input Sequence</Label>
                    <Input
                        id="by-mfa-code"
                        type="text"
                        placeholder="000000"
                        value={mfaCode}
                        onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="text-center text-3xl tracking-[0.6em] font-mono h-20 bg-[#0a0a0a] border-white/5 focus:border-beeyield-gold/50 focus:ring-0 text-white rounded-none"
                        maxLength={6}
                        required
                        autoFocus
                    />
                </div>

                <Button type="submit" className="w-full h-16 bg-beeyield-green text-white font-black uppercase tracking-[0.4em] text-[10px] rounded-none group relative" disabled={loading || mfaCode.length !== 6}>
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        'Authenticate Token'
                    )}
                </Button>

                <button
                    type="button"
                    onClick={() => {
                        setShowMFAInput(false);
                        setMfaCode('');
                    }}
                    className="w-full text-[8px] font-black uppercase tracking-[0.4em] text-white/20 hover:text-white transition-colors"
                >
                    &lt; Back to Credential Entry &gt;
                </button>
            </form>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Button
                type="button"
                variant="outline"
                className="w-full h-14 bg-[#0a0a0a] border border-white/10 hover:border-beeyield-gold/50 text-white/70 hover:text-white transition-all font-mono text-[10px] tracking-widest uppercase"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
            >
                {googleLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-beeyield-gold" />
                ) : (
                    <Hexagon className="mr-2 h-4 w-4 text-beeyield-gold" />
                )}
                Sync with Professional Cloud
            </Button>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/5" />
                </div>
                <div className="relative flex justify-center text-[8px] uppercase font-bold tracking-[0.4em]">
                    <span className="bg-[#050505] px-4 text-white/20 italic">Node Credentials</span>
                </div>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="by-email" className="text-white/40 font-bold text-[8px] uppercase tracking-widest pl-1">Professional Identity</Label>
                    <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/10 group-focus-within:text-beeyield-gold transition-colors" />
                        <Input
                            id="by-email"
                            type="email"
                            placeholder="node_id@beeyield.agro"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10 h-14 bg-[#0a0a0a] border-white/5 focus:border-beeyield-gold/50 focus:ring-0 text-white font-mono text-xs rounded-none"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between pl-1">
                        <Label htmlFor="by-password" className="text-white/40 font-bold text-[8px] uppercase tracking-widest">Access Key</Label>
                        {onForgotPassword && (
                            <button
                                type="button"
                                onClick={onForgotPassword}
                                className="text-[8px] font-bold text-beeyield-gold/40 hover:text-beeyield-gold uppercase tracking-widest"
                            >
                                Recover
                            </button>
                        )}
                    </div>
                    <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/10 group-focus-within:text-beeyield-gold transition-colors" />
                        <Input
                            id="by-password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 h-14 bg-[#0a0a0a] border-white/5 focus:border-beeyield-gold/50 focus:ring-0 text-white font-mono text-xs rounded-none"
                            required
                        />
                    </div>
                </div>
            </div>

            <Button
                type="submit"
                className="w-full h-14 bg-beeyield-green text-white font-black uppercase tracking-[0.3em] text-[11px] rounded-none shadow-premium hover:shadow-glow-green transition-all relative group"
                disabled={loading}
            >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative z-10 flex items-center gap-3">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                    Initialize Interface
                </span>
            </Button>

            {onSwitchToRegister && (
                <div className="flex flex-col items-center gap-4 pt-2">
                    <button
                        type="button"
                        onClick={onSwitchToRegister}
                        className="text-[10px] font-bold text-white/30 hover:text-white transition-colors tracking-widest uppercase"
                    >
                        Register New Hardware Node
                    </button>

                    <div className="flex gap-4 opacity-5">
                        <Cpu className="w-3 h-3 text-white" />
                        <Zap className="w-3 h-3 text-white" />
                    </div>
                </div>
            )}
        </form>
    );
};

export default BeeYieldLoginForm;

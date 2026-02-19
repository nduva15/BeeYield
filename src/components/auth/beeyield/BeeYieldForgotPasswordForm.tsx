import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2, Mail, ArrowLeft, CheckCircle, Activity, ShieldCheck } from 'lucide-react';

interface BeeYieldForgotPasswordFormProps {
    onBackToLogin: () => void;
}

const BeeYieldForgotPasswordForm: React.FC<BeeYieldForgotPasswordFormProps> = ({
    onBackToLogin
}) => {
    const { resetPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await resetPassword(email, 'beeyield');

        if (error) {
            toast.error('Protocol Failure', { description: error.message });
        } else {
            setEmailSent(true);
            toast.success('Encryption Link Transmitted.');
        }
        setLoading(false);
    };

    if (emailSent) {
        return (
            <div className="space-y-8 text-center">
                <div className="w-20 h-20 rounded-none bg-beeyield-green/5 flex items-center justify-center mx-auto border border-beeyield-green/20 relative">
                    <ShieldCheck className="h-10 w-10 text-beeyield-green" />
                    <div className="absolute inset-0 border border-beeyield-green/10 scale-125 animate-pulse" />
                </div>
                <div className="space-y-3">
                    <h3 className="text-sm font-black text-white uppercase tracking-[0.4em]">Signal Transmitted</h3>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] leading-relaxed max-w-xs mx-auto">
                        Check your secure comms (<span className="text-beeyield-green">{email}</span>) for the Layer 1 reset protocol.
                    </p>
                </div>
                <Button
                    variant="outline"
                    className="w-full h-14 bg-transparent border-white/10 text-white/50 hover:text-white font-mono text-[10px] tracking-widest uppercase rounded-none"
                    onClick={onBackToLogin}
                >
                    &lt; RETURN TO PORTAL &gt;
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-none bg-beeyield-gold/5 flex items-center justify-center mx-auto border border-beeyield-gold/20">
                    <Activity className="h-6 w-6 text-beeyield-gold" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-sm font-black text-white uppercase tracking-[0.4em]">Credential Recovery</h3>
                    <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest leading-loose">
                        Initiate secure identity reset protocol
                    </p>
                </div>
            </div>

            <div className="space-y-3">
                <Label htmlFor="by-reset-email" className="text-white/20 font-bold text-[8px] uppercase tracking-[0.3em] pl-1">Target Identity</Label>
                <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/10 group-focus-within:text-beeyield-gold transition-colors" />
                    <Input
                        id="by-reset-email"
                        type="email"
                        placeholder="node_id@beeyield.agro"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-16 bg-[#0a0a0a] border-white/5 focus:border-beeyield-gold/50 focus:ring-0 text-white font-mono text-xs rounded-none"
                        required
                        autoFocus
                    />
                </div>
            </div>

            <Button
                type="submit"
                className="w-full h-16 bg-beeyield-green text-white font-black uppercase tracking-[0.4em] text-[10px] rounded-none group relative"
                disabled={loading}
            >
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Transmit Reset Key'}
            </Button>

            <button
                type="button"
                onClick={onBackToLogin}
                className="w-full text-[8px] font-black uppercase tracking-[0.4em] text-white/20 hover:text-white transition-colors"
            >
                &lt; ABORT RECOVERY &gt;
            </button>
        </form>
    );
};

export default BeeYieldForgotPasswordForm;

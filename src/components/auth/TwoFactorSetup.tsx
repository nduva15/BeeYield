import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2, Shield, ShieldCheck, Copy, Check, RefreshCw } from 'lucide-react';
import { Factor } from '@supabase/supabase-js';
import { cn } from '@/lib/utils';
import { glass } from '@/components/beeyield/GlassTheme';
import { motion, AnimatePresence } from 'framer-motion';

interface TwoFactorSetupProps {
    onComplete?: () => void;
}

const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({ onComplete }) => {
    const { enrollMFA, verifyMFAEnrollment, unenrollMFA, getMFAFactors, user } = useAuth();

    const [loading, setLoading] = useState(false);
    const [enrolling, setEnrolling] = useState(false);
    const [factors, setFactors] = useState<Factor[]>([]);
    const [enrollmentData, setEnrollmentData] = useState<{
        id: string;
        qr_code: string;
        secret: string;
    } | null>(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [copied, setCopied] = useState(false);

    const loadFactors = useCallback(async () => {
        setLoading(true);
        const { factors: loadedFactors } = await getMFAFactors();
        setFactors(loadedFactors);
        setLoading(false);
    }, [getMFAFactors]);

    const handleEnroll = async () => {
        setEnrolling(true);
        const { data, error } = await enrollMFA();

        if (error) {
            toast.error('Error starting setup', { description: error.message });
            setEnrolling(false);
            return;
        }

        if (data) {
            setEnrollmentData({
                id: data.id,
                qr_code: data.totp.qr_code,
                secret: data.totp.secret,
            });
        }
        setEnrolling(false);
    };

    const handleVerifyEnrollment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!enrollmentData) return;

        setLoading(true);
        const { error } = await verifyMFAEnrollment(enrollmentData.id, verificationCode);

        if (error) {
            toast.error('Code verification failed', { description: error.message });
        } else {
            toast.success('Security enabled!');
            setEnrollmentData(null);
            setVerificationCode('');
            await loadFactors();
            onComplete?.();
        }
        setLoading(false);
    };

    const handleUnenroll = async (factorId: string) => {
        setLoading(true);
        const { error } = await unenrollMFA(factorId);

        if (error) {
            toast.error('Error disabling security', { description: error.message });
        } else {
            toast.success('Security disabled');
            await loadFactors();
        }
        setLoading(false);
    };

    const copySecret = () => {
        if (enrollmentData?.secret) {
            navigator.clipboard.writeText(enrollmentData.secret);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast.success('Secret key copied');
        }
    };

    if (!user) {
        return (
            <div className="p-8 text-center bg-white rounded-xl border border-gray-100 shadow-sm">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Authentication Required</p>
                <p className="text-[11px] text-gray-400 mt-1 font-medium leading-relaxed">Please sign in to manage security settings.</p>
            </div>
        );
    }

    if (loading && factors.length === 0) {
        return (
            <div className="p-12 flex flex-col items-center justify-center bg-white rounded-xl border border-gray-100 shadow-sm space-y-3">
                <Loader2 className="h-6 w-6 animate-spin text-[#F4D03F] opacity-50" />
                <span className="text-[10px] font-bold text-gray-400">Hydrating Security Kernel...</span>
            </div>
        );
    }

    const hasMFA = factors.length > 0;

    return (
        <AnimatePresence mode="wait">
            {enrollmentData ? (
                <motion.div
                    key="enroll"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={cn(glass.card, "bg-white p-0 overflow-hidden shadow-sm")}
                >
                    <CardHeader className="p-6 pb-4 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-gray-200 shadow-sm">
                                <Shield className="h-5 w-5 text-[#F4D03F]" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-bold text-[#1A1A1A] tracking-tight">Extra Security Setup</CardTitle>
                                <CardDescription className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">Scan QR with Authenticator App</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="flex justify-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                                <img
                                    src={enrollmentData.qr_code}
                                    alt="QR Code"
                                    className="w-32 h-32"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between px-1">
                                <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Manual Entry Key</Label>
                                <button onClick={copySecret} className="text-[10px] font-bold text-[#F4D03F] uppercase tracking-wider hover:underline flex items-center gap-1">
                                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                    {copied ? 'Copied' : 'Copy'}
                                </button>
                            </div>
                            <div className="px-4 py-2.5 bg-gray-50 rounded-lg border border-gray-100 font-mono text-[10px] text-gray-600 break-all select-all text-center">
                                {enrollmentData.secret}
                            </div>
                        </div>

                        <form onSubmit={handleVerifyEnrollment} className="space-y-4">
                            <div className="space-y-1.5 text-center">
                                <Label htmlFor="verify-code" className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                    Identity Verification Code
                                </Label>
                                <Input
                                    id="verify-code"
                                    placeholder="000 000"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="h-12 text-center text-2xl font-bold bg-gray-50 border-gray-100 focus:bg-white focus:border-[#F4D03F] rounded-xl"
                                    maxLength={6}
                                    required
                                />
                            </div>

                            <div className="flex gap-2.5">
                                <button
                                    type="button"
                                    className={cn(glass.btnSecondary, "flex-1 h-10")}
                                    onClick={() => {
                                        setEnrollmentData(null);
                                        setVerificationCode('');
                                    }}
                                >
                                    Abort
                                </button>
                                <button
                                    type="submit"
                                    className={cn(glass.btnPrimary, "flex-1 h-10")}
                                    disabled={loading || verificationCode.length !== 6}
                                >
                                    {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Confirm'}
                                </button>
                            </div>
                        </form>
                    </CardContent>
                </motion.div>
            ) : (
                <motion.div
                    key="status"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={cn(glass.card, "bg-white p-0 overflow-hidden shadow-sm")}
                >
                    <CardHeader className="p-6 pb-4 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex items-center gap-3">
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm transition-colors bg-white", hasMFA ? "border-[#1B9157]/20" : "border-[#F4D03F]/20")}>
                                {hasMFA ? <ShieldCheck className="h-5 w-5 text-[#1B9157]" /> : <Shield className="h-5 w-5 text-[#F4D03F]" />}
                            </div>
                            <div>
                                <CardTitle className="text-lg font-bold text-[#1A1A1A] tracking-tight">Extra Security (MFA)</CardTitle>
                                <CardDescription className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">Account Protection Layer</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className={cn("p-4 rounded-xl border transition-colors", hasMFA ? "bg-[#1B9157]/5 border-[#1B9157]/10" : "bg-[#F4D03F]/5 border-[#F4D03F]/10")}>
                            <div className="flex items-center gap-2">
                                <div className={cn("w-1.5 h-1.5 rounded-full", hasMFA ? "bg-[#1B9157] shadow-[0_0_8px_rgba(27,145,87,0.4)]" : "bg-[#F4D03F]")} />
                                <p className={cn("text-xs font-bold uppercase tracking-wider", hasMFA ? "text-[#1B9157]" : "text-[#F4D03F]")}>
                                    {hasMFA ? 'Protected Identity' : 'Vulnerable Identity'}
                                </p>
                            </div>
                            <p className="text-[11px] text-gray-500 mt-2 font-medium leading-relaxed">
                                {hasMFA 
                                    ? `Extra security was active since ${new Date(factors[0].created_at).toLocaleDateString()}.`
                                    : 'Setup a second pulse verification to secure your industrial metadata from unauthorized access.'
                                }
                            </p>
                        </div>

                        {hasMFA ? (
                            <button
                                className={cn("w-full h-10 rounded-lg border border-red-100 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all font-bold text-xs uppercase shadow-sm")}
                                onClick={() => {
                                    if (confirm('Are you sure you want to disable extra security?')) {
                                        handleUnenroll(factors[0].id);
                                    }
                                }}
                                disabled={loading}
                            >
                                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Disable Security'}
                            </button>
                        ) : (
                            <button
                                className={cn(glass.btnPrimary, "w-full h-10 shadow-sm")}
                                onClick={handleEnroll}
                                disabled={enrolling}
                            >
                                {enrolling ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Activate Protection'}
                            </button>
                        )}
                    </CardContent>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default TwoFactorSetup;

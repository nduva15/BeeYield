import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2, Lock as LockIcon, CheckCircle, Shield, ArrowLeft } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const UpdatePasswordForm: React.FC = () => {
    const { updatePassword, session, activeBackend } = useAuth();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [isValidSession, setIsValidSession] = useState(false);

    useEffect(() => {
        // Supabase automatically logs the user in when they click the reset link
        if (session) {
            setIsValidSession(true);
        }
    }, [session]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Access mismatch: Passwords do not match');
            return;
        }

        if (password.length < 6) {
            toast.error('Encryption insufficient: Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        const { error } = await updatePassword(password);

        if (error) {
            toast.error('Update Protocol Failed', { description: error.message });
        } else {
            setSuccess(true);
            toast.success('Security Protocol Updated! 🎉');
        }

        setLoading(false);
    };

    const loginPath = activeBackend === 'ceba' ? '/ceba/login' : activeBackend === 'beeyield' ? '/beeyield-login' : '/login';

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-beeyield-cream via-white to-beeyield-gold/10 p-4 font-sans">
                <div className="w-full max-w-md">
                    <div className="bg-[#FFF9F0]/80 backdrop-blur-xl rounded-[2.5rem] shadow-premium border border-beeyield-gold/20 p-10 space-y-8 text-center">
                        <div className="space-y-4">
                            <div className="w-20 h-20 rounded-full bg-beeyield-green/10 flex items-center justify-center mx-auto border-2 border-beeyield-green/20">
                                <CheckCircle className="h-10 w-10 text-beeyield-green" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-3xl font-black text-beeyield-green tracking-tight">Security Updated.</h2>
                                <p className="text-sm text-beeyield-green/60 font-medium leading-relaxed">
                                    Your access credentials have been successfully reset. You may now re-authenticate via the secure portal.
                                </p>
                            </div>
                        </div>

                        <Button
                            onClick={() => navigate(loginPath)}
                            className="w-full h-14 bg-beeyield-green hover:bg-beeyield-green-dark text-[#1A1A1A] font-black uppercase tracking-widest rounded-xl shadow-glow transition-all"
                        >
                            Return to Sign In
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (!isValidSession) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-beeyield-cream p-4">
                <div className="text-center space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-beeyield-green mx-auto" />
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-beeyield-green/40">Synchronizing Session...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-beeyield-cream via-white to-beeyield-gold/10 p-4 font-sans">
            <div className="w-full max-w-md">
                <div className="bg-[#FFF9F0]/80 backdrop-blur-xl rounded-[2.5rem] shadow-premium border border-beeyield-gold/20 p-10">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="text-center space-y-3">
                            <div className="w-16 h-16 rounded-2xl bg-beeyield-gold/10 flex items-center justify-center mx-auto border border-beeyield-gold/20">
                                <Shield className="h-8 w-8 text-beeyield-gold" />
                            </div>
                            <h2 className="text-2xl font-black text-beeyield-green uppercase tracking-tighter">New Access Key</h2>
                            <p className="text-xs font-black text-beeyield-green/40 uppercase tracking-widest">
                                Establish your revised security protocol
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="new-password" title="Enter at least 6 characters" className="text-[10px] font-black uppercase tracking-widest text-beeyield-green/60 pl-1">New Access Key</Label>
                                <div className="relative group">
                                    <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-beeyield-green/20 group-focus-within:text-beeyield-gold transition-colors" />
                                    <Input
                                        id="new-password"
                                        type="password"
                                        placeholder="Min. 6 alphanumeric"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 h-14 border-beeyield-green/10 focus:border-beeyield-gold focus:ring-beeyield-gold/10 rounded-xl bg-[#FFF9F0]"
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirm-password" className="text-[10px] font-black uppercase tracking-widest text-beeyield-green/60 pl-1">Verify Access Key</Label>
                                <div className="relative group">
                                    <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-beeyield-green/20 group-focus-within:text-beeyield-gold transition-colors" />
                                    <Input
                                        id="confirm-password"
                                        type="password"
                                        placeholder="Repeat your access key"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="pl-10 h-14 border-beeyield-green/10 focus:border-beeyield-gold focus:ring-beeyield-gold/10 rounded-xl bg-[#FFF9F0]"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-14 bg-gradient-to-r from-beeyield-gold to-beeyield-orange text-[#1A1A1A] font-black uppercase tracking-widest rounded-xl shadow-glow transition-all"
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                'Activate Security Key'
                            )}
                        </Button>

                        <button
                            type="button"
                            onClick={() => navigate(loginPath)}
                            className="w-full flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-beeyield-green/40 hover:text-beeyield-gold transition-colors"
                        >
                            <ArrowLeft className="h-3 w-3" />
                            Return to Portal
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UpdatePasswordForm;

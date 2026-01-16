import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
    Shield,
    Lock,
    Cpu,
    Hexagon,
    ChevronRight,
    ArrowLeft,
    Terminal,
    Database,
    Activity,
    Bot
} from 'lucide-react';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

type AuthMode = 'login' | 'register' | 'forgot-password';

const ProfessionalAuth: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading: authLoading } = useAuth();
    const [authMode, setAuthMode] = useState<AuthMode>('login');

    useEffect(() => {
        if (user && !authLoading) {
            navigate('/beeyield-dashboard');
        }
    }, [user, authLoading, navigate]);

    if (authLoading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Activity className="h-8 w-8 text-primary animate-pulse" />
                    <span className="text-primary/50 font-mono text-xs tracking-widest uppercase">Initializing Protocol...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-primary/30 font-mono overflow-hidden relative">
            {/* Cyber Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(241,210,160,0.05)_0%,transparent_50%)]" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
            </div>

            <div className="container mx-auto px-4 h-screen flex flex-col relative z-10">
                {/* Minimal Professional Header */}
                <div className="py-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
                            <Hexagon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tighter leading-none">BEEYIELD <span className="text-primary">PRO</span></h1>
                            <p className="text-[10px] text-primary/40 leading-none mt-1">INDUSTRIAL IOT ECOSYSTEM</p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-xs text-primary/60 hover:text-primary transition-colors font-bold uppercase tracking-widest"
                    >
                        <ArrowLeft className="h-4 w-4" /> Exit to Public Site
                    </button>
                </div>

                <div className="flex-1 flex items-center justify-center py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl w-full items-center">

                        {/* Technical Side */}
                        <div className="hidden lg:block space-y-12">
                            <div className="space-y-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                    <span className="text-[10px] font-bold text-primary tracking-widest uppercase">System Operational</span>
                                </div>
                                <h2 className="text-6xl font-black tracking-tighter leading-tight">
                                    Secure <br />
                                    <span className="text-primary italic">Intelligence</span> <br />
                                    Interface
                                </h2>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { icon: Bot, label: 'AI Analytics', desc: 'Predictive hive modeling' },
                                    { icon: Activity, label: 'Real-time IoT', desc: 'Live sensor telemetry' },
                                    { icon: Shield, label: 'Vault Security', desc: 'AES-256 data protection' },
                                    { icon: Database, label: 'Fleet Logic', desc: 'Scaleable apiary management' }
                                ].map((item, i) => (
                                    <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/30 transition-all group">
                                        <item.icon className="h-6 w-6 text-primary/60 group-hover:text-primary mb-4 transition-colors" />
                                        <h4 className="font-bold text-sm mb-1">{item.label}</h4>
                                        <p className="text-[10px] text-white/40 leading-relaxed font-sans">{item.desc}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-4">
                                <Terminal className="h-5 w-5 text-primary" />
                                <div className="font-mono text-[10px] text-primary/60 overflow-hidden whitespace-nowrap">
                                    <p className="animate-typing">root@beeyield-hub: auth --mode professional_v2.0.4</p>
                                    <p className="opacity-50 tracking-tighter">Initializing secure kernel session...</p>
                                </div>
                            </div>
                        </div>

                        {/* Auth Card */}
                        <div className="max-w-md w-full mx-auto">
                            <Card className="bg-white/5 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-[2rem] overflow-hidden backdrop-blur-xl">
                                <div className="p-8 border-b border-white/5 bg-white/5">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="inline-flex rounded-lg bg-black/40 p-1 border border-white/10">
                                            <button
                                                onClick={() => setAuthMode('login')}
                                                className={`px-6 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${authMode === 'login' ? 'bg-primary text-black' : 'text-white/40 hover:text-white'}`}
                                            >
                                                Authorize
                                            </button>
                                            <button
                                                onClick={() => setAuthMode('register')}
                                                className={`px-6 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${authMode === 'register' ? 'bg-primary text-black' : 'text-white/40 hover:text-white'}`}
                                            >
                                                Deploy
                                            </button>
                                        </div>
                                        <Lock className="h-4 w-4 text-primary/40" />
                                    </div>

                                    <h3 className="text-2xl font-black tracking-tightest">
                                        {authMode === 'login' ? 'PORTAL ACCESS' : authMode === 'register' ? 'NETWORK JOIN' : 'KEY RECOVERY'}
                                    </h3>
                                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em] mt-2">
                                        {authMode === 'login' ? 'Enter credentials for biometric validation' : 'Register your professional IoT account'}
                                    </p>
                                </div>

                                <CardContent className="p-8">
                                    <div className="space-y-6">
                                        {authMode === 'login' && (
                                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                <div className="pro-auth-forms">
                                                    <LoginForm
                                                        onSuccess={() => navigate('/beeyield-dashboard')}
                                                        onSwitchToRegister={() => setAuthMode('register')}
                                                        onForgotPassword={() => setAuthMode('forgot-password')}
                                                        requireMetadata={{ beeyield_active: true }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {authMode === 'register' && (
                                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                <div className="pro-auth-forms">
                                                    <RegisterForm
                                                        onSuccess={() => {
                                                            toast.success("Protocol Initialized");
                                                            setAuthMode('login');
                                                        }}
                                                        onSwitchToLogin={() => setAuthMode('login')}
                                                        additionalMetadata={{ beeyield_active: true }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {authMode === 'forgot-password' && (
                                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                <div className="pro-auth-forms">
                                                    <ForgotPasswordForm
                                                        onBackToLogin={() => setAuthMode('login')}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-12 pt-6 border-t border-white/5 flex flex-col items-center gap-4 text-center">
                                        <div className="flex gap-4">
                                            <div className="flex items-center gap-2 text-[8px] font-bold text-white/20 uppercase tracking-[0.3em]">
                                                <Shield className="h-3 w-3" /> FIPS 140-2
                                            </div>
                                            <div className="flex items-center gap-2 text-[8px] font-bold text-white/20 uppercase tracking-[0.3em]">
                                                <Lock className="h-3 w-3" /> ISO 27001
                                            </div>
                                        </div>
                                        <p className="text-[9px] text-white/30 leading-relaxed font-sans max-w-[200px]">
                                            Unauthorized access is monitored and strictly prohibited by cyber-security protocols.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Cyber Footer */}
                <div className="py-8 border-t border-white/5 flex items-center justify-between text-[8px] font-bold text-white/20 uppercase tracking-[0.3em]">
                    <p>© 2026 BEEYIELD GLOBAL HUB // CORE v4.0.2</p>
                    <div className="flex gap-8">
                        <span>LAT: 1.2921 N</span>
                        <span>LONG: 36.8219 E</span>
                        <span className="text-primary/40 animate-pulse">Session Encrypted</span>
                    </div>
                </div>
            </div>

            <style>{`
                .pro-auth-forms input {
                    background: rgba(255, 255, 255, 0.05) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    color: white !important;
                    height: 50px !important;
                    border-radius: 12px !important;
                    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
                    font-size: 13px !important;
                }
                .pro-auth-forms label {
                    color: rgba(255, 255, 255, 0.4) !important;
                    font-size: 10px !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.1em !important;
                    font-weight: 700 !important;
                }
                .pro-auth-forms button[type="submit"] {
                    background: #f1d2a0 !important;
                    color: black !important;
                    font-weight: 900 !important;
                    height: 50px !important;
                    border-radius: 12px !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.1em !important;
                    font-size: 12px !important;
                }
                .animate-typing {
                    border-right: 2px solid #f1d2a0;
                    width: fit-content;
                    animation: typing 3s steps(40, end), blink-caret .75s step-end infinite;
                }
                @keyframes typing {
                    from { width: 0 }
                    to { width: 100% }
                }
                @keyframes blink-caret {
                    from, to { border-color: transparent }
                    50% { border-color: #f1d2a0; }
                }
            `}</style>
        </div>
    );
};

export default ProfessionalAuth;

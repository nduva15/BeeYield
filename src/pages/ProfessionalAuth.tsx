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
    const { user, loading: authLoading, beeyieldUser } = useAuth();
    const [authMode, setAuthMode] = useState<AuthMode>('login');

    useEffect(() => {
        // Redirect to dashboard if user is authenticated (check both path-based user and beeyield-specific user)
        if ((user || beeyieldUser) && !authLoading) {
            navigate('/beeyield-dashboard');
        }
    }, [user, beeyieldUser, authLoading, navigate]);

    if (authLoading) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Activity className="h-8 w-8 text-primary animate-pulse" />
                    <span className="text-zinc-400 font-mono text-xs tracking-widest uppercase">Initializing Protocol...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f9fc] text-zinc-900 selection:bg-primary/30 overflow-hidden relative">
            {/* Soft Light Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(241,210,160,0.15)_0%,transparent_70%)]" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
            </div>

            <div className="container mx-auto px-4 h-screen flex flex-col relative z-10">
                {/* Minimal Professional Header */}
                <div className="py-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-zinc-200 shadow-sm">
                            <Hexagon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tighter leading-none text-zinc-900">BEEYIELD <span className="text-primary">PROFESSIONAL</span></h1>
                            <p className="text-sm text-zinc-500 leading-none mt-1 font-bold tracking-wider uppercase">Professional Dashboard</p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors font-bold uppercase tracking-widest"
                    >
                        <ArrowLeft className="h-4 w-4" /> Back to Home
                    </button>
                </div>

                <div className="flex-1 flex items-center justify-center py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl w-full items-center">

                        {/* Technical Side (Light Version) */}
                        <div className="hidden lg:block space-y-12">
                            <div className="space-y-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                    <span className="text-sm font-bold text-primary tracking-widest uppercase">Online</span>
                                </div>
                                <h2 className="text-6xl font-black tracking-tighter leading-tight text-zinc-900">
                                    Professional <br />
                                    <span className="text-primary">Tools</span> <br />
                                    Interface
                                </h2>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { icon: Bot, label: 'Intelligent Insights', desc: 'Predicting hive needs' },
                                    { icon: Activity, label: 'Live Tracking', desc: 'Real-time hive data' },
                                    { icon: Shield, label: 'Secure Support', desc: 'Safe data protection' },
                                    { icon: Database, label: 'Fleet Management', desc: 'Easy hive organization' }
                                ].map((item, i) => (
                                    <div key={i} className="p-6 rounded-2xl bg-white border border-zinc-200 hover:border-primary/50 transition-all group shadow-sm hover:shadow-md">
                                        <item.icon className="h-6 w-6 text-zinc-400 group-hover:text-primary mb-4 transition-colors" />
                                        <h4 className="font-bold text-sm mb-1 text-zinc-900">{item.label}</h4>
                                        <p className="text-xs text-zinc-500 leading-relaxed">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Auth Card (Bright Version) */}
                        <div className="max-w-md w-full mx-auto">
                            <Card className="bg-white border border-zinc-200 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] rounded-[2.5rem] overflow-hidden">
                                <div className="p-8 border-b border-zinc-100 bg-zinc-50/50">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="inline-flex rounded-xl bg-zinc-200/50 p-1 border border-zinc-200 shadow-inner">
                                            <button
                                                onClick={() => setAuthMode('login')}
                                                className={`px-6 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${authMode === 'login' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}
                                            >
                                                Login
                                            </button>
                                            <button
                                                onClick={() => setAuthMode('register')}
                                                className={`px-6 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${authMode === 'register' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}
                                            >
                                                Sign Up
                                            </button>
                                        </div>
                                        <Lock className="h-4 w-4 text-zinc-300" />
                                    </div>

                                    <h3 className="text-2xl font-black tracking-tightest text-zinc-900">
                                        {authMode === 'login' ? 'Welcome Back' : authMode === 'register' ? 'Join Us' : 'Reset Password'}
                                    </h3>
                                    <p className="text-xs text-zinc-400 font-bold uppercase tracking-[0.2em] mt-2">
                                        {authMode === 'login' ? 'Please login to continue' : 'Create your professional account'}
                                    </p>
                                </div>

                                <CardContent className="p-8 pb-12">
                                    <div className="space-y-6">
                                        {authMode === 'login' && (
                                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                <div className="pro-auth-forms">
                                                    <LoginForm
                                                        variant="professional"
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
                                                            toast.success("Account Created");
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
                                                        variant="professional"
                                                        onBackToLogin={() => setAuthMode('login')}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-12 pt-8 border-t border-zinc-100 flex flex-col items-center gap-4 text-center">
                                        <div className="flex gap-4">
                                            <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 uppercase tracking-[0.3em]">
                                                <Shield className="h-3 w-3" /> Secure
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 uppercase tracking-[0.3em]">
                                                <Lock className="h-3 w-3" /> Encrypted
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Cyber Footer (Light Version) */}
                <div className="py-8 border-t border-zinc-200 flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-[0.3em]">
                    <p>Â© 2026 BeeYield</p>
                    <div className="flex gap-8">
                        <span className="text-primary/60 font-black">Connected</span>
                    </div>
                </div>
            </div>


        </div>
    );
};

export default ProfessionalAuth;

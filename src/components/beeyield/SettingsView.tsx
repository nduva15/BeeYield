import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    User,
    Shield,
    Bell,
    Globe,
    Lock,
    Eye,
    EyeOff,
    Mail,
    Phone,
    MapPin,
    AlertTriangle,
    Save,
    Trash2,
    Database,
    ShieldCheck,
    Cpu,
    Activity,
    Key,
    Smartphone
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface SettingsViewProps {
    onTabChange?: (tab: string, message?: string, action?: string) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onTabChange }) => {
    const { user, signOut } = useAuth();
    const [loading, setLoading] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);

    const handleSave = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            toast.success("Registry Updated");
        }, 1000);
    };

    return (
        <div className="p-8 space-y-12 bg-white min-h-screen text-[#064e3b] antialiased">
            {/* Header - Functional Registry */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b-4 border-[#064e3b] pb-8">
                <div className="space-y-4">
                    <h1 className="text-5xl font-black tracking-tighter uppercase leading-[0.8]">
                        System <span className="text-[#10b981]">Settings</span>
                    </h1>
                    <p className="text-[#10b981] font-black uppercase text-[10px] tracking-[0.4em] mt-4">
                        Registry Configuration and Access Control
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="h-14 px-10 border-2 border-[#064e3b] bg-[#10b981] font-black text-xs uppercase tracking-widest text-white hover:bg-black transition-all shadow-[6px_6px_0px_0px_rgba(6,78,59,1)] active:shadow-none active:translate-x-1 active:translate-y-1 flex items-center gap-3"
                >
                    {loading ? <Activity className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Save Settings
                </button>
            </div>

            <Tabs defaultValue="account" className="w-full">
                <TabsList className="bg-white border-2 border-[#064e3b] p-0 h-14 w-full flex rounded-none mb-10">
                    <TabsTrigger value="account" className="flex-1 h-full rounded-none border-r-2 border-[#064e3b] last:border-r-0 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-[#10b981] data-[state=active]:text-white transition-none">
                        <Key className="w-4 h-4 mr-2" /> Identity
                    </TabsTrigger>
                    <TabsTrigger value="alerts" className="flex-1 h-full rounded-none border-r-2 border-[#064e3b] last:border-r-0 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-[#10b981] data-[state=active]:text-white transition-none">
                        <Bell className="w-4 h-4 mr-2" /> Alert Routes
                    </TabsTrigger>
                    <TabsTrigger value="security" className="flex-1 h-full rounded-none border-r-2 border-[#064e3b] last:border-r-0 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-[#10b981] data-[state=active]:text-white transition-none">
                        <ShieldCheck className="w-4 h-4 mr-2" /> Security Path
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="account" className="space-y-10 focus-visible:outline-none">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                        <div className="md:col-span-4 space-y-4">
                            <div className="w-24 h-24 border-4 border-[#064e3b] bg-[#facc15] flex items-center justify-center">
                                <User className="w-12 h-12 text-[#064e3b]" />
                            </div>
                            <h3 className="text-xl font-black uppercase">Identity Proof</h3>
                            <p className="text-[10px] font-bold text-[#064e3b]/60 uppercase tracking-widest leading-relaxed">
                                Managed by BeeYield Global Registry. Verification active.
                            </p>
                            <button className="w-full h-10 border-2 border-[#064e3b] bg-white font-black text-[10px] uppercase hover:bg-neutral-100 transition-none">Update Image</button>
                        </div>

                        <div className="md:col-span-8 space-y-8 bg-[#facc15]/5 p-8 border-2 border-[#064e3b]">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest">Full Name</Label>
                                    <input
                                        placeholder="Timothy Nduva"
                                        className="w-full h-12 px-4 border-2 border-[#064e3b] bg-white font-bold text-xs uppercase focus:bg-[#facc15]/10 outline-none"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest">Login Email</Label>
                                    <input
                                        placeholder="timothy@beeyield.com"
                                        className="w-full h-12 px-4 border-2 border-[#064e3b] bg-white/50 font-bold text-xs uppercase cursor-not-allowed outline-none"
                                        disabled
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest">Phone Link</Label>
                                <input
                                    placeholder="+254 7XX XXX XXX"
                                    className="w-full h-12 px-4 border-2 border-[#064e3b] bg-white font-bold text-xs uppercase focus:bg-[#facc15]/10 outline-none"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest">Physical Locus</Label>
                                <input
                                    placeholder="Kibwezi, Kenya"
                                    className="w-full h-12 px-4 border-2 border-[#064e3b] bg-white font-bold text-xs uppercase focus:bg-[#facc15]/10 outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="alerts" className="space-y-10 focus-visible:outline-none">
                    <div className="border-4 border-[#064e3b] divide-y-2 divide-[#064e3b]/10 bg-white overflow-hidden">
                        {[
                            { title: 'Critical Malfunction', desc: 'Instant pulse on hardware failure.' },
                            { title: 'Battery Low Level', desc: 'Threshold at 20% remaining.' },
                            { title: 'Sync Success', desc: 'Daily signal audit completion.' },
                        ].map((item, i) => (
                            <div key={i} className="p-8 flex items-center justify-between hover:bg-[#facc15]/5">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-black uppercase tracking-tight">{item.title}</h4>
                                    <p className="text-[10px] font-bold text-[#064e3b]/40 uppercase tracking-widest">{item.desc}</p>
                                </div>
                                <Switch className="data-[state=checked]:bg-[#10b981] border-2 border-[#064e3b] h-8 w-14 rounded-none" />
                            </div>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="security" className="space-y-10 focus-visible:outline-none">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="p-8 border-4 border-[#064e3b] space-y-6">
                            <div className="flex items-center gap-4">
                                <Database className="w-6 h-6 text-[#10b981]" />
                                <h4 className="font-black uppercase">Access Tokens</h4>
                            </div>
                            <p className="text-[10px] font-bold text-[#064e3b]/60 uppercase tracking-widest leading-loose">
                                API access keys for third-party node integration. Traceability level 4 active.
                            </p>
                            <button className="h-12 w-full border-2 border-[#064e3b] bg-[#facc15] font-black uppercase text-xs tracking-widest hover:bg-[#064e3b] hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(6,78,59,1)] active:shadow-none">Generate Token</button>
                        </div>
                        <div className="p-8 border-4 border-[#064e3b] bg-red-50 space-y-6">
                            <div className="flex items-center gap-4">
                                <Trash2 className="w-6 h-6 text-red-600" />
                                <h4 className="font-black uppercase text-red-600">Delete Account</h4>
                            </div>
                            <p className="text-[10px] font-bold text-red-600/60 uppercase tracking-widest leading-loose">
                                IRREVERSIBLE ACTION. TERMINATE ALL REGISTRY DATA AND NODE LINKS.
                            </p>
                            <button className="h-12 w-full border-2 border-red-600 bg-white text-red-600 font-black uppercase text-xs tracking-widest hover:bg-red-600 hover:text-white transition-all">TERMINATE</button>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default SettingsView;

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
    ShieldCheck,
    Database,
    ChevronDown,
    Activity,
    Cpu,
    Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import beeyieldService from '@/services/beeyieldService';

const SettingsIntegrationsView: React.FC = () => {
    const [configs, setConfigs] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    // State for inputs
    const [kraPin, setKraPin] = React.useState('');
    const [branchCode, setBranchCode] = React.useState('00');

    const fetchConfigs = async () => {
        setLoading(true);
        try {
            const data = await beeyieldService.getIntegrationConfigs();
            setConfigs(data || []);

            const etims = data?.find((c: any) => c.platform === 'etims');
            if (etims) {
                setKraPin(etims.kra_pin || '');
                setBranchCode(etims.branch_code || '00');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchConfigs();
    }, []);

    const handleConnectETIMS = async () => {
        if (!kraPin) return toast.error("KRA PIN is required for legal compliance");
        setLoading(true);
        const res = await beeyieldService.upsertIntegrationConfig({
            platform: 'etims',
            is_active: true,
            kra_pin: kraPin,
            branch_code: branchCode
        });
        setLoading(false);
        if (res) {
            toast.success('KRA eTIMS Compliance Hub Activated');
            fetchConfigs();
        }
    };

    const isConnected = (platform: string) => configs.some(c => c.platform === platform && c.is_active);
    const getSyncDate = (platform: string) => {
        const c = configs.find(c => c.platform === platform);
        return c?.updated_at ? new Date(c.updated_at).toLocaleString() : 'Never synced';
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-[1400px] mx-auto">

            {/* COMPLIANCE HEADER */}
            <div className="relative group overflow-hidden rounded-[3rem] bg-[#09090b] text-gray-900 p-12 border border-white/5 shadow-2xl">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#1B9157] opacity-10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1B9157]/10 border border-[#1B9157]/20">
                            <ShieldCheck className="w-4 h-4 text-[#1B9157]" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#1B9157]">Tax Compliance Terminal</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">
                            KRA eTIMS <span className="text-gray-400">VSDC Hub</span>
                        </h1>
                        <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">
                            Automated Electronic Tax Invoice Management Enforcement for Hive Products.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/5 border border-gray-200 backdrop-blur-xl">
                        <div className={cn("w-2 h-2 rounded-full", isConnected('etims') ? "bg-[#1B9157] animate-pulse" : "bg-red-500")} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{isConnected('etims') ? "SECURE CONNECTION" : "ACTION REQUIRED"}</span>
                    </div>
                </div>
            </div>

            {/* DYNAMIC VIEW CONTENT */}
            <Card className="rounded-[4rem] border-none bg-white shadow-xl overflow-hidden min-h-[500px]">
                <CardContent className="p-16">
                    <div className="space-y-12 animate-in fade-in duration-500">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                            <div className="space-y-4">
                                <div className="w-20 h-20 rounded-[2rem] bg-[#1B9157]/10 flex items-center justify-center border border-[#1B9157]/20">
                                    <Lock className="w-10 h-10 text-[#1B9157]" />
                                </div>
                                <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">eTIMS VSDC Terminal</h3>
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Electronic Tax Invoice Generation Enforcement</p>
                            </div>
                            <Button
                                onClick={handleConnectETIMS}
                                className="bg-[#1B9157] hover:bg-[#167d4a] text-gray-900 rounded-[2rem] h-16 px-12 font-black text-xs uppercase tracking-widest shadow-2xl"
                            >
                                {isConnected('etims') ? "Sync Compliance Keys" : "Connect VSDC Gateway"}
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-8 border-t border-gray-100">
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-4">Registered KRA PIN</label>
                                    <Input
                                        placeholder="P05XXXXXXXX"
                                        value={kraPin}
                                        onChange={(e) => setKraPin(e.target.value.toUpperCase())}
                                        className="rounded-[2rem] border-gray-100 h-20 text-2xl font-black bg-gray-50 focus:bg-white text-center tracking-[0.3em]"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-4">Branch Code</label>
                                    <Input
                                        placeholder="00"
                                        value={branchCode}
                                        onChange={(e) => setBranchCode(e.target.value)}
                                        className="rounded-[2rem] border-gray-100 h-20 text-2xl font-black bg-gray-50 focus:bg-white text-center"
                                    />
                                </div>
                            </div>

                            <div className="bg-[#09090b] rounded-[3rem] p-10 text-gray-900 space-y-10 shadow-2xl relative overflow-hidden">
                                <div className="absolute bottom-0 right-0 w-40 h-40 bg-[#1B9157] opacity-10 blur-3xl rounded-full" />
                                <div className="flex items-center gap-4 relative z-10">
                                    <Activity className="w-6 h-6 text-[#1B9157]" />
                                    <span className="text-xs font-black uppercase">Live Metrics</span>
                                </div>
                                <div className="space-y-8 relative z-10">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-gray-600 uppercase">Authorized Hub</span>
                                        <span className="text-sm font-black text-[#1B9157]">BeeYield-VSDC-v2</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-gray-600 uppercase">Last Handshake</span>
                                        <span className="text-sm font-black">{getSyncDate('etims')}</span>
                                    </div>
                                    <div className="pt-6 border-t border-white/5">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-[10px] font-bold text-gray-500 uppercase">Uptime Stability</span>
                                            <span className="text-[10px] font-black uppercase text-[#1B9157]">99.9%</span>
                                        </div>
                                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-[#1B9157] to-[#1B9157]/40 w-[99.9%]" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* SECURITY ASSURANCE */}
            <div className="p-10 rounded-[3rem] border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center">
                        <Database className="w-6 h-6 text-gray-300" />
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-sm font-black uppercase">Encryption & Data Residency</h4>
                        <p className="max-w-xl text-[10px] text-gray-500 font-bold uppercase leading-relaxed tracking-wider">
                            BeeYield Enterprise enforces technical separation between tax compliance events and financial ledgers. All KRA transmission logs are AES-256 encrypted at rest.
                        </p>
                    </div>
                </div>
                <Button variant="outline" className="rounded-full px-8 h-12 font-black text-[10px] uppercase border-gray-100">Download VSDC Log</Button>
            </div>
        </div>
    );
};

export default SettingsIntegrationsView;

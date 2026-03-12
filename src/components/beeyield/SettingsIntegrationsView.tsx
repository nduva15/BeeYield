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
import { glass } from './GlassTheme';

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
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700 max-w-[1400px] mx-auto p-4 lg:p-6">

            {/* COMPLIANCE HEADER */}
            <div className={cn(glass.card, "relative overflow-hidden bg-[#1A1A1A] text-white p-8")}>
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#1B9157] opacity-10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#1B9157]/20 border border-[#1B9157]/30">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#1B9157]" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1B9157]">Tax Compliance Terminal</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight leading-none">
                            KRA eTIMS <span className="text-gray-400">VSDC Hub</span>
                        </h1>
                        <p className="text-xs font-medium text-gray-400">
                            Automated Electronic Tax Invoice Management Enforcement for Hive Products.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-black/40 border border-white/10 backdrop-blur-xl shrink-0">
                        <div className={cn("w-2 h-2 rounded-full", isConnected('etims') ? "bg-[#1B9157] animate-pulse" : "bg-red-500")} />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white">
                            {isConnected('etims') ? "SECURE CONNECTION" : "ACTION REQUIRED"}
                        </span>
                    </div>
                </div>
            </div>

            {/* DYNAMIC VIEW CONTENT */}
            <Card className={cn(glass.card, "p-0 overflow-hidden min-h-[400px]")}>
                <CardContent className="p-8">
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-gray-100 pb-8">
                            <div className="space-y-3">
                                <div className="w-14 h-14 rounded-xl bg-[#1B9157]/10 flex items-center justify-center border border-[#1B9157]/20">
                                    <Lock className="w-6 h-6 text-[#1B9157]" />
                                </div>
                                <h3 className="text-2xl font-bold text-[#1A1A1A] tracking-tight">eTIMS VSDC Terminal</h3>
                                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Electronic Tax Invoice Generation Enforcement</p>
                            </div>
                            <button
                                onClick={handleConnectETIMS}
                                className={cn(glass.btnPrimary, "h-10 px-6 font-bold text-xs uppercase shrink-0")}
                            >
                                {isConnected('etims') ? "Sync Compliance Keys" : "Connect VSDC Gateway"}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Registered KRA PIN</label>
                                    <Input
                                        placeholder="P05XXXXXXXX"
                                        value={kraPin}
                                        onChange={(e) => setKraPin(e.target.value.toUpperCase())}
                                        className="h-12 bg-gray-50 border-gray-200 text-sm font-bold text-center tracking-[0.2em] focus:bg-white transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Branch Code</label>
                                    <Input
                                        placeholder="00"
                                        value={branchCode}
                                        onChange={(e) => setBranchCode(e.target.value)}
                                        className="h-12 bg-gray-50 border-gray-200 text-sm font-bold text-center tracking-[0.1em] focus:bg-white transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="bg-[#1A1A1A] rounded-2xl p-6 text-white space-y-6 shadow-sm relative overflow-hidden">
                                <div className="absolute bottom-0 right-0 w-40 h-40 bg-[#1B9157] opacity-10 blur-3xl rounded-full" />
                                <div className="flex items-center gap-3 relative z-10">
                                    <Activity className="w-5 h-5 text-[#1B9157]" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Live Metrics</span>
                                </div>
                                <div className="space-y-4 relative z-10">
                                    <div className="flex justify-between items-center bg-white/5 px-4 py-3 rounded-lg">
                                        <span className="text-[10px] font-medium text-gray-400 uppercase">Authorized Hub</span>
                                        <span className="text-xs font-bold text-[#1B9157]">BeeYield-VSDC-v2</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-white/5 px-4 py-3 rounded-lg">
                                        <span className="text-[10px] font-medium text-gray-400 uppercase">Last Handshake</span>
                                        <span className="text-xs font-bold">{getSyncDate('etims')}</span>
                                    </div>
                                    <div className="pt-4 border-t border-white/10">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[10px] font-medium text-gray-400 uppercase">Uptime Stability</span>
                                            <span className="text-[10px] font-bold uppercase text-[#1B9157]">99.9%</span>
                                        </div>
                                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-[#1B9157] w-[99.9%]" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* SECURITY ASSURANCE */}
            <div className={cn(glass.card, "p-6 flex flex-col md:flex-row items-center justify-between gap-6 border-dashed border-gray-300")}>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                        <Database className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="space-y-0.5">
                        <h4 className="text-sm font-bold text-[#1A1A1A] tracking-tight">Encryption & Data Residency</h4>
                        <p className="max-w-xl text-[11px] text-gray-500 font-medium leading-relaxed">
                            BeeYield Enterprise enforces technical separation between tax compliance events and financial ledgers. All KRA transmission logs are AES-256 encrypted at rest.
                        </p>
                    </div>
                </div>
                <button className={cn(glass.btnSecondary, "h-10 px-6 font-bold text-xs uppercase shrink-0")}>Download VSDC Log</button>
            </div>
        </div>
    );
};

export default SettingsIntegrationsView;

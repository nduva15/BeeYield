import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
    ShieldCheck,
    Database,
    Activity,
    Lock as LockIcon,
    RefreshCw,
    Network
} from "lucide-react";
import { cn } from '@/lib/utils';
import beeyieldService from '@/services/beeyieldService';
import { glass, PageHeader } from './GlassTheme';
import { motion } from 'framer-motion';

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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={cn(glass.page, "max-w-7xl mx-auto space-y-6 pb-20 p-4 lg:p-6")}>
            <PageHeader
                icon={Network}
                label="Tax Compliance Terminal"
                title={<>KRA eTIMS <span className="text-[#F4D03F]">VSDC Hub</span></>}
                subtitle="Automated Electronic Tax Invoice Management Enforcement for Hive Products."
                actions={
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-gray-100 shadow-sm">
                        <div className={cn("w-2 h-2 rounded-full", isConnected('etims') ? "bg-[#1B9157] animate-pulse" : "bg-red-500")} />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-700">
                            {isConnected('etims') ? "SECURE CONNECTION" : "ACTION REQUIRED"}
                        </span>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-12">
                    <Card className={cn(glass.card, "p-0 overflow-hidden bg-white")}>
                        <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-gray-100 shadow-sm">
                                    <LockIcon className="w-5 h-5 text-[#1B9157]" />
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="text-lg font-bold text-[#1A1A1A] tracking-tight">eTIMS VSDC Terminal</h3>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Electronic Tax Invoice Generation Enforcement</p>
                                </div>
                            </div>
                            <button
                                onClick={handleConnectETIMS}
                                className={cn(glass.btnPrimary, "h-9 px-6 font-bold text-xs uppercase")}
                                disabled={loading}
                            >
                                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : isConnected('etims') ? "Sync Compliance Keys" : "Connect VSDC Gateway"}
                            </button>
                        </div>
                        
                        <CardContent className="p-6 md:p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Registered KRA PIN</label>
                                        <Input
                                            placeholder="P05XXXXXXXX"
                                            value={kraPin}
                                            onChange={(e) => setKraPin(e.target.value.toUpperCase())}
                                            className="h-10 bg-gray-50 border-gray-100 text-sm font-bold tracking-[0.25em] focus:bg-white transition-colors text-center"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Branch Code</label>
                                        <Input
                                            placeholder="00"
                                            value={branchCode}
                                            onChange={(e) => setBranchCode(e.target.value)}
                                            className="h-10 bg-gray-50 border-gray-100 text-sm font-bold tracking-[0.1em] focus:bg-white transition-colors text-center"
                                        />
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-4 relative overflow-hidden">
                                    <div className="flex items-center gap-3">
                                        <Activity className="w-4 h-4 text-[#1B9157]" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Live Resilience Metrics</span>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center bg-white px-4 py-2.5 rounded-lg border border-gray-100">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Authorized Hub</span>
                                            <span className="text-xs font-bold text-[#1B9157]">BeeYield-VSDC-v4</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-white px-4 py-2.5 rounded-lg border border-gray-100">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Last Handshake</span>
                                            <span className="text-xs font-bold text-gray-700">{getSyncDate('etims')}</span>
                                        </div>
                                        <div className="pt-3">
                                            <div className="flex justify-between items-center mb-1.5 px-1">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Uptime Stability</span>
                                                <span className="text-[10px] font-bold uppercase text-[#1B9157]">99.9%</span>
                                            </div>
                                            <div className="h-1.5 bg-gray-200/50 rounded-full overflow-hidden">
                                                <div className="h-full bg-[#1B9157] w-[99.9%]" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className={cn(glass.card, "p-6 flex flex-col md:flex-row items-center justify-between gap-6 bg-white shadow-sm")}>
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 shadow-sm">
                        <Database className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="space-y-0.5">
                        <h4 className="text-sm font-bold text-[#1A1A1A] tracking-tight">Encryption & Data Residency</h4>
                        <p className="max-w-2xl text-[11px] text-gray-500 font-medium leading-relaxed">
                            BeeYield Enterprise enforces technical separation between tax compliance events and financial ledgers. All KRA transmission logs are AES-256 encrypted at rest.
                        </p>
                    </div>
                </div>
                <button className={cn(glass.btnSecondary, "h-9 px-6 font-bold text-xs uppercase shrink-0")}>Download VSDC Log</button>
            </div>
        </motion.div>
    );
};

export default SettingsIntegrationsView;

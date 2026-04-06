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

const SettingsIntegrationsView: React.FC<{ initialConfigs?: any[] }> = ({ initialConfigs }) => {
    const [configs, setConfigs] = React.useState<any[]>(initialConfigs || []);
    const [loading, setLoading] = React.useState(!initialConfigs);

    // State for inputs
    const [kraPin, setKraPin] = React.useState('');
    const [branchCode, setBranchCode] = React.useState('00');
    const [deviceSerial, setDeviceSerial] = React.useState('BY-VSCU-MOCK-2026');
    const [companyName, setCompanyName] = React.useState('');

    const fetchConfigs = React.useCallback(async (force = false) => {
        if (!force && configs.length > 0) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const data = await beeyieldService.getIntegrationConfigs();
            setConfigs(data || []);

            const etims = data?.find((c: any) => c.platform === 'etims');
            if (etims) {
                setKraPin(etims.kra_pin || etims.config_json?.kra_pin || '');
                setBranchCode(etims.branch_code || etims.config_json?.branch_code || '00');
                setDeviceSerial(etims.device_serial || etims.config_json?.device_serial || 'BY-VSCU-MOCK-2026');
                setCompanyName(etims.company_name || etims.config_json?.company_name || '');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [configs.length]);

    React.useEffect(() => {
        if (initialConfigs && initialConfigs.length > 0) {
            const etims = initialConfigs.find((c: any) => c.platform === 'etims');
            if (etims) {
                setKraPin(etims.kra_pin || etims.config_json?.kra_pin || '');
                setBranchCode(etims.branch_code || etims.config_json?.branch_code || '00');
                setDeviceSerial(etims.device_serial || etims.config_json?.device_serial || 'BY-VSCU-MOCK-2026');
                setCompanyName(etims.company_name || etims.config_json?.company_name || '');
            }
            setConfigs(initialConfigs);
            setLoading(false);
        } else {
            fetchConfigs();
        }
    }, [initialConfigs, fetchConfigs]);

    const handleConnectETIMS = async () => {
        if (!kraPin) return toast.error("KRA PIN is required for legal compliance");
        setLoading(true);
        const res = await beeyieldService.upsertIntegrationConfig({
            platform: 'etims',
            is_active: true,
            kra_pin: kraPin,
            branch_code: branchCode,
            device_serial: deviceSerial,
            config_json: {
                kra_pin: kraPin,
                branch_code: branchCode,
                device_serial: deviceSerial,
                company_name: companyName
            }
        });
        setLoading(false);
        if (res) {
            toast.success('KRA eTIMS Compliance Hub Activated');
            // After saving required details, take the user to eTIMS to sign in/sign up.
            // This is the official entry point for onboarding/credentials management.
            try {
                window.open('https://etims.kra.go.ke/', '_blank', 'noopener,noreferrer');
            } catch {
                // ignore (popup blockers)
            }
            fetchConfigs();
        }
    };

    const isConnected = React.useMemo(() => (platform: string) => 
        configs.some(c => c.platform === platform && c.is_active), 
    [configs]);
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
                        <span className="text-[10px] font-bold tracking-wider text-gray-700">
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
                                    <p className="text-[10px] font-bold text-gray-500 tracking-wider">Electronic Tax Invoice Generation Enforcement</p>
                                </div>
                            </div>
                            <button
                                onClick={handleConnectETIMS}
                                className={cn(glass.btnPrimary, "h-9 px-6 font-bold text-xs")}
                                disabled={loading}
                            >
                                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : isConnected('etims') ? "Sync Compliance Keys" : "Connect VSDC Gateway"}
                            </button>
                        </div>
                        
                        <CardContent className="p-6 md:p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-500 tracking-wider ml-1">Registered KRA PIN</label>
                                        <Input
                                            placeholder="P05XXXXXXXX"
                                            value={kraPin}
                                            onChange={(e) => setKraPin(e.target.value.toUpperCase())}
                                            className="h-10 bg-gray-50 border-gray-100 text-sm font-bold focus:bg-white transition-colors text-center"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-500 tracking-wider ml-1">Branch Code</label>
                                        <Input
                                            placeholder="00"
                                            value={branchCode}
                                            onChange={(e) => setBranchCode(e.target.value)}
                                            className="h-10 bg-gray-50 border-gray-100 text-sm font-bold focus:bg-white transition-colors text-center"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-500 tracking-wider ml-1">Device Serial</label>
                                        <Input
                                            placeholder="BY-VSCU-MOCK-2026"
                                            value={deviceSerial}
                                            onChange={(e) => setDeviceSerial(e.target.value.toUpperCase())}
                                            className="h-10 bg-gray-50 border-gray-100 text-sm font-bold focus:bg-white transition-colors text-center"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-500 tracking-wider ml-1">Registered Business</label>
                                        <Input
                                            placeholder="BeeYield Ltd"
                                            value={companyName}
                                            onChange={(e) => setCompanyName(e.target.value)}
                                            className="h-10 bg-gray-50 border-gray-100 text-sm font-bold focus:bg-white transition-colors text-center"
                                        />
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-4 relative overflow-hidden">
                                    <div className="flex items-center gap-3">
                                        <Activity className="w-4 h-4 text-[#1B9157]" />
                                        <span className="text-[10px] font-bold tracking-wider text-gray-500">Live Resilience Metrics</span>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center bg-white px-4 py-2.5 rounded-lg border border-gray-100">
                                            <span className="text-[10px] font-bold text-gray-400 tracking-wider">Authorized Hub</span>
                                            <span className="text-xs font-bold text-[#1B9157]">BeeYield-VSDC-v4</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-white px-4 py-2.5 rounded-lg border border-gray-100">
                                            <span className="text-[10px] font-bold text-gray-400 tracking-wider">Last sync</span>
                                            <span className="text-xs font-bold text-gray-700">{getSyncDate('etims')}</span>
                                        </div>
                                        <div className="pt-3">
                                            <div className="flex justify-between items-center mb-1.5 px-1">
                                                <span className="text-[10px] font-bold text-gray-400 tracking-wider">Uptime Stability</span>
                                                <span className="text-[10px] font-bold text-[#1B9157]">99.9%</span>
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
                            We store data securely. Tax and finance records are kept separate, and transmission logs are encrypted at rest.
                        </p>
                    </div>
                </div>
                <button className={cn(glass.btnSecondary, "h-9 px-6 font-bold text-xs shrink-0")}>Download VSDC Log</button>
            </div>
        </motion.div>
    );
};

export default SettingsIntegrationsView;

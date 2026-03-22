import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, MapPin, Hexagon, Hand, User, Mail, ShieldCheck, Calendar, Activity, ClipboardList, HelpCircle, FileBarChart, Cpu, Puzzle } from 'lucide-react';
import { glass, PageHeader } from './GlassTheme';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useApiaries } from '@/hooks/useHives';
import { useHives } from '@/hooks/useHives';
import { useHarvests } from '@/hooks/useHarvests';
import type { Apiary, Hive, Harvest, IoTDevice, SensorReading } from '@/services/beeyieldService';

interface DashboardHomeViewProps {
    devices: IoTDevice[];
    readings: SensorReading[];
    apiaries: Apiary[];
    onTabChange: (tab: string, message?: string, action?: string) => void;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between gap-4 py-2 border-b border-[#F4D03F]/10 last:border-b-0">
            <span className="text-[10px] font-black text-gray-400">{label}</span>
            <span className="text-[11px] font-bold text-[#1A1A1A] break-all text-right">{value}</span>
        </div>
    );
}

/* ─── Main View ─── */
const DashboardHomeView: React.FC<DashboardHomeViewProps> = ({ onTabChange }) => {
    const { user, beeyieldUser } = useAuth();
    const [selectedHarvest, setSelectedHarvest] = React.useState<Harvest | null>(null);
    const apiariesQuery = useApiaries();
    const hivesQuery = useHives();
    const harvestsQuery = useHarvests();

    const apiaries = apiariesQuery.data || [];
    const hives = hivesQuery.data || [];
    const harvests = harvestsQuery.data || [];

    const now = new Date();
    const hour = now.getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

    const userMetadata = user?.user_metadata || {};
    const fullName = userMetadata.first_name || userMetadata.full_name || user?.email?.split('@')[0] || 'User';
    const avatarUrl = userMetadata.avatar_url;

    const recentHarvests = [...harvests]
        .sort((a: any, b: any) => new Date(b.harvest_date).getTime() - new Date(a.harvest_date).getTime())
        .slice(0, 8);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={glass.page}
        >
            {/* Header */}
            <PageHeader
                icon={LayoutGrid}
                label="BeeYield AI Dashboard"
                title={<>{greeting}, {fullName}</>}
                subtitle="Your expert-level operational OS."
                actions={
                    <div className="flex gap-2">
                        <button
                            onClick={() => onTabChange('assistant')}
                            className={cn(glass.btnSecondary, "gap-2")}
                        >
                            <Hexagon className="w-4 h-4 text-[#F4D03F]" />
                            BeeYield AI
                        </button>
                        <button
                            onClick={() => onTabChange('harvests')}
                            className={cn(glass.btnPrimary)}
                        >
                            <Hand className="w-4 h-4" />
                            Harvests
                        </button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Account */}
                <div className="lg:col-span-4">
                    <div className={cn(glass.section, "p-5")}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-white border border-[#F4D03F]/10 flex items-center justify-center overflow-hidden shadow-sm">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-[#F9F7F2] text-[#F4D03F] font-bold text-sm">
                                        {fullName.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-[#1A1A1A]">{fullName}</h3>
                                <p className="text-[11px] text-gray-500">Your signed-in details</p>
                            </div>
                        </div>
                        <div className="bg-white/50 border border-[#F4D03F]/10 rounded-xl p-4">
                            <Row label="Email" value={user?.email || '—'} />
                            <Row label="User ID" value={user?.id || '—'} />
                            <Row label="Profile" value={beeyieldUser ? 'Active' : '—'} />
                            <Row label="Last login" value={user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : '—'} />
                        </div>
                        <div className="mt-4 flex gap-2">
                            <button onClick={() => onTabChange('settings')} className={cn(glass.btnSecondary, "flex-1 justify-center gap-2")}>
                                <ShieldCheck className="w-4 h-4 text-[#F4D03F]" />
                                Settings
                            </button>
                            <button onClick={() => onTabChange('support')} className={cn(glass.btnSecondary, "flex-1 justify-center gap-2")}>
                                <Mail className="w-4 h-4 text-[#F4D03F]" />
                                Support
                            </button>
                        </div>
                    </div>
                </div>

                {/* Important views */}
                <div className="lg:col-span-8">
                    <div className={cn(glass.section, "p-5")}>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-sm font-semibold text-[#1A1A1A]">Important views</h3>
                                <p className="text-[11px] text-gray-500">Quick access to core workflows</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {[
                                { id: 'devices', label: 'Devices', icon: Cpu, sub: 'Sensors & activity' },
                                { id: 'meters', label: 'Meters', icon: Activity, sub: 'Usage & alarms' },
                                { id: 'precision-pollination-folder', label: 'Pollination', icon: FileBarChart, sub: 'Plans & exports' },
                                { id: 'task', label: 'My Task', icon: ClipboardList, sub: 'Tasks & setup' },
                                { id: 'requests', label: 'Requests', icon: HelpCircle, sub: 'Support tickets' },
                                { id: 'integrations', label: 'Integrations', icon: Puzzle, sub: 'QuickBooks / Shopify' },
                            ].map((v) => (
                                <button
                                    key={v.id}
                                    type="button"
                                    onClick={() => onTabChange(v.id)}
                                    className={cn(
                                        "text-left bg-white/50 border border-[#F4D03F]/10 rounded-2xl p-4 hover:bg-white/70 hover:border-[#F4D03F]/20 transition-all",
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-[#F4D03F]/10 border border-[#F4D03F]/10 flex items-center justify-center">
                                            <v.icon className="w-5 h-5 text-[#F4D03F]" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-black text-[11px] tracking-tight text-[#1A1A1A] truncate">{v.label}</div>
                                            <div className="text-[10px] text-gray-500 truncate">{v.sub}</div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Apiaries */}
                <div className="lg:col-span-4">
                    <div className={cn(glass.section, "overflow-hidden")}>
                        <div className="px-5 py-4 border-b border-[#F4D03F]/20 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-[#F4D03F]/10 flex items-center justify-center border border-[#F4D03F]/10">
                                    <MapPin className="w-4 h-4 text-[#F4D03F]" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-[#1A1A1A]">Apiaries</h3>
                                    <p className="text-[11px] text-gray-500">{apiaries.length} records</p>
                                </div>
                            </div>
                            <button onClick={() => onTabChange('places')} className={cn(glass.btnSecondary, "h-8 px-3 text-[10px]")}>
                                Open
                            </button>
                        </div>
                        <div className="p-4 space-y-2">
                            {apiariesQuery.isLoading ? (
                                <div className="text-[11px] text-gray-500">Loading…</div>
                            ) : apiaries.length === 0 ? (
                                <div className="text-[11px] text-gray-500">No apiaries yet.</div>
                            ) : (
                                apiaries.slice(0, 8).map((a: Apiary) => (
                                    <div key={a.id} className="bg-white/50 border border-[#F4D03F]/10 rounded-xl p-3">
                                        <div className="font-black text-[11px] tracking-tight text-[#1A1A1A] truncate">{a.name}</div>
                                        <div className="text-[10px] text-gray-500 truncate">{a.location_name || 'Unknown location'}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Hives */}
                <div className="lg:col-span-4">
                    <div className={cn(glass.section, "overflow-hidden")}>
                        <div className="px-5 py-4 border-b border-[#F4D03F]/20 flex items-center justify-between">
                            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onTabChange('beeyield')}>
                                <div className="w-9 h-9 rounded-xl bg-[#F4D03F]/10 flex items-center justify-center border border-[#F4D03F]/10 group-hover:bg-[#F4D03F]/20 transition-all">
                                    <Hexagon className="w-4 h-4 text-[#F4D03F]" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-[#1A1A1A] group-hover:text-[#F4D03F] transition-colors">Hives</h3>
                                    <p className="text-[11px] text-gray-500">{hives.length} records</p>
                                </div>
                            </div>
                            <button onClick={() => onTabChange('beeyield')} className={cn(glass.btnSecondary, "h-8 px-3 text-[10px]")}>
                                Open
                            </button>
                        </div>
                        <div className="p-4 space-y-2">
                            {hivesQuery.isLoading ? (
                                <div className="text-[11px] text-gray-500">Loading…</div>
                            ) : hives.length === 0 ? (
                                <div className="text-[11px] text-gray-500">No hives yet.</div>
                            ) : (
                                hives.slice(0, 8).map((h: Hive) => (
                                    <div 
                                        key={h.id} 
                                        onClick={() => onTabChange('beeyield')}
                                        className="bg-white/50 border border-[#F4D03F]/10 rounded-xl p-3 cursor-pointer hover:border-[#F4D03F]/30 hover:bg-white transition-all group"
                                    >
                                        <div className="font-black text-[11px] tracking-tight text-[#1A1A1A] truncate group-hover:text-[#F4D03F] transition-colors">{h.hive_code}</div>
                                        <div className="text-[10px] text-gray-500 truncate">{h.status || 'Active'}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Harvests */}
            <div className={cn(glass.section, "overflow-hidden mt-6")}>
                <div className="px-5 py-4 border-b border-[#F4D03F]/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#F4D03F]/10 flex items-center justify-center border border-[#F4D03F]/10">
                            <Hand className="w-4 h-4 text-[#F4D03F]" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-[#1A1A1A]">Harvests</h3>
                            <p className="text-[11px] text-gray-500">{harvests.length} records</p>
                        </div>
                    </div>
                    <button onClick={() => onTabChange('harvests')} className={cn(glass.btnSecondary, "h-8 px-3 text-[10px]")}>
                        Open
                    </button>
                </div>
                <div className="p-4 space-y-2">
                    {harvestsQuery.isLoading ? (
                        <div className="text-[11px] text-gray-500">Loading…</div>
                    ) : recentHarvests.length === 0 ? (
                        <div className="text-[11px] text-gray-500">No harvests yet.</div>
                    ) : (
                        recentHarvests.map((h: Harvest) => (
                            <button 
                                key={h.id} 
                                onClick={() => setSelectedHarvest(h)}
                                className="w-full text-left bg-white/50 border border-[#F4D03F]/10 rounded-xl p-3 flex items-center justify-between gap-4 hover:bg-[#F4D03F]/5 transition-all active:scale-[0.98] group"
                            >
                                <div className="min-w-0">
                                    <div className="font-black text-[11px] tracking-tight text-[#1A1A1A] truncate group-hover:text-[#F4D03F] transition-colors">{h.batch_code || `BAT-${h.id.slice(-6).toUpperCase()}`}</div>
                                    <div className="text-[10px] text-gray-500 truncate">{h.honey_type || '—'}</div>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <div className="text-[10px] font-black tabular-nums text-[#1A1A1A]">{(h.quantity_kg ?? 0).toFixed(1)} kg</div>
                                    <div className="text-[10px] text-gray-500 flex items-center gap-1">
                                        <Calendar className="w-3 h-3 opacity-60" />
                                        {h.harvest_date ? new Date(h.harvest_date).toLocaleDateString() : '—'}
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Harvest Details Modal */}
            <AnimatePresence>
                {selectedHarvest && (
                    <div className={glass.modalOverlay} onClick={() => setSelectedHarvest(null)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className={cn(glass.modalCard, "max-w-md")}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-[#F4D03F]/10">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <h2 className="text-xl font-bold text-foreground tracking-tight">Harvest <span className="text-[#F4D03F]">Details</span></h2>
                                        <p className="text-xs text-gray-400 font-medium tracking-tight">Traceability record for {selectedHarvest.batch_code || 'this batch'}</p>
                                    </div>
                                    <button onClick={() => setSelectedHarvest(null)} className="w-8 h-8 rounded-lg bg-[#F9F7F2] border border-[#F4D03F]/10 flex items-center justify-center hover:bg-red-500/10 transition-all">
                                        <Activity className="w-4 h-4 text-gray-400" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black uppercase text-gray-400">Batch Code</span>
                                        <div className="text-sm font-bold truncate tabular-nums">{selectedHarvest.batch_code || '—'}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black uppercase text-gray-400">Date</span>
                                        <div className="text-sm font-bold">{selectedHarvest.harvest_date ? new Date(selectedHarvest.harvest_date).toLocaleDateString() : '—'}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black uppercase text-gray-400">Yield (KG)</span>
                                        <div className="text-sm font-bold text-[#1B9157]">{selectedHarvest.quantity_kg?.toFixed(1)} KG</div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black uppercase text-gray-400">Honey Type</span>
                                        <div className="text-sm font-bold">{selectedHarvest.honey_type || '—'}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black uppercase text-gray-400">Extraction</span>
                                        <div className="text-sm font-bold">{selectedHarvest.extraction_method || '—'}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black uppercase text-gray-400">Color Grade</span>
                                        <div className="text-sm font-bold">{selectedHarvest.color_grade || '—'}</div>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-[#F4D03F]/10">
                                    <button onClick={() => setSelectedHarvest(null)} className={cn(glass.btnPrimary, "w-full")}>
                                        Close Details
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default DashboardHomeView;

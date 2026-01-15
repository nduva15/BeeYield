import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, Mail, MessageSquare, BookOpen, Settings2, CloudRain, Briefcase, UserRound, X, Star, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsViewProps {
    onTabChange?: (tab: string) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onTabChange }) => {
    const [showBanner, setShowBanner] = useState(() => {
        const saved = localStorage.getItem('beeyield_settings_banner_hidden');
        return saved !== 'true';
    });

    const hideBanner = () => {
        setShowBanner(false);
        localStorage.setItem('beeyield_settings_banner_hidden', 'true');
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            {/* First Steps Banner */}
            {showBanner && (
                <div className="bg-[#FFF8F0] dark:bg-amber-950/10 p-10 rounded-[2.5rem] border border-[#FFE5B4] dark:border-amber-900/20 relative overflow-hidden">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={hideBanner}
                        className="absolute right-8 top-8 rounded-xl bg-white dark:bg-[#09090b] border-gray-100 dark:border-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all h-8 px-4"
                    >
                        Hide
                    </Button>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">First steps</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-2xl font-medium">
                        Start here to set up your apiaries, devices, and measurements.
                    </p>

                    <div className="space-y-4">
                        <p className="text-[10px] font-bold text-[#B48428] uppercase tracking-[0.2em]">Quick Links</p>
                        <div className="flex flex-wrap gap-3">
                            {[
                                { id: 'places', label: 'Add apiaries and hives' },
                                { id: 'devices', label: 'My devices' },
                                { id: 'data', label: 'Measurement data' },
                                { id: 'support', label: 'Support Center' },
                                { id: 'beeyield', label: 'BeeHUB Agro Intelligence' },
                                { id: 'settings', label: 'Settings' },
                            ].map((link) => (
                                <Button
                                    key={link.id}
                                    variant="outline"
                                    onClick={() => onTabChange?.(link.id)}
                                    className="rounded-full bg-white dark:bg-[#1e1e1e] border-orange-100 dark:border-gray-800 hover:bg-orange-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-sm font-bold text-xs h-10 px-6"
                                >
                                    {link.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <h1 className="text-4xl font-black text-gray-900 dark:text-white">Settings</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-8">
                    {/* General Section */}
                    <Card className="rounded-[2.5rem] border border-gray-100 dark:border-[#1e1e1e] bg-white dark:bg-[#09090b] shadow-sm overflow-hidden">
                        <CardHeader className="p-10 pb-2">
                            <CardTitle className="text-2xl font-black">General</CardTitle>
                        </CardHeader>
                        <CardContent className="p-10 space-y-4">
                            <div className="relative group">
                                <Label htmlFor="username" className="absolute left-4 top-3 text-[9px] font-black text-gray-400 uppercase tracking-widest z-10">Username</Label>
                                <Input id="username" defaultValue="timothy" className="pt-8 pb-3 px-4 rounded-xl bg-gray-50/50 dark:bg-[#1e1e1e] border-gray-100 dark:border-gray-800 h-16 shadow-none font-bold text-gray-400 cursor-not-allowed group-hover:border-amber-200 transition-colors" readOnly />
                            </div>
                            <div className="relative group">
                                <Label htmlFor="email" className="absolute left-4 top-3 text-[9px] font-black text-gray-400 uppercase tracking-widest z-10">Email</Label>
                                <Input id="email" defaultValue="timothy.mathuva@strathmore.edu" className="pt-8 pb-3 px-4 rounded-xl bg-gray-50/50 dark:bg-[#1e1e1e] border-gray-100 dark:border-gray-800 h-16 shadow-none font-bold text-gray-400 cursor-not-allowed group-hover:border-amber-200 transition-colors" readOnly />
                            </div>
                            <div className="relative group">
                                <Label htmlFor="firstname" className="absolute left-4 top-3 text-[9px] font-black text-gray-400 uppercase tracking-widest z-10">First name</Label>
                                <Input id="firstname" defaultValue="Timothy" className="pt-8 pb-3 px-4 rounded-xl bg-white dark:bg-[#09090b] border-gray-200 dark:border-gray-800 h-16 shadow-none font-bold group-hover:border-amber-300 focus:border-amber-500 transition-all outline-none" />
                            </div>
                            <div className="relative group">
                                <Label htmlFor="surname" className="absolute left-4 top-3 text-[9px] font-black text-gray-400 uppercase tracking-widest z-10">Surname</Label>
                                <Input id="surname" defaultValue="Mathuva Nduva" className="pt-8 pb-3 px-4 rounded-xl bg-white dark:bg-[#09090b] border-gray-200 dark:border-gray-800 h-16 shadow-none font-bold group-hover:border-amber-300 focus:border-amber-500 transition-all outline-none" />
                            </div>
                            <div className="relative group">
                                <Label htmlFor="phone" className="absolute left-4 top-3 text-[9px] font-black text-gray-400 uppercase tracking-widest z-10">Telephone number</Label>
                                <Input id="phone" defaultValue="0742014187" className="pt-8 pb-3 px-4 rounded-xl bg-white dark:bg-[#09090b] border-gray-200 dark:border-gray-800 h-16 shadow-none font-bold group-hover:border-amber-300 focus:border-amber-500 transition-all outline-none" />
                            </div>
                            <div className="relative group">
                                <Label htmlFor="language" className="absolute left-4 top-3 text-[9px] font-black text-gray-400 uppercase tracking-widest z-10">Language</Label>
                                <select id="language" className="w-full pt-8 pb-3 px-4 rounded-xl bg-white dark:bg-[#09090b] border-gray-200 dark:border-gray-800 h-16 shadow-none font-bold group-hover:border-amber-300 focus:border-amber-500 transition-all outline-none appearance-none">
                                    <option>English</option>
                                    <option>Polish</option>
                                    <option>French</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 font-bold">⌄</div>
                            </div>
                            <div className="flex justify-end pt-4">
                                <Button className="border-2 border-[#FFE5B4] hover:bg-[#FFE5B4]/20 text-[#B48428] rounded-2xl px-10 font-black h-12 transition-all shadow-sm">Save</Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Email Notifications Segment */}
                    <Card className="rounded-[2.5rem] border border-gray-100 dark:border-[#1e1e1e] bg-white dark:bg-[#09090b] shadow-sm overflow-hidden">
                        <CardHeader className="p-10 pb-4">
                            <CardTitle className="text-2xl font-black leading-tight">Email notifications from BeeHUB devices</CardTitle>
                            <p className="text-sm text-gray-400 font-medium pt-2">BeeHUB device sends out vandalism alerts. You can temporarily disable this option, for example during an inspection.</p>
                        </CardHeader>
                        <CardContent className="p-10 pt-0 space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="relative flex items-center">
                                    <Switch defaultChecked className="data-[state=checked]:bg-[#B48428]" />
                                </div>
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Allow for email notifications from BeeHUB devices</span>
                                <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                            </div>
                            <div className="flex justify-end">
                                <Button className="border-2 border-[#FFE5B4] hover:bg-[#FFE5B4]/20 text-[#B48428] rounded-2xl px-10 font-black h-12 transition-all">Save</Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* AI Auto Notifications */}
                    <Card className="rounded-[2.5rem] border border-gray-100 dark:border-[#1e1e1e] bg-white dark:bg-[#09090b] shadow-sm overflow-hidden">
                        <CardHeader className="p-10 pb-4">
                            <CardTitle className="text-2xl font-black leading-tight">AI auto notifications</CardTitle>
                            <p className="text-sm text-gray-400 font-medium pt-2">When significant patterns are detected (e.g., anomalies, swarming risk, sensor issues), we'll send an automatic notification.</p>
                        </CardHeader>
                        <CardContent className="p-10 pt-0 space-y-8">
                            <div className="flex items-center gap-3">
                                <Switch defaultChecked className="data-[state=checked]:bg-[#B48428]" />
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Enable AI notifications</span>
                                <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                            </div>
                            <div className="flex justify-end">
                                <Button className="border-2 border-[#FFE5B4] hover:bg-[#FFE5B4]/20 text-[#B48428] rounded-2xl px-10 font-black h-12 transition-all">Save</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                    {/* Account Info */}
                    <Card className="rounded-[2.5rem] border border-gray-100 dark:border-[#1e1e1e] bg-white dark:bg-[#09090b] shadow-sm overflow-hidden">
                        <CardHeader className="p-10 pb-4">
                            <CardTitle className="text-2xl font-black">Account information</CardTitle>
                        </CardHeader>
                        <CardContent className="p-10 pt-0 space-y-6">
                            <div className="flex justify-between items-center py-2">
                                <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">Account type</span>
                                <Badge className="bg-blue-500 text-white rounded-md text-[9px] uppercase font-black tracking-widest border-none px-2 py-1">BEEKEEPER</Badge>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">Subscription expires</span>
                                <span className="text-sm font-black text-gray-900 dark:text-white">-</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">Registered on</span>
                                <span className="text-sm font-black text-gray-900 dark:text-white">14.01.2026 21:55</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Change Password */}
                    <Card className="rounded-[2.5rem] border border-gray-100 dark:border-[#1e1e1e] bg-white dark:bg-[#09090b] shadow-sm overflow-hidden">
                        <CardHeader className="p-10 pb-4">
                            <CardTitle className="text-2xl font-black">Change password</CardTitle>
                            <p className="text-sm text-gray-400 font-medium pt-2">Change password</p>
                        </CardHeader>
                        <CardContent className="p-10 pt-0">
                            <div className="flex justify-end">
                                <Button variant="outline" className="rounded-2xl px-8 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-black h-12 transition-all shadow-none">Change password</Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Delete Account */}
                    <Card className="rounded-[2.5rem] border border-gray-100 dark:border-[#1e1e1e] bg-white dark:bg-[#09090b] shadow-sm overflow-hidden">
                        <CardHeader className="p-10 pb-4">
                            <CardTitle className="text-2xl font-black">Delete Account</CardTitle>
                            <p className="text-sm text-gray-400 font-medium pt-4 leading-relaxed font-medium">Delete Account means the action of deleting an Account. This removes the Account from the database entirely. A deleted Account can't be recovered.</p>
                        </CardHeader>
                        <CardContent className="p-10 pt-0">
                            <div className="flex justify-end pt-4">
                                <Button variant="outline" className="rounded-2xl px-10 border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 font-black h-12 transition-all shadow-none">Delete My Account</Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Guides & Tutorials */}
                    <Card className="rounded-[2.5rem] border border-gray-100 dark:border-[#1e1e1e] bg-white dark:bg-[#09090b] shadow-sm overflow-hidden">
                        <CardHeader className="p-10 pb-4">
                            <CardTitle className="text-2xl font-black">Guides & Tutorials</CardTitle>
                            <p className="text-sm text-gray-400 font-medium pt-2">Enable or disable in-app tips, guides and onboarding tutorials.</p>
                        </CardHeader>
                        <CardContent className="p-10 pt-0 space-y-8">
                            <div className="flex items-center gap-3">
                                <Switch defaultChecked className="data-[state=checked]:bg-[#B48428]" />
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Enable tips & tutorials</span>
                                <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                            </div>
                            <div className="flex justify-end">
                                <Button className="border-2 border-[#FFE5B4] hover:bg-[#FFE5B4]/20 text-[#B48428] rounded-2xl px-10 font-black h-12 transition-all">Save</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Modules Section */}
            <Card className="rounded-[2.5rem] border border-gray-100 dark:border-[#1e1e1e] bg-white dark:bg-[#09090b] shadow-sm overflow-hidden mt-8">
                <CardHeader className="p-10 pb-6 border-b border-gray-50 dark:border-[#1e1e1e]">
                    <CardTitle className="text-3xl font-black">Enable / disable modules</CardTitle>
                    <p className="text-sm text-gray-400 font-medium mt-4 max-w-3xl leading-relaxed">Enable or disable the main application modules for your account. Changes affect the menu and access to features.</p>

                    <div className="flex gap-2 mt-8">
                        <Button variant="outline" size="sm" className="rounded-xl px-6 border-gray-200 text-xs font-black uppercase tracking-widest h-10 shadow-none">Enable all</Button>
                        <Button variant="outline" size="sm" className="rounded-xl px-6 border-gray-200 text-xs font-black uppercase tracking-widest h-10 shadow-none">Disable all</Button>
                    </div>
                </CardHeader>
                <CardContent className="p-10 pt-8">
                    <div className="border border-gray-100 dark:border-[#1e1e1e] rounded-[2.5rem] overflow-hidden">
                        <div className="bg-gray-50/50 dark:bg-[#1e1e1e]/20 px-8 py-6 border-b border-gray-100 dark:border-[#1e1e1e]">
                            <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Core modules</p>
                            <p className="text-[10px] font-bold text-amber-600">UI only for now (no persistence)</p>
                        </div>

                        <div className="divide-y divide-gray-50 dark:divide-[#1e1e1e]">
                            {[
                                { id: 'beeyield', icon: Settings2, label: 'Intelligent Hives', desc: 'Manage hives and apiaries', priority: true, enabled: true },
                                { id: 'agro', icon: CloudRain, label: 'Agro & Meteo', desc: 'Weather data and meteo stations', priority: false, enabled: false },
                                { id: 'resources', icon: Briefcase, label: 'My Resources', desc: 'Auxiliary devices and resources (e.g., trackers)', priority: false, enabled: false },
                                { id: 'patients', icon: UserRound, label: 'Patients', desc: 'Care and records in veterinary mode', priority: false, enabled: false },
                            ].map((mod) => (
                                <div key={mod.id} className="p-8 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-white/5 transition-all">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 bg-white dark:bg-[#09090b] rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 dark:border-gray-800">
                                            <mod.icon className="w-7 h-7 text-gray-900 dark:text-white" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-lg font-black text-gray-900 dark:text-white">{mod.label}</span>
                                                {mod.priority && (
                                                    <Badge className="bg-amber-500 text-white text-[8px] font-black tracking-widest px-2 py-0.5 rounded-sm border-none">PRIORITY</Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-400 font-medium">{mod.desc}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <button className="text-gray-300 hover:text-amber-500 transition-colors">
                                            <Star className={cn("w-6 h-6", mod.id === 'beeyield' && "fill-amber-500 text-amber-500")} />
                                        </button>
                                        <Switch defaultChecked={mod.enabled} className="data-[state=checked]:bg-amber-600" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="px-10 py-8 bg-gray-50/30 dark:bg-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 dark:border-[#1e1e1e]">
                            <div className="flex gap-4">
                                <Button variant="link" className="text-blue-500 font-black text-xs uppercase tracking-widest p-0 h-auto hover:text-blue-600">Disable all</Button>
                                <Button variant="link" className="text-blue-500 font-black text-xs uppercase tracking-widest p-0 h-auto hover:text-blue-600">Enable all</Button>
                            </div>
                            <Button className="bg-amber-500 hover:bg-amber-600 text-white rounded-2xl px-12 h-14 font-black shadow-lg shadow-amber-500/20 border-none transition-all scale-105">Save</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SettingsView;

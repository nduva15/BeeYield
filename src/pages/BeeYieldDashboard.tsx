import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { beeyieldService, IoTDevice, SensorReading } from '@/services/beeyieldService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    LayoutGrid, MessageSquare, Box, LineChart, Signal, Bluetooth, Cpu, Usb, FileText, HelpCircle,
    Plus, Filter, SlidersHorizontal, MoreHorizontal, Battery, Wifi, Clock, AlertTriangle, CheckCircle2,
    X, ChevronDown, MapPin, Search, ClipboardList, Calculator, Receipt, LifeBuoy, Settings,
    Hand, Map, TrendingUp, Volume2, Camera, BookOpen, Droplet, Flame, Zap, Building2, Home, PieChart,
    ArrowRightLeft, FileInput, Bot, Activity, Gauge, List, Layers, BarChart3, Upload, LayoutList, Hexagon, Puzzle,
    LogIn, UserPlus, Loader2, ArrowLeft, Shield, Lock
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import DashboardLayout from '@/components/beeyield/DashboardLayout';
import { NavItem } from '@/components/beeyield/DashboardSidebar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import { useLanguage } from '@/contexts/LanguageContext';

// View Imports
import MyDevicesView from '@/components/beeyield/MyDevicesView';
import AIAssistantView from '@/components/beeyield/AIAssistantView';
import AgroIntelligenceView from '@/components/beeyield/AgroIntelligenceView';
import MyPlacesView from '@/components/beeyield/MyPlacesView';
import BeeYieldHivesView from '@/components/beeyield/BeeYieldHivesView';
import MeasurementDataView from '@/components/beeyield/MeasurementDataView';
import SettingsView from '@/components/beeyield/SettingsView';
import {
    BeeYieldOnlineView,
    BluetoothView,
    USBView
} from '@/components/beeyield/RemainingViews';

import MyRequestsView from '@/components/beeyield/MyRequestsView';
import MyNotesView from '@/components/beeyield/MyNotesView';
import MyTaskView from '@/components/beeyield/MyTaskView';
import BuyBeeYieldHubView from '@/components/beeyield/BuyBeeYieldHubView';
import MetersView from '@/components/beeyield/MetersView';
import BillingView from '@/components/beeyield/BillingView';
import SupportCenterView from '@/components/beeyield/SupportCenterView';
import ServerStatusView from '@/components/beeyield/ServerStatusView';

type AuthMode = 'login' | 'register' | 'forgot-password';

const BeeYieldDashboard: React.FC = () => {
    const { user, loading: authLoading, signOut } = useAuth();
    const navigate = useNavigate();

    // Auth State
    const [authMode, setAuthMode] = useState<AuthMode>('login');

    // Dashboard state
    const [loading, setLoading] = useState(true);
    const [devices, setDevices] = useState<IoTDevice[]>([]);
    const [readings, setReadings] = useState<SensorReading[]>([]);
    const [activeTab, setActiveTab] = useState('devices');
    const [showBanner, setShowBanner] = useState(true);

    const handleLogout = async () => {
        await signOut();
        navigate('/shop');
        toast.success("Disconnected from Secure Ecosystem");
    };

    // Data fetching
    useEffect(() => {
        const loadData = async () => {
            // Only load data if user is authenticated
            if (!user) return;

            setLoading(true);
            try {
                const [devicesData, readingsData] = await Promise.all([
                    beeyieldService.getDevices(),
                    beeyieldService.getSensorReadings(undefined, 24 * 7) // Get last 7 days for stats
                ]);
                setDevices(devicesData);
                setReadings(readingsData);
            } catch (error) {
                console.error('Failed to load dashboard data', error);
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading && user) {
            loadData();
        }
    }, [user, authLoading]);

    // Derived Stats
    const totalDevices = devices.length;
    const withMeasurement = devices.filter(d => readings.some(r => r.device_id === d.id)).length;

    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    const measuredIn24h = devices.filter(d => {
        const lastReading = readings.find(r => r.device_id === d.id); // Assuming sorted or filtering approach
        // Better: check if ANY reading for this device is within 24h
        return readings.some(r => r.device_id === d.id && (now.getTime() - new Date(r.timestamp).getTime() < oneDay));
    }).length;

    const measuredIn48h = devices.filter(d => {
        return readings.some(r => r.device_id === d.id && (now.getTime() - new Date(r.timestamp).getTime() < oneDay * 2));
    }).length;

    const measuredIn7Days = devices.filter(d => {
        return readings.some(r => r.device_id === d.id && (now.getTime() - new Date(r.timestamp).getTime() < oneDay * 7));
    }).length;

    // Attention Needed Stats (Mock logic for demonstration)
    const noMeasurement5Days = devices.filter(d => {
        const hasRecent = readings.some(r => r.device_id === d.id && (now.getTime() - new Date(r.timestamp).getTime() < oneDay * 5));
        return !hasRecent;
    }).length;

    const lowBattery = devices.filter(d => d.battery_level < 20).length;

    const { language, t } = useLanguage();

    // Nav Items matching screenshot precisely
    const navItems: NavItem[] = [
        { id: 'assistant', label: t('nav_ai_assistant'), icon: Bot },
        { id: 'places', label: t('nav_my_places'), icon: MapPin },
        {
            id: 'beeyield',
            label: t('nav_beeyield_hives'),
            icon: Hexagon,
            hasSubmenu: true,
            submenuItems: [
                { id: 'inspections', label: t('nav_inspections'), icon: Search },
                { id: 'harvests', label: t('nav_harvests'), icon: Hand },
                { id: 'flight-map', label: t('nav_flight_map'), icon: Map },
                { id: 'varroa', label: t('nav_varroa'), icon: TrendingUp },
                { id: 'sound', label: t('nav_sound'), icon: Volume2 },
                { id: 'image-analysis', label: t('nav_image_analysis'), icon: Camera },
                { id: 'health-guide', label: t('nav_health_guide'), icon: BookOpen },
            ]
        },
        {
            id: 'data',
            label: t('nav_measurement_data'),
            icon: Activity,
            hasSubmenu: true,
            submenuItems: [
                { id: 'online', label: t('nav_online'), icon: Signal },
                { id: 'bluetooth', label: t('nav_bluetooth'), icon: Bluetooth },
                { id: 'devices', label: t('nav_my_devices'), icon: Cpu },
                { id: 'usb', label: t('nav_usb'), icon: Usb },
            ]
        },
        { id: 'notes', label: t('nav_my_notes'), icon: FileText },
        { id: 'requests', label: t('nav_my_requests'), icon: HelpCircle },
        { id: 'task', label: t('nav_my_task'), icon: ClipboardList },
        { id: 'buy', label: t('nav_buy'), icon: Cpu },
        {
            id: 'meters',
            label: t('nav_meters'),
            icon: LayoutList,
            hasSubmenu: true,
            submenuItems: [
                { id: 'meters-dashboard', label: t('nav_dashboard'), icon: Gauge },
                {
                    id: 'meters-list',
                    label: t('nav_meter_list'),
                    icon: List,
                    subItems: [
                        { id: 'meters-water', label: t('nav_water'), icon: Droplet },
                        { id: 'meters-heat', label: t('nav_heat'), icon: Flame },
                        { id: 'meters-energy', label: t('nav_energy'), icon: Zap },
                        { id: 'meters-other', label: t('nav_other'), icon: Layers },
                    ]
                },
                {
                    id: 'meters-buildings',
                    label: t('nav_buildings'),
                    icon: Building2,
                    subItems: [
                        { id: 'meters-apartments', label: t('nav_apartments'), icon: Home },
                    ]
                },
                {
                    id: 'meters-measurements',
                    label: t('nav_measurements'),
                    icon: Activity,
                    subItems: [
                        { id: 'meters-charts', label: t('nav_charts'), icon: BarChart3 },
                        { id: 'meters-consumption', label: t('nav_consumption'), icon: PieChart },
                        { id: 'meters-comparisons', label: t('nav_comparisons'), icon: ArrowRightLeft },
                        { id: 'meters-import', label: t('nav_import'), icon: Upload },
                    ]
                },
            ]
        },
        { id: 'billing', label: t('billing'), icon: Receipt },
        { id: 'support', label: t('nav_support'), icon: LifeBuoy },
        { id: 'settings', label: t('settings'), icon: Settings },
    ];

    // Function to render content based on active tab
    const renderContent = () => {
        switch (activeTab) {
            case 'assistant':
                return <AIAssistantView onTabChange={setActiveTab} />;
            case 'agro-intelligence':
                return <AgroIntelligenceView onTabChange={setActiveTab} />;
            case 'places':
                return <MyPlacesView onTabChange={setActiveTab} />;
            case 'beeyield':
                return <BeeYieldHivesView onTabChange={setActiveTab} />;
            case 'data':
                return <MeasurementDataView onTabChange={setActiveTab} />;
            case 'online':
                return <BeeYieldOnlineView onTabChange={setActiveTab} />;
            case 'bluetooth':
                return <BluetoothView onTabChange={setActiveTab} />;
            case 'devices':
                return <MyDevicesView devices={devices} readings={readings} onTabChange={setActiveTab} />;
            case 'usb':
                return <USBView onTabChange={setActiveTab} />;
            case 'notes':
                return <MyNotesView onTabChange={setActiveTab} />;
            case 'requests':
                return <MyRequestsView onTabChange={setActiveTab} />;
            case 'task':
                return <MyTaskView onTabChange={setActiveTab} />;
            case 'buy':
                return <BuyBeeYieldHubView onTabChange={setActiveTab} />;
            case 'meters':
            case 'meters-dashboard':
            case 'meters-list':
            case 'meters-water':
            case 'meters-heat':
            case 'meters-energy':
            case 'meters-other':
            case 'meters-buildings':
            case 'meters-apartments':
            case 'meters-measurements':
            case 'meters-charts':
            case 'meters-consumption':
            case 'meters-comparisons':
            case 'meters-import':
                return <MetersView onTabChange={setActiveTab} activeSubTab={activeTab} />;
            case 'billing':
                return <BillingView onTabChange={setActiveTab} />;
            case 'support':
                return <SupportCenterView onTabChange={setActiveTab} />;
            case 'server-status':
                return <ServerStatusView onTabChange={setActiveTab} />;
            case 'settings': // Special case from top bar or banner
                return <SettingsView onTabChange={setActiveTab} />;
            default:
                return (
                    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-white dark:bg-[#09090b] rounded-[2.5rem] border border-dashed border-gray-200 dark:border-[#1e1e1e]">
                        <div className="w-16 h-16 bg-gray-50 dark:bg-[#1e1e1e] rounded-2xl flex items-center justify-center mb-4">
                            <Box className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {navItems.find(i => i.id === activeTab)?.label || 'View Content'}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-sm font-medium">
                            This section is currently under development. Check back soon for updates!
                        </p>
                    </div>
                );
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    // Check if user has initialized BeeYield access - BYPASSED FOR DEVELOPMENT
    const isBeeYieldActive = true;

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    // 1. User is not logged in OR does not have a Pollination account: Show Login/Register
    // BYPASSED: skipping check for development
    if (false && (!user || !isBeeYieldActive)) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#050505] text-white font-mono">
                <div className="max-w-md w-full text-center space-y-8">
                    <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto border border-primary/20 relative">
                        <Hexagon className="h-12 w-12 text-primary" />
                        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-50" />
                    </div>
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 mb-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-red-500 tracking-widest uppercase">Access Denied</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter">RESTRICTED <br /><span className="text-primary italic">AIRSPACE</span></h1>
                        <p className="text-white/40 text-xs font-bold uppercase tracking-widest leading-relaxed">
                            To interface with the BeeYield professional IoT ecosystem, authorization is mandatory.
                        </p>
                    </div>

                    <div className="grid gap-3">
                        <Button
                            onClick={() => navigate('/beeyield-login')}
                            className="w-full h-14 text-sm font-black rounded-xl bg-primary text-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            <LogIn className="w-4 h-4 mr-2" /> Authenticate Session
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/shop')}
                            className="w-full h-14 text-white/40 hover:text-white transition-colors uppercase tracking-widest text-[10px] font-bold"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" /> Return to Public Shop
                        </Button>
                    </div>

                    <div className="pt-8 border-t border-white/5 flex flex-col items-center gap-2">
                        <div className="flex gap-4">
                            <Shield className="h-3 w-3 text-white/10" />
                            <Lock className="h-3 w-3 text-white/10" />
                        </div>
                        <p className="text-[8px] text-white/10 tracking-[0.3em]">ENCRYPTED KERNEL ACCESS ONLY</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <DashboardLayout
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onLogout={handleLogout}
            navItems={navItems}
        >
            {renderContent()}
        </DashboardLayout>
    );
};

export default BeeYieldDashboard;

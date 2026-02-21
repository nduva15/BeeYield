import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { beeyieldService, IoTDevice, SensorReading, Apiary, Hive } from '@/services/beeyieldService';
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
    LogIn, UserPlus, Loader2, ArrowLeft, Shield, Lock, Bell, Banknote, Globe, Tag, ShieldCheck, Server,
    Navigation, FileBarChart, Brain, Crosshair, Scale, FileCheck
} from 'lucide-react';
import { Award } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import DashboardLayout from '@/components/beeyield/DashboardLayout';
import { NavItem } from '@/components/beeyield/DashboardSidebar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '@/contexts/LanguageContext';
import UserDebugPanel from '@/components/beeyield/UserDebugPanel';
import { SUPER_ADMIN_EMAIL } from '@/config/constants';

// View Imports
import MyDevicesView from '@/components/beeyield/MyDevicesView';
import SmartAssistantView from '@/components/beeyield/SmartAssistantView';
import AgroIntelligenceView from '@/components/beeyield/AgroIntelligenceView';
import MyPlacesView from '@/components/beeyield/MyPlacesView';
import BeeYieldHivesView from '@/components/beeyield/BeeYieldHivesView';
import GlobalHiveNetwork from '@/pages/GlobalHiveNetwork';
import MeasurementDataView from '@/components/beeyield/MeasurementDataView';
import SettingsView from '@/components/beeyield/SettingsView';
import PrecisionPollinationView from '@/components/beeyield/PrecisionPollinationView';
import BloomTrackingView from '@/components/beeyield/BloomTrackingView';
import {
    BeeYieldOnlineView,
    USBView
} from '@/components/beeyield/RemainingViews';
import { BluetoothConnectivityView } from '@/components/beeyield/BluetoothConnectivityView';

import ReportsExportsView from '@/components/beeyield/ReportsExportsView';
import LabelGeneratorView from '@/components/beeyield/LabelGeneratorView';

import MyRequestsView from '@/components/beeyield/MyRequestsView';
import MyNotesView from '@/components/beeyield/MyNotesView';
import MyTaskView from '@/components/beeyield/MyTaskView';
import BuyBeeYieldHubView from '@/components/beeyield/BuyBeeYieldHubView';
import MetersView from '@/components/beeyield/MetersView';
import BillingView from '@/components/beeyield/BillingView';
import SupportCenterView from '@/components/beeyield/SupportCenterView';
import ServerStatusView from '@/components/beeyield/ServerStatusView';
import InspectionsView from '@/components/beeyield/InspectionsView';
import HarvestsView from '@/components/beeyield/HarvestsView';
import ImageAnalysisView from '@/components/beeyield/ImageAnalysisView';
import SoundAnalysisView from '@/components/beeyield/SoundAnalysisView';
import HealthGuideView from '@/components/beeyield/HealthGuideView';
import FlightMapView from '@/components/beeyield/FlightMapView';
import VarroaView from '@/components/beeyield/VarroaView';
import SensorHealthView from '@/components/beeyield/SensorHealthView';
import ContinuousMonitor from '@/components/beeyield/ContinuousMonitor';
import YardOperations from '@/components/beeyield/YardOperations';
import GeospatialSecurity from '@/components/beeyield/GeospatialSecurity';
import PollinationIntelligence from '@/components/beeyield/PollinationIntelligence';
import OrchardMapper from '@/components/beeyield/OrchardMapper';
import SeasonSummary from '@/components/beeyield/SeasonSummary';
import PollinationEngine from '@/components/beeyield/PollinationEngine';

import LiveActivityHeatmap from '@/components/beeyield/LiveActivityHeatmap';
import PredictiveSuccessEngine from '@/components/beeyield/PredictiveSuccessEngine';
import HealthyHiveIndex from '@/components/beeyield/HealthyHiveIndex';
import DeploymentPlanning from '@/components/beeyield/DeploymentPlanning';

import ForagingOptimizer from '@/components/beeyield/ForagingOptimizer';
import HiveLogisticsSecurity from '@/components/beeyield/HiveLogisticsSecurity';
import DigitalHealthAudit from '@/components/beeyield/DigitalHealthAudit';
import AcousticMoodTransformer from '@/components/beeyield/AcousticMoodTransformer';
import BeeFlightHoursForecast from '@/components/beeyield/BeeFlightHoursForecast';
import VpmAutoCounter from '@/components/beeyield/VpmAutoCounter';
import VpmTicker from '@/components/beeyield/VpmTicker';
import HpaOptimizer from '@/components/beeyield/HpaOptimizer';
import FleetSecurity from '@/components/beeyield/FleetSecurity';
import ComplianceReport from '@/components/beeyield/ComplianceReport';
import BeeCalculatorPage from '@/components/beeyield/BeeCalculatorPage';

import DashboardHomeView from '@/components/beeyield/DashboardHomeView';

import HiveTelemetryView from '@/components/beeyield/HiveTelemetryView';
import ContractVerificationModule from '@/components/beeyield/ContractVerificationModule';
import GatewayHub from '@/components/beeyield/GatewayHub';
import SpatialCoverageView from '@/components/beeyield/SpatialCoverageView';
import MasterMapView from '@/pages/MasterMapView';
import BeeCalculatorSuite from '@/pages/BeeCalculatorSuite';
import BloomPhenology from '@/pages/BloomPhenology';


type AuthMode = 'login' | 'register' | 'forgot-password';

const BeeYieldDashboard: React.FC = () => {
    const { user, loading: authLoading, signOut, beeyieldUser } = useAuth();
    const navigate = useNavigate();
    const { t } = useLanguage();

    // Auth State
    const [authMode, setAuthMode] = React.useState<AuthMode>('login');

    // Dashboard state
    const [loading, setLoading] = React.useState(true);
    const [devices, setDevices] = React.useState<IoTDevice[]>([]);
    const [readings, setReadings] = React.useState<SensorReading[]>([]);
    const [apiaries, setApiaries] = React.useState<Apiary[]>([]);
    const [hives, setHives] = React.useState<Hive[]>([]);
    const [activeTab, setActiveTab] = React.useState('home');
    const [aiInitialMessage, setAiInitialMessage] = React.useState<string | null>(null);
    const [showBanner, setShowBanner] = React.useState(true);

    const [viewParams, setViewParams] = React.useState<{ message?: string, action?: string } | null>(null);

    const handleTabChange = (tab: string, message?: string, action?: string) => {
        if (tab === 'assistant' && message) {
            setAiInitialMessage(message);
        }
        setViewParams({ message, action });
        setActiveTab(tab);
    };

    const handleLogout = async () => {
        await signOut();
        navigate('/shop');
        toast.success(t('disconnected_success'));
    };

    // Data fetching
    React.useEffect(() => {
        const loadData = async () => {
            // Only load data if user is authenticated
            if (!user) return;

            setLoading(true);
            try {
                const [devicesData, readingsData, apiariesData, hivesData] = await Promise.all([
                    beeyieldService.getDevices(),
                    beeyieldService.getSensorReadings(undefined, 24 * 7), // Get last 7 days for stats
                    beeyieldService.getApiaries(),
                    beeyieldService.getHives()
                ]);

                const userId = beeyieldUser?.id || user?.id;
                const filteredApiaries = userId ? apiariesData.filter(a => !a.user_id || a.user_id === userId) : apiariesData;
                const filteredHives = userId ? hivesData.filter(h => !h.user_id || h.user_id === userId) : hivesData;

                setDevices(devicesData);
                setReadings(readingsData);
                setApiaries(filteredApiaries);
                setHives(filteredHives);
            } catch (error) {
                console.error('Failed to load dashboard data', error);
                toast.error(t('error_load_dashboard'));
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

    // Attention Needed Stats
    const noMeasurement5Days = devices.filter(d => {
        const hasRecent = readings.some(r => r.device_id === d.id && (now.getTime() - new Date(r.timestamp).getTime() < oneDay * 5));
        return !hasRecent;
    }).length;

    const lowBattery = devices.filter(d => d.battery_level < 20).length;



    // Nav Items matching screenshot precisely
    const navItems: NavItem[] = [
        { id: 'home', label: 'Home', icon: Home },
        { id: 'assistant', label: t('nav_ai_assistant'), icon: Bot },
        { id: 'agro-intelligence', label: t('nav_agro_intelligence'), icon: LayoutGrid },
        {
            id: 'precision-pollination-folder',
            label: t('nav_precision_pollination'),
            icon: Calculator,
            hasSubmenu: true,
            submenuItems: [
                {
                    title: 'Field Info',
                    items: [
                        { id: 'intelligence', label: 'Pollination Info', icon: Brain },
                        { id: 'logistics-setup', label: 'Farm Map', icon: Layers },
                        { id: 'fleet-security-active', label: 'Asset Security', icon: ShieldCheck },
                    ]
                },
                {
                    title: 'Analysis',
                    items: [
                        { id: 'acoustic-transformer', label: 'Hive Sound', icon: Volume2 },
                        { id: 'bee-calculator', label: 'Op-Health Calculator', icon: Calculator },
                        { id: 'hpa-optimizer', label: 'HPA Optimizer', icon: Calculator },
                        { id: 'foraging-optimizer', label: 'Bee Optimizer', icon: Crosshair },
                        { id: 'vpm-counter', label: 'Visits Counter', icon: Camera },
                        { id: 'bfh-forecast', label: 'Efficiency Forecast', icon: Zap },
                        { id: 'yield-predict', label: 'Yield Forecast', icon: Cpu },
                    ]
                },
                {
                    title: 'Checkups',
                    items: [
                        { id: 'digital-audit', label: 'Hive Check', icon: FileBarChart },
                        { id: 'compliance-report', label: 'Pollination Report', icon: Award },
                        { id: 'bloom-tracking', label: 'Flower Status', icon: Zap },
                    ]
                },
                {
                    title: 'System View',
                    items: [
                        { id: 'sensor-vitals', label: 'Hive Health', icon: Zap },
                        { id: 'continuous-monitor', label: 'Live View', icon: Activity },
                        { id: 'yard-ops', label: 'Bee Yard', icon: Building2 },
                        { id: 'gateway-hub', label: 'Gateway Hub', icon: Server },
                    ]
                },
                {
                    title: 'Forecasting & Infrastructure',
                    items: [
                        { id: 'hive-telemetry', label: 'Weight Dynamics', icon: Scale },
                        { id: 'saturation-math', label: 'Saturation Math', icon: Crosshair },
                        { id: 'contract-verification', label: 'Grade Certificates', icon: ShieldCheck },
                    ]
                },
            ]
        },

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
                { id: 'reports-exports', label: t('nav_reports_exports'), icon: FileText },
                { id: 'label-generator', label: t('nav_label_generator'), icon: Tag },
                { id: 'global-hive-network', label: t('nav_global_hive_network'), icon: Globe },
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
                { id: 'meters-alarms', label: t('nav_alarms_events'), icon: Bell },
                { id: 'meters-payments', label: t('nav_payments_settlements'), icon: Banknote },
                { id: 'meters-reports', label: t('nav_reports'), icon: FileText },
                { id: 'meters-settings', label: t('settings'), icon: Settings },
            ]
        },
        { id: 'billing', label: t('billing'), icon: Receipt },
        { id: 'support', label: t('nav_support'), icon: LifeBuoy },
        { id: 'settings', label: t('settings'), icon: Settings },
    ];

    // Function to render content based on active tab
    const renderContent = () => {
        switch (activeTab) {
            case 'home':
                return <DashboardHomeView devices={devices} readings={readings} apiaries={apiaries} onTabChange={handleTabChange} />;
            case 'assistant':
                return (
                    <SmartAssistantView
                        onTabChange={handleTabChange}
                        initialMessage={aiInitialMessage || undefined}
                        onInitialMessageConsumed={() => setAiInitialMessage(null)}
                    />
                );
            case 'agro-intelligence':
                return <AgroIntelligenceView onTabChange={handleTabChange} />;
            case 'precision-pollination-folder':
            case 'precision-pollination-home':
                return <PrecisionPollinationView devices={devices} readings={readings} onTabChange={handleTabChange} activeSubPageOverride="home" />;
            case 'precision-pollination-grid':
                return <PrecisionPollinationView devices={devices} readings={readings} onTabChange={handleTabChange} activeSubPageOverride="grid" />;
            case 'bloom-tracking':
            case 'bloom-phenology':
                return <BloomPhenology />;
            case 'pollination-calcs':
            case 'pollination-engine':
                return <PollinationEngine onTabChange={handleTabChange} />;
            case 'flight-mapping-tactical':
                return <PrecisionPollinationView devices={devices} readings={readings} onTabChange={handleTabChange} activeSubPageOverride="map" />;
            case 'site-reports-tactical':
                return <PrecisionPollinationView devices={devices} readings={readings} onTabChange={handleTabChange} activeSubPageOverride="reports" />;

            case 'intelligence':
            case 'pollination-intelligence':
                return <PollinationIntelligence onTabChange={handleTabChange} />;

            case 'logistics-setup':
            case 'orchard-mapper':
            case 'master-map':
                return <MasterMapView />;

            case 'fleet-security':
            case 'geospatial-security':
            case 'deployment':
                return <HiveLogisticsSecurity onTabChange={handleTabChange} />;

            case 'acoustic-transformer':
                return <AcousticMoodTransformer />;

            case 'bee-calculator':
            case 'calculator-suite':
                return <BeeCalculatorSuite />;

            case 'hpa-optimizer':
                return <HpaOptimizer />;

            case 'foraging-optimizer':
                return <ForagingOptimizer onTabChange={handleTabChange} />;

            case 'yield-predict':
                return <PredictiveSuccessEngine onTabChange={handleTabChange} />;

            case 'fleet-security-active':
                return <FleetSecurity />;

            case 'bfh-forecast':
                return <BeeFlightHoursForecast />;

            case 'vpm-counter':
                return <VpmAutoCounter />;

            case 'digital-audit':
            case 'hhi-audit':
                return <DigitalHealthAudit onTabChange={handleTabChange} />;

            case 'compliance-report':
                return <ComplianceReport />;

            case 'sensor-vitals':
                return <SensorHealthView onTabChange={handleTabChange} />;
            case 'continuous-monitor':
                return <ContinuousMonitor onTabChange={handleTabChange} />;
            case 'yard-management':
                return <YardOperations onTabChange={handleTabChange} />;
            case 'fleet-security':
            case 'baas-command':
                return <GeospatialSecurity onTabChange={handleTabChange} />;
            case 'orchard-mapper':
                return <OrchardMapper onTabChange={handleTabChange} />;
            case 'season-summary':
                return <SeasonSummary onTabChange={handleTabChange} />;

            case 'hive-telemetry':
                return <HiveTelemetryView />;
            case 'contract-verification':
                return <ContractVerificationModule />;
            case 'gateway-hub':
                return <GatewayHub />;
            case 'saturation-math':
                return <SpatialCoverageView />;

            case 'places':
                return <MyPlacesView onTabChange={handleTabChange} />;
            case 'beeyield':
                return <BeeYieldHivesView onTabChange={handleTabChange} />;
            case 'inspections':
                return <InspectionsView onTabChange={handleTabChange} initialParams={viewParams} />;
            case 'harvests':
                return <HarvestsView onTabChange={handleTabChange} initialParams={viewParams} />;
            case 'flight-map':
                return <FlightMapView />;
            case 'varroa':
                return <VarroaView />;
            case 'global-hive-network':
                return <GlobalHiveNetwork />;
            case 'data':
                return <MeasurementDataView onTabChange={handleTabChange} />;
            case 'online':
                return <BeeYieldOnlineView onTabChange={handleTabChange} />;
            case 'bluetooth':
                return <BluetoothConnectivityView onTabChange={handleTabChange} />;
            case 'devices':
                return <MyDevicesView devices={devices} readings={readings} apiaries={apiaries} hives={hives} onTabChange={handleTabChange} />;
            case 'usb':
                return <USBView onTabChange={handleTabChange} />;
            case 'notes':
                return <MyNotesView onTabChange={handleTabChange} />;
            case 'requests':
                return <MyRequestsView onTabChange={handleTabChange} />;
            case 'task':
                return <MyTaskView onTabChange={handleTabChange} />;
            case 'buy':
                return <BuyBeeYieldHubView onTabChange={handleTabChange} />;
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
            case 'meters-alarms':
            case 'meters-payments':
            case 'meters-reports':
            case 'meters-settings':
                return <MetersView onTabChange={handleTabChange} activeSubTab={activeTab} />;
            case 'billing':
                return <BillingView onTabChange={handleTabChange} />;
            case 'support':
                return <SupportCenterView onTabChange={handleTabChange} />;
            case 'settings': // Special case from top bar or banner
                return <SettingsView onTabChange={handleTabChange} />;
            case 'image-analysis':
                return <ImageAnalysisView onTabChange={handleTabChange} />;
            case 'sound':
                return <SoundAnalysisView onTabChange={handleTabChange} />;
            case 'health-guide':
                return <HealthGuideView />;
            case 'reports-exports':
                return <ReportsExportsView onTabChange={handleTabChange} />;
            case 'label-generator':
                return <LabelGeneratorView onTabChange={handleTabChange} />;
            default:
                return (
                    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-white dark:bg-[#09090b] rounded-[2.5rem] border border-dashed border-gray-200 dark:border-[#1e1e1e]">
                        <div className="w-16 h-16 bg-gray-50 dark:bg-[#1e1e1e] rounded-2xl flex items-center justify-center mb-4">
                            <Box className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {navItems.find(i => i.id === activeTab)?.label || t('view_content')}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-sm font-medium">
                            {t('under_development')}
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

    // Check if user has initialized BeeYield access
    const isBeeYieldActive = !!user?.user_metadata?.beeyield_active || ['timothynduva349@gmail.com', SUPER_ADMIN_EMAIL.toLowerCase()].includes(user?.email?.toLowerCase() || '') || !!beeyieldUser;



    if (!user || !isBeeYieldActive) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-white font-sans text-[#064e3b] antialiased">
                <div className="max-w-2xl w-full text-center space-y-12">
                    <div className="w-24 h-24 border-4 border-[#064e3b] bg-[#facc15] flex items-center justify-center mx-auto shadow-[8px_8px_0px_0px_rgba(6,78,59,1)]">
                        <Hexagon className="h-12 w-12 text-[#064e3b] fill-current" />
                    </div>

                    <div className="space-y-6">
                        <h1 className="text-6xl font-black uppercase tracking-tighter leading-none">
                            Access <span className="text-[#10b981]">Denied</span>
                        </h1>
                        <p className="text-[10px] font-black uppercase text-[#064e3b]/40 tracking-[0.4em]">
                            Security Check
                        </p>
                    </div>

                    <div className="border-4 border-[#064e3b] p-10 bg-white shadow-[12px_12px_0px_0px_rgba(6,78,59,1)]">
                        <p className="text-sm font-black uppercase leading-relaxed mb-10">
                            You need to log in to see this page.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <button
                                onClick={() => navigate('/login')}
                                className="h-14 px-12 border-2 border-[#064e3b] bg-[#10b981] text-white font-black uppercase text-xs tracking-widest hover:bg-black transition-all flex items-center justify-center gap-3"
                            >
                                <Lock className="w-4 h-4" />
                                Login
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/')}
                        className="text-[10px] font-black uppercase tracking-widest text-[#064e3b]/30 hover:text-[#10b981] transition-colors"
                    >
                        Back home
                    </button>
                </div >
            </div >
        );
    }

    return (
        <DashboardLayout
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onLogout={handleLogout}
            navItems={navItems}
        >
            <div className="mb-6">
                <UserDebugPanel />
            </div>
            {renderContent()}
        </DashboardLayout>
    );
};

export default BeeYieldDashboard;

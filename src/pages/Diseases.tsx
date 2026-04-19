import React, { useState } from "react";
import { MapContainer, TileLayer, Circle, Marker, Popup, Tooltip, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
    Activity,
    Shield,
    Droplets,
    ArrowRight,
    CheckCircle,
    CheckCircle2,
    Sparkles,
    Leaf,
    Globe,
    Zap,
    Smartphone,
    Wifi,
    Thermometer,
    Cpu,
    Mic,
    Scale,
    Radio,
    HelpCircle,
    Mail,
    Phone,
    LayoutDashboard,
    MapPin,
    AlertTriangle,
    BarChart3,
    BellRing,
    Satellite,
    ShieldCheck,
    Target,
    HeartPulse,
    Microscope,
    FlaskConical,
    Handshake,
    Bug,
    TrendingDown,
    Eye,
    BookOpen,
    Expand,
    BadgeDollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

import { submitContactForm } from "@/services/contactService";
import { useToast } from "@/hooks/use-toast";
import { BeeYieldPageShell } from "@/components/beeyield/BeeYieldUI";

import LOGO from "@/assets/Logo.png";

// Apisense partnership images (public/images/diseases/)
const SENSOR_PORTRAIT = "/images/diseases/apisense-sensor-portrait.jpg";
const SENSOR_LANDSCAPE = "/images/diseases/apisense-sensor-landscape.png";
const APISENSE_APP = "/images/diseases/apisense-app.png";
const SATELLITE_HEATMAP = "/images/diseases/satellite-heatmap.jpg";
const HIVE_INSPECTION = "/images/diseases/hive-inspection.jpg";

// Map Data
const getHubIcon = () => {
    const color = '#10b981'; // BeeYield Green for HQ
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36" fill="white" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0px 4px 12px ${color}90);">
            <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
            <circle cx="12" cy="10" r="3.5" fill="${color}" stroke="none" />
        </svg>
    `;
    return L.divIcon({
        className: "bg-transparent border-none",
        html: svg,
        iconSize: [36, 36],
        iconAnchor: [18, 36]
    });
};

const getSatIcon = (status: string) => {
    const color = status === 'Warning' ? '#ef4444' : '#f59e0b'; // Amber for standard to match the screenshot vibe
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="white" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0px 4px 8px ${color}80);">
            <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
            <circle cx="12" cy="10" r="3" fill="${color}" stroke="none" />
        </svg>
    `;
    return L.divIcon({
        className: "bg-transparent border-none",
        html: svg,
        iconSize: [28, 28],
        iconAnchor: [14, 28]
    });
};

const kibweziHub = { name: "Kibwezi HQ", lat: -2.4167, lng: 37.9667 };

const satellites = [
    { id: "API-01", lat: -2.3867, lng: 37.9567, status: "Active" },
    { id: "API-02", lat: -2.4367, lng: 37.9867, status: "Active" },
    { id: "API-03", lat: -2.4067, lng: 37.9167, status: "Warning" },
    { id: "API-04", lat: -2.4467, lng: 37.9467, status: "Active" },
    { id: "API-05", lat: -2.3967, lng: 37.9967, status: "Active" },
    { id: "API-06", lat: -2.4267, lng: 37.9967, status: "Active" },
    { id: "API-07", lat: -2.4367, lng: 37.9267, status: "Active" },
    { id: "API-08", lat: -2.3767, lng: 37.9767, status: "Active" },
    { id: "API-09", lat: -2.4567, lng: 37.9667, status: "Active" }
];

const Diseases = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "+254",
        message: ""
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Split name into first/last for backend consistency
            const nameParts = formData.name.trim().split(/\s+/);
            const first_name = nameParts[0] || "";
            const last_name = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "Unknown";

            const response = await submitContactForm({
                first_name,
                last_name,
                email: formData.email,
                phone: formData.phone,
                city: "Nairobi",
                state: "Nairobi",
                country: "Kenya",
                inquiry_type: "diseases",
                topic: "Disease Detection & Apisense Partnership Inquiry",
                message: formData.message
            });

            toast({
                title: "✅ Inquiry Sent!",
                description: response?.message || "We've received your message and will get back to you soon.",
            });

            setFormData({
                name: "",
                email: "",
                phone: "+254",
                message: ""
            });
        } catch (error) {
            console.error(error);
            toast({
                title: "Submission Failed",
                description: "There was an error sending your message. Please try again.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    /* ── Data Arrays ────────────────────────────────────── */

    const howItWorks = [
        {
            title: "Advanced Gas Monitoring",
            description: "Specialized sensors continuously analyze the air composition inside the hive, tracking volatile organic compounds (VOCs), carbon dioxide (CO₂), and nitrogen oxides (NOx).",
            icon: <Thermometer className="h-7 w-7" />,
        },
        {
            title: "Acoustic & Environmental Data",
            description: "Integrated microphones assess the mood and condition of the colony through sound analysis, while hive scales monitor honey yield and external conditions.",
            icon: <Mic className="h-7 w-7" />,
        },
        {
            title: "Satellite Data Integration",
            description: "Apisense combines hive location data with satellite environmental monitoring to track temperature, humidity, and local forage availability.",
            icon: <Satellite className="h-7 w-7" />,
        },
        {
            title: "Centralized AI Analytics",
            description: "All data is transmitted in real-time via an LTE gateway to proprietary AI algorithms that detect anomalies and early signs of disease.",
            icon: <Cpu className="h-7 w-7" />,
        },
    ];

    const pollinationAdvantages = [
        {
            title: "Strategic & Safe Hive Placement",
            description: "By leveraging Apisense's satellite data analysis and interactive risk maps, BeeYield gains a precise understanding of the environmental conditions surrounding each apiary. This enables field teams to place hives in locations with the lowest disease risk and highest forage potential — a direct upgrade to BeeYield's precision pollination model.",
            icon: <MapPin className="h-7 w-7" />,
            badge: "Precision Placement",
        },
        {
            title: "Reduced Chemical Intervention",
            description: "Because Apisense detects diseases at their absolute earliest stages, BeeYield can drastically reduce the need for heavy chemical treatments. This not only lowers apiary management costs but also ensures that the pollination process remains as natural and safe as possible for the surrounding agricultural ecosystem.",
            icon: <Droplets className="h-7 w-7" />,
            badge: "Natural Pollination",
        },
        {
            title: "Instant Alerts & Actionable Guidance",
            description: "BeeYield's apiary managers receive instant mobile notifications the moment a risk is detected. The Apisense system provides a clear diagnosis and actionable treatment recommendations — enabling rapid response against threats like Foulbrood, Nosema, or Varroa, protecting the entire apiary.",
            icon: <BellRing className="h-7 w-7" />,
            badge: "Real-Time Response",
        }
    ];

    const advantageTable = [
        {
            feature: "IoT Air & Acoustic Sensors",
            technology: "Monitors VOCs, CO₂, NOx, and hive sounds to detect early signs of Foulbrood, Varroa, and Nosema.",
            benefit: "Ensures only strong, healthy colonies are deployed to your fields, maximizing pollination efficiency.",
            icon: <Wifi className="h-5 w-5" />,
        },
        {
            feature: "Satellite Risk Mapping",
            technology: "Analyzes environmental conditions, weather changes, and local forage sources.",
            benefit: "Guides BeeYield's precision hive placement, avoiding high-risk zones and optimizing field coverage.",
            icon: <Satellite className="h-5 w-5" />,
        },
        {
            feature: "Disease Spread Modeling",
            technology: "Predicts the spread of pathogens across an apiary with 85% accuracy.",
            benefit: "Protects the overall workforce; infected hives are treated or quarantined before impacting the crop.",
            icon: <BarChart3 className="h-5 w-5" />,
        },
        {
            feature: "Action Recommendations",
            technology: "AI-generated guidance for feeding, treatment, or harvesting.",
            benefit: "Reduces operational downtime and chemical use, providing a sustainable pollination service.",
            icon: <Target className="h-5 w-5" />,
        },
    ];

    const benefits = [
        {
            title: "Healthy Bees",
            description: "Detect the earliest warning signs of colony stress through real-time gas and acoustic analysis — enabling intervention well before symptoms become visible to the naked eye.",
            icon: <HeartPulse className="h-7 w-7" />,
            accent: "bg-rose-500/10 text-rose-600",
        },
        {
            title: "Safe Apiary",
            description: "Contain disease outbreaks at the source hive by leveraging predictive spread modeling, preventing cascading losses across the entire apiary operation.",
            icon: <ShieldCheck className="h-7 w-7" />,
            accent: "bg-emerald-500/10 text-emerald-600",
        },
        {
            title: "Knowledge & Guidance",
            description: "Receive AI-generated treatment protocols and step-by-step response plans whenever a threat is identified — turning complex diagnostics into clear, actionable decisions.",
            icon: <BookOpen className="h-7 w-7" />,
            accent: "bg-violet-500/10 text-violet-600",
        },
        {
            title: "Continuous Monitoring",
            description: "Access live colony telemetry from any device, at any time. Track VOC levels, temperature, humidity, and hive weight around the clock without physically opening a single hive.",
            icon: <Eye className="h-7 w-7" />,
            accent: "bg-sky-500/10 text-sky-600",
        },
        {
            title: "Ease of Use",
            description: "Compact, non-invasive sensors clip directly onto the frame — no wiring, no calibration, no disruption to the colony. Installation takes minutes, not hours.",
            icon: <Sparkles className="h-7 w-7" />,
            accent: "bg-amber-500/10 text-amber-600",
        },
        {
            title: "Scalability",
            description: "A single LTE gateway supports up to 100 sensor devices within a 30-meter range. Whether managing 5 hives or 500, the system scales effortlessly with your operation.",
            icon: <Expand className="h-7 w-7" />,
            accent: "bg-indigo-500/10 text-indigo-600",
        },
        {
            title: "Reduced Chemical Use",
            description: "Pinpoint disease at its inception and apply targeted, minimal treatments instead of blanket chemical protocols — preserving the natural pollination ecosystem.",
            icon: <Leaf className="h-7 w-7" />,
            accent: "bg-lime-500/10 text-lime-600",
        },
        {
            title: "Lower Costs",
            description: "Cut operational overhead by replacing routine manual inspections with automated alerts. Fewer site visits, fewer lost colonies, and reduced treatment expenses.",
            icon: <BadgeDollarSign className="h-7 w-7" />,
            accent: "bg-teal-500/10 text-teal-600",
        }
    ];

    const appFeatures = [
        {
            title: "Manage your apiary",
            description: "Add and organize apiaries and individual hives."
        },
        {
            title: "Analyze data in real time",
            description: "Track weight charts, monitor environmental conditions, and compare results across hives."
        },
        {
            title: "Detect diseases",
            description: "Receive alerts about threats along with a ready-to-follow action plan."
        },
        {
            title: "Keep notes and inspections",
            description: "Record information about each bee colony, plan your work, and access the complete history of every hive."
        }
    ];

    const hardwareFeatures = [
        {
            title: "Gas Sensors",
            description: "Monitoring conditions inside the hive and enabling early disease detection.",
            icon: <Thermometer className="h-6 w-6" />,
        },
        {
            title: "Microphones",
            description: "Analyzing hive sounds to assess the mood and condition of the colony.",
            icon: <Mic className="h-6 w-6" />,
        },
        {
            title: "Hive Scales",
            description: "Providing continuous monitoring of honey yield and tracking external hive conditions.",
            icon: <Scale className="h-6 w-6" />,
        },
        {
            title: "LTE Gateway with GPS Module",
            description: "Enabling the transmission of data from up to 100 measuring devices to the server. With a range of 30 m, a single gateway supports the entire apiary.",
            icon: <Radio className="h-6 w-6" />,
        }
    ];

    const aiCapabilities = [
        "Disease detection — analysis of hive signals and data allows early identification of diseases and rapid response",
        "Disease spread modeling — forecasts and risk maps",
        "Advanced data analytics — uncovering patterns and anomalies",
        "Action recommendations — suggestions regarding feeding, treatment, or honey harvesting",
        "Summaries and reports — automatically generated overviews based on hive data and observations",
    ];

    const faqs = [
        {
            question: "What is Apisense?",
            answer: "Apisense is an intelligent hive monitoring system that enables early detection of bee diseases and other threats using IoT sensors, AI algorithms, and satellite data. BeeYield is an official participant in the 2026 Apisense Global Field Research program."
        },
        {
            question: "Is the Apisense system resistant to harsh weather conditions?",
            answer: "When installed according to the instructions, Apisense sensors are fully adapted to operate in harsh weather conditions — resistant to moisture, rain, snow, and extreme temperatures."
        },
        {
            question: "How does BeeYield's partnership with Apisense benefit precision pollination?",
            answer: "By integrating Apisense's IoT disease sensors into BeeYield's operations, the team deploys only the healthiest colonies. The real-time monitoring ensures strategic hive placement based on environmental risk data, maximizing pollination coverage and crop yield."
        },
        {
            question: "Can I test Apisense before deciding on full implementation?",
            answer: "If you want to experience how Apisense works, join the field testing program. As a BeeYield partner in the 2026 Global Field Research, select apiaries can gain early access to the full Apisense monitoring stack."
        },
        {
            question: "Why does the system use satellite data?",
            answer: "Satellite data enables the analysis of environmental conditions around the apiary, such as temperature, humidity, weather changes, and the availability of forage for bees. Combining this information with sensor data allows Apisense's machine learning algorithms to provide beekeepers with precise guidance on potential threats to their apiary."
        },
        {
            question: "How does Apisense use artificial intelligence (AI)?",
            answer: "Apisense uses proprietary machine learning algorithms to analyze the collected data, enabling rapid detection of anomalies and prediction of disease risks with up to 95% accuracy for diseases like Foulbrood, Nosema, and Varroa."
        },
        {
            question: "What data do the in-hive sensors collect?",
            answer: "The sensors monitor gas levels such as volatile organic compounds (VOCs), carbon dioxide (CO₂), and nitrogen oxides (NOx). They also record temperature, humidity, and the sounds generated by bees. Analyzing this data makes it possible to detect health problems in bee colonies at an early stage."
        },
    ];

    return (
        <BeeYieldPageShell className="bg-background text-foreground">

            {/* ═══════════════════════════════════════════════════════════════
                HERO SECTION — Partnership Announcement
            ═══════════════════════════════════════════════════════════════ */}
            <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden border-b border-neutral-100">
                {/* Hero background image */}
                <div className="absolute inset-0">
                    <img src={HIVE_INSPECTION} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/80 to-white/95" />
                </div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
                        <motion.img
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            src={LOGO}
                            alt="BeeYield Logo"
                            className="h-24 md:h-36 w-auto mb-12 drop-shadow-2xl"
                        />
                        <Badge className="mb-6 bg-amber-500/10 text-amber-700 border-amber-200 px-5 py-2 font-semibold text-[10px] rounded-full backdrop-blur-sm">
                            2026 Apisense Global Field Research Partner
                        </Badge>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-6xl font-bold mb-8 tracking-tight text-neutral-900"
                        >
                            Intelligent Disease <br />
                            Defense & <span className="text-beeyield-green">Precision Pollination</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-muted-foreground leading-relaxed mb-12 max-w-2xl mx-auto"
                        >
                            The BeeYield and Apisense Partnership — Integrating state-of-the-art IoT disease sensors and AI-driven analytics into BeeYield's precision pollination ecosystem.
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center"
                        >
                            <Button
                                size="lg"
                                className="h-14 px-10 bg-neutral-900 text-beeyield-green font-bold text-xs rounded-2xl hover:bg-neutral-800 transition-all shadow-xl shadow-neutral-900/20"
                                onClick={() => document.getElementById('partnership')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                Explore the Partnership <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="h-14 px-10 border-neutral-200 text-neutral-900 font-bold text-xs rounded-2xl hover:bg-neutral-50 transition-all backdrop-blur-sm"
                                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                Join 2026 Field Research
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                EFFICIENCY STATS — 95% / 85%
            ═══════════════════════════════════════════════════════════════ */}
            <section className="py-20 bg-neutral-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none" />
                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <Badge className="bg-beeyield-green/20 text-beeyield-green border-none mb-6 px-5 py-2 font-semibold text-[10px] rounded-full">
                            High Efficiency Proven by Research
                        </Badge>
                        <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
                            Industry-Leading <span className="text-beeyield-green">Accuracy</span>
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-12 text-center group hover:bg-white/10 transition-all"
                        >
                            <div className="text-7xl md:text-8xl font-black text-beeyield-green mb-4 tracking-tighter">
                                95<span className="text-4xl">%</span>
                            </div>
                            <div className="h-1 w-16 bg-beeyield-green/30 mx-auto mb-6 rounded-full" />
                            <h3 className="text-xl font-bold mb-3">Disease Detection</h3>
                            <p className="text-neutral-400 font-medium leading-relaxed text-sm">
                                Apisense achieves up to 95% accuracy in detecting <strong className="text-white">Foulbrood, Nosema, and Varroa</strong> — before they can cause irreversible damage.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-12 text-center group hover:bg-white/10 transition-all"
                        >
                            <div className="text-7xl md:text-8xl font-black text-amber-400 mb-4 tracking-tighter">
                                85<span className="text-4xl">%</span>
                            </div>
                            <div className="h-1 w-16 bg-amber-400/30 mx-auto mb-6 rounded-full" />
                            <h3 className="text-xl font-bold mb-3">Disease Spread Prediction</h3>
                            <p className="text-neutral-400 font-medium leading-relaxed text-sm">
                                Advanced modeling forecasts potential outbreaks, allowing us to <strong className="text-white">isolate threats before they compromise neighboring hives</strong>.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                PARTNERSHIP NARRATIVE
            ═══════════════════════════════════════════════════════════════ */}
            <section id="partnership" className="py-32 lg:py-48 relative overflow-hidden bg-white">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neutral-100 to-transparent" />
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-24 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="relative rounded-[3rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] aspect-square bg-neutral-900 group">
                                <img
                                    src={SENSOR_PORTRAIT}
                                    alt="Apisense IoT Sensor installed on hive frame"
                                    className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform"
                                    style={{ transitionDuration: '2000ms' }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/20 to-transparent" />
                                <div className="absolute bottom-12 left-12 right-12 p-10 bg-white/5 backdrop-blur-2xl rounded-[2rem] border border-white/10 shadow-2xl">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="h-0.5 w-12 bg-beeyield-green" />
                                        <span className="text-[10px] font-bold text-beeyield-green">Official 2026 Partner</span>
                                    </div>
                                    <p className="text-white text-xl md:text-2xl font-bold leading-tight tracking-tight">
                                        "Effective pollination is impossible without healthy, thriving colonies."
                                    </p>
                                </div>
                            </div>
                            {/* Decorative corners */}
                            <div className="absolute -top-6 -left-6 w-32 h-32 border-t-2 border-l-2 border-beeyield-green/20 rounded-tl-[3rem] -z-10" />
                            <div className="absolute -bottom-6 -right-6 w-32 h-32 border-b-2 border-r-2 border-amber-400/20 rounded-br-[3rem] -z-10" />
                        </motion.div>

                        <div className="space-y-12">
                            <div>
                                <Badge className="bg-beeyield-green/10 text-beeyield-green border-none mb-8 px-4 py-1.5 font-semibold text-[10px]">
                                    The BeeYield × Apisense Partnership
                                </Badge>
                                <h2 className="text-3xl lg:text-5xl font-bold text-neutral-900 tracking-tight mb-8">
                                    Intelligent <br />
                                    <span className="text-beeyield-green">Protection</span>
                                </h2>
                                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                                    At <strong className="text-neutral-900">BeeYield</strong>, the core mission is to deliver unparalleled precision pollination that maximizes crop yields while safeguarding the health of the most critical agricultural workforce: the bees.
                                </p>
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    BeeYield is proud to announce an official partnership with <strong className="text-neutral-900">Apisense</strong> as a key participant in their <strong className="text-neutral-900">2026 Global Field Research</strong> program. By integrating Apisense's state-of-the-art IoT disease sensors and AI-driven analytics into the BeeYield ecosystem, this partnership represents a revolutionary step forward in proactive apiary management, precision hive placement, and early threat detection.
                                </p>
                            </div>

                            <div className="grid gap-8 pt-6">
                                <div className="flex items-start gap-6 group">
                                    <div className="h-14 w-14 shrink-0 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-center group-hover:bg-beeyield-green group-hover:border-beeyield-green transition-all shadow-sm">
                                        <Microscope className="w-6 h-6 text-beeyield-green group-hover:text-white transition-colors" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-neutral-900 tracking-tight mb-2">Non-Invasive Monitoring</h4>
                                        <p className="text-neutral-400 font-medium leading-relaxed">Apisense is a compact IoT device easily installed inside a hive — monitoring bee health without disturbing their natural rhythm of life.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-6 group">
                                    <div className="h-14 w-14 shrink-0 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-center group-hover:bg-amber-400 group-hover:border-amber-400 transition-all shadow-sm">
                                        <Shield className="w-6 h-6 text-amber-500 group-hover:text-white transition-colors" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-neutral-900 tracking-tight mb-2">Proactive Disease Defense</h4>
                                        <p className="text-neutral-400 font-medium leading-relaxed">Real-time cloud AI analysis detects early signs of Foulbrood, Nosema, and Varroa before they become critical threats.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                HOW APISENSE WORKS
            ═══════════════════════════════════════════════════════════════ */}
            <section className="py-32 bg-neutral-50/50 border-y border-neutral-100 relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] pointer-events-none" />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-24">
                        <Badge className="bg-beeyield-green/10 text-beeyield-green border-none mb-6 px-5 py-2 font-semibold text-[10px] rounded-full">
                            Apisense Technology
                        </Badge>
                        <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight mb-4">How Does Apisense Work?</h2>
                        <div className="h-1 w-20 bg-beeyield-green mx-auto mb-6 rounded-full" />
                        <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                            Apisense is equipped with specialized, non-invasive IoT sensors that continuously analyze the air composition inside the hive. All data is transmitted in real time to the cloud, where Apisense's proprietary AI algorithms detect early signs of diseases and threats.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
                        {howItWorks.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white p-12 rounded-[2.5rem] border border-neutral-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] hover:border-beeyield-green/20 transition-all duration-500 group"
                            >
                                <div className="mb-10 inline-flex items-center justify-center p-6 bg-neutral-50 rounded-3xl group-hover:bg-beeyield-green/10 transition-colors text-beeyield-green">
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-bold text-neutral-900 mb-5 tracking-tight">{item.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {item.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                HIGH EFFICIENCY PROVEN BY RESEARCH
            ═══════════════════════════════════════════════════════════════ */}
            <section className="py-24 bg-neutral-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')] opacity-5" />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
                        <div className="md:w-1/3">
                            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight leading-tight">
                                High efficiency <br />
                                <span className="text-beeyield-green">proven by research:</span>
                            </h2>
                        </div>
                        <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-10 border-t md:border-t-0 md:border-l border-white/10 pt-10 md:pt-0 md:pl-12">
                            <div>
                                <h3 className="text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-neutral-400 mb-4 tracking-tighter">95%</h3>
                                <h4 className="text-lg font-bold text-white mb-2">Disease detection</h4>
                                <p className="text-sm text-white/70 leading-relaxed">
                                    Apisense achieves up to 95% accuracy in detecting early-stage signs of Foulbrood, Nosema, and Varroa destructor infestations before visible symptoms appear.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-beeyield-green to-emerald-700 mb-4 tracking-tighter">85%</h3>
                                <h4 className="text-lg font-bold text-white mb-2">Disease spread prediction</h4>
                                <p className="text-sm text-white/70 leading-relaxed">
                                    Through continuous localized monitoring, the system predicts the vector spread of diseases across the apiary with up to 85% accuracy, enabling proactive containment.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                SATELLITE DATA MONITORING — Split Layout
            ═══════════════════════════════════════════════════════════════ */}
            <section className="py-32 bg-neutral-50 relative overflow-hidden border-b border-neutral-200">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-beeyield-green/[0.03] -skew-x-12 translate-x-20 pointer-events-none" />
                
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
                        <div className="lg:w-1/2 space-y-8">
                            <div>
                                <Badge className="bg-amber-500/10 text-amber-700 border-amber-200 mb-6 px-5 py-2 font-semibold text-[10px] rounded-full">
                                    Satellite Data Monitoring
                                </Badge>
                                <h2 className="text-3xl lg:text-5xl font-bold text-neutral-900 tracking-tight mb-6">
                                    Environmental Risk <span className="text-beeyield-green">Mapping</span>
                                </h2>
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    The Apisense system harnesses real-time satellite telemetry to provide comprehensive insights into the macro-environmental conditions surrounding BeeYield apiaries in the <strong className="text-neutral-900">Kibwezi-Makueni agricultural corridor</strong>.
                                </p>
                            </div>
                            
                            <div className="space-y-6">
                                <div className="bg-white p-6 hover:p-7 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] border border-neutral-100 hover:border-amber-200 transition-all duration-300 flex flex-col sm:flex-row gap-5 group">
                                    <div className="w-14 h-14 bg-amber-50 group-hover:bg-amber-100 transition-colors text-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <MapPin className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-neutral-900 mb-2">Forage & Threat Overlay</h4>
                                        <p className="text-sm text-muted-foreground leading-relaxed">By cross-referencing precise hive coordinates with satellite data on local flora blooms and agricultural chemical drift, Apisense dynamically generates heatmaps of potential environmental risks unique to the Kenyan climate.</p>
                                    </div>
                                </div>
                                <div className="bg-white p-6 hover:p-7 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] border border-neutral-100 hover:border-beeyield-green/30 transition-all duration-300 flex flex-col sm:flex-row gap-5 group">
                                    <div className="w-14 h-14 bg-beeyield-green/10 group-hover:bg-beeyield-green/20 transition-colors text-beeyield-green rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Satellite className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-neutral-900 mb-2">Predictive Deployment</h4>
                                        <p className="text-sm text-muted-foreground leading-relaxed">This interactive spatial visualization allows BeeYield field technicians to optimize hive placement routes safely across Makueni County, preventing unnecessary exposure to extreme weather or resource-scarce zones.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:w-1/2 w-full h-[400px] md:h-[500px]">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="relative rounded-[3rem] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.15)] border-8 border-white bg-neutral-200 h-full w-full group isolate"
                            >
                                <MapContainer 
                                    center={[-2.4167, 37.9667]} 
                                    zoom={12} 
                                    scrollWheelZoom={false}
                                    style={{ height: '100%', width: '100%', zIndex: 1 }}
                                    zoomControl={false}
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                                    />
                                    
                                    {/* Central Heat Zone indicating cluster coverage */}
                                    <Circle 
                                        center={[kibweziHub.lat, kibweziHub.lng]} 
                                        radius={6500} 
                                        pathOptions={{ 
                                            fillColor: '#f59e0b', 
                                            fillOpacity: 0.1, 
                                            color: '#f59e0b',
                                            weight: 1,
                                            dashArray: '4,4'
                                        }} 
                                    />

                                    {/* Telemetry Polylines connecting Satellites to Hub */}
                                    {satellites.map((sat, idx) => (
                                        <Polyline 
                                            key={`line-${idx}`} 
                                            positions={[[kibweziHub.lat, kibweziHub.lng], [sat.lat, sat.lng]]} 
                                            pathOptions={{ color: '#10b981', weight: 1.5, dashArray: '4,6', opacity: 0.6 }} 
                                        />
                                    ))}

                                    {/* Satellite Node Markers */}
                                    {satellites.map((sat, idx) => (
                                        <Marker key={`sat-${idx}`} position={[sat.lat, sat.lng]} icon={getSatIcon(sat.status)}>
                                            <Popup className="rounded-xl font-sans" autoClose={false}>
                                                <div className="text-center p-1">
                                                    <strong className="block text-xs mb-1 text-neutral-900">Node {sat.id}</strong>
                                                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Status: <span className={sat.status === 'Active' ? 'text-beeyield-green' : 'text-amber-500'}>{sat.status}</span></span>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    ))}

                                    {/* Central HQ Marker */}
                                    <Marker position={[kibweziHub.lat, kibweziHub.lng]} icon={getHubIcon()}>
                                        <Tooltip 
                                            permanent 
                                            direction="top" 
                                            offset={[0, -12]}
                                            className="bg-white/90 backdrop-blur-sm border-none shadow-sm rounded-full px-3 py-1 text-neutral-900 font-bold text-xs"
                                        >
                                            {kibweziHub.name}
                                        </Tooltip>
                                    </Marker>
                                </MapContainer>
                                
                                {/* Overlay status bar overlaying the map securely above z-index */}
                                <div className="absolute bottom-6 left-6 right-6 pointer-events-none z-[1000] opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                                    <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 border border-white/20 pointer-events-auto">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2.5 h-2.5 rounded-full bg-beeyield-green shadow-[0_0_8px_rgba(74,222,128,0.8)] animate-pulse" />
                                            <span className="text-sm font-bold text-neutral-900">Live API Uplink Active</span>
                                        </div>
                                        <span className="text-[11px] font-mono font-medium tracking-wider text-muted-foreground bg-neutral-100 px-3 py-1.5 rounded-full">HQ: Kibwezi</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                WHY THIS MATTERS FOR PRECISION POLLINATION
            ═══════════════════════════════════════════════════════════════ */}
            <section className="py-32 bg-white relative overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-20 max-w-3xl mx-auto">
                        <Badge className="bg-amber-500/10 text-amber-700 border-amber-200 mb-6 px-5 py-2 font-semibold text-[10px] rounded-full">
                            Precision Agriculture
                        </Badge>
                        <h2 className="text-3xl lg:text-5xl font-bold text-neutral-900 tracking-tight mb-6">
                            Why This Matters for <span className="text-beeyield-green">Precision Pollination</span>
                        </h2>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            In precision agriculture, the health of the hive directly correlates to the quality of the pollination and the ultimate crop yield. The integration of Apisense into BeeYield's operations provides crucial advantages for both the bees and the growers.
                        </p>
                    </div>

                    <div className="space-y-8 max-w-5xl mx-auto">
                        {pollinationAdvantages.map((adv, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="flex flex-col md:flex-row gap-8 p-10 bg-neutral-50 rounded-[2rem] border border-neutral-100 hover:border-beeyield-green/20 hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)] transition-all duration-500 group"
                            >
                                <div className="shrink-0 flex flex-col items-center md:items-start gap-4">
                                    <div className="h-16 w-16 rounded-2xl bg-white border border-neutral-100 flex items-center justify-center text-beeyield-green group-hover:bg-beeyield-green group-hover:text-white group-hover:border-beeyield-green transition-all shadow-sm">
                                        {adv.icon}
                                    </div>
                                    <Badge className="bg-beeyield-green/10 text-beeyield-green border-none text-[9px] font-bold px-3 py-1 rounded-lg whitespace-nowrap">
                                        {adv.badge}
                                    </Badge>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-neutral-900 tracking-tight mb-4">
                                        <span className="text-beeyield-green mr-2">{index + 1}.</span>{adv.title}
                                    </h3>
                                    <p className="text-neutral-500 font-medium leading-relaxed">{adv.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                ADVANTAGE TABLE — BeeYield × Apisense
            ═══════════════════════════════════════════════════════════════ */}
            <section className="py-24 bg-neutral-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')] opacity-10 pointer-events-none" />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                        <Badge className="bg-beeyield-green/20 text-beeyield-green border-none mb-6 px-5 py-2 font-semibold text-[10px] rounded-full">
                            Technology × Pollination
                        </Badge>
                        <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
                            The BeeYield & Apisense <span className="text-beeyield-green">Advantage</span>
                        </h2>
                    </div>

                    <div className="max-w-6xl mx-auto space-y-4">
                        {/* Table Header */}
                        <div className="hidden md:grid md:grid-cols-3 gap-4 px-8 pb-4 border-b border-white/10">
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Feature</span>
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Apisense Technology</span>
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">BeeYield Pollination Benefit</span>
                        </div>

                        {advantageTable.map((row, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.08 }}
                                className="grid md:grid-cols-3 gap-6 p-8 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 shrink-0 rounded-xl bg-beeyield-green/20 flex items-center justify-center text-beeyield-green">
                                        {row.icon}
                                    </div>
                                    <span className="font-bold text-sm">{row.feature}</span>
                                </div>
                                <p className="text-neutral-400 text-sm leading-relaxed">{row.technology}</p>
                                <p className="text-beeyield-green/90 text-sm leading-relaxed font-medium">{row.benefit}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                AI CAPABILITIES — What the Algorithms Do
            ═══════════════════════════════════════════════════════════════ */}
            <section className="py-24 bg-white border-b border-neutral-100">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-20 items-center max-w-6xl mx-auto">
                        <div>
                            <Badge className="bg-beeyield-green/10 text-beeyield-green border-none mb-8 px-4 py-1.5 font-semibold text-[10px]">
                                Instant Alerts & Guidance
                            </Badge>
                            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight mb-8">
                                AI-Powered <span className="text-beeyield-green">Decision Making</span>
                            </h2>
                            <p className="text-lg text-muted-foreground leading-relaxed mb-10">
                                When the Apisense system detects a risk in the hive, you immediately receive a notification with a diagnosis and recommendations for treating the colony and preventing the spread of disease within the apiary.
                            </p>
                            <div className="space-y-5">
                                {aiCapabilities.map((cap, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -15 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.08 }}
                                        className="flex items-start gap-4 group"
                                    >
                                        <CheckCircle2 className="h-5 w-5 text-beeyield-green mt-0.5 shrink-0" />
                                        <p className="text-neutral-600 font-medium leading-relaxed text-sm">{cap}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            {/* Apisense App — Real tablet screenshot */}
                            <div className="relative mx-auto max-w-md">
                                <div className="rounded-[2rem] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.25)] border-[6px] border-neutral-800 bg-neutral-900">
                                    <img
                                        src={APISENSE_APP}
                                        alt="Apisense app dashboard showing apiary map, disease detection alerts for Foulbrood, Varroa and Nosema, and colony health status"
                                        className="w-full h-auto"
                                    />
                                </div>
                            </div>

                            {/* Floating badges */}
                            <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl border border-neutral-100 px-4 py-3 flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-beeyield-green" />
                                <span className="text-xs font-bold text-neutral-900">Real-Time</span>
                            </div>
                            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl border border-neutral-100 px-4 py-3 flex items-center gap-2">
                                <Wifi className="h-4 w-4 text-beeyield-green" />
                                <span className="text-xs font-bold text-neutral-900">LTE Connected</span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                BENEFITS GRID — 8 Benefits
            ═══════════════════════════════════════════════════════════════ */}
            <section className="py-32 bg-neutral-50/50 border-b border-neutral-100">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-24">
                        <Badge className="bg-beeyield-green/10 text-beeyield-green border-none mb-6 px-5 py-2 font-semibold text-[10px] rounded-full">
                            Operational Benefits
                        </Badge>
                        <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight mb-4">
                            Discover All the Benefits
                        </h2>
                        <div className="h-1 w-20 bg-beeyield-green mx-auto mb-6 rounded-full" />
                        <p className="text-muted-foreground text-sm max-w-xl mx-auto">Why BeeYield's integration with Apisense delivers unmatched value for your apiary and pollination operations</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                        {benefits.map((benefit, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.06 }}
                                className="bg-white p-8 rounded-[2rem] border border-neutral-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] hover:border-beeyield-green/20 transition-all duration-500 group relative overflow-hidden"
                            >
                                {/* Numbered corner badge */}
                                <div className="absolute top-5 right-5 w-8 h-8 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center group-hover:bg-beeyield-green/10 group-hover:border-beeyield-green/20 transition-all">
                                    <span className="text-[10px] font-bold text-neutral-300 group-hover:text-beeyield-green transition-colors">{String(index + 1).padStart(2, '0')}</span>
                                </div>
                                <div className={`mb-6 inline-flex items-center justify-center p-4 rounded-2xl transition-colors ${benefit.accent}`}>
                                    {benefit.icon}
                                </div>
                                <h3 className="text-lg font-bold text-neutral-900 mb-3 tracking-tight">{benefit.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {benefit.description}
                                </p>
                                {/* Bottom accent line */}
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-beeyield-green/0 to-transparent group-hover:via-beeyield-green/40 transition-all duration-700" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                SYSTEM APISENSE — App Features + Hardware
            ═══════════════════════════════════════════════════════════════ */}
            <section className="py-32 bg-beeyield-green text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')] opacity-10" />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-20 max-w-3xl mx-auto">
                        <Badge className="bg-white/20 text-white border-none mb-6 px-5 py-2 font-semibold text-[10px] rounded-full">
                            System Apisense
                        </Badge>
                        <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-6">Apisense App</h2>
                        <p className="text-lg opacity-90 leading-relaxed">
                            Apisense is the central hub for managing your entire apiary — it combines data from hive-installed devices, weather information, satellite data, beekeeper's notes and inspections, and AI analyses into one clear system.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
                        {appFeatures.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="flex gap-5 items-start bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-all"
                            >
                                <CheckCircle className="h-6 w-6 mt-1 flex-shrink-0 text-yellow-300" />
                                <div>
                                    <h4 className="font-bold text-lg mb-2">{feature.title}</h4>
                                    <p className="opacity-80 text-sm">{feature.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Hardware Section */}
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-12">
                            <h3 className="text-2xl font-bold mb-4">What Does the Solution Consist Of?</h3>
                            <p className="opacity-80 max-w-2xl mx-auto text-sm">
                                The Apisense solution is built on modern monitoring devices that collect data from the hive in real time, combined with satellite data and weather forecasts.
                            </p>
                        </div>
                        {/* Sensor close-up image */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mb-12 rounded-[2rem] overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.2)] border border-white/10"
                        >
                            <img
                                src={SENSOR_LANDSCAPE}
                                alt="Apisense IoT sensor device installed on beehive frame — close-up showing gas sensors and circuit board with bees"
                                className="w-full h-48 md:h-72 object-cover"
                            />
                        </motion.div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {hardwareFeatures.map((hardware, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/10 text-center hover:bg-white/20 transition-all group"
                                >
                                    <div className="mb-5 inline-flex items-center justify-center p-4 bg-white/10 rounded-2xl group-hover:bg-white/20 transition-colors">
                                        {hardware.icon}
                                    </div>
                                    <h4 className="font-bold mb-3">{hardware.title}</h4>
                                    <p className="text-sm opacity-80">{hardware.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                2026 FIELD RESEARCH + PARTNERS
            ═══════════════════════════════════════════════════════════════ */}
            <section className="py-32 bg-white relative overflow-hidden">
                <div className="container mx-auto px-4">
                    {/* 2026 CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="max-w-4xl mx-auto text-center mb-32 bg-neutral-900 p-16 rounded-[3rem] shadow-[0_40px_80px_rgba(0,0,0,0.15)] relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none" />
                        <div className="relative z-10">
                            <Badge className="bg-beeyield-green/20 text-beeyield-green border-none mb-8 px-5 py-2 font-semibold text-[10px] rounded-full">
                                Shaping the Future of Beekeeping
                            </Badge>
                            <h2 className="text-3xl lg:text-4xl font-bold text-white tracking-tight mb-6">
                                Try Apisense in Your Apiary — <span className="text-beeyield-green">2026 & Beyond</span>
                            </h2>
                            <p className="text-neutral-400 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
                                BeeYield's participation in the 2026 Apisense Global Field Research is more than just a technological upgrade — it is a commitment to the future of global food security. You will gain early access to innovative solutions and have a real impact on their development.
                            </p>
                            <Button
                                size="lg"
                                className="h-16 px-12 bg-beeyield-green text-neutral-900 font-bold text-sm rounded-2xl hover:bg-beeyield-green/90 shadow-[0_0_40px_rgba(45,168,79,0.3)] transition-all hover:scale-[1.02] active:scale-95"
                                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                Join the 2026 Research Program <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </div>
                    </motion.div>

                    {/* Global Partners */}
                    <div className="text-center max-w-4xl mx-auto">
                        <Badge className="bg-beeyield-green/10 text-beeyield-green border-none mb-8 px-5 py-2 font-semibold text-[10px] rounded-full">
                            Strategic Ecosystem
                        </Badge>
                        <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight mb-6">
                            Building a Global <span className="text-beeyield-green">Network of Partners</span>
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto mb-16 leading-relaxed">
                            BeeYield collaborates with leading partners worldwide, joining forces with beekeeping equipment manufacturers, industry organizations, and renowned universities. Apisense is supported by national and international beekeeping associations.
                        </p>

                        <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
                            {[
                                { label: "Apisense", subtitle: "IoT Disease Partner", icon: Cpu },
                                { label: "BeeYield", subtitle: "Precision Pollination", icon: Activity },
                                { label: "Global Research", subtitle: "Universities & Labs", icon: Globe },
                            ].map((partner, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 15 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex flex-col items-center gap-5 p-10 bg-neutral-50 rounded-[2.5rem] border border-neutral-100 hover:border-beeyield-green/20 hover:shadow-lg transition-all group"
                                >
                                    <div className="h-16 w-16 flex items-center justify-center bg-white rounded-2xl border border-neutral-100 text-beeyield-green shadow-sm group-hover:bg-beeyield-green group-hover:text-white group-hover:border-beeyield-green transition-all">
                                        <partner.icon className="h-7 w-7" />
                                    </div>
                                    <div className="text-center">
                                        <span className="font-bold text-lg text-neutral-900 block">{partner.label}</span>
                                        <span className="text-[10px] font-semibold text-neutral-400">{partner.subtitle}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                FAQ + CONTACT
            ═══════════════════════════════════════════════════════════════ */}
            <section className="py-32 lg:py-48 bg-neutral-50 border-t border-neutral-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-beeyield-green/[0.01] -skew-x-12 translate-x-32 pointer-events-none" />
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-32 items-start">

                        {/* FAQ */}
                        <div>
                            <Badge className="bg-beeyield-green/10 text-beeyield-green border-none mb-8 px-5 py-2 font-semibold text-[10px] rounded-full">
                                Questions & Answers
                            </Badge>
                            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight mb-10">We Answer Your Questions</h2>
                            <Accordion type="single" collapsible className="w-full space-y-3">
                                {faqs.map((faq, index) => (
                                    <AccordionItem key={index} value={`item-${index}`} className="border border-neutral-100 rounded-2xl px-6 overflow-hidden bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                                        <AccordionTrigger className="text-left font-bold text-[15px] text-neutral-900 py-5 hover:no-underline">
                                            {faq.question}
                                        </AccordionTrigger>
                                        <AccordionContent className="text-neutral-500 leading-relaxed font-medium pb-5">
                                            {faq.answer}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>

                        {/* Contact Form */}
                        <div id="contact">
                            <div className="bg-white p-12 lg:p-16 rounded-[3.5rem] border border-neutral-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-48 h-48 bg-beeyield-green/[0.02] rounded-full -translate-x-20 -translate-y-20 border border-beeyield-green/5" />
                                <div className="relative z-10">
                                    <h3 className="text-2xl font-bold text-neutral-900 tracking-tight mb-3">Contact Us</h3>
                                    <p className="text-sm text-neutral-400 font-medium mb-10">Interested in disease detection or the 2026 research program? Get in touch.</p>
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <Label htmlFor="name" className="text-[10px] font-semibold text-neutral-400 ml-1">Name & Surname</Label>
                                                <Input
                                                    id="name"
                                                    name="name"
                                                    placeholder="John Doe"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="h-14 rounded-2xl border-neutral-100 bg-neutral-50/50 focus:bg-white focus:ring-beeyield-green/20 focus:border-beeyield-green transition-all"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <Label htmlFor="email" className="text-[10px] font-semibold text-neutral-400 ml-1">Email</Label>
                                                <Input
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    placeholder="john@example.com"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="h-14 rounded-2xl border-neutral-100 bg-neutral-50/50 focus:bg-white focus:ring-beeyield-green/20 focus:border-beeyield-green transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <Label htmlFor="phone" className="text-[10px] font-semibold text-neutral-400 ml-1">Mobile (optional)</Label>
                                            <Input
                                                id="phone"
                                                name="phone"
                                                type="tel"
                                                placeholder="+254"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                className="h-14 rounded-2xl border-neutral-100 bg-neutral-50/50 focus:bg-white focus:ring-beeyield-green/20 focus:border-beeyield-green transition-all"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <Label htmlFor="message" className="text-[10px] font-semibold text-neutral-400 ml-1">Message</Label>
                                            <Textarea
                                                id="message"
                                                name="message"
                                                placeholder="Tell us about your apiary, pollination needs, or interest in the 2026 research program..."
                                                className="min-h-[140px] rounded-2xl border-neutral-100 bg-neutral-50/50 focus:bg-white focus:ring-beeyield-green/20 focus:border-beeyield-green transition-all p-5"
                                                value={formData.message}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <Button
                                            type="submit"
                                            className="w-full h-16 rounded-2xl bg-neutral-900 text-beeyield-green font-bold text-xs shadow-2xl shadow-neutral-900/30 hover:scale-[1.02] active:scale-95 transition-all"
                                            disabled={loading}
                                        >
                                            {loading ? "Sending..." : "Send Inquiry"}
                                        </Button>
                                    </form>

                                    <div className="mt-10 pt-8 border-t border-neutral-100 text-center">
                                        <p className="text-[11px] text-neutral-400">
                                            <a href="/privacy" className="hover:text-beeyield-green transition-colors">Privacy Policy</a> • <a href="/terms" className="hover:text-beeyield-green transition-colors">Terms of Service</a>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </BeeYieldPageShell>
    );
};

export default Diseases;

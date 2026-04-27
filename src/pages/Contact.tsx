import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { submitContactForm, submitContactMessage, ContactSubmission } from "@/services/contactService";
import {
    Mail, Phone, MapPin,
    Sprout, Bug, MessageSquare, Stethoscope, Send, Loader2, CheckCircle2, ArrowRight
} from "lucide-react";
import { adminService } from "@/services/adminService";
import { BeeYieldPageShell } from "@/components/beeyield/BeeYieldUI";
import { motion, AnimatePresence } from "framer-motion";
import SEO from "@/components/SEO";
import LOGO from "@/assets/Logo.png";

const Contact = () => {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<"quick" | "grower" | "beekeeper" | "general" | "diseases">("quick");
    const [loading, setLoading] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);

    // Quick Message form state
    const [quickForm, setQuickForm] = useState({
        fullName: "",
        email: "",
        subject: "",
        message: ""
    });
    const [quickLoading, setQuickLoading] = useState(false);
    const [quickSent, setQuickSent] = useState(false);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        city: "",
        state: "",
        country: "",
        farmName: "",
        cropType: "Maize",
        acres: "",
        apiaryName: "",
        hiveCount: "",
        experienceYears: "1-5 years",
        company: "",
        topic: "Pollination Services",
        message: ""
    });

    const tabs = [
        { id: "quick" as const, label: "Quick Message", icon: Send },
        { id: "grower" as const, label: "Growers", icon: Sprout },
        { id: "beekeeper" as const, label: "Beekeepers", icon: Bug },
        { id: "diseases" as const, label: "Diseases", icon: Stethoscope },
        { id: "general" as const, label: "General", icon: MessageSquare },
    ];

    const handleTabChange = (tabId: "quick" | "grower" | "beekeeper" | "general" | "diseases") => {
        setActiveTab(tabId);
        setQuickSent(false);
        let defaultTopic = "Pollination Services";
        if (tabId === "beekeeper") defaultTopic = "Technology Integration";
        if (tabId === "diseases") defaultTopic = "Varroa Mite";
        if (tabId === "general") defaultTopic = "General Question";
        setFormData(prev => ({ ...prev, topic: defaultTopic }));
    };

    const handleQuickChange = (field: string, value: string) => {
        setQuickForm(prev => ({ ...prev, [field]: value }));
    };

    const handleQuickSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setQuickLoading(true);
        try {
            await submitContactMessage({
                full_name: quickForm.fullName,
                email: quickForm.email,
                subject: quickForm.subject || undefined,
                message: quickForm.message,
            });
            toast({ title: "✅ Message Sent!" });
            setQuickSent(true);
            setQuickForm({ fullName: "", email: "", subject: "", message: "" });
        } catch (error) {
            toast({ title: "Failed to Send", variant: "destructive" });
        } finally {
            setQuickLoading(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!termsAccepted) {
            toast({ title: "Terms Required", variant: "destructive" });
            return;
        }
        setLoading(true);
        try {
            const submissionData: ContactSubmission = {
                first_name: formData.firstName,
                last_name: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                city: formData.city,
                state: formData.state,
                country: formData.country,
                inquiry_type: (activeTab === "quick" ? "general" : activeTab) as ContactSubmission["inquiry_type"],
                topic: formData.topic,
                message: (activeTab === 'general' || activeTab === 'diseases') ? formData.message : undefined,
                farm_name: activeTab === "grower" ? formData.farmName : undefined,
                crop_type: activeTab === "grower" ? formData.cropType : undefined,
                acres: activeTab === "grower" ? Number(formData.acres) : undefined,
            };
            await submitContactForm(submissionData);
            toast({ title: "✅ Inquiry Received!" });
            setFormData({ ...formData, firstName: "", lastName: "", email: "", phone: "", message: "" });
            setTermsAccepted(false);
        } catch (error) {
            toast({ title: "Submission Failed", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <BeeYieldPageShell className="bg-background">
            <SEO 
                title="Contact | BeeYield"
                description="Get in touch with the BeeYield team for pollination services, research, and support."
                url="/contact"
            />

            {/* ═══════════════════════════════════════════════════════════════
                HERO SECTION — Sync with Diseases Hero
            ═══════════════════════════════════════════════════════════════ */}
            <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden border-b border-neutral-100">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/80 to-white/95" />
                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-beeyield-green/5 to-transparent pointer-events-none" />
                </div>
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="max-w-4xl mx-auto flex flex-col items-center">
                        <motion.img
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            src={LOGO}
                            alt="BeeYield Logo"
                            className="h-24 md:h-36 w-auto mb-12 drop-shadow-2xl"
                        />
                        <Badge className="mb-6 bg-beeyield-green/10 text-beeyield-green border-beeyield-green/20 px-5 py-2 font-semibold text-[10px] rounded-full backdrop-blur-sm">
                            Support & Inquiries
                        </Badge>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-6xl font-bold mb-8 tracking-tight text-neutral-900 leading-tight"
                        >
                            Connect With Our <br /> <span className="text-beeyield-green">Expert Team</span>
                        </motion.h1>
                        <p className="text-xl text-muted-foreground leading-relaxed mb-12 max-w-2xl font-medium">
                            Whether you're a grower, beekeeper, or researcher — we're here to help optimize your outcomes.
                        </p>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-24 bg-white border-b border-neutral-100">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        {/* Tabs — Sync Style */}
                        <div className="flex flex-wrap justify-center gap-3 mb-16">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => handleTabChange(tab.id)}
                                        className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all duration-300 font-bold text-xs ${isActive
                                            ? "border-beeyield-green bg-beeyield-green/5 text-beeyield-green shadow-sm"
                                            : "border-neutral-100 bg-neutral-50 text-neutral-400 hover:bg-white hover:border-neutral-200"
                                            }`}
                                    >
                                        <Icon size={16} />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="grid lg:grid-cols-12 gap-12 items-start">
                            {/* Left Side: Contact Info */}
                            <div className="lg:col-span-4 space-y-8">
                                {[
                                    { title: "Email Us", value: "info@beeyield.com", icon: Mail },
                                    { title: "Kibwezi HQ", value: "Makueni, Kenya", icon: MapPin },
                                    { title: "Support", value: "+254 700 000 000", icon: Phone }
                                ].map((item, i) => (
                                    <div key={i} className="bg-neutral-50 p-8 rounded-[2.5rem] border border-neutral-100">
                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center mb-6 text-beeyield-green shadow-sm">
                                            <item.icon size={20} />
                                        </div>
                                        <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">{item.title}</h3>
                                        <p className="text-sm font-bold text-neutral-900">{item.value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Right Side: Form */}
                            <div className="lg:col-span-8">
                                <Card className="border border-neutral-200/60 rounded-[3rem] shadow-sm overflow-hidden bg-white">
                                    <CardContent className="p-10 md:p-12">
                                        <AnimatePresence mode="wait">
                                            {quickSent && activeTab === 'quick' ? (
                                                <motion.div 
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="text-center py-12"
                                                >
                                                    <div className="w-16 h-16 bg-beeyield-green/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-beeyield-green">
                                                        <CheckCircle2 size={32} />
                                                    </div>
                                                    <h3 className="text-2xl font-bold text-neutral-900">Message Received</h3>
                                                    <p className="text-neutral-500 mt-4 font-medium">One of our experts will be in touch with you shortly.</p>
                                                    <Button variant="outline" className="mt-10 h-12 rounded-xl text-xs font-bold" onClick={() => setQuickSent(false)}>Send Another</Button>
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key={activeTab}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <form onSubmit={activeTab === 'quick' ? handleQuickSubmit : handleSubmit} className="space-y-6">
                                                        {activeTab === 'quick' ? (
                                                            <>
                                                                <div className="grid md:grid-cols-2 gap-6">
                                                                    <div className="space-y-2">
                                                                        <Label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Full Name</Label>
                                                                        <Input required className="h-14 rounded-2xl bg-neutral-50 border-neutral-100" placeholder="Jane Doe" value={quickForm.fullName} onChange={e => handleQuickChange('fullName', e.target.value)} />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Email Address</Label>
                                                                        <Input required type="email" className="h-14 rounded-2xl bg-neutral-50 border-neutral-100" placeholder="jane@example.com" value={quickForm.email} onChange={e => handleQuickChange('email', e.target.value)} />
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Message</Label>
                                                                    <Textarea required className="min-h-[160px] rounded-2xl bg-neutral-50 border-neutral-100 resize-none" placeholder="Tell us how we can help..." value={quickForm.message} onChange={e => handleQuickChange('message', e.target.value)} />
                                                                </div>
                                                            </>
                                                        ) : (
                                                            // Detailed form simplified for synchronization
                                                            <div className="space-y-6">
                                                                <div className="grid md:grid-cols-2 gap-6">
                                                                    <Input required className="h-14 rounded-2xl bg-neutral-50 border-neutral-100" placeholder="First Name" value={formData.firstName} onChange={e => handleChange('firstName', e.target.value)} />
                                                                    <Input required className="h-14 rounded-2xl bg-neutral-50 border-neutral-100" placeholder="Last Name" value={formData.lastName} onChange={e => handleChange('lastName', e.target.value)} />
                                                                </div>
                                                                <Input required type="email" className="h-14 rounded-2xl bg-neutral-50 border-neutral-100" placeholder="Work Email" value={formData.email} onChange={e => handleChange('email', e.target.value)} />
                                                                <Textarea required className="min-h-[160px] rounded-2xl bg-neutral-50 border-neutral-100 resize-none" placeholder="Project details or inquiry..." value={formData.message} onChange={e => handleChange('message', e.target.value)} />
                                                            </div>
                                                        )}
                                                        
                                                        <div className="flex items-center space-x-3 pt-4">
                                                            <Checkbox id="terms" checked={termsAccepted} onCheckedChange={checked => setTermsAccepted(checked as boolean)} />
                                                            <Label htmlFor="terms" className="text-[11px] text-neutral-500 font-medium cursor-pointer">I agree to the privacy policy and terms of service.</Label>
                                                        </div>

                                                        <Button type="submit" disabled={loading || quickLoading} className="w-full h-14 bg-neutral-900 text-beeyield-green font-bold text-xs rounded-2xl shadow-xl shadow-neutral-900/10">
                                                            {(loading || quickLoading) ? <Loader2 className="animate-spin" /> : "Send Message"}
                                                        </Button>
                                                    </form>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </BeeYieldPageShell>
    );
};

export default Contact;
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { submitContactForm } from "@/services/contactService";
import { Loader2, Send } from "lucide-react";

interface PollinationContactFormProps {
    type: "in_land" | "in_hive";
    title?: string;
    description?: string;
}

export const PollinationContactForm = ({ type, title, description }: PollinationContactFormProps) => {
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const formId = type === "in_land" ? "in-land-form" : "in-hive-form";
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        company: "",
        message: "",
        hive_code: "" // Added for in-hive inquires
    });

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await submitContactForm({
                inquiry_type: type === "in_land" ? "In-Land Technology" : "In-Hive Technology",
                first_name: formData.firstName,
                last_name: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                city: "N/A",
                state: "N/A",
                country: "N/A",
                company: formData.company,
                topic: type === "in_land" ? "In-Land Pollination Interest" : "In-Hive Pollination Interest",
                message: formData.message,
            });

            toast({
                title: "✅ Request Sent!",
                description: response?.message || "We've received your interest and will be in touch shortly.",
            });

            setSubmitted(true);
            setFormData({
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
                company: "",
                message: "",
                hive_code: ""
            });

            // Reset success state after 5 seconds
            setTimeout(() => setSubmitted(false), 5000);
        } catch (error) {
            console.error(error);
            toast({
                title: "Submission Failed",
                description: "There was an error sending your request. Please try again.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div id={formId} className="relative group scroll-mt-32">
            {/* Architectural Background Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-beeyield-green/20 via-beeyield-gold/20 to-beeyield-green/20 rounded-[2.5rem] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>

            <div className="relative bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-white/10">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-beeyield-green/10 mb-6 border border-beeyield-green/20">
                        <Send className="h-8 w-8 text-beeyield-green" />
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tightest uppercase italic leading-none">{title || "Secure Your Partnership"}</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px] max-w-sm mx-auto">{description || "Initialize the next phase of your apiary productivity."}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">First Name *</label>
                            <Input
                                id="pollination-first-name"
                                name="firstName"
                                required
                                value={formData.firstName}
                                onChange={(e) => handleChange("firstName", e.target.value)}
                                placeholder="Jane"
                                className="h-14 rounded-2xl border-slate-100 dark:border-white/5 text-base bg-slate-50/50 dark:bg-white/[0.02] font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Last Name *</label>
                            <Input
                                id="pollination-last-name"
                                name="lastName"
                                required
                                value={formData.lastName}
                                onChange={(e) => handleChange("lastName", e.target.value)}
                                placeholder="Doe"
                                className="h-14 rounded-2xl border-slate-100 dark:border-white/5 text-base bg-slate-50/50 dark:bg-white/[0.02] font-bold"
                            />
                        </div>
                    </div>

                    {/* New Hive Code Input */}
                    {type === "in_hive" && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hive Logic Identifier</label>
                            <Input
                                id="hive_code"
                                name="hive_code"
                                value={formData.hive_code}
                                onChange={(e) => handleChange("hive_code", e.target.value)}
                                placeholder="e.g. ALPHA-001"
                                className="h-14 rounded-2xl border-beeyield-gold/30 dark:border-beeyield-gold/20 text-base bg-beeyield-gold/5 font-bold text-beeyield-gold"
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Architecture *</label>
                            <Input
                                id="pollination-email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => handleChange("email", e.target.value)}
                                placeholder="jane@beeyield.com"
                                className="h-14 rounded-2xl border-slate-100 dark:border-white/5 text-base bg-slate-50/50 dark:bg-white/[0.02] font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Telemetry / Phone *</label>
                            <Input
                                id="pollination-phone"
                                name="phone"
                                type="tel"
                                required
                                value={formData.phone}
                                onChange={(e) => handleChange("phone", e.target.value)}
                                placeholder="+254..."
                                className="h-14 rounded-2xl border-slate-100 dark:border-white/5 text-base bg-slate-50/50 dark:bg-white/[0.02] font-bold"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Organization / Ecosystem</label>
                        <Input
                            id="pollination-company"
                            name="company"
                            value={formData.company}
                            onChange={(e) => handleChange("company", e.target.value)}
                            placeholder="Your Company Name"
                            className="h-14 rounded-2xl border-slate-100 dark:border-white/5 text-base bg-slate-50/50 dark:bg-white/[0.02] font-bold"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Transmission Notes (Optional)</label>
                        <Textarea
                            id="pollination-message"
                            name="message"
                            value={formData.message}
                            onChange={(e) => handleChange("message", e.target.value)}
                            placeholder="Briefly describe your requirements..."
                            rows={3}
                            className="rounded-2xl border-slate-100 dark:border-white/5 text-base bg-slate-50/50 dark:bg-white/[0.02] font-bold resize-none"
                        />
                    </div>

                    <Button type="submit" className="w-full h-16 text-xs uppercase tracking-[0.2em] font-black gap-3 bg-neutral-900 hover:bg-beeyield-green text-white rounded-2xl shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Synchronizing...
                            </>
                        ) : (
                            <>
                                <Send className="h-5 w-5" />
                                Dispatch Request
                            </>
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
};

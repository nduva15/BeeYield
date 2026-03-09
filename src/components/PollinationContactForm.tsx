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
        <div id={formId} className="bg-card p-8 rounded-3xl shadow-xl border border-border scroll-mt-24">
            <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{title || "Join the Program"}</h3>
                <p className="text-muted-foreground">{description || "Fill in your details below and our team will reach out to you."}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">First Name *</label>
                        <Input
                            id="pollination-first-name"
                            name="firstName"
                            required
                            value={formData.firstName}
                            onChange={(e) => handleChange("firstName", e.target.value)}
                            placeholder="Jane"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Last Name *</label>
                        <Input
                            id="pollination-last-name"
                            name="lastName"
                            required
                            value={formData.lastName}
                            onChange={(e) => handleChange("lastName", e.target.value)}
                            placeholder="Doe"
                        />
                    </div>
                </div>

                {/* New Hive Code Input */}
                {type === "in_hive" && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Hive Code</label>
                        <Input
                            id="hive_code"
                            name="hive_code"
                            value={formData.hive_code}
                            onChange={(e) => handleChange("hive_code", e.target.value)}
                            placeholder="e.g. ALPHA-001"
                            className="h-14 rounded-2xl border-slate-100 dark:border-white/5 text-base bg-slate-50/50 dark:bg-white/[0.02] font-bold"
                        />
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email *</label>
                        <Input
                            id="pollination-email"
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => handleChange("email", e.target.value)}
                            placeholder="jane@example.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Phone Number *</label>
                        <Input
                            id="pollination-phone"
                            name="phone"
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) => handleChange("phone", e.target.value)}
                            placeholder="+254..."
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Company / Farm Name</label>
                    <Input
                        id="pollination-company"
                        name="company"
                        value={formData.company}
                        onChange={(e) => handleChange("company", e.target.value)}
                        placeholder="Your Company Name"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Message (Optional)</label>
                    <Textarea
                        id="pollination-message"
                        name="message"
                        value={formData.message}
                        onChange={(e) => handleChange("message", e.target.value)}
                        placeholder="Tell us about your needs..."
                        rows={3}
                    />
                </div>

                <Button type="submit" className="w-full h-12 text-lg font-bold gap-2" disabled={loading}>
                    {loading ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Sending...
                        </>
                    ) : (
                        <>
                            <Send className="h-5 w-5" />
                            Send Request
                        </>
                    )}
                </Button>
            </form>
        </div>
    );
};

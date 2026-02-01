import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { submitContactForm, ContactSubmission } from "@/services/contactService";
import {
  Mail, Phone, MapPin, ChevronDown,
  Sprout, Bug, MessageSquare, Stethoscope
} from "lucide-react";
import { adminService } from "@/services/adminService";

const Contact = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"grower" | "beekeeper" | "general" | "diseases">("grower");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    country: "",
    // Unique fields
    farmName: "",
    cropType: "Maize",
    acres: "",
    apiaryName: "",
    hiveCount: "",
    experienceYears: "1-5 years",
    company: "",
    topic: "Pollination Services", // Default for grower
    message: ""
  });

  const tabs = [
    { id: "grower" as const, label: "Grower Inquiries", icon: Sprout },
    { id: "beekeeper" as const, label: "Beekeeper Inquiries", icon: Bug },
    { id: "diseases" as const, label: "Diseases Inquiry", icon: Stethoscope },
    { id: "general" as const, label: "General Inquiries", icon: MessageSquare },
  ];

  const handleTabChange = (tabId: "grower" | "beekeeper" | "general" | "diseases") => {
    setActiveTab(tabId);
    // Reset topic based on tab
    let defaultTopic = "Pollination Services";
    if (tabId === "beekeeper") defaultTopic = "Technology Integration";
    if (tabId === "diseases") defaultTopic = "Varroa Mite";
    if (tabId === "general") defaultTopic = "General Question";
    setFormData(prev => ({ ...prev, topic: defaultTopic }));
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        inquiry_type: activeTab,
        topic: formData.topic,
        message: (activeTab === "general" || activeTab === "diseases") ? formData.message : undefined,
        // Optional fields based on tab
        company: activeTab === "general" ? formData.company : undefined,
        farm_name: activeTab === "grower" ? formData.farmName : undefined,
        crop_type: activeTab === "grower" ? formData.cropType : undefined,
        acres: activeTab === "grower" ? Number(formData.acres) : undefined,
        apiary_name: activeTab === "beekeeper" ? formData.apiaryName : undefined,
        hive_count: activeTab === "beekeeper" ? Number(formData.hiveCount) : undefined,
        experience_years: activeTab === "beekeeper" ? formData.experienceYears : undefined,
      };

      await submitContactForm(submissionData);

      // Log activity
      adminService.logActivity({
        activity_type: 'contact',
        action: 'submitted',
        entity_type: 'inquiry',
        entity_reference: formData.email,
        metadata: { inquiry_type: activeTab, topic: formData.topic }
      }).catch(() => { });

      toast({
        title: "Inquiry Received!",
        description: "We'll get back to you as soon as possible.",
      });

      // Reset form (keep tab)
      setFormData({
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
        topic: formData.topic,
        message: ""
      });

    } catch (error) {
      console.error(error);
      toast({
        title: "Submission Failed",
        description: "There was an error sending your inquiry. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">

        {/* Header */}
        <div className="mx-auto max-w-3xl text-center mb-12">
          <h1 className="mb-6 text-5xl font-bold">Contact Us Today</h1>
          <p className="mb-12 text-xl text-muted-foreground">
            Fill in the form, and we will get back to you at our earliest convenience.
          </p>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12 max-w-5xl mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${isActive
                  ? "border-primary bg-primary/5 text-primary shadow-soft"
                  : "border-transparent bg-white shadow-soft text-muted-foreground hover:bg-secondary/20"
                  }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                <span className="font-bold">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Container */}
        <Card className="max-w-4xl mx-auto border-none shadow-soft">
          <CardContent className="p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Common Fields */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    placeholder="Jane"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    placeholder="Doe"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    placeholder="New York"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">State *</label>
                    <input
                      type="text"
                      required
                      value={formData.state}
                      onChange={(e) => handleChange("state", e.target.value)}
                      placeholder="NY"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Country *</label>
                    <input
                      type="text"
                      required
                      value={formData.country}
                      onChange={(e) => handleChange("country", e.target.value)}
                      placeholder="USA"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="info@beeyield.com"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
              </div>

              <div className="h-px bg-border/50" />

              {/* Specific Fields based on Tab */}
              <div className="grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">

                {activeTab === "grower" && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Farm Name *</label>
                      <input
                        type="text"
                        required={activeTab === "grower"}
                        value={formData.farmName}
                        onChange={(e) => handleChange("farmName", e.target.value)}
                        placeholder="Green Acres Farm"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Crop *</label>
                      <select
                        aria-label="Crop selection"
                        value={formData.cropType}
                        onChange={(e) => handleChange("cropType", e.target.value)}
                        className="w-full appearance-none rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <option>Maize</option>
                        <option>Sisal</option>
                        <option>Mangoes</option>
                        <option>Beans</option>
                        <option>Sunflower</option>
                        <option>Oranges</option>
                        <option>Vegetables</option>
                        <option>Tomatoes</option>
                        <option>Onions</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Acres *</label>
                      <input
                        type="number"
                        required={activeTab === "grower"}
                        value={formData.acres}
                        onChange={(e) => handleChange("acres", e.target.value)}
                        placeholder="500"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Topic *</label>
                      <select
                        aria-label="Topic selection"
                        value={formData.topic}
                        onChange={(e) => handleChange("topic", e.target.value)}
                        className="w-full appearance-none rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <option>Pollination Services</option>
                        <option>Pricing</option>
                        <option>Partnership</option>
                        <option>Support</option>
                      </select>
                    </div>
                  </>
                )}

                {activeTab === "beekeeper" && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Apiary Name *</label>
                      <input
                        type="text"
                        required={activeTab === "beekeeper"}
                        value={formData.apiaryName}
                        onChange={(e) => handleChange("apiaryName", e.target.value)}
                        placeholder="Busy Bee Apiaries"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Number of Hives *</label>
                      <input
                        type="number"
                        required={activeTab === "beekeeper"}
                        value={formData.hiveCount}
                        onChange={(e) => handleChange("hiveCount", e.target.value)}
                        placeholder="1000"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Years of Experience *</label>
                      <select
                        aria-label="Years of experience selection"
                        value={formData.experienceYears}
                        onChange={(e) => handleChange("experienceYears", e.target.value)}
                        className="w-full appearance-none rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <option>1-5 years</option>
                        <option>5-10 years</option>
                        <option>10+ years</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Topic *</label>
                      <select
                        aria-label="Topic selection for beekeeper"
                        value={formData.topic}
                        onChange={(e) => handleChange("topic", e.target.value)}
                        className="w-full appearance-none rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <option>Technology Integration</option>
                        <option>Hive Monitoring</option>
                        <option>Partnership</option>
                        <option>Support</option>
                      </select>
                    </div>
                  </>
                )}

                {activeTab === "diseases" && (
                  <>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-medium">Which disease are you inquiring about? *</label>
                      <select
                        aria-label="Disease selection"
                        value={formData.topic}
                        onChange={(e) => handleChange("topic", e.target.value)}
                        className="w-full appearance-none rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <option>Varroa Mite</option>
                        <option>American Foulbrood</option>
                        <option>European Foulbrood</option>
                        <option>Nosema</option>
                        <option>Chalkbrood</option>
                        <option>Sacbrood</option>
                        <option>Small Hive Beetle</option>
                        <option>Wax Moths</option>
                        <option>Tracheal Mites</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </>
                )}

                {activeTab === "general" && (
                  <>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-medium">Company / Organization</label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => handleChange("company", e.target.value)}
                        placeholder="Optional"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-medium">Topic *</label>
                      <select
                        aria-label="Topic selection for general inquiry"
                        value={formData.topic}
                        onChange={(e) => handleChange("topic", e.target.value)}
                        className="w-full appearance-none rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <option>Press Inquiry</option>
                        <option>Careers</option>
                        <option>Sustainability</option>
                        <option>General Question</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              {/* Message Area for general and diseases */}
              {(activeTab === 'general' || activeTab === 'diseases') && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => handleChange("message", e.target.value)}
                    placeholder="How can we help you?"
                    className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
              )}

              <div className="space-y-6 pt-4">
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="terms"
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="terms" className="text-sm font-medium leading-none text-muted-foreground">
                    I agree with the <a href="#" className="text-primary hover:underline">Terms and Conditions</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                  </label>
                </div>

                <Button size="lg" className="min-w-[200px]" disabled={loading}>
                  {loading ? "Submitting..." : "Submit Inquiry"}
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>

        {/* Direct Contact Info */}
        <div className="grid md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto text-center">
          <div className="p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-bold mb-2">Email Us</h3>
            <p className="text-muted-foreground">info@beeyield.com</p>
          </div>
          <div className="p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-bold mb-2">Call Us</h3>
            <p className="text-muted-foreground">+1 (800) 123-4567</p>
          </div>
          <div className="p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-bold mb-2">Visit Us</h3>
            <p className="text-muted-foreground">Kibwezi</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Contact;
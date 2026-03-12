import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
  Sprout, Bug, MessageSquare, Stethoscope, Send, Loader2, CheckCircle2
} from "lucide-react";
import { adminService } from "@/services/adminService";

const Contact = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"quick" | "grower" | "beekeeper" | "general" | "diseases">("quick");
  const [loading, setLoading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Quick Message form state (PRD Contact Messages)
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
    { id: "quick" as const, label: "Quick Message", icon: Send },
    { id: "grower" as const, label: "Grower Inquiries", icon: Sprout },
    { id: "beekeeper" as const, label: "Beekeeper Inquiries", icon: Bug },
    { id: "diseases" as const, label: "Diseases Inquiry", icon: Stethoscope },
    { id: "general" as const, label: "General Inquiries", icon: MessageSquare },
  ];

  const handleTabChange = (tabId: "quick" | "grower" | "beekeeper" | "general" | "diseases") => {
    setActiveTab(tabId);
    setQuickSent(false);
    // Reset topic based on tab
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
      const response = await submitContactMessage({
        full_name: quickForm.fullName,
        email: quickForm.email,
        subject: quickForm.subject || undefined,
        message: quickForm.message,
      });

      toast({
        title: "✅ Message Sent!",
        description: response?.message || "We'll get back to you shortly.",
      });

      setQuickSent(true);
      setQuickForm({ fullName: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error(error);
      toast({
        title: "Failed to Send",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
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
      toast({
        title: "Terms Required",
        description: "Please accept the terms and conditions to proceed.",
        variant: "destructive"
      });
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

      const response = await submitContactForm(submissionData);

      // Log activity
      adminService.logActivity({
        activity_type: 'contact',
        action: 'submitted',
        entity_type: 'inquiry',
        entity_reference: formData.email,
        metadata: { inquiry_type: activeTab, topic: formData.topic }
      }).catch(() => { });

      toast({
        title: "✅ Inquiry Received!",
        description: response?.message || "We'll get back to you as soon as possible.",
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
      setTermsAccepted(false);

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
    <div className="min-h-screen py-20 bg-background">
      <div className="container mx-auto px-4">

        {/* Header */}
        <div className="mx-auto max-w-3xl text-center mb-12">
          <h1 className="mb-6 text-5xl font-bold tracking-tight">Contact Us Today</h1>
          <p className="mb-12 text-xl text-muted-foreground">
            Fill in the form, and we will get back to you at our earliest convenience.
          </p>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-12 max-w-5xl mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center justify-center gap-3 p-4 rounded-xl border transition-all duration-200 ${isActive
                  ? "border-primary bg-primary/10 text-primary shadow-sm"
                  : "border-border bg-card shadow-sm text-muted-foreground hover:bg-muted/50"
                  }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                <span className="font-bold text-sm">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Message Form — PRD Contact Messages */}
        {activeTab === "quick" && (
          <Card className="max-w-xl mx-auto border-none shadow-premium rounded-3xl overflow-hidden glass animate-in fade-in slide-in-from-bottom-3 duration-500">
            <CardContent className="p-8 md:p-10">
              {quickSent ? (
                <div className="text-center py-12 space-y-4 animate-in fade-in zoom-in duration-500">
                  <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold">Message Sent!</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    Thank you for reaching out. Our team will get back to you shortly.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setQuickSent(false)}
                    className="mt-4"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleQuickSubmit} className="space-y-6">
                  <div className="text-center mb-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
                      <Send className="h-3 w-3" />
                      Quick Contact
                    </div>
                    <h2 className="text-2xl font-bold">Send Us a Message</h2>
                    <p className="text-muted-foreground text-sm mt-1">Sales, Support, or Partnerships — we're here to help.</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quick-fullname">Full Name *</Label>
                    <Input
                      id="quick-fullname"
                      name="full_name"
                      type="text"
                      required
                      value={quickForm.fullName}
                      onChange={(e) => handleQuickChange("fullName", e.target.value)}
                      placeholder="Jane Doe"
                      autoComplete="name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quick-email">Email Address *</Label>
                    <Input
                      id="quick-email"
                      name="email"
                      type="email"
                      required
                      value={quickForm.email}
                      onChange={(e) => handleQuickChange("email", e.target.value)}
                      placeholder="jane@example.com"
                      autoComplete="email"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quick-subject">Subject</Label>
                    <Input
                      id="quick-subject"
                      name="subject"
                      type="text"
                      value={quickForm.subject}
                      onChange={(e) => handleQuickChange("subject", e.target.value)}
                      placeholder="e.g. Pricing Question"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quick-message">Message *</Label>
                    <Textarea
                      id="quick-message"
                      name="message"
                      required
                      value={quickForm.message}
                      onChange={(e) => handleQuickChange("message", e.target.value)}
                      placeholder="How can we help you?"
                      className="min-h-[150px] resize-y"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-gray-900 shadow-lg shadow-amber-500/20 font-bold"
                    disabled={quickLoading}
                  >
                    {quickLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        )}

        {/* Detailed Inquiry Forms */}
        {activeTab !== "quick" && (
          <Card className="max-w-4xl mx-auto border-none shadow-premium rounded-3xl overflow-hidden glass">
            <CardContent className="p-8 md:p-12">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Common Fields */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => handleChange("firstName", e.target.value)}
                      placeholder="Jane"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                      placeholder="Doe"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      placeholder="New York"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        type="text"
                        required
                        value={formData.state}
                        onChange={(e) => handleChange("state", e.target.value)}
                        placeholder="NY"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country *</Label>
                      <Input
                        id="country"
                        type="text"
                        required
                        value={formData.country}
                        onChange={(e) => handleChange("country", e.target.value)}
                        placeholder="USA"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="info@beeyield.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                <div className="h-px bg-border/50" />

                {/* Specific Fields based on Tab */}
                <div className="grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">

                  {activeTab === "grower" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="farmName">Farm Name *</Label>
                        <Input
                          id="farmName"
                          type="text"
                          required={activeTab === "grower"}
                          value={formData.farmName}
                          onChange={(e) => handleChange("farmName", e.target.value)}
                          placeholder="Green Acres Farm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Crop *</Label>
                        <Select
                          value={formData.cropType}
                          onValueChange={(value) => handleChange("cropType", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Crop" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Maize">Maize</SelectItem>
                            <SelectItem value="Sisal">Sisal</SelectItem>
                            <SelectItem value="Mangoes">Mangoes</SelectItem>
                            <SelectItem value="Beans">Beans</SelectItem>
                            <SelectItem value="Sunflower">Sunflower</SelectItem>
                            <SelectItem value="Oranges">Oranges</SelectItem>
                            <SelectItem value="Vegetables">Vegetables</SelectItem>
                            <SelectItem value="Tomatoes">Tomatoes</SelectItem>
                            <SelectItem value="Onions">Onions</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="acres">Acres *</Label>
                        <Input
                          id="acres"
                          type="number"
                          step="any"
                          required={activeTab === "grower"}
                          value={formData.acres}
                          onChange={(e) => handleChange("acres", e.target.value)}
                          placeholder="500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Topic *</Label>
                        <Select
                          value={formData.topic}
                          onValueChange={(value) => handleChange("topic", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Topic" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pollination Services">Pollination Services</SelectItem>
                            <SelectItem value="Pricing">Pricing</SelectItem>
                            <SelectItem value="Partnership">Partnership</SelectItem>
                            <SelectItem value="Support">Support</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  {activeTab === "beekeeper" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="apiaryName">Apiary Name *</Label>
                        <Input
                          id="apiaryName"
                          type="text"
                          required={activeTab === "beekeeper"}
                          value={formData.apiaryName}
                          onChange={(e) => handleChange("apiaryName", e.target.value)}
                          placeholder="Busy Bee Apiaries"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hiveCount">Number of Hives *</Label>
                        <Input
                          id="hiveCount"
                          type="number"
                          required={activeTab === "beekeeper"}
                          value={formData.hiveCount}
                          onChange={(e) => handleChange("hiveCount", e.target.value)}
                          placeholder="1000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Years of Experience *</Label>
                        <Select
                          value={formData.experienceYears}
                          onValueChange={(value) => handleChange("experienceYears", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Experience" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-5 years">1-5 years</SelectItem>
                            <SelectItem value="5-10 years">5-10 years</SelectItem>
                            <SelectItem value="10+ years">10+ years</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Topic *</Label>
                        <Select
                          value={formData.topic}
                          onValueChange={(value) => handleChange("topic", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Topic" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Technology Integration">Technology Integration</SelectItem>
                            <SelectItem value="Hive Monitoring">Hive Monitoring</SelectItem>
                            <SelectItem value="Partnership">Partnership</SelectItem>
                            <SelectItem value="Support">Support</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  {activeTab === "diseases" && (
                    <>
                      <div className="md:col-span-2 space-y-2">
                        <Label>Which disease are you inquiring about? *</Label>
                        <Select
                          value={formData.topic}
                          onValueChange={(value) => handleChange("topic", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Disease" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Varroa Mite">Varroa Mite</SelectItem>
                            <SelectItem value="American Foulbrood">American Foulbrood</SelectItem>
                            <SelectItem value="European Foulbrood">European Foulbrood</SelectItem>
                            <SelectItem value="Nosema">Nosema</SelectItem>
                            <SelectItem value="Chalkbrood">Chalkbrood</SelectItem>
                            <SelectItem value="Sacbrood">Sacbrood</SelectItem>
                            <SelectItem value="Small Hive Beetle">Small Hive Beetle</SelectItem>
                            <SelectItem value="Wax Moths">Wax Moths</SelectItem>
                            <SelectItem value="Tracheal Mites">Tracheal Mites</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  {activeTab === "general" && (
                    <>
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="company">Company / Organization</Label>
                        <Input
                          id="company"
                          type="text"
                          value={formData.company}
                          onChange={(e) => handleChange("company", e.target.value)}
                          placeholder="Optional"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label>Topic *</Label>
                        <Select
                          value={formData.topic}
                          onValueChange={(value) => handleChange("topic", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Topic" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Press Inquiry">Press Inquiry</SelectItem>
                            <SelectItem value="Careers">Careers</SelectItem>
                            <SelectItem value="Sustainability">Sustainability</SelectItem>
                            <SelectItem value="General Question">General Question</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </div>

                {/* Message Area for general and diseases */}
                {(activeTab === 'general' || activeTab === 'diseases') && (
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleChange("message", e.target.value)}
                      placeholder="How can we help you?"
                      className="min-h-[120px]"
                    />
                  </div>
                )}

                <div className="space-y-6 pt-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={termsAccepted}
                      onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                    />
                    <Label htmlFor="terms" className="text-sm font-medium leading-none text-muted-foreground cursor-pointer">
                      I agree with the <a href="/terms" className="text-primary hover:underline">Terms and Conditions</a> and <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
                    </Label>
                  </div>

                  <Button size="lg" className="min-w-[200px] font-bold" disabled={loading}>
                    {loading ? "Submitting..." : "Submit Inquiry"}
                  </Button>
                </div>

              </form>
            </CardContent>
          </Card>
        )}

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
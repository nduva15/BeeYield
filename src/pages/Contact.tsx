import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Mail, Phone, MapPin, ChevronDown,
  Sprout, Bug, MessageSquare
} from "lucide-react";

const Contact = () => {
  useEffect(() => {
    // Inject GTM script into head
    const script = document.createElement('script');
    script.innerHTML = ` (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','GTM-KF284247');`;
    script.async = true;
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);
  const [activeTab, setActiveTab] = useState("grower");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    city: "",
    state: "",
    country: "",
    email: "",
    phone: "",
    farmName: "",
    crop: "Almonds",
    acres: "",
    topic: "Pollination Services",
    apiaryName: "",
    hiveCount: "",
    experience: "1-5 years",
    company: "",
    message: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { submitContactForm } = await import("@/services/contactService");

      const submissionData: any = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        inquiry_type: activeTab,
        topic: formData.topic,
      };

      if (activeTab === "grower") {
        submissionData.farm_name = formData.farmName;
        submissionData.crop_type = formData.crop;
        submissionData.acres = Number(formData.acres);
      } else if (activeTab === "beekeeper") {
        submissionData.apiary_name = formData.apiaryName;
        submissionData.hive_count = Number(formData.hiveCount);
        submissionData.experience_years = formData.experience;
      } else {
        submissionData.company_name = formData.company;
        submissionData.message = formData.message;
      }

      await submitContactForm(submissionData);

      // We should probably use a toast here if available in context, but since I don't see one in props, I'll alert or check local toast hook
      alert("Inquiry submitted successfully!");

      // Reset form
      setFormData({
        firstName: "", lastName: "", city: "", state: "", country: "", email: "", phone: "",
        farmName: "", crop: "Almonds", acres: "", topic: "Pollination Services",
        apiaryName: "", hiveCount: "", experience: "1-5 years", company: "", message: ""
      });

    } catch (error) {
      console.error("Submission failed:", error);
      alert("There was an error submitting your inquiry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "grower", label: "Grower Inquiries", icon: Sprout },
    { id: "beekeeper", label: "Beekeeper Inquiries", icon: Bug },
    { id: "general", label: "General Inquiries", icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen py-12 sm:py-20">
      {/* Google Tag Manager (noscript) */}
      <noscript>
        <iframe
          src="https://www.googletagmanager.com/ns.html?id=GTM-KF284247"
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
          title="Google Tag Manager"
        ></iframe>
      </noscript>
      <div className="container mx-auto px-4">

        {/* Header */}
        <div className="mx-auto max-w-3xl text-center mb-8 sm:mb-12">
          <h1 className="mb-4 sm:mb-6 text-3xl sm:text-4xl md:text-5xl font-bold">Contact Us Today</h1>
          <p className="mb-8 sm:mb-12 text-base sm:text-xl text-muted-foreground">
            Fill in the form, and we will get back to you at our earliest convenience.
          </p>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-12 max-w-4xl mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
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
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    placeholder="Jane"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    placeholder="Doe"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    placeholder="New York"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">State *</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      placeholder="NY"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Country *</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                      placeholder="USA"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="info@beeyield.com"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
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
                        name="farmName"
                        value={formData.farmName}
                        onChange={handleInputChange}
                        required
                        placeholder="Green Acres Farm"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Crop *</label>
                      <select
                        name="crop"
                        value={formData.crop}
                        onChange={handleInputChange}
                        aria-label="Crop selection"
                        className="w-full appearance-none rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <option>Almonds</option>
                        <option>Apples</option>
                        <option>Avocados</option>
                        <option>Blueberries</option>
                        <option>Cherries</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Acres *</label>
                      <input
                        type="number"
                        name="acres"
                        value={formData.acres}
                        onChange={handleInputChange}
                        required
                        placeholder="500"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Topic *</label>
                      <select
                        name="topic"
                        value={formData.topic}
                        onChange={handleInputChange}
                        aria-label="Topic selection"
                        className="w-full appearance-none rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <option>Pollination Services</option>
                        <option>Pricing</option>
                        <option>Consultation</option>
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
                        name="apiaryName"
                        value={formData.apiaryName}
                        onChange={handleInputChange}
                        required
                        placeholder="Busy Bee Apiaries"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Number of Hives *</label>
                      <input
                        type="number"
                        name="hiveCount"
                        value={formData.hiveCount}
                        onChange={handleInputChange}
                        required
                        placeholder="1000"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Years of Experience *</label>
                      <select
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        aria-label="Years of experience selection"
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
                        name="topic"
                        value={formData.topic}
                        onChange={handleInputChange}
                        aria-label="Topic selection for beekeeper"
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

                {activeTab === "general" && (
                  <>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-medium">Company / Organization</label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        placeholder="Optional"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-medium">Topic *</label>
                      <select
                        name="topic"
                        value={formData.topic}
                        onChange={handleInputChange}
                        aria-label="Topic selection for general inquiry"
                        className="w-full appearance-none rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <option>Press Inquiry</option>
                        <option>Careers</option>
                        <option>Sustainability</option>
                        <option>Consultation</option>
                        <option>General Question</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              {/* Message Area for general */}
              {activeTab === 'general' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
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
                    required
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="terms" className="text-sm font-medium leading-none text-muted-foreground">
                    I agree with the <a href="#" className="text-primary hover:underline">Terms and Conditions</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                  </label>
                </div>

                <Button type="submit" size="lg" className="min-w-[200px]" disabled={loading}>
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
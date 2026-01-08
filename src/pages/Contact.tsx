import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { submitContactForm, ContactSubmission } from "@/services/contactService";
import {
  Mail, Phone, MapPin,
  Sprout, Bug, MessageSquare, Loader2
} from "lucide-react";

const Contact = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"grower" | "beekeeper" | "general">("grower");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Unified form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    city: "",
    state: "",
    country: "",
    email: "",
    phone: "",
    // Grower specific
    farmName: "",
    crop: "Almonds",
    acres: "",
    // Beekeeper specific
    apiaryName: "",
    hiveCount: "",
    experience: "1-5 years",
    // General specific
    company: "",
    message: "",
    // Shared
    topic: "Pollination Services",
    agreed: false
  });

  const tabs = [
    { id: "grower", label: "Grower Inquiries", icon: Sprout },
    { id: "beekeeper", label: "Beekeeper Inquiries", icon: Bug },
    { id: "general", label: "General Inquiries", icon: MessageSquare },
  ] as const;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, agreed: e.target.checked }));
  };

  const handleTabChange = (tabId: "grower" | "beekeeper" | "general") => {
    setActiveTab(tabId);
    // Reset specific fields or topic default based on tab if needed
    let defaultTopic = "Pollination Services";
    if (tabId === "beekeeper") defaultTopic = "Technology Integration";
    if (tabId === "general") defaultTopic = "General Question";

    setFormData(prev => ({ ...prev, topic: defaultTopic }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreed) {
      toast({
        title: "Agreement Required",
        description: "Please agree to the Terms and Conditions to proceed.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

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
      };

      // Add conditional fields
      if (activeTab === "grower") {
        submissionData.farm_name = formData.farmName;
        submissionData.crop_type = formData.crop;
        submissionData.acres = parseInt(formData.acres) || 0;
      } else if (activeTab === "beekeeper") {
        submissionData.apiary_name = formData.apiaryName;
        submissionData.hive_count = parseInt(formData.hiveCount) || 0;
        submissionData.experience_years = formData.experience;
      } else if (activeTab === "general") {
        submissionData.company = formData.company;
        submissionData.message = formData.message;
      }

      await submitContactForm(submissionData);

      toast({
        title: "Inquiry Sent!",
        description: "We've received your message and will get back to you shortly.",
      });

      // Reset form (optional, or just specific fields)
      setFormData(prev => ({
        ...prev,
        message: "",
        topic: prev.topic, // keep topic
        agreed: false
      }));

    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was a problem sending your inquiry. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-12 sm:py-20">
      <div className="container mx-auto px-4">

        {/* Header */}
        <div className="mx-auto max-w-3xl text-center mb-8 sm:mb-12">
          <h1 className="mb-4 sm:mb-6 text-3xl sm:text-4xl font-bold">Contact Us Today</h1>
          <p className="mb-8 sm:mb-12 text-sm sm:text-lg text-muted-foreground">
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
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${isActive
                  ? "border-primary bg-primary/5 text-primary shadow-soft"
                  : "border-transparent bg-white shadow-soft text-muted-foreground hover:bg-secondary/20"
                  }`}
                type="button"
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
                    name="firstName"
                    type="text"
                    required
                    placeholder="Jane"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name *</label>
                  <input
                    name="lastName"
                    type="text"
                    required
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">City *</label>
                  <input
                    name="city"
                    type="text"
                    required
                    placeholder="New York"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">State *</label>
                    <input
                      name="state"
                      type="text"
                      required
                      placeholder="NY"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Country *</label>
                    <input
                      name="country"
                      type="text"
                      required
                      placeholder="USA"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email *</label>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="info@beeyield.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number *</label>
                  <input
                    name="phone"
                    type="tel"
                    required
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={handleInputChange}
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
                        name="farmName"
                        type="text"
                        required
                        placeholder="Green Acres Farm"
                        value={formData.farmName}
                        onChange={handleInputChange}
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
                        <option value="Almonds">Almonds</option>
                        <option value="Apples">Apples</option>
                        <option value="Avocados">Avocados</option>
                        <option value="Blueberries">Blueberries</option>
                        <option value="Cherries">Cherries</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Acres *</label>
                      <input
                        name="acres"
                        type="number"
                        required
                        placeholder="500"
                        value={formData.acres}
                        onChange={handleInputChange}
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
                        <option value="Pollination Services">Pollination Services</option>
                        <option value="Pricing">Pricing</option>
                        <option value="Consultation">Consultation</option>
                        <option value="Partnership">Partnership</option>
                        <option value="Support">Support</option>
                      </select>
                    </div>
                  </>
                )}

                {activeTab === "beekeeper" && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Apiary Name *</label>
                      <input
                        name="apiaryName"
                        type="text"
                        required
                        placeholder="Busy Bee Apiaries"
                        value={formData.apiaryName}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Number of Hives *</label>
                      <input
                        name="hiveCount"
                        type="number"
                        required
                        placeholder="1000"
                        value={formData.hiveCount}
                        onChange={handleInputChange}
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
                        <option value="1-5 years">1-5 years</option>
                        <option value="5-10 years">5-10 years</option>
                        <option value="10+ years">10+ years</option>
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
                        <option value="Technology Integration">Technology Integration</option>
                        <option value="Hive Monitoring">Hive Monitoring</option>
                        <option value="Partnership">Partnership</option>
                        <option value="Support">Support</option>
                      </select>
                    </div>
                  </>
                )}

                {activeTab === "general" && (
                  <>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-medium">Company / Organization</label>
                      <input
                        name="company"
                        type="text"
                        placeholder="Optional"
                        value={formData.company}
                        onChange={handleInputChange}
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
                        <option value="Press Inquiry">Press Inquiry</option>
                        <option value="Careers">Careers</option>
                        <option value="Sustainability">Sustainability</option>
                        <option value="Consultation">Consultation</option>
                        <option value="General Question">General Question</option>
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
                    placeholder="How can we help you?"
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
              )}

              <div className="space-y-6 pt-4">
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={formData.agreed}
                    onChange={handleCheckboxChange}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="terms" className="text-sm font-medium leading-none text-muted-foreground">
                    I agree with the <a href="#" className="text-primary hover:underline">Terms and Conditions</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                  </label>
                </div>

                <Button type="submit" size="lg" className="min-w-[200px]" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : "Submit Inquiry"}
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
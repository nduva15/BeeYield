import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Mail, Phone, MapPin,
  Sprout, Bug, MessageSquare, Loader2, ArrowRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { submitContactForm, ContactSubmission } from "@/services/contactService";
import { Badge } from "@/components/ui/badge";

const Contact = () => {
  const { toast } = useToast();
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

  const [activeTab, setActiveTab] = useState<"grower" | "beekeeper" | "general">("grower");
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
        message: formData.message
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
        submissionData.company = formData.company;
      }

      await submitContactForm(submissionData);

      toast({
        title: "Inquiry Submitted!",
        description: "We'll get back to you shortly.",
      });

      setFormData({
        firstName: "", lastName: "", city: "", state: "", country: "", email: "", phone: "",
        farmName: "", crop: "Almonds", acres: "", topic: "Pollination Services",
        apiaryName: "", hiveCount: "", experience: "1-5 years", company: "", message: ""
      });

    } catch (error) {
      console.error("Submission failed:", error);
      toast({
        title: "Submission Failed",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "grower", label: "Growers", icon: Sprout },
    { id: "beekeeper", label: "Beekeepers", icon: Bug },
    { id: "general", label: "General", icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-background">
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

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <Badge className="bg-primary/20 text-primary border-primary/30 px-6 py-2 rounded-2xl font-black uppercase tracking-widest mb-8">
            Connect With Us
          </Badge>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-none mb-8">
            Let's Start a <br /><span className="text-primary italic">Conversation</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-medium">
            Whether you're looking to optimize your yield or join our network, our experts are ready to help.
          </p>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4">

          {/* Tab Switcher */}
          <div className="flex flex-wrap justify-center gap-4 mb-20 max-w-2xl mx-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-3 h-16 rounded-2xl border-2 font-black transition-all ${isActive ? 'bg-primary border-primary text-white shadow-glow' : 'bg-white border-border text-muted-foreground hover:bg-muted/50'}`}
                >
                  <Icon className="h-5 w-5" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          <div className="grid lg:grid-cols-12 gap-16 max-w-7xl mx-auto">
            {/* Form Col */}
            <div className="lg:col-span-8">
              <Card className="border-none shadow-premium rounded-[4rem] bg-white p-10 md:p-16">
                <form onSubmit={handleSubmit} className="space-y-12">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="font-black">First Name</Label>
                      <input name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full h-14 bg-muted/20 border-2 border-transparent focus:border-primary rounded-2xl px-6 outline-none transition-all" required />
                    </div>
                    <div className="space-y-3">
                      <Label className="font-black">Last Name</Label>
                      <input name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full h-14 bg-muted/20 border-2 border-transparent focus:border-primary rounded-2xl px-6 outline-none transition-all" required />
                    </div>
                    <div className="space-y-3">
                      <Label className="font-black">Email Address</Label>
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full h-14 bg-muted/20 border-2 border-transparent focus:border-primary rounded-2xl px-6 outline-none transition-all" required />
                    </div>
                    <div className="space-y-3">
                      <Label className="font-black">Phone Number</Label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full h-14 bg-muted/20 border-2 border-transparent focus:border-primary rounded-2xl px-6 outline-none transition-all" required />
                    </div>
                  </div>

                  <div className="h-px bg-border/50" />

                  <div className="grid md:grid-cols-2 gap-8">
                    {activeTab === 'grower' && (
                      <>
                        <div className="space-y-3">
                          <Label className="font-black">Farm Name</Label>
                          <input name="farmName" value={formData.farmName} onChange={handleInputChange} className="w-full h-14 bg-muted/20 border-2 border-transparent focus:border-primary rounded-2xl px-6 outline-none transition-all" required />
                        </div>
                        <div className="space-y-3">
                          <Label className="font-black">Primary Crop</Label>
                          <select name="crop" value={formData.crop} onChange={handleInputChange} className="w-full h-14 bg-muted/20 border-2 border-transparent focus:border-primary rounded-2xl px-6 outline-none transition-all appearance-none cursor-pointer">
                            <option>Almonds</option>
                            <option>Apples</option>
                            <option>Maize</option>
                            <option>Sunflower</option>
                          </select>
                        </div>
                      </>
                    )}
                    {activeTab === 'beekeeper' && (
                      <>
                        <div className="space-y-3">
                          <Label className="font-black">Apiary Name</Label>
                          <input name="apiaryName" value={formData.apiaryName} onChange={handleInputChange} className="w-full h-14 bg-muted/20 border-2 border-transparent focus:border-primary rounded-2xl px-6 outline-none transition-all" required />
                        </div>
                        <div className="space-y-3">
                          <Label className="font-black">Hive Count</Label>
                          <input type="number" name="hiveCount" value={formData.hiveCount} onChange={handleInputChange} className="w-full h-14 bg-muted/20 border-2 border-transparent focus:border-primary rounded-2xl px-6 outline-none transition-all" required />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label className="font-black">Your Message</Label>
                    <textarea name="message" value={formData.message} onChange={handleInputChange} rows={6} className="w-full bg-muted/20 border-2 border-transparent focus:border-primary rounded-[2rem] p-8 outline-none transition-all" placeholder="How can we help you?" />
                  </div>

                  <Button type="submit" size="lg" className="h-20 w-full text-2xl font-black shadow-glow group" disabled={loading}>
                    {loading ? "Transmitting..." : "Send Inquiry"} <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
                  </Button>
                </form>
              </Card>
            </div>

            {/* Contact Info Col */}
            <div className="lg:col-span-4 space-y-12">
              <div className="bg-foreground text-background p-12 rounded-[3.5rem] space-y-10">
                <h2 className="text-3xl font-black">Direct Access</h2>
                <div className="space-y-8">
                  <div className="flex gap-6">
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                      <Mail className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-black uppercase text-white/40 mb-1">Email Us</p>
                      <p className="text-xl font-bold">info@beeyield.com</p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                      <Phone className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-black uppercase text-white/40 mb-1">Call HQ</p>
                      <p className="text-xl font-bold">+254 700 123 456</p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                      <MapPin className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-black uppercase text-white/40 mb-1">Global Base</p>
                      <p className="text-xl font-bold">Kibwezi, Kenya</p>
                    </div>
                  </div>
                </div>
              </div>

              <Card className="bg-primary/5 border-none rounded-[3.5rem] p-12 text-center overflow-hidden relative">
                <h3 className="text-2xl font-black mb-4 relative z-10">Follow the Journey</h3>
                <p className="text-muted-foreground font-medium relative z-10">Stay updated on the latest in bee-tech.</p>
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16" />
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
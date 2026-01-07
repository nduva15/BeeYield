import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar, MapPin, Sprout, ArrowRight, ShieldCheck, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const PollinationRequest = () => {
  useEffect(() => {
    // Inject GTM script into head
    const script = document.createElement('script');
    script.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
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

  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    farmName: "",
    location: "",
    cropType: "",
    acres: "",
    pollinationDate: "",
    additionalInfo: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { submitPollinationRequest } = await import("@/services/contactService");

      const payload = {
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        farm_name: formData.farmName,
        farm_location: formData.location,
        crop_type: formData.cropType,
        acres: Number(formData.acres),
        preferred_start_date: formData.pollinationDate,
        additional_info: formData.additionalInfo
      };

      await submitPollinationRequest(payload);

      toast({
        title: "Request Submitted!",
        description: "Our team will contact you within 24 hours.",
      });
      setFormData({
        name: "", email: "", phone: "", farmName: "", location: "",
        cropType: "", acres: "", pollinationDate: "", additionalInfo: ""
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to submit request.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <Badge className="bg-primary/20 text-primary border-primary/30 px-6 py-2 rounded-2xl font-black uppercase tracking-widest mb-8">
            Service Deployment
          </Badge>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-none mb-8">
            Request <span className="text-primary italic">Pollination</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-medium">
            Partner with the pioneers of data-driven pollination. Tell us about your operation and let's optimize your harvest.
          </p>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-12 gap-16 max-w-7xl mx-auto">

            {/* Info Column */}
            <div className="lg:col-span-5 space-y-12">
              <div className="bg-white p-10 rounded-[3rem] shadow-soft border border-border">
                <h2 className="text-3xl font-black mb-8">Why Partner With Us?</h2>
                <div className="space-y-8">
                  <div className="flex gap-6">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                      <ShieldCheck className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">Guaranteed Strength</h4>
                      <p className="text-muted-foreground font-medium">We audit every hive to ensure only the strongest colonies enter your field.</p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                      <Clock className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">24h Response</h4>
                      <p className="text-muted-foreground font-medium">Our agronomists review every request within one business day.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-primary p-12 rounded-[3.5rem] text-white">
                <h3 className="text-2xl font-black mb-6">Expert Support</h3>
                <p className="text-white/80 font-medium mb-8 italic">"We help farmers navigate the complexities of pollination math to maximize yield without wasting resources."</p>
                <div className="flex items-center gap-4 border-t border-white/20 pt-8">
                  <div className="w-12 h-12 bg-white/20 rounded-full" />
                  <div>
                    <p className="font-bold">Agatha Kibwezi</p>
                    <p className="text-xs uppercase tracking-widest text-white/60">Operations Lead</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Column */}
            <div className="lg:col-span-7">
              <Card className="border-none shadow-premium rounded-[4rem] bg-white p-12 md:p-16">
                <form onSubmit={handleSubmit} className="space-y-10">
                  <div className="space-y-8">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-10 w-1 bg-primary rounded-full" />
                      <h3 className="text-2xl font-black">Contact Details</h3>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <Label className="font-black" htmlFor="name">Full Name</Label>
                        <Input id="name" className="h-14 border-2 rounded-2xl bg-muted/20" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-black" htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" className="h-14 border-2 rounded-2xl bg-muted/20" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-black" htmlFor="phone">Phone Number</Label>
                      <Input id="phone" type="tel" className="h-14 border-2 rounded-2xl bg-muted/20" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} required />
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-10 w-1 bg-primary rounded-full" />
                      <h3 className="text-2xl font-black">Farm Specs</h3>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <Label className="font-black" htmlFor="farmName">Farm Name</Label>
                        <Input id="farmName" className="h-14 border-2 rounded-2xl bg-muted/20" value={formData.farmName} onChange={(e) => handleChange("farmName", e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-black" htmlFor="location">Location</Label>
                        <Input id="location" className="h-14 border-2 rounded-2xl bg-muted/20" value={formData.location} onChange={(e) => handleChange("location", e.target.value)} required />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <Label className="font-black">Crop Type</Label>
                        <Select onValueChange={(v) => handleChange("cropType", v)}>
                          <SelectTrigger className="h-14 border-2 rounded-2xl bg-muted/20 shadow-none">
                            <SelectValue placeholder="Select Crop" />
                          </SelectTrigger>
                          <SelectContent>
                            {['Maize', 'Apples', 'Sisal', 'Macadamia', 'Sunflower'].map(c => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="font-black">Total Acres</Label>
                        <Input type="number" className="h-14 border-2 rounded-2xl bg-muted/20" value={formData.acres} onChange={(e) => handleChange("acres", e.target.value)} required />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-10 w-1 bg-primary rounded-full" />
                      <h3 className="text-2xl font-black">Timeline & Details</h3>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-black">Preferred Start Date</Label>
                      <Input type="date" className="h-14 border-2 rounded-2xl bg-muted/20" value={formData.pollinationDate} onChange={(e) => handleChange("pollinationDate", e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-black">Additional Requirements</Label>
                      <Textarea rows={5} className="border-2 rounded-2xl bg-muted/20" value={formData.additionalInfo} onChange={(e) => handleChange("additionalInfo", e.target.value)} />
                    </div>
                  </div>

                  <Button type="submit" size="lg" className="w-full h-20 text-2xl font-black shadow-glow group" disabled={loading}>
                    {loading ? "Transmitting..." : "Initialize Request"} <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PollinationRequest;

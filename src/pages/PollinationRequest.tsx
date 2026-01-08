import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar, MapPin, Sprout, Briefcase,
  Mail, Phone, Info, CheckCircle2, ShieldCheck,
  ArrowRight, Sparkles, Clock, Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { submitPollinationRequest } from "@/services/contactService";

const PollinationRequest = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    setIsSubmitting(true);

    try {
      await submitPollinationRequest({
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        farm_name: formData.farmName,
        farm_location: formData.location,
        crop_type: formData.cropType,
        acres: parseInt(formData.acres) || 0,
        preferred_start_date: formData.pollinationDate,
        additional_info: formData.additionalInfo || undefined
      });

      toast({
        title: "Request Submitted!",
        description: "Our experts have received your request and will contact you within 24 hours.",
      });

      // Reset form
      setFormData({
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
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30">

      {/* Hero Header */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-primary to-secondary text-white">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="hex-request" x="0" y="0" width="10" height="8.66" patternUnits="userSpaceOnUse">
              <polygon points="5,0 10,2.89 10,8.66 5,11.55 0,8.66 0,2.89" fill="none" stroke="currentColor" strokeWidth="0.3" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#hex-request)" />
          </svg>
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <Badge className="bg-white/20 text-white border-white/30 mb-6">Securing Your Harvest</Badge>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">Request <span className="text-honey-light italic">Pollination</span></h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto font-medium">
            Take the first step towards a precision-powered harvest. Tell us about your farm,
            and our team will craft a custom pollination strategy for you.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 -mt-12 pb-24 relative z-20">
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">

          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="border-none shadow-premium bg-white dark:bg-gray-950 rounded-[2.5rem] overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border/50 p-8">
                <CardTitle className="text-2xl font-black flex items-center gap-3">
                  <Sparkles className="h-6 w-6 text-primary" />
                  Service Request Form
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 md:p-12">
                <form onSubmit={handleSubmit} className="space-y-10">

                  {/* Contact Group */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Briefcase className="h-4 w-4" />
                      </div>
                      <h3 className="text-lg font-black uppercase tracking-widest text-muted-foreground">Contact Details</h3>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-bold ml-1">Full Name</Label>
                        <Input
                          id="name"
                          className="h-12 rounded-xl bg-muted/20 border-border/50 focus:bg-white transition-all"
                          value={formData.name}
                          onChange={(e) => handleChange("name", e.target.value)}
                          placeholder="e.g. Samuel Njenga"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-bold ml-1">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          className="h-12 rounded-xl bg-muted/20 border-border/50 focus:bg-white transition-all"
                          value={formData.email}
                          onChange={(e) => handleChange("email", e.target.value)}
                          placeholder="samuel@farm.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-bold ml-1">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        className="h-12 rounded-xl bg-muted/20 border-border/50 focus:bg-white transition-all"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        placeholder="+254 7XX XXX XXX"
                        required
                      />
                    </div>
                  </div>

                  {/* Farm Group */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                        <Sprout className="h-4 w-4" />
                      </div>
                      <h3 className="text-lg font-black uppercase tracking-widest text-muted-foreground">Farm Information</h3>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="farmName" className="text-sm font-bold ml-1">Farm Name</Label>
                        <Input
                          id="farmName"
                          className="h-12 rounded-xl bg-muted/20 border-border/50 focus:bg-white transition-all"
                          value={formData.farmName}
                          onChange={(e) => handleChange("farmName", e.target.value)}
                          placeholder="e.g. Highland Macadamia"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location" className="text-sm font-bold ml-1">General Location</Label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="location"
                            className="h-12 pl-12 rounded-xl bg-muted/20 border-border/50 focus:bg-white transition-all"
                            value={formData.location}
                            onChange={(e) => handleChange("location", e.target.value)}
                            placeholder="e.g. Kibwezi, Kenya"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="cropType" className="text-sm font-bold ml-1">Crop Type</Label>
                        <Select value={formData.cropType} onValueChange={(value) => handleChange("cropType", value)}>
                          <SelectTrigger id="cropType" className="h-12 rounded-xl bg-muted/20 border-border/50">
                            <SelectValue placeholder="Select target crop" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="maize">Maize</SelectItem>
                            <SelectItem value="macadamia">Macadamia</SelectItem>
                            <SelectItem value="mangoes">Mangoes</SelectItem>
                            <SelectItem value="beans">Beans</SelectItem>
                            <SelectItem value="sunflower">Sunflower</SelectItem>
                            <SelectItem value="avocado">Avocado</SelectItem>
                            <SelectItem value="vegetables">Vegetables</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="acres" className="text-sm font-bold ml-1">Acres to Pollinate</Label>
                        <Input
                          id="acres"
                          type="number"
                          className="h-12 rounded-xl bg-muted/20 border-border/50 focus:bg-white transition-all"
                          value={formData.acres}
                          onChange={(e) => handleChange("acres", e.target.value)}
                          placeholder="e.g. 50"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Service Group */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <h3 className="text-lg font-black uppercase tracking-widest text-muted-foreground">Service Schedule</h3>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pollinationDate" className="text-sm font-bold ml-1">Preferred Start Date</Label>
                      <Input
                        id="pollinationDate"
                        type="date"
                        className="h-12 rounded-xl bg-muted/20 border-border/50 focus:bg-white transition-all"
                        value={formData.pollinationDate}
                        onChange={(e) => handleChange("pollinationDate", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="additionalInfo" className="text-sm font-bold ml-1">Anything else we should know?</Label>
                      <Textarea
                        id="additionalInfo"
                        className="rounded-2xl bg-muted/20 border-border/50 focus:bg-white transition-all p-4"
                        value={formData.additionalInfo}
                        onChange={(e) => handleChange("additionalInfo", e.target.value)}
                        placeholder="Tell us about your previous pollination experience or specific farm needs..."
                        rows={4}
                      />
                    </div>
                  </div>

                  <Button type="submit" size="lg" className="w-full h-16 text-xl font-black bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-glow gap-3">
                    Submit My Request
                    <ArrowRight className="h-6 w-6" />
                  </Button>

                  <p className="text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-nature-green" />
                    Your data is secure and will only be used for service consultation.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <Card className="border-none shadow-lg bg-secondary/10 dark:bg-secondary/20 rounded-[2rem] p-8">
              <h3 className="text-xl font-black mb-6 tracking-tight">What Happens Next?</h3>
              <div className="space-y-6">
                {[
                  { icon: Clock, title: "Quick Review", desc: "Our agronomists review your farm profile within 24 hours." },
                  { icon: Phone, title: "Consultation", desc: "We'll call you to discuss specific pollination goals and timing." },
                  { icon: CheckCircle2, title: "Deployment", desc: "Certified Precision Hives are deployed to your field." }
                ].map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-900 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <step.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{step.title}</p>
                      <p className="text-xs text-muted-foreground">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="border-none shadow-lg bg-primary text-white rounded-[2rem] p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-20">
                <Info className="h-20 w-20" />
              </div>
              <h3 className="text-xl font-black mb-4 relative z-10">Need a faster quote?</h3>
              <p className="text-white/80 text-sm mb-6 relative z-10 leading-relaxed">
                If you have an urgent bloom starting, call our field office directly for priority scheduling.
              </p>
              <Button variant="outline" className="w-full bg-white/10 border-white/20 text-white hover:bg-white hover:text-primary font-black relative z-10">
                Call: +254 700 000 000
              </Button>
            </Card>

            {/* Testimonial snippet */}
            <div className="p-6 italic text-muted-foreground text-sm leading-relaxed">
              "BeeYield's response time was incredible. Within 48 hours of submitting this form, we had a full deployment plan for our 25-acre maize field."
              <p className="font-black text-foreground not-italic mt-2">— Timothy N. , Master Beekeeper</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollinationRequest;

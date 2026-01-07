import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar, MapPin, Sprout } from "lucide-react";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Request Submitted!",
      description: "Our team will contact you within 24 hours to discuss your pollination needs.",
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
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen py-20">
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
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-5xl font-bold">Request Pollination Service</h1>
            <p className="text-xl text-muted-foreground">
              Fill out the form below and our pollination experts will contact you to discuss your needs
            </p>
          </div>

          <Card className="border-none shadow-elegant">
            <CardHeader>
              <CardTitle className="text-2xl">Service Request Form</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="flex items-center text-lg font-semibold">
                    <MapPin className="mr-2 h-5 w-5 text-primary" />
                    Contact Information
                  </h3>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="info@beeyield.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      required
                    />
                  </div>
                </div>

                {/* Farm Information */}
                <div className="space-y-4">
                  <h3 className="flex items-center text-lg font-semibold">
                    <Sprout className="mr-2 h-5 w-5 text-primary" />
                    Farm Information
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="farmName">Farm Name *</Label>
                    <Input
                      id="farmName"
                      value={formData.farmName}
                      onChange={(e) => handleChange("farmName", e.target.value)}
                      placeholder="Green Valley Farm"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Farm Location *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleChange("location", e.target.value)}
                      placeholder="City, State/Province"
                      required
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="cropType">Crop Type *</Label>
                      <Select value={formData.cropType} onValueChange={(value) => handleChange("cropType", value)}>
                        <SelectTrigger id="cropType">
                          <SelectValue placeholder="Select crop type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="almonds">Almonds</SelectItem>
                          <SelectItem value="apples">Apples</SelectItem>
                          <SelectItem value="blueberries">Blueberries</SelectItem>
                          <SelectItem value="cherries">Cherries</SelectItem>
                          <SelectItem value="cucumbers">Cucumbers</SelectItem>
                          <SelectItem value="melons">Melons</SelectItem>
                          <SelectItem value="pumpkins">Pumpkins</SelectItem>
                          <SelectItem value="strawberries">Strawberries</SelectItem>
                          <SelectItem value="tomatoes">Tomatoes</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="acres">Acres to Pollinate *</Label>
                      <Input
                        id="acres"
                        type="number"
                        value={formData.acres}
                        onChange={(e) => handleChange("acres", e.target.value)}
                        placeholder="100"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Service Details */}
                <div className="space-y-4">
                  <h3 className="flex items-center text-lg font-semibold">
                    <Calendar className="mr-2 h-5 w-5 text-primary" />
                    Service Details
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="pollinationDate">Preferred Pollination Start Date *</Label>
                    <Input
                      id="pollinationDate"
                      type="date"
                      value={formData.pollinationDate}
                      onChange={(e) => handleChange("pollinationDate", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="additionalInfo">Additional Information</Label>
                    <Textarea
                      id="additionalInfo"
                      value={formData.additionalInfo}
                      onChange={(e) => handleChange("additionalInfo", e.target.value)}
                      placeholder="Tell us about any specific requirements, concerns, or questions you have..."
                      rows={5}
                    />
                  </div>
                </div>

                <Button type="submit" size="lg" className="w-full">
                  Submit Pollination Request
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Our team typically responds within 24 hours. For urgent requests, please call us directly.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PollinationRequest;

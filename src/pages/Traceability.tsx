import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { QrCode, MapPin, Calendar, Leaf, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Traceability = () => {
  const [qrCode, setQrCode] = useState("");
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (qrCode.trim()) {
      setShowResults(true);
      toast({
        title: "Code verified!",
        description: "Loading honey information...",
      });
    }
  };

  const mockData = {
    batchId: "PH2024-WF-0342",
    harvestDate: "August 15, 2024",
    location: "Meadowville Valley Apiaries",
    coordinates: "42.3601° N, 71.0589° W",
    beekeeper: "Sarah Johnson",
    flowerSource: "Wildflower (Mixed)",
    certifications: ["Organic", "Fair Trade", "Non-GMO"],
  };

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-block rounded-full bg-primary/10 p-4">
            <QrCode className="h-12 w-12 text-primary" />
          </div>
          <h1 className="mb-4 text-5xl font-bold">Honey Traceability</h1>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            Discover the complete journey of your honey from hive to home. Simply enter the code from your jar or scan the QR code.
          </p>
        </div>

        <div className="mx-auto max-w-2xl">
          <Card className="mb-12 border-none shadow-soft">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="qrCode" className="text-sm font-medium">
                    Enter Traceability Code
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="qrCode"
                      name="qrCode"
                      value={qrCode}
                      onChange={(e) => setQrCode(e.target.value)}
                      placeholder="e.g., PH2024-WF-0342"
                      className="flex-1"
                    />
                    <Button type="submit">
                      Trace
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Find the code on the bottom of your honey jar
                  </p>
                </div>
              </form>

              <div className="mt-6 border-t pt-6">
                <Button variant="outline" className="w-full" size="lg">
                  <QrCode className="mr-2 h-5 w-5" />
                  Scan QR Code Instead
                </Button>
              </div>
            </CardContent>
          </Card>

          {showResults && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <Card className="border-none shadow-soft">
                <CardContent className="p-8">
                  <h2 className="mb-6 text-2xl font-bold">Honey Information</h2>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-primary/10 p-3">
                        <Info className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Batch ID</h3>
                        <p className="text-muted-foreground">{mockData.batchId}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-secondary/10 p-3">
                        <Calendar className="h-5 w-5 text-secondary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Harvest Date</h3>
                        <p className="text-muted-foreground">{mockData.harvestDate}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-accent/10 p-3">
                        <MapPin className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Origin</h3>
                        <p className="text-muted-foreground">{mockData.location}</p>
                        <p className="text-sm text-muted-foreground">{mockData.coordinates}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-primary/10 p-3">
                        <Leaf className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Flower Source</h3>
                        <p className="text-muted-foreground">{mockData.flowerSource}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-soft">
                <CardContent className="p-8">
                  <h3 className="mb-4 font-semibold">Beekeeper</h3>
                  <p className="mb-2 text-lg">{mockData.beekeeper}</p>
                  <p className="text-sm text-muted-foreground">
                    A third-generation beekeeper committed to sustainable practices and bee welfare.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-soft">
                <CardContent className="p-8">
                  <h3 className="mb-4 font-semibold">Certifications</h3>
                  <div className="flex flex-wrap gap-2">
                    {mockData.certifications.map((cert) => (
                      <span
                        key={cert}
                        className="rounded-full bg-secondary/20 px-4 py-2 text-sm font-medium text-secondary-foreground"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Traceability;

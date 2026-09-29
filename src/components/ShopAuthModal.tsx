import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ShoppingBag,
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  Building,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Database,
  Loader2,
  UserCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import { useShopAuth } from "@/hooks/use-shop-auth";
import { toast } from "sonner";

interface ShopAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "signin" | "signup" | "demo";
}

const KENYA_COUNTIES = [
  "Nairobi",
  "Makueni",
  "Mombasa",
  "Kiambu",
  "Machakos",
  "Nakuru",
  "Kisumu",
  "Uasin Gishu",
  "Kilifi",
  "Kajiado",
  "Meru",
  "Nyeri",
  "Other / International",
];

export default function ShopAuthModal({
  isOpen,
  onClose,
  defaultTab = "signin",
}: ShopAuthModalProps) {
  const { signIn, signUp, isDedicatedBackend } = useShopAuth();

  const [activeTab, setActiveTab] = useState<"signin" | "signup">(defaultTab === "demo" ? "signin" : defaultTab);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  // Sign Up Form State
  const [fullName, setFullName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("Nairobi");
  const [county, setCounty] = useState("Nairobi");
  const [accountType, setAccountType] = useState<"customer" | "wholesale">("customer");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail.trim()) {
      toast.error("Please enter your email");
      return;
    }
    if (!signInPassword) {
      toast.error("Please enter your password");
      return;
    }

    setLoading(true);
    const res = await signIn({ email: signInEmail, password: signInPassword });
    setLoading(false);

    if (res.success) {
      toast.success("Welcome to BeeYield Store!");
      onClose();
    } else {
      toast.error(res.error || "Failed to sign in. Please check your credentials.");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    if (!signUpEmail.trim()) {
      toast.error("Please enter your email");
      return;
    }
    if (!phone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }
    if (signUpPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    const res = await signUp({
      full_name: fullName,
      email: signUpEmail,
      phone,
      password: signUpPassword,
      street,
      city,
      county,
      role: accountType,
    });
    setLoading(false);

    if (res.success) {
      toast.success("Shop account created successfully!");
      onClose();
    } else {
      toast.error(res.error || "Failed to register account.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-full bg-card/95 backdrop-blur-xl border border-border shadow-2xl p-6 sm:p-7 rounded-2xl">
        <DialogHeader className="text-left space-y-2 pb-2 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-inner">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="font-display text-lg font-bold text-foreground">
                  Shop <span className="text-honey">Customer Portal</span>
                </DialogTitle>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                  <Database className="w-3 h-3 text-emerald-400" />
                  <span>Isolated Shop Backend & Database</span>
                </div>
              </div>
            </div>
            <Badge
              variant="outline"
              className="text-[10px] uppercase font-mono tracking-wider bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
            >
              {isDedicatedBackend ? "Dedicated DB" : "Shop Partition"}
            </Badge>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Sign in with your e-commerce customer account to manage direct honey orders, saved delivery addresses, and order tracking.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mt-2">
          <TabsList className="grid grid-cols-2 bg-muted/60 p-1 rounded-xl mb-4">
            <TabsTrigger value="signin" className="text-xs font-semibold rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Sign In
            </TabsTrigger>
            <TabsTrigger value="signup" className="text-xs font-semibold rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Register
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: SIGN IN */}
          <TabsContent value="signin" className="space-y-4 focus:outline-none">
            <form onSubmit={handleSignIn} className="space-y-3.5">
              <div className="space-y-1.5">
                <Label className="text-xs text-foreground font-medium flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                  Email Address
                </Label>
                <Input
                  type="email"
                  placeholder="customer@domain.com"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  className="h-10 text-xs bg-background/60 border-input rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-foreground font-medium flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                    Password
                  </Label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showPassword ? "Hide" : "Show"}</span>
                  </button>
                </div>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  className="h-10 text-xs bg-background/60 border-input rounded-xl"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 rounded-xl bg-honey hover:bg-honey/90 text-primary-foreground font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connecting to Shop Database...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Sign In to Shop</span>
                  </>
                )}
              </Button>
            </form>

            <div className="pt-2 text-center border-t border-border/50">
              <p className="text-[11px] text-muted-foreground">
                Don't have an e-commerce account?{" "}
                <button
                  type="button"
                  onClick={() => setActiveTab("signup")}
                  className="text-honey hover:underline font-semibold"
                >
                  Create one now
                </button>
              </p>
            </div>
          </TabsContent>

          {/* TAB 2: SIGN UP */}
          <TabsContent value="signup" className="space-y-3.5 focus:outline-none max-h-[60vh] overflow-y-auto pr-1">
            <form onSubmit={handleSignUp} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAccountType("customer")}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    accountType === "customer"
                      ? "border-honey/60 bg-honey/10 text-foreground"
                      : "border-border bg-background/40 text-muted-foreground"
                  }`}
                >
                  <p className="text-xs font-bold">Retail Buyer</p>
                  <p className="text-[10px] text-muted-foreground">Honey, jars & supplies</p>
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType("wholesale")}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    accountType === "wholesale"
                      ? "border-emerald-500/60 bg-emerald-500/10 text-foreground"
                      : "border-border bg-background/40 text-muted-foreground"
                  }`}
                >
                  <p className="text-xs font-bold">Wholesale Partner</p>
                  <p className="text-[10px] text-muted-foreground">Bulk drums & export</p>
                </button>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-foreground font-medium flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  Full Name / Organization
                </Label>
                <Input
                  placeholder="e.g. Timothy Nduva"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-9 text-xs bg-background/60 border-input rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-foreground font-medium flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                    Email
                  </Label>
                  <Input
                    type="email"
                    placeholder="grace@domain.com"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    className="h-9 text-xs bg-background/60 border-input rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-foreground font-medium flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                    Phone (M-Pesa)
                  </Label>
                  <Input
                    placeholder="+254 700 000 000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-9 text-xs bg-background/60 border-input rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-foreground font-medium flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                  Password
                </Label>
                <Input
                  type="password"
                  placeholder="At least 6 characters"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  className="h-9 text-xs bg-background/60 border-input rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-foreground font-medium flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                  Delivery Street Address
                </Label>
                <Input
                  placeholder="e.g. Kilimani, Argwings Kodhek Rd"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="h-9 text-xs bg-background/60 border-input rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-foreground font-medium">City / Town</Label>
                  <Input
                    placeholder="e.g. Nairobi"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="h-9 text-xs bg-background/60 border-input rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-foreground font-medium">County</Label>
                  <select
                    value={county}
                    onChange={(e) => setCounty(e.target.value)}
                    className="w-full h-9 px-2 text-xs bg-background/60 border border-input rounded-xl text-foreground"
                  >
                    {KENYA_COUNTIES.map((c) => (
                      <option key={c} value={c} className="bg-card text-foreground">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Registering in Shop Database...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Create Shop Account</span>
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

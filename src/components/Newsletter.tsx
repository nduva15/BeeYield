import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { submitNewsletterSubscription } from "@/services/contactService";
import { Loader2, Mail, CheckCircle2, Sparkles } from "lucide-react";

interface NewsletterProps {
    className?: string;
    source?: string;
}

export const Newsletter = ({ className = "", source = "footer" }: NewsletterProps) => {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        // Basic validation
        if (!email.includes("@") || !email.includes(".")) {
            toast({
                title: "Invalid Email",
                description: "Please enter a valid email address.",
                variant: "destructive",
            });
            return;
        }

        setStatus("loading");
        try {
            await submitNewsletterSubscription({ email, source });
            setStatus("success");
            toast({
                title: "✅ Subscribed Successfully!",
                description: "Welcome to BeeYield Weekly — you'll hear from us soon.",
            });
            setEmail("");
        } catch (error: any) {
            console.error(error);
            setStatus("idle");

            // Handle duplicate subscriber
            const errMsg = error?.message || "";
            if (errMsg.toLowerCase().includes("already") || errMsg.toLowerCase().includes("duplicate")) {
                toast({
                    title: "Already Subscribed",
                    description: "This email is already on our list. Thank you!",
                });
            } else {
                toast({
                    title: "Subscription Failed",
                    description: "Something went wrong. Please try again.",
                    variant: "destructive",
                });
            }
        }
    };

    if (status === "success") {
        return (
            <div className={`flex items-center gap-3 text-emerald-600 bg-emerald-50 p-4 rounded-xl border border-emerald-200 animate-in fade-in slide-in-from-bottom-2 duration-500 ${className}`}>
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                    <p className="font-semibold text-sm">You're in! 🐝</p>
                    <p className="text-xs opacity-80">Check your inbox for a welcome message.</p>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className={`space-y-3 ${className}`}>
            <div className="flex items-center gap-1.5 mb-1">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">BeeYield Weekly</span>
            </div>
            <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                    id="newsletter-email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    className="pl-9 bg-background/60 backdrop-blur-sm border-border/60 focus-visible:ring-primary/50 focus-visible:border-primary transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                />
            </div>
            <Button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all duration-300"
                disabled={status === "loading"}
            >
                {status === "loading" ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Subscribing...
                    </>
                ) : (
                    <>
                        <Mail className="mr-2 h-4 w-4" />
                        Subscribe
                    </>
                )}
            </Button>
            <p className="text-[11px] text-muted-foreground/70 text-center leading-relaxed">
                Harvest updates, pollination insights & industry news.<br />
                No spam — unsubscribe anytime.
            </p>
        </form>
    );
};

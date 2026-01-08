import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { submitNewsletterSubscription } from "@/services/contactService";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";

export const Newsletter = ({ className = "" }: { className?: string }) => {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus("loading");
        try {
            await submitNewsletterSubscription({ email, source: "footer" });
            setStatus("success");
            toast({
                title: "Subscribed!",
                description: "You've successfully joined our newsletter.",
            });
            setEmail("");
        } catch (error) {
            console.error(error);
            setStatus("idle");
            toast({
                title: "Subscription Failed",
                description: "Please try again later.",
                variant: "destructive",
            });
        }
    };

    if (status === "success") {
        return (
            <div className={`flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg ${className}`}>
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Thanks for subscribing!</span>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className={`space-y-2 ${className}`}>
            <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="email"
                    placeholder="Enter your email"
                    className="pl-9 bg-background/50 border-border/50 focus-visible:ring-primary"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <Button
                type="submit"
                className="w-full"
                disabled={status === "loading"}
            >
                {status === "loading" ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Subscribing...
                    </>
                ) : (
                    "Subscribe to Newsletter"
                )}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
                Join for updates on harvest seasons and pollination tech.
            </p>
        </form>
    );
};

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Loader2,
  Eye,
  EyeOff,
  Mail,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import beeyieldLogo from "@/assets/beeyield-logo.png";

function safeNext(raw: string | null): string {
  if (!raw) return "/";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

const COUNTRIES = [
  "Kenya",
  "Uganda",
  "Tanzania",
  "Rwanda",
  "Ethiopia",
  "Nigeria",
  "Ghana",
  "South Africa",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "India",
  "Germany",
  "France",
  "Other",
];

export default function Auth() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get("next"));
  const returnTo = typeof window !== "undefined" ? `${window.location.origin}${next}` : next;

  const { user, signInDemoOwner } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("Kenya");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);

  // Unconfirmed email warning state
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);
  // Signup success pending email confirmation state
  const [signupPendingConfirmation, setSignupPendingConfirmation] = useState(false);

  useEffect(() => {
    if (user) {
      nav(next, { replace: true });
    }
  }, [user, nav, next]);

  // Catch OAuth redirect errors (from Supabase URL hash or query params)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    const search = window.location.search;
    const searchParams = new URLSearchParams(search);
    const errorMsg =
      searchParams.get("error_description") ||
      searchParams.get("error") ||
      (hash.includes("error_description=")
        ? decodeURIComponent(hash.split("error_description=")[1]?.split("&")[0]?.replace(/\+/g, " ") || "")
        : null);

    if (errorMsg) {
      toast.error(`Authentication error: ${errorMsg}`);
    }
  }, []);

  // Resend email confirmation handler
  async function handleResendConfirmation(targetEmail: string) {
    if (!targetEmail.trim()) {
      toast.error("Please enter your email address to resend confirmation.");
      return;
    }
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: targetEmail.trim(),
        options: {
          emailRedirectTo: returnTo,
        },
      });
      if (error) throw error;
      toast.success("Confirmation link resent! Check your inbox and spam folder.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to resend confirmation email.");
    } finally {
      setResending(false);
    }
  }

  // Fast demo / owner login handler
  function handleFastOwnerLogin() {
    signInDemoOwner("timothy@beeyield.com", "Timothy (Apiary Owner)");
    toast.success("Signed in as Timothy (Kibwezi Apiary Owner)");
    nav(next, { replace: true });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setUnconfirmedEmail(null);

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    try {
      if (mode === "reset") {
        if (!cleanEmail) throw new Error("Please enter your email address");
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: `${window.location.origin}/auth`,
        });
        if (error) throw error;
        toast.success("Password reset link sent to your email.");
        setMode("signin");
      } else if (mode === "signup") {
        if (!fullName.trim()) throw new Error("Please enter your full name");
        if (!cleanEmail) throw new Error("Please enter a valid email address");
        if (cleanPassword.length < 6) throw new Error("Password must be at least 6 characters");
        if (cleanPassword !== confirmPassword.trim()) throw new Error("Passwords do not match");

        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
          options: {
            emailRedirectTo: returnTo,
            data: {
              full_name: fullName.trim(),
              phone: phone.trim(),
              country,
            },
          },
        });

        if (error) {
          if (error.message.toLowerCase().includes("weak") || (error as any).code === "weak_password") {
            throw new Error("Password is too weak or commonly used. Please choose a stronger password.");
          }
          throw error;
        }

        // Case 1: Account already exists (Supabase returns empty identities array to avoid email enumeration)
        if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
          toast.info("An account with this email already exists. Please sign in.");
          setMode("signin");
          return;
        }

        // Case 2: Auto-confirmed / immediate session returned
        if (data?.session) {
          try {
            const p = {
              id: data.session.user.id,
              email: cleanEmail,
              full_name: fullName.trim(),
              phone: phone.trim(),
              country,
              avatar_url: null,
            };
            localStorage.setItem(
              "beeyield_local_user",
              JSON.stringify({ user: data.session.user, profile: p })
            );
          } catch {}
          toast.success("Welcome to BeeYield! Your account is created and active.");
          nav(next, { replace: true });
          return;
        }

        // Case 3: Email confirmation required
        setSignupPendingConfirmation(true);
        toast.success("Account created! A confirmation email has been sent.");
      } else {
        // Sign In
        if (!cleanEmail) throw new Error("Please enter your email");
        if (!cleanPassword) throw new Error("Please enter your password");

        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        });

        if (error) {
          if (
            error.message.toLowerCase().includes("email not confirmed") ||
            (error as any).code === "email_not_confirmed"
          ) {
            setUnconfirmedEmail(cleanEmail);
            throw new Error("Your email has not been confirmed yet. Please verify your inbox.");
          }
          if (error.message.toLowerCase().includes("invalid login credentials")) {
            throw new Error("Invalid email or password. Please verify your credentials.");
          }
          throw error;
        }

        if (data?.session) {
          try {
            const p = {
              id: data.session.user.id,
              email: cleanEmail,
              full_name: data.session.user.user_metadata?.full_name || null,
              phone: data.session.user.user_metadata?.phone || null,
              country: data.session.user.user_metadata?.country || null,
              avatar_url: data.session.user.user_metadata?.avatar_url || null,
            };
            localStorage.setItem(
              "beeyield_local_user",
              JSON.stringify({ user: data.session.user, profile: p })
            );
          } catch {}
          toast.success("Signed in successfully. Welcome back!");
          nav(next, { replace: true });
        }
      }
    } catch (err: any) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogleOAuth() {
    setBusy(true);
    try {
      // 1. Verify if Google OAuth provider is active on the Supabase instance
      // to avoid dumping the user onto a raw Supabase 400 Bad Request JSON error page
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

      if (supabaseUrl && supabaseKey) {
        try {
          const res = await fetch(`${supabaseUrl}/auth/v1/settings`, {
            headers: { apikey: supabaseKey },
          });
          if (res.ok) {
            const settings = await res.json();
            if (settings?.external && settings.external.google === false) {
              toast.error(
                "Google sign-in is not enabled on this Supabase project yet. Please sign in with email or use Fast Owner Sign-In.",
                { duration: 6000 }
              );
              return;
            }
          }
        } catch {
          // If network check fails, continue to auth attempt
        }
      }

      // Direct BeeYield Supabase OAuth with safe redirect
      const { data, error: sbErr } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: returnTo,
          skipBrowserRedirect: true,
        },
      });

      if (sbErr) throw sbErr;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      toast.error(err?.message || "Google sign-in unavailable. Please use email sign in.");
    } finally {
      setBusy(false);
    }
  }

  // Pending confirmation view
  if (signupPendingConfirmation) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-[#FAF9F5] text-stone-900">
        <div className="w-full max-w-md bg-white border border-[#E7E5E4] rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-5 animate-in fade-in">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 mx-auto shadow-sm">
            <Mail className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-display tracking-tight text-foreground">
              Confirm your email
            </h2>
            <p className="text-xs text-muted-foreground">
              We sent a verification link to <strong className="text-foreground">{email}</strong>.
              Please click the link in your email to activate your account.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-left space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Security Check</span>
            </div>
            <p className="text-[11px] text-amber-800">
              If you don't see the email within 1–2 minutes, check your spam or promotional folders.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <Button
              onClick={() => handleResendConfirmation(email)}
              disabled={resending}
              variant="outline"
              className="w-full h-10 rounded-xl text-xs font-semibold gap-1.5"
            >
              {resending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              Resend confirmation link
            </Button>

            <Button
              onClick={() => {
                setSignupPendingConfirmation(false);
                setMode("signin");
              }}
              className="w-full h-10 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs gap-1.5"
            >
              Proceed to sign in
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>

            <div className="pt-2 border-t border-border/60">
              <button
                type="button"
                onClick={handleFastOwnerLogin}
                className="text-xs text-amber-700 hover:text-amber-800 font-semibold flex items-center justify-center gap-1 mx-auto"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Or bypass email & enter as Kibwezi Apiary Owner (Demo)
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-[#FAF9F5] text-stone-900">
      <div className="w-full max-w-md bg-white border border-[#E7E5E4] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <img src={beeyieldLogo} alt="BeeYield" className="h-12 w-auto object-contain" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            {mode === "signin"
              ? "Sign in to BeeYield"
              : mode === "signup"
              ? "Create your BeeYield account"
              : "Reset your password"}
          </h1>
          <p className="text-xs text-muted-foreground">
            Unified access for apiculture records, hive telemetry, and BeeGPT guidance.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        {mode !== "reset" && (
          <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-xl border border-stone-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setUnconfirmedEmail(null);
              }}
              className={`py-2 rounded-lg transition-all ${
                mode === "signin"
                  ? "bg-white text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setUnconfirmedEmail(null);
              }}
              className={`py-2 rounded-lg transition-all ${
                mode === "signup"
                  ? "bg-white text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Unconfirmed Email Alert with Instant Resend */}
        {unconfirmedEmail && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-900 space-y-2">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Email Confirmation Required</span>
            </div>
            <p className="text-[11px] text-amber-800">
              Your account exists, but the email address <strong>{unconfirmedEmail}</strong> has not
              been confirmed yet.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <Button
                type="button"
                size="sm"
                onClick={() => handleResendConfirmation(unconfirmedEmail)}
                disabled={resending}
                className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold"
              >
                {resending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Resend confirmation"}
              </Button>
              <button
                type="button"
                onClick={handleFastOwnerLogin}
                className="text-xs text-amber-800 hover:underline font-semibold"
              >
                Enter as Owner (Demo)
              </button>
            </div>
          </div>
        )}

        {/* Social / Google OAuth */}
        {mode !== "reset" && (
          <>
            <Button
              onClick={handleGoogleOAuth}
              disabled={busy}
              variant="outline"
              className="w-full h-10 rounded-xl text-xs font-semibold border-border hover:bg-muted/50 gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Continue with Google
            </Button>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex-1 h-px bg-border/80" />
              <span>or continue with email</span>
              <div className="flex-1 h-px bg-border/80" />
            </div>
          </>
        )}

        {/* Credentials Form */}
        <form onSubmit={submit} className="space-y-3.5">
          {mode === "signup" && (
            <>
              <div className="space-y-1">
                <Label htmlFor="fullName" className="text-xs font-semibold text-foreground">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Timothy Munyao"
                  required
                  className="h-10 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="phone" className="text-xs font-semibold text-foreground">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+254 7xx xxx xxx"
                    className="h-10 rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="country" className="text-xs font-semibold text-foreground">
                    Country
                  </Label>
                  <select
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full h-10 rounded-xl border border-input bg-background px-2.5 text-xs font-medium"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="space-y-1">
            <Label htmlFor="email" className="text-xs font-semibold text-foreground">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@beeyield.com"
              required
              className="h-10 rounded-xl text-xs"
            />
          </div>

          {mode !== "reset" && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold text-foreground">
                  Password
                </Label>
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder={mode === "signup" ? "At least 6 characters" : "••••••••"}
                  className="h-10 rounded-xl text-xs pr-10"
                />
              </div>
            </div>
          )}

          {mode === "signup" && (
            <div className="space-y-1">
              <Label htmlFor="confirmPassword" className="text-xs font-semibold text-foreground">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Re-type your password"
                className="h-10 rounded-xl text-xs"
              />
            </div>
          )}

          <Button
            type="submit"
            disabled={busy}
            className="w-full h-10 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-sm mt-1"
          >
            {busy ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : mode === "signin" ? (
              "Sign In"
            ) : mode === "signup" ? (
              "Create Beeyield Account"
            ) : (
              "Send Reset Link"
            )}
          </Button>
        </form>

        {/* Owner Fast Access Bypass Button */}
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center space-y-1.5">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-900">
            <UserCheck className="w-4 h-4 text-amber-600" />
            <span>Fast Owner Sign-In (Kibwezi Apiary)</span>
          </div>
          <p className="text-[11px] text-amber-800">
            Immediate access as verified Apiary Owner Timothy with live Kibwezi records.
          </p>
          <Button
            type="button"
            onClick={handleFastOwnerLogin}
            variant="outline"
            size="sm"
            className="w-full h-8 text-xs font-bold rounded-lg border-amber-300 bg-white hover:bg-amber-100 text-amber-900 shadow-xs"
          >
            Continue as Timothy (Owner)
          </Button>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-border/60">
          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setUnconfirmedEmail(null);
            }}
            className="text-muted-foreground hover:text-foreground font-medium"
          >
            {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </button>
          {mode !== "reset" ? (
            <button
              type="button"
              onClick={() => {
                setMode("reset");
                setUnconfirmedEmail(null);
              }}
              className="text-muted-foreground hover:text-foreground font-medium"
            >
              Forgot password?
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setUnconfirmedEmail(null);
              }}
              className="text-muted-foreground hover:text-foreground font-medium"
            >
              Back to Sign in
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

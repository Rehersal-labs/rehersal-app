"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronDown, Mail } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
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
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function getCallbackUrl(next?: string | null): string {
  // Prefer current browser origin so OAuth works on :3000 or :3001
  const base =
    (typeof window !== "undefined" ? window.location.origin : "") ||
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "";
  const url = new URL("/callback", base);
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    url.searchParams.set("next", next);
  }
  return url.toString();
}

export function SignInForm() {
  const searchParams = useSearchParams();
  const authError = searchParams.get("error") === "auth";
  const authReason = searchParams.get("reason");
  const nextPath = searchParams.get("next");

  const [emailExpanded, setEmailExpanded] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState<"google" | "email" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(() => {
    if (!authError) return null;
    if (authReason) {
      return `Sign-in failed: ${decodeURIComponent(authReason)}. Add your app URL + /callback in Supabase → Authentication → URL Configuration.`;
    }
    return "Sign-in failed. Enable Google in Supabase and add /callback to redirect URLs (see docs/GOOGLE_AUTH.md).";
  });

  async function signInWithGoogle() {
    setLoading("google");
    setError(null);
    setMessage(null);
    try {
      const supabase = createBrowserSupabaseClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: getCallbackUrl(nextPath),
          queryParams: { prompt: "select_account" },
        },
      });
      if (oauthError) throw oauthError;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start Google sign-in");
      setLoading(null);
    }
  }

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setLoading("email");
    setError(null);
    setMessage(null);
    try {
      const supabase = createBrowserSupabaseClient();
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: { emailRedirectTo: getCallbackUrl(nextPath) },
      });
      if (otpError) throw otpError;
      setMessage("Check your inbox for a magic link to continue.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send magic link");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="animate-fade-in-up">
      {/* Logo + brand */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/20 ring-2 ring-accent/30">
          <span className="font-display text-h1 font-bold text-accent">R</span>
        </div>
        <h1 className="font-display text-h1 text-foreground-primary">Welcome back</h1>
        <p className="mt-2 text-body text-foreground-secondary">
          Practice the conversation before it matters.
        </p>
      </div>

      <Card className="border border-border-subtle bg-surface p-8 shadow-float">
        <div className="space-y-3">
          {/* Google */}
          <Button
            type="button"
            size="lg"
            className="w-full bg-accent text-white hover:bg-accent/90 btn-glow"
            disabled={loading !== null}
            onClick={signInWithGoogle}
          >
            {loading === "google" ? (
              "Redirecting…"
            ) : (
              <>
                <GoogleIcon className="h-5 w-5" />
                Continue with Google
              </>
            )}
          </Button>

          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border-subtle" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-surface px-3 font-mono text-caption uppercase text-foreground-tertiary">
                or
              </span>
            </div>
          </div>

          {/* Email magic link */}
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full border-border text-foreground-secondary hover:border-accent/40 hover:text-foreground-primary"
            disabled={loading !== null}
            onClick={() => setEmailExpanded((v) => !v)}
          >
            <Mail className="h-4 w-4" strokeWidth={1.5} />
            Continue with email
            <ChevronDown
              className={cn(
                "ml-auto h-4 w-4 transition-transform duration-standard",
                emailExpanded && "rotate-180"
              )}
              strokeWidth={1.5}
            />
          </Button>

          {emailExpanded && (
            <form onSubmit={sendMagicLink} className="space-y-3 pt-1 animate-fade-in-up">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-small text-foreground-secondary">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading !== null}
                  className="border-border bg-surface-elevated"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading !== null || !email.trim()}
              >
                {loading === "email" ? "Sending…" : "Send magic link"}
              </Button>
            </form>
          )}
        </div>

        {message && (
          <p className="mt-5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-center text-small text-emerald-400" role="status">
            {message}
          </p>
        )}
        {error && (
          <p className="mt-5 rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-center text-small text-rose-400" role="alert">
            {error}
          </p>
        )}
      </Card>

      <p className="mt-6 text-center text-caption text-foreground-tertiary">
        By continuing you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}

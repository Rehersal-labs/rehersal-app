"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function getCallbackUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/callback`;
}

export function SignInForm() {
  const searchParams = useSearchParams();
  const authError = searchParams.get("error") === "auth";

  const [email, setEmail] = useState("");
  const [showEmail, setShowEmail] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [loading, setLoading] = useState<"google" | "email" | null>(null);
  const [error, setError] = useState<string | null>(
    authError ? "Sign-in failed. Please try again." : null
  );

  async function signInWithGoogle() {
    setLoading("google");
    setError(null);
    try {
      const supabase = createBrowserSupabaseClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: getCallbackUrl(),
        },
      });
      if (oauthError) throw oauthError;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Google sign-in failed");
      setLoading(null);
    }
  }

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading("email");
    setError(null);
    try {
      const supabase = createBrowserSupabaseClient();
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: getCallbackUrl(),
        },
      });
      if (otpError) throw otpError;
      setMagicSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send magic link");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <p className="font-mono text-caption text-foreground-tertiary">REHEARSAL</p>
        <h1 className="font-display text-h1 text-foreground-primary">
          Sign in to Rehearsal
        </h1>
        <p className="text-body text-foreground-secondary">
          Have the conversation before you have it.
        </p>
      </div>

      {magicSent ? (
        <div
          className="rounded-lg border border-border-default bg-surface-elevated p-6 text-center"
          role="status"
        >
          <p className="font-display text-h3 text-foreground-primary">
            Check your email
          </p>
          <p className="mt-2 text-small text-foreground-secondary">
            We sent a sign-in link to <strong>{email}</strong>
          </p>
          <Button
            variant="ghost"
            className="mt-4"
            onClick={() => {
              setMagicSent(false);
              setShowEmail(true);
            }}
          >
            Use a different email
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <Button
            type="button"
            className="w-full"
            disabled={loading !== null}
            onClick={signInWithGoogle}
          >
            {loading === "google" ? "Redirecting…" : "Continue with Google"}
          </Button>

          {!showEmail ? (
            <Button
              type="button"
              variant="outline"
              className="w-full border-border-default"
              disabled={loading !== null}
              onClick={() => setShowEmail(true)}
            >
              Continue with email
            </Button>
          ) : (
            <form onSubmit={sendMagicLink} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading !== null || !email.trim()}
              >
                {loading === "email" ? "Sending…" : "Send magic link"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setShowEmail(false)}
              >
                Back
              </Button>
            </form>
          )}
        </div>
      )}

      {error && (
        <p className="text-center text-small text-critical" role="alert">
          {error}
        </p>
      )}

      <p className="text-center text-small text-foreground-tertiary">
        By continuing, you agree to session transcription for feedback on
        rehearsal sessions.
      </p>
    </div>
  );
}


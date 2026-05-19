"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Users, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useLibrary } from "@/lib/hooks/use-api";
import type { Role } from "@/types";

const USE_CASES = [
  { id: "interview",    label: "Job interviews",          icon: "🎯" },
  { id: "pitch",        label: "Fundraising & pitches",   icon: "🚀" },
  { id: "sales",        label: "Sales conversations",     icon: "💼" },
  { id: "difficult",    label: "Difficult conversations", icon: "🤝" },
  { id: "negotiation",  label: "Negotiations",            icon: "⚖️" },
  { id: "other",        label: "Something else",          icon: "✨" },
];

type InviteRow = { email: string; role: Role };

const MODE_OPTIONS = [
  {
    id: "solo" as const,
    Icon: User,
    heading: "Solo practice",
    description:
      "I'm preparing for my own conversations. Interviews, pitches, calls, or anything else I need to rehearse.",
    caption: "Free during private pilot.",
  },
  {
    id: "team" as const,
    Icon: Users,
    heading: "Team training",
    description:
      "I coach or manage others. I want to assign rehearsals and review their reports.",
    caption: "Free during private pilot.",
  },
];

function ProgressDots({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 rounded-full transition-all duration-300",
            i + 1 === step
              ? "w-6 bg-accent"
              : i + 1 < step
              ? "w-1.5 bg-accent/40"
              : "w-1.5 bg-border"
          )}
        />
      ))}
    </div>
  );
}

export function OnboardingFlow() {
  const router = useRouter();
  const { data: libraryData } = useLibrary({ category: "professional" });
  const [step, setStep] = useState(1);
  const [intent, setIntent] = useState<"solo" | "team" | null>(null);
  const [workspaceName, setWorkspaceName] = useState("");
  const [useCase, setUseCase] = useState("");
  const [starterId, setStarterId] = useState<string | null>(null);
  const [invites, setInvites] = useState<InviteRow[]>([{ email: "", role: "learner" }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const profiles = (libraryData?.profiles ?? []).slice(0, 4) as {
    id: string;
    name: string;
    title?: string | null;
    company?: string | null;
  }[];

  const totalSteps = intent === "team" ? 5 : 4;

  // Step 1 requires intent selection before continuing
  const canContinue =
    step === 1 ? intent !== null :
    step === 2 ? workspaceName.trim().length > 0 :
    step === 3 ? useCase !== "" :
    true;

  async function complete() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent,
          workspace_name: workspaceName || (intent === "solo" ? "My Practice Space" : "My Team"),
          primary_use_case: useCase,
          starter_target_id: starterId ?? undefined,
          invite_emails:
            intent === "team"
              ? invites
                  .filter((i) => i.email.trim())
                  .map((i) => ({ email: i.email.trim(), role: i.role }))
              : undefined,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Onboarding failed");
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function next() {
    if (step === 1 && intent === null) return;
    setStep((s) => s + 1);
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="space-y-3">
        <p className="font-mono text-caption uppercase tracking-widest text-accent">
          Getting started
        </p>
        <h1 className="font-display text-display-2 text-foreground-primary">
          {step === 1 && "How will you use Rehearsal?"}
          {step === 2 && (intent === "solo" ? "Name your practice space" : "Name your workspace")}
          {step === 3 && "What will you rehearse?"}
          {step === 4 && "Start with a real target"}
          {step === 5 && "Invite your team"}
        </h1>
        <ProgressDots step={step} total={totalSteps} />
      </div>

      {/* ── Step 1: Mode selection ── */}
      {step === 1 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {MODE_OPTIONS.map(({ id, Icon, heading, description, caption }) => {
            const selected = intent === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setIntent(id)}
                className={cn(
                  "group relative flex flex-col items-start gap-4 rounded-2xl border-2 p-6 text-left transition-all duration-200",
                  selected
                    ? "border-accent bg-accent/10 shadow-accent-glow"
                    : "border-border-subtle bg-surface hover:border-accent/40 hover:bg-accent/5"
                )}
              >
                {/* Selected checkmark */}
                {selected && (
                  <span className="absolute right-4 top-4">
                    <CheckCircle2
                      className="h-5 w-5 text-accent"
                      strokeWidth={2}
                    />
                  </span>
                )}

                {/* Icon */}
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl transition-colors",
                    selected
                      ? "bg-accent/20"
                      : "bg-surface-elevated group-hover:bg-accent/10"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-6 w-6 transition-colors",
                      selected ? "text-accent" : "text-foreground-secondary"
                    )}
                    strokeWidth={1.5}
                  />
                </div>

                {/* Text */}
                <div className="flex-1 space-y-1.5">
                  <p
                    className={cn(
                      "font-display text-h2 transition-colors",
                      selected ? "text-accent" : "text-foreground-primary"
                    )}
                  >
                    {heading}
                  </p>
                  <p className="text-small leading-relaxed text-foreground-secondary">
                    {description}
                  </p>
                </div>

                {/* Caption / pricing */}
                <p className="font-mono text-caption text-foreground-tertiary">
                  {caption}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Step 2: Workspace name ── */}
      {step === 2 && (
        <div className="space-y-4 max-w-md">
          <div className="space-y-1.5">
            <Label htmlFor="workspace">
              {intent === "solo" ? "Practice space name" : "Workspace name"}
            </Label>
            <Input
              id="workspace"
              autoFocus
              placeholder={
                intent === "solo" ? "e.g. Alex's Practice Space" : "e.g. Acme Sales Team"
              }
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && canContinue) next(); }}
              className="text-body"
            />
          </div>
          <p className="text-small text-foreground-tertiary">
            {intent === "solo"
              ? "Only you will see this. You can change it later in Settings."
              : "Your team will see this name. You can change it later in Settings."}
          </p>
        </div>
      )}

      {/* ── Step 3: Use case ── */}
      {step === 3 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {USE_CASES.map((uc) => (
            <button
              key={uc.id}
              type="button"
              onClick={() => setUseCase(uc.id)}
              className={cn(
                "flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all duration-150",
                useCase === uc.id
                  ? "border-accent bg-accent/10"
                  : "border-border-subtle bg-surface hover:border-accent/30 hover:bg-accent/5"
              )}
            >
              <span className="text-xl leading-none">{uc.icon}</span>
              <span
                className={cn(
                  "font-medium",
                  useCase === uc.id ? "text-accent" : "text-foreground-primary"
                )}
              >
                {uc.label}
              </span>
              {useCase === uc.id && (
                <CheckCircle2 className="ml-auto h-4 w-4 text-accent" strokeWidth={2} />
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── Step 4: Starter target (optional) ── */}
      {step === 4 && (
        <div className="space-y-4">
          <p className="text-body text-foreground-secondary">
            Clone a real personality from the library to practice with right away.
            You can always add more later.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {profiles.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setStarterId(starterId === p.id ? null : p.id)}
                className={cn(
                  "relative rounded-xl border-2 p-4 text-left transition-all duration-150",
                  starterId === p.id
                    ? "border-accent bg-accent/10"
                    : "border-border-subtle bg-surface hover:border-accent/30"
                )}
              >
                {starterId === p.id && (
                  <CheckCircle2
                    className="absolute right-3 top-3 h-4 w-4 text-accent"
                    strokeWidth={2}
                  />
                )}
                <p className="font-display text-h3 text-foreground-primary pr-6">{p.name}</p>
                {p.title && (
                  <p className="mt-0.5 text-small text-foreground-tertiary line-clamp-1">
                    {p.title}{p.company ? ` · ${p.company}` : ""}
                  </p>
                )}
              </button>
            ))}
          </div>
          <p className="text-caption text-foreground-tertiary">
            Or skip this — you can build your own target from scratch.
          </p>
        </div>
      )}

      {/* ── Step 5: Team invites (team mode only) ── */}
      {step === 5 && intent === "team" && (
        <div className="space-y-4 max-w-lg">
          <p className="text-body text-foreground-secondary">
            Invite teammates to practice or review sessions. You can do this now or later from Settings.
          </p>
          {invites.map((inv, i) => (
            <div key={i} className="flex gap-2">
              <Input
                type="email"
                placeholder="email@company.com"
                value={inv.email}
                onChange={(e) => {
                  const next = [...invites];
                  next[i] = { ...next[i], email: e.target.value };
                  setInvites(next);
                }}
              />
              <Select
                value={inv.role}
                onValueChange={(v) => {
                  const next = [...invites];
                  next[i] = { ...next[i], role: v as Role };
                  setInvites(next);
                }}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="learner">Learner</SelectItem>
                  <SelectItem value="coach">Coach</SelectItem>
                  <SelectItem value="reviewer">Reviewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ))}
          {invites.length < 5 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-accent"
              onClick={() => setInvites([...invites, { email: "", role: "learner" }])}
            >
              + Add another
            </Button>
          )}
          <p className="text-caption text-foreground-tertiary">
            All roles can practice. Coaches can assign and review. Owners manage everything.
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="rounded-lg border border-critical/30 bg-critical/10 px-4 py-3 text-small text-critical">
          {error}
        </p>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <Button
          type="button"
          variant="ghost"
          disabled={step === 1 || loading}
          onClick={() => setStep((s) => s - 1)}
          className="text-foreground-secondary"
        >
          Back
        </Button>

        <div className="flex items-center gap-3">
          {/* Allow skipping the starter target step */}
          {step === 4 && starterId === null && (
            <Button
              type="button"
              variant="ghost"
              className="text-foreground-tertiary"
              onClick={() => {
                if (step < totalSteps) setStep((s) => s + 1);
                else void complete();
              }}
            >
              Skip
            </Button>
          )}

          {step < totalSteps ? (
            <Button
              type="button"
              disabled={!canContinue}
              onClick={next}
            >
              Continue
            </Button>
          ) : (
            <Button
              type="button"
              disabled={loading}
              onClick={() => void complete()}
              className="btn-glow"
            >
              {loading ? "Setting up…" : "Go to dashboard →"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

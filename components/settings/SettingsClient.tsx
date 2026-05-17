"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  LogOut,
  Trash2,
  CreditCard,
  Plug,
  Users,
  ShieldCheck,
  Zap,
  Webhook,
} from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useTeamMembers } from "@/lib/hooks/use-api";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";

const ROLE_COLORS: Record<string, string> = {
  owner: "border-violet-500/30 bg-violet-500/10 text-violet-300",
  coach: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  learner: "border-border bg-surface-elevated text-foreground-secondary",
  reviewer: "border-amber-500/30 bg-amber-500/10 text-amber-300",
};

export function SettingsClient({
  session,
  isTeam,
  isOwner,
  canManageTeam,
}: {
  session: {
    user: { email: string; name: string | null };
    organization: { name: string; mode: string };
    membership: { role: Role };
  };
  isTeam: boolean;
  isOwner: boolean;
  canManageTeam: boolean;
}) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [removeMemberOpen, setRemoveMemberOpen] = useState(false);
  const [removeMemberTarget, setRemoveMemberTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [workspaceName, setWorkspaceName] = useState(session.organization.name);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("learner");
  const [inviting, setInviting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const [removingMember, setRemovingMember] = useState(false);

  const { data: teamData, isLoading: teamLoading } = useTeamMembers(isTeam && canManageTeam);
  const queryClient = useQueryClient();

  async function saveWorkspace() {
    const trimmed = workspaceName.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspace_name: trimmed }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Failed to save");
      toast({ title: "Workspace updated" });
      router.refresh();
    } catch (e) {
      toast({
        title: "Could not save",
        description: e instanceof Error ? e.message : "Try again",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function exportData() {
    setExporting(true);
    try {
      const res = await fetch("/api/settings/export");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Export failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rehearsal-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Export downloaded" });
    } catch (e) {
      toast({
        title: "Export failed",
        description: e instanceof Error ? e.message : "Try again",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  }

  async function sendInvite() {
    const trimmed = inviteEmail.trim();
    if (!trimmed) return;
    setInviting(true);
    try {
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, role: inviteRole }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Invite failed");
      setInviteEmail("");
      toast({
        title: "Invite queued",
        description: body.message ?? `Invite recorded for ${trimmed}`,
      });
    } catch (e) {
      toast({
        title: "Could not invite",
        description: e instanceof Error ? e.message : "Try again",
        variant: "destructive",
      });
    } finally {
      setInviting(false);
    }
  }

  async function changeRole(membershipId: string, newRole: string) {
    setUpdatingRole(membershipId);
    try {
      const res = await fetch(`/api/team/members/${membershipId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Could not update role");
      toast({ title: "Role updated" });
      void queryClient.invalidateQueries({ queryKey: ["team", "members"] });
    } catch (e) {
      toast({
        title: "Could not update role",
        description: e instanceof Error ? e.message : "Try again",
        variant: "destructive",
      });
    } finally {
      setUpdatingRole(null);
    }
  }

  async function removeMember() {
    if (!removeMemberTarget) return;
    setRemovingMember(true);
    try {
      const res = await fetch(`/api/team/members/${removeMemberTarget.id}`, {
        method: "DELETE",
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Could not remove member");
      toast({ title: `${removeMemberTarget.name} removed from workspace` });
      setRemoveMemberOpen(false);
      setRemoveMemberTarget(null);
      void queryClient.invalidateQueries({ queryKey: ["team", "members"] });
    } catch (e) {
      toast({
        title: "Could not remove member",
        description: e instanceof Error ? e.message : "Try again",
        variant: "destructive",
      });
    } finally {
      setRemovingMember(false);
    }
  }

  async function signOut() {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.push("/signin");
    router.refresh();
  }

  async function deleteWorkspace() {
    setDeleting(true);
    try {
      const res = await fetch("/api/settings", { method: "DELETE" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Delete failed");
      setDeleteOpen(false);
      toast({ title: "Workspace deleted" });
      router.push(body.redirect ?? "/onboarding");
      router.refresh();
    } catch (e) {
      toast({
        title: "Could not delete workspace",
        description: e instanceof Error ? e.message : "Try again",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  }

  const members = teamData?.members ?? [];

  return (
    <>
      <Tabs defaultValue="general" className="max-w-2xl">
        <TabsList className="flex-wrap">
          <TabsTrigger value="general">General</TabsTrigger>
          {isTeam && <TabsTrigger value="team">Team</TabsTrigger>}
          {isOwner && <TabsTrigger value="billing">Billing</TabsTrigger>}
          {isOwner && <TabsTrigger value="integrations">Integrations</TabsTrigger>}
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        {/* ── General ── */}
        <TabsContent value="general" className="mt-6 space-y-4">
          <div>
            <Label htmlFor="workspace">Workspace name</Label>
            <Input
              id="workspace"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="mt-2"
              disabled={!isOwner}
            />
          </div>
          <p className="text-small text-foreground-tertiary">
            Mode: {session.organization.mode} · Role: {session.membership.role}
          </p>
          {isOwner ? (
            <Button
              disabled={saving || !workspaceName.trim()}
              onClick={() => void saveWorkspace()}
            >
              {saving ? "Saving…" : "Save changes"}
            </Button>
          ) : (
            <p className="text-small text-foreground-secondary">
              Only workspace owners can rename the workspace.
            </p>
          )}
        </TabsContent>

        {/* ── Team ── */}
        {isTeam && (
          <TabsContent value="team" className="mt-6 space-y-6">
            {canManageTeam && (
              <div className="space-y-3">
                <Label>Invite teammate</Label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    type="email"
                    placeholder="email@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                  <Select
                    value={inviteRole}
                    onValueChange={(v) => setInviteRole(v as Role)}
                  >
                    <SelectTrigger className="w-full sm:w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="learner">Learner</SelectItem>
                      <SelectItem value="coach">Coach</SelectItem>
                      <SelectItem value="reviewer">Reviewer</SelectItem>
                      {isOwner && <SelectItem value="owner">Owner</SelectItem>}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    disabled={inviting || !inviteEmail.trim()}
                    onClick={() => void sendInvite()}
                  >
                    {inviting ? "Sending…" : "Invite"}
                  </Button>
                </div>
                <p className="text-caption text-foreground-tertiary">
                  Learners practice, Coaches review and assign, Owners manage everything.
                </p>
              </div>
            )}

            {session.membership.role === "owner" && (
              <div className="flex items-center gap-3 rounded-lg border border-border-subtle bg-surface p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15">
                  <ShieldCheck className="h-4 w-4 text-accent" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <p className="text-body font-medium text-foreground-primary">
                    Scoring rubrics
                  </p>
                  <p className="text-small text-foreground-secondary">
                    Define custom evaluation dimensions for each scenario type.
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/rubrics">Manage</Link>
                </Button>
              </div>
            )}

            {session.membership.role === "owner" && (
              <div className="flex items-center gap-3 rounded-lg border border-border-subtle bg-surface p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-elevated">
                  <Users className="h-4 w-4 text-foreground-secondary" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <p className="text-body font-medium text-foreground-primary">
                    Company documents
                  </p>
                  <p className="text-small text-foreground-secondary">
                    Shared PDFs visible to all learners during sessions.
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/company-documents">Manage</Link>
                </Button>
              </div>
            )}

            {/* Member list */}
            <div className="space-y-2">
              <Label>Members ({members.length})</Label>
              {teamLoading ? (
                <LoadingSkeleton rows={3} />
              ) : members.length === 0 ? (
                <p className="text-small text-foreground-secondary">No members yet.</p>
              ) : (
                <div className="divide-y divide-border-subtle rounded-lg border border-border">
                  {members.map((m) => {
                    const isSelf = m.user.id === session.user.email; // best effort
                    const displayName = m.user.name ?? m.user.email ?? "Member";
                    return (
                      <div
                        key={m.membership_id}
                        className="flex items-center gap-3 px-4 py-3"
                      >
                        {/* Avatar initials */}
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent font-display text-caption font-bold">
                          {displayName.slice(0, 2).toUpperCase()}
                        </div>
                        {/* Name + email */}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-body text-foreground-primary">
                            {displayName}
                          </p>
                          {m.user.name && (
                            <p className="truncate text-caption text-foreground-tertiary">
                              {m.user.email}
                            </p>
                          )}
                        </div>
                        {/* Role select (owner only) */}
                        {isOwner ? (
                          <Select
                            value={m.role}
                            onValueChange={(v) => void changeRole(m.membership_id, v)}
                            disabled={updatingRole === m.membership_id}
                          >
                            <SelectTrigger className="h-7 w-28 text-caption">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="learner">Learner</SelectItem>
                              <SelectItem value="coach">Coach</SelectItem>
                              <SelectItem value="reviewer">Reviewer</SelectItem>
                              <SelectItem value="owner">Owner</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge
                            variant="outline"
                            className={cn(
                              "font-mono text-caption capitalize",
                              ROLE_COLORS[m.role] ?? ""
                            )}
                          >
                            {m.role}
                          </Badge>
                        )}
                        {/* Remove button (owner only, not self) */}
                        {isOwner && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-foreground-tertiary hover:text-critical"
                            onClick={() => {
                              setRemoveMemberTarget({ id: m.membership_id, name: displayName });
                              setRemoveMemberOpen(true);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>
        )}

        {/* ── Billing ── */}
        {isOwner && (
          <TabsContent value="billing" className="mt-6 space-y-4">
            <div className="rounded-lg border border-accent/30 bg-accent/5 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
                  <CreditCard className="h-5 w-5 text-accent" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-display text-h3 text-foreground-primary">Pro Plan</p>
                  <p className="text-small text-foreground-tertiary">Active · Renews monthly</p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Team members", value: `${members.length} / 20` },
                  { label: "Sessions this month", value: "—" },
                  { label: "Avatar minutes used", value: "—" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-md border border-border-subtle bg-surface p-3">
                    <p className="font-mono text-caption text-foreground-tertiary">{stat.label}</p>
                    <p className="mt-1 font-display text-h3 text-foreground-primary">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <Card className="border border-border-subtle bg-surface p-5 space-y-3">
              <p className="font-display text-h3 text-foreground-primary">Available plans</p>
              {[
                { name: "Starter", price: "Free", desc: "1 user, 5 sessions/month, basic targets" },
                { name: "Pro", price: "$49/mo", desc: "20 users, unlimited sessions, custom rubrics", active: true },
                { name: "Enterprise", price: "Custom", desc: "Unlimited users, SSO, dedicated support, SLA" },
              ].map((plan) => (
                <div
                  key={plan.name}
                  className={cn(
                    "flex items-center justify-between rounded-lg border p-4",
                    plan.active
                      ? "border-accent/40 bg-accent/5"
                      : "border-border-subtle bg-surface"
                  )}
                >
                  <div>
                    <p className="font-display text-body text-foreground-primary">
                      {plan.name}
                      {plan.active && (
                        <span className="ml-2 font-mono text-caption text-accent">current</span>
                      )}
                    </p>
                    <p className="text-small text-foreground-tertiary">{plan.desc}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-h3 text-foreground-primary">{plan.price}</p>
                    {!plan.active && (
                      <Button variant="outline" size="sm" className="mt-2" disabled>
                        Upgrade
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              <p className="text-caption text-foreground-tertiary">
                Billing management coming soon. Contact support to change your plan.
              </p>
            </Card>
          </TabsContent>
        )}

        {/* ── Integrations ── */}
        {isOwner && (
          <TabsContent value="integrations" className="mt-6 space-y-4">
            <p className="text-body text-foreground-secondary">
              Connect Rehearsal to your existing tools.
            </p>
            {[
              {
                name: "Slack",
                desc: "Post session completions and scores to a Slack channel.",
                icon: Zap,
                available: false,
              },
              {
                name: "Webhook",
                desc: "Send session events (completed, scored) to any HTTP endpoint.",
                icon: Webhook,
                available: false,
              },
              {
                name: "Zapier",
                desc: "Trigger automations from Rehearsal events via Zapier.",
                icon: Plug,
                available: false,
              },
            ].map((integration) => (
              <div
                key={integration.name}
                className="flex items-center gap-4 rounded-lg border border-border-subtle bg-surface p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-elevated">
                  <integration.icon className="h-5 w-5 text-foreground-secondary" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <p className="font-display text-body text-foreground-primary">
                    {integration.name}
                  </p>
                  <p className="text-small text-foreground-tertiary">{integration.desc}</p>
                </div>
                <Button variant="outline" size="sm" disabled>
                  {integration.available ? "Connect" : "Coming soon"}
                </Button>
              </div>
            ))}
          </TabsContent>
        )}

        {/* ── Data ── */}
        <TabsContent value="data" className="mt-6 space-y-4">
          <p className="text-body text-foreground-secondary">
            Download a JSON export of your workspace data.
          </p>
          <Button
            variant="outline"
            disabled={!isOwner || exporting}
            onClick={() => void exportData()}
          >
            {exporting ? "Exporting…" : "Export all data"}
          </Button>
          {!isOwner && (
            <p className="text-small text-foreground-tertiary">
              Export is available to workspace owners only.
            </p>
          )}
          <div className="rounded-lg border border-critical/40 p-4">
            <p className="font-display text-h3 text-critical">Danger zone</p>
            <p className="mt-2 text-small text-foreground-secondary">
              Permanently delete this workspace and all associated data.
            </p>
            <Button
              variant="outline"
              className="mt-4 border-critical text-critical hover:bg-critical/10"
              disabled={!isOwner}
              onClick={() => setDeleteOpen(true)}
            >
              Delete workspace
            </Button>
            {!isOwner && (
              <p className="mt-2 text-small text-foreground-tertiary">
                Only owners can delete a workspace.
              </p>
            )}
          </div>
        </TabsContent>

        {/* ── Account ── */}
        <TabsContent value="account" className="mt-6 space-y-4">
          <div>
            <Label>Email</Label>
            <p className="mt-1 text-body">{session.user.email}</p>
          </div>
          <div>
            <Label>Name</Label>
            <p className="mt-1 text-body">{session.user.name ?? "—"}</p>
          </div>
          <Button variant="outline" onClick={() => void signOut()}>
            <LogOut className="mr-2 h-4 w-4" strokeWidth={1.5} />
            Sign out
          </Button>
        </TabsContent>
      </Tabs>

      {/* Remove member dialog */}
      <ConfirmDialog
        open={removeMemberOpen}
        onOpenChange={(open) => {
          setRemoveMemberOpen(open);
          if (!open) setRemoveMemberTarget(null);
        }}
        title={`Remove ${removeMemberTarget?.name ?? "member"}?`}
        description="They will lose access to this workspace immediately. Their session history will be preserved."
        confirmLabel={removingMember ? "Removing…" : "Remove member"}
        destructive
        loading={removingMember}
        onConfirm={() => void removeMember()}
      />

      {/* Delete workspace dialog */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setDeleteConfirm("");
        }}
        title="Delete workspace?"
        description="All targets, sessions, and reports will be permanently removed."
        confirmLabel={deleting ? "Deleting…" : "Delete workspace"}
        destructive
        loading={deleting}
        confirmDisabled={deleteConfirm !== session.organization.name}
        onConfirm={() => void deleteWorkspace()}
      >
        <div className="py-2">
          <Label htmlFor="delete-confirm">
            Type <strong>{session.organization.name}</strong> to confirm
          </Label>
          <Input
            id="delete-confirm"
            className="mt-2"
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder={session.organization.name}
          />
        </div>
      </ConfirmDialog>
    </>
  );
}

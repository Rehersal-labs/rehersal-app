"use client";

import { useState } from "react";
import { Plus, Check, Circle, Trash2, Pencil, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface PlanItem {
  goal: string;
  actions: string[];
  target_date?: string;
  status: "pending" | "done";
}

function ActionItem({
  text,
  onChange,
  onRemove,
}: {
  text: string;
  onChange: (v: string) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Circle className="h-3 w-3 shrink-0 text-foreground-tertiary" strokeWidth={1.5} />
      <Input
        value={text}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Action step…"
        className="h-7 flex-1 text-small border-0 bg-transparent px-0 focus-visible:ring-0"
      />
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 text-foreground-tertiary hover:text-critical"
        onClick={onRemove}
      >
        <X className="h-3 w-3" strokeWidth={1.5} />
      </Button>
    </div>
  );
}

function PlanItemCard({
  item,
  editable,
  onChange,
  onRemove,
}: {
  item: PlanItem;
  editable: boolean;
  onChange: (updated: PlanItem) => void;
  onRemove: () => void;
}) {
  const [editing, setEditing] = useState(false);

  if (!editable || !editing) {
    return (
      <div
        className={cn(
          "rounded-lg border p-4 space-y-2 transition-colors",
          item.status === "done"
            ? "border-success/20 bg-success/5"
            : "border-border-subtle bg-surface"
        )}
      >
        <div className="flex items-start gap-3">
          <button
            onClick={() =>
              editable
                ? onChange({ ...item, status: item.status === "done" ? "pending" : "done" })
                : undefined
            }
            className={cn(
              "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
              item.status === "done"
                ? "border-success bg-success/20 text-success"
                : "border-border text-transparent hover:border-accent"
            )}
          >
            {item.status === "done" && <Check className="h-2.5 w-2.5" strokeWidth={2.5} />}
          </button>
          <div className="flex-1 min-w-0">
            <p
              className={cn(
                "font-display text-body font-medium",
                item.status === "done"
                  ? "text-foreground-tertiary line-through"
                  : "text-foreground-primary"
              )}
            >
              {item.goal}
            </p>
            {item.target_date && (
              <p className="mt-0.5 font-mono text-caption text-foreground-tertiary">
                Target: {item.target_date}
              </p>
            )}
            {item.actions.length > 0 && (
              <ul className="mt-2 space-y-1">
                {item.actions.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-small text-foreground-secondary">
                    <Circle className="mt-1 h-2.5 w-2.5 shrink-0 text-foreground-tertiary" strokeWidth={1.5} />
                    {a}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {editable && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-foreground-tertiary"
                onClick={() => setEditing(true)}
              >
                <Pencil className="h-3 w-3" strokeWidth={1.5} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-foreground-tertiary hover:text-critical"
                onClick={onRemove}
              >
                <Trash2 className="h-3 w-3" strokeWidth={1.5} />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-accent/30 bg-surface p-4 space-y-3">
      <Input
        placeholder="Goal (e.g. Improve objection handling)"
        value={item.goal}
        onChange={(e) => onChange({ ...item, goal: e.target.value })}
        className="font-display text-body"
      />
      <Input
        type="date"
        value={item.target_date ?? ""}
        onChange={(e) => onChange({ ...item, target_date: e.target.value || undefined })}
        className="h-8 text-small"
      />
      <div className="space-y-1.5">
        <p className="text-caption text-foreground-tertiary">Action steps</p>
        {item.actions.map((a, i) => (
          <ActionItem
            key={i}
            text={a}
            onChange={(v) => {
              const next = [...item.actions];
              next[i] = v;
              onChange({ ...item, actions: next });
            }}
            onRemove={() =>
              onChange({ ...item, actions: item.actions.filter((_, j) => j !== i) })
            }
          />
        ))}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-caption text-accent px-0"
          onClick={() => onChange({ ...item, actions: [...item.actions, ""] })}
        >
          <Plus className="mr-1 h-3 w-3" strokeWidth={1.5} /> Add step
        </Button>
      </div>
      <Button size="sm" className="h-7" onClick={() => setEditing(false)}>
        <Save className="mr-1 h-3 w-3" strokeWidth={1.5} /> Done
      </Button>
    </div>
  );
}

export function ImprovementPlan({
  reportId,
  initialPlan,
  isCoach,
}: {
  reportId: string;
  initialPlan: PlanItem[];
  isCoach: boolean;
}) {
  const [plan, setPlan] = useState<PlanItem[]>(initialPlan);
  const [saving, setSaving] = useState(false);

  function addItem() {
    setPlan((prev) => [
      ...prev,
      { goal: "", actions: [], status: "pending" },
    ]);
  }

  function updateItem(index: number, updated: PlanItem) {
    setPlan((prev) => prev.map((x, i) => (i === index ? updated : x)));
  }

  function removeItem(index: number) {
    setPlan((prev) => prev.filter((_, i) => i !== index));
  }

  async function savePlan() {
    setSaving(true);
    try {
      const res = await fetch(`/api/reports/${reportId}/improvement-plan`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      if (!res.ok) throw new Error("Save failed");
      toast({ title: "Improvement plan saved" });
    } catch {
      toast({ title: "Could not save plan", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  if (plan.length === 0 && !isCoach) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <p className="font-mono text-caption uppercase text-foreground-tertiary tracking-widest">
          Improvement plan
        </p>
        {isCoach && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-caption text-accent"
              onClick={addItem}
            >
              <Plus className="mr-1 h-3 w-3" strokeWidth={1.5} /> Add goal
            </Button>
            <Button
              size="sm"
              className="h-7"
              onClick={() => void savePlan()}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save plan"}
            </Button>
          </div>
        )}
      </div>

      {plan.length === 0 ? (
        <p className="text-small text-foreground-tertiary">
          No improvement plan set yet. Add goals to guide the learner.
        </p>
      ) : (
        <div className="space-y-3">
          {plan.map((item, i) => (
            <PlanItemCard
              key={i}
              item={item}
              editable={isCoach}
              onChange={(updated) => updateItem(i, updated)}
              onRemove={() => removeItem(i)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

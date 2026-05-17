"use client";

import { useState } from "react";
import { Plus, Trash2, Star, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { CONVERSATION_TYPES } from "@/lib/constants";

interface Dimension {
  name: string;
  description: string;
  weight: number;
}

interface RubricTemplate {
  id: string;
  name: string;
  conversation_type: string | null;
  dimensions: Dimension[];
  is_default: boolean;
  created_at: string;
}

function DimensionRow({
  dim,
  index,
  total,
  onChange,
  onRemove,
}: {
  dim: Dimension;
  index: number;
  total: number;
  onChange: (d: Dimension) => void;
  onRemove: () => void;
}) {
  return (
    <div className="grid gap-2 rounded-lg border border-border-subtle bg-surface-elevated p-3">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Dimension name (e.g. Clarity)"
          value={dim.name}
          onChange={(e) => onChange({ ...dim, name: e.target.value })}
          className="flex-1 h-8 text-small"
        />
        <div className="flex items-center gap-1">
          <Input
            type="number"
            min={1}
            max={100}
            value={dim.weight}
            onChange={(e) => onChange({ ...dim, weight: Number(e.target.value) })}
            className="w-16 h-8 text-small text-center"
          />
          <span className="text-caption text-foreground-tertiary">%</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-foreground-tertiary hover:text-critical"
          onClick={onRemove}
          disabled={total <= 1}
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
        </Button>
      </div>
      <Input
        placeholder="Description (e.g. How clearly the user articulated their point)"
        value={dim.description}
        onChange={(e) => onChange({ ...dim, description: e.target.value })}
        className="h-8 text-small text-foreground-secondary"
      />
    </div>
  );
}

function RubricCard({
  rubric,
  onDeleted,
}: {
  rubric: RubricTemplate;
  onDeleted: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const typeLabel =
    CONVERSATION_TYPES.find((c) => c.id === rubric.conversation_type)?.label ??
    (rubric.conversation_type ? rubric.conversation_type : "All types");

  async function del() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/rubrics/${rubric.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      onDeleted(rubric.id);
      toast({ title: "Rubric deleted" });
    } catch {
      toast({ title: "Could not delete rubric", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Card className="border border-border-subtle bg-surface p-4 shadow-card">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-display text-h3 text-foreground-primary">{rubric.name}</p>
            {rubric.is_default && (
              <Badge variant="outline" className="border-accent/30 bg-accent/10 text-accent font-mono text-caption">
                <Star className="mr-1 h-2.5 w-2.5" />default
              </Badge>
            )}
          </div>
          <p className="mt-0.5 text-small text-foreground-tertiary">
            {typeLabel} · {rubric.dimensions.length} dimensions
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-foreground-tertiary"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? (
              <ChevronUp className="h-3.5 w-3.5" strokeWidth={1.5} />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" strokeWidth={1.5} />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-foreground-tertiary hover:text-critical"
            onClick={() => void del()}
            disabled={deleting}
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 space-y-2 border-t border-border-subtle pt-4">
          {rubric.dimensions.map((d, i) => (
            <div key={i} className="flex items-center justify-between gap-2 text-small">
              <div>
                <span className="font-medium text-foreground-primary">{d.name}</span>
                {d.description && (
                  <span className="ml-2 text-foreground-tertiary">{d.description}</span>
                )}
              </div>
              <span className="shrink-0 font-mono text-caption text-accent">{d.weight}%</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export function RubricBuilder({ initialRubrics }: { initialRubrics: RubricTemplate[] }) {
  const [rubrics, setRubrics] = useState<RubricTemplate[]>(initialRubrics);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [conversationType, setConversationType] = useState<string>("__all__");
  const [isDefault, setIsDefault] = useState(false);
  const [dimensions, setDimensions] = useState<Dimension[]>([
    { name: "", description: "", weight: 50 },
    { name: "", description: "", weight: 50 },
  ]);
  const [saving, setSaving] = useState(false);

  const totalWeight = dimensions.reduce((s, d) => s + d.weight, 0);

  function addDimension() {
    setDimensions((prev) => [...prev, { name: "", description: "", weight: 0 }]);
  }

  function updateDimension(index: number, d: Dimension) {
    setDimensions((prev) => prev.map((x, i) => (i === index ? d : x)));
  }

  function removeDimension(index: number) {
    setDimensions((prev) => prev.filter((_, i) => i !== index));
  }

  function resetForm() {
    setName("");
    setConversationType("__all__");
    setIsDefault(false);
    setDimensions([
      { name: "", description: "", weight: 50 },
      { name: "", description: "", weight: 50 },
    ]);
    setShowForm(false);
  }

  async function save() {
    if (!name.trim()) {
      toast({ title: "Rubric name is required", variant: "destructive" });
      return;
    }
    if (totalWeight !== 100) {
      toast({ title: `Weights must sum to 100 (currently ${totalWeight})`, variant: "destructive" });
      return;
    }
    const invalid = dimensions.filter((d) => !d.name.trim());
    if (invalid.length > 0) {
      toast({ title: "All dimensions need a name", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/rubrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          conversation_type: conversationType === "__all__" ? null : conversationType,
          dimensions,
          is_default: isDefault,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Save failed");
      setRubrics((prev) => [...prev, body.rubric]);
      toast({ title: "Rubric saved" });
      resetForm();
    } catch (e) {
      toast({
        title: "Could not save rubric",
        description: e instanceof Error ? e.message : "Try again",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {rubrics.length === 0 && !showForm && (
        <div className="rounded-lg border border-dashed border-border py-10 text-center">
          <p className="text-foreground-secondary">No rubrics yet.</p>
          <p className="mt-1 text-small text-foreground-tertiary">
            Create one to customize how sessions are scored.
          </p>
        </div>
      )}

      {rubrics.map((r) => (
        <RubricCard
          key={r.id}
          rubric={r}
          onDeleted={(id) => setRubrics((prev) => prev.filter((x) => x.id !== id))}
        />
      ))}

      {showForm && (
        <Card className="border border-accent/30 bg-surface p-5 space-y-4 shadow-card">
          <p className="font-display text-h3 text-foreground-primary">New rubric</p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Rubric name</Label>
              <Input
                placeholder="e.g. Sales Discovery v2"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Applies to</Label>
              <Select value={conversationType} onValueChange={setConversationType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All conversation types</SelectItem>
                  {CONVERSATION_TYPES.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>
                Dimensions
                <span className={cn(
                  "ml-2 font-mono text-caption",
                  totalWeight === 100 ? "text-success" : "text-critical"
                )}>
                  {totalWeight}/100
                </span>
              </Label>
              <Button variant="ghost" size="sm" className="h-7 text-caption text-accent" onClick={addDimension}>
                <Plus className="mr-1 h-3 w-3" strokeWidth={1.5} /> Add dimension
              </Button>
            </div>
            {dimensions.map((d, i) => (
              <DimensionRow
                key={i}
                dim={d}
                index={i}
                total={dimensions.length}
                onChange={(nd) => updateDimension(i, nd)}
                onRemove={() => removeDimension(i)}
              />
            ))}
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border accent-accent"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
            />
            <span className="text-small text-foreground-secondary">
              Set as default for this conversation type
            </span>
          </label>

          <div className="flex gap-2 pt-1">
            <Button onClick={() => void save()} disabled={saving}>
              {saving ? "Saving…" : "Save rubric"}
            </Button>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {!showForm && (
        <Button variant="outline" onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" strokeWidth={1.5} /> New rubric
        </Button>
      )}
    </div>
  );
}

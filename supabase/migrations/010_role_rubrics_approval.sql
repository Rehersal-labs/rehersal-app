-- Migration 010: Role management, custom rubric templates, coach approval workflow, improvement plans

-- Custom rubric templates (admin/owner defines scoring dimensions per conversation type)
CREATE TABLE IF NOT EXISTS rubric_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  conversation_type TEXT,  -- NULL = applies to all types; matches conversation_type enum values
  dimensions JSONB NOT NULL DEFAULT '[]',  -- [{name, description, weight (0-100)}]
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Coach approval fields on sessions
ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS coach_approved BOOLEAN,
  ADD COLUMN IF NOT EXISTS coach_reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS coach_reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Structured improvement plan on feedback_reports
-- [{goal, actions: string[], target_date, status: 'pending'|'done'}]
ALTER TABLE feedback_reports
  ADD COLUMN IF NOT EXISTS improvement_plan JSONB;

-- RLS for rubric_templates
ALTER TABLE rubric_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view rubric templates"
  ON rubric_templates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE org_id = rubric_templates.org_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Owners and coaches can manage rubric templates"
  ON rubric_templates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE org_id = rubric_templates.org_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'coach')
    )
  );

-- Index for rubric template lookup
CREATE INDEX IF NOT EXISTS rubric_templates_org_id_idx ON rubric_templates(org_id);
CREATE INDEX IF NOT EXISTS rubric_templates_conversation_type_idx ON rubric_templates(conversation_type);

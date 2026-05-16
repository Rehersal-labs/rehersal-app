-- Repair migration: run if verify-supabase reports missing columns or RPC

-- Library table columns (safe if already exist)
ALTER TABLE public_figure_library
  ADD COLUMN IF NOT EXISTS avatar_brief_template TEXT;

ALTER TABLE public_figure_library
  ADD COLUMN IF NOT EXISTS profile_json JSONB;

ALTER TABLE public_figure_library
  ADD COLUMN IF NOT EXISTS source_urls TEXT[] DEFAULT '{}';

UPDATE public_figure_library
SET avatar_brief_template = 'Library profile'
WHERE avatar_brief_template IS NULL;

-- pgvector + semantic search (from 003 — idempotent)
CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE document_chunks
  ADD COLUMN IF NOT EXISTS embedding vector(1536);

CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx ON document_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE OR REPLACE FUNCTION match_document_chunks(
  query_embedding vector(1536),
  match_count INT DEFAULT 5,
  filter_org_id UUID DEFAULT NULL,
  filter_user_id UUID DEFAULT NULL,
  include_company BOOLEAN DEFAULT false
)
RETURNS TABLE (
  id UUID,
  user_document_id UUID,
  chunk_text TEXT,
  chunk_index INT,
  similarity FLOAT
)
LANGUAGE sql STABLE
AS $$
  SELECT
    dc.id,
    dc.user_document_id,
    dc.chunk_text,
    dc.chunk_index,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM document_chunks dc
  JOIN user_documents ud ON ud.id = dc.user_document_id
  WHERE dc.embedding IS NOT NULL
    AND (filter_org_id IS NULL OR ud.org_id = filter_org_id)
    AND (
      ud.user_id = filter_user_id
      OR (include_company AND ud.is_company_shared = true)
    )
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
$$;

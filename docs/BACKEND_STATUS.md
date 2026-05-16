# Rehearsal — Backend Status

**Updated:** 2026-05-16  
**State:** All backend code complete. Remaining = configure env + verify pipelines.

---

## ✅ Implemented — All Done

### Database (`supabase/migrations/`)

| Migration | Contents | Status |
|-----------|----------|--------|
| 001 | Core schema (19 tables) | ✅ |
| 002 | RLS policies | ✅ |
| 003 | pgvector extension + ivfflat index | ✅ |
| 004 | Query indexes | ✅ |
| 005 | audit_logs table + column fixes | ✅ |
| 006 | Library repair + `match_document_chunks` RPC | ✅ |
| 007 | public_figure_library fixes | ✅ |
| 008 | Storage buckets `documents` + `reports` | ✅ |

**To apply:** Paste `supabase/RUN_PENDING.sql` into Supabase SQL Editor.

---

### API Routes (`app/api/`) — 35+ handlers

| Domain | Routes | Status |
|--------|--------|--------|
| Auth | `/callback`, `/api/auth/callback`, `/api/me` | ✅ |
| Onboarding | `POST /api/onboarding` | ✅ |
| Targets | CRUD + sources + reconstruct + preview | ✅ |
| Documents | list + upload (multipart) + delete + embed | ✅ |
| Company docs | list + create + delete (owner only) | ✅ |
| Scenarios | CRUD | ✅ |
| Sessions | create (+ BP call) + get + end + sync + evaluate | ✅ |
| Reports | get + PDF + rate-accuracy | ✅ |
| Library | browse + get + clone | ✅ |
| Admin | sessions list + team report | ✅ |
| Team | members list + invite | ✅ |
| Assignments | list + create | ✅ |
| Coach comments | create | ✅ |
| Settings | export | ✅ |
| Webhooks | beyond-presence | ✅ |
| Health | GET `/api/health` (incl. `openai_configured` flag) | ✅ |

**Note on document upload:** `DocumentUploader.tsx` uploads files to Supabase Storage, then registers via `POST /api/documents` (JSON with `file_url`). Multipart `POST /api/documents/upload` also exists for direct server uploads.

---

### Lib Pipelines (`lib/`)

| Module | Purpose | Status |
|--------|---------|--------|
| `openai.ts` | gpt-4o + embeddings + safety validation | ✅ |
| `beyondPresence.ts` | createCall, messages, updateAgent, endCall | ✅ |
| `scraper/` | native (Cheerio), Jina, YouTube, orchestrator | ✅ |
| `fileParser.ts` | PDF, DOCX, TXT text extraction | ✅ |
| `reconstruction.ts` | Target personality build from sources | ✅ |
| `embeddings.ts` | Chunk + embed documents → pgvector | ✅ |
| `contextRetriever.ts` | pgvector RPC top-K semantic search | ✅ |
| `avatarBriefBuilder.ts` | Compose BP system prompt | ✅ |
| `evaluator.ts` | Post-session AI evaluation | ✅ |
| `reportBuilder.ts` | Evaluation → full feedback report JSON | ✅ |
| `pdfExporter.tsx` | Report → PDF → Supabase Storage `reports` bucket | ✅ |
| `sessionTurns.ts` | BP transcript sync to session_turns table | ✅ |
| `prompts.ts` | All prompt templates (10 avatar types + reconstruction + evaluator) | ✅ |
| `schemas.ts` | Zod validation + AI safety scan | ✅ |
| `rateLimit.ts` | In-memory rate limiting for AI routes | ✅ |
| `auth.ts` | getSession, requireSession, provisionNewUser | ✅ |
| `api/auth.ts` | requireAuth, requireOwner, requireCoach | ✅ |
| `api/http.ts` | jsonOk, jsonError helpers | ✅ |
| `api/org.ts` | Org ownership checks | ✅ |

---

### Scripts

| Command | Purpose | Status |
|---------|---------|--------|
| `npm run setup:check` | Env var validation | ✅ |
| `npm run verify:supabase` | Tables + RPC check | ✅ |
| `npm run backend:ready` | Full readiness (no OpenAI) | ✅ |
| `npm run seed:library` | Insert 15 library profiles | ✅ |
| `npm run seed:demo` | Demo org + sample data | ✅ |
| `npm run test:bp` | Beyond Presence spike | ✅ |
| `npm run test:openai` | OpenAI smoke test | ✅ |
| `npm run smoke:health` | GET /api/health | ✅ |
| `npm run storage:setup` | Ensure Supabase Storage buckets | ✅ |

---

## ❌ Remaining (Backend)

### P0 — Environment Setup (Do First)

| # | Task | How |
|---|------|-----|
| 1 | Apply pending SQL migrations | Supabase SQL Editor → paste `supabase/RUN_PENDING.sql` |
| 2 | Verify readiness | `npm run backend:ready` |
| 3 | Add `OPENAI_API_KEY` | `.env.local` |
| 4 | OpenAI smoke test | `npm run test:openai` |
| 5 | Add `BEY_API_KEY` + `BEY_AGENT_ID` | `.env.local` |
| 6 | BP smoke test | `npm run test:bp` |
| 7 | Configure Google OAuth | Supabase Dashboard → Auth → Providers |

---

### P1 — Code Fixes — ✅ Complete (2026-05-16)

T1, T2, N1, N2, N3 applied. Build passes. See `fix.md` for history.

---

### P1 — Pipeline Verification (With Real Keys)

| # | Task | Command / How |
|---|------|---------------|
| 1 | Upload + embed doc | `POST /api/documents/upload` (multipart) → check `embedding_status = complete` |
| 2 | Reconstruct target | `POST /api/targets/:id/reconstruct` → check `status = complete`, `personality_json` populated |
| 3 | Full session loop | Create session → join → end → evaluate → `GET /api/reports/:id` |
| 4 | PDF export | `POST /api/reports/:id/pdf` → check `pdf_url` returned |

---

### P2 — Hardening (Pre-Production)

| # | Task | Notes |
|---|------|-------|
| 1 | RLS two-user test | Two users in separate orgs — confirm no cross-read |
| 2 | Verify rate limiting | Check `lib/rateLimit.ts` is called on reconstruct, evaluate, embed |
| 3 | Audit all API routes for Zod body validation | Every POST/PATCH must validate request body |
| 4 | `BEY_WEBHOOK_SECRET` | Verify webhook signature in production |
| 5 | Team invites | Currently audit-log only. Wire `RESEND_API_KEY` for actual invite emails |
| 6 | Safety audit | Run evaluator output through `validateAISafety()` — check no forbidden phrases |

---

## Quick Test: Document Upload

```bash
# With dev server running and valid session cookie:
curl -X POST http://localhost:3000/api/documents/upload \
  -H "Cookie: <your-supabase-session-cookie>" \
  -F "file=@./resume.pdf" \
  -F "doc_type=my_background"
```

Expected: `{ document: { id, filename, embedding_status: "pending" } }` — embedding runs async.

---

## Definition of Done (Backend)

- [ ] `npm run setup:check` — all required vars green
- [ ] `npm run verify:supabase` — all checks pass
- [ ] `npm run seed:library` — 15 rows in `public_figure_library`
- [ ] `npm run test:bp` — returns join URL
- [ ] `npm run test:openai` — returns embedding vector
- [ ] Full E2E loop: upload doc → create target → reconstruct → session → report
- [ ] `npm run build` passes (currently passing)
- [ ] Code fixes T1, T2, N1, N2, N3 applied

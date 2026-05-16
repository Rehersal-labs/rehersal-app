# Rehearsal — Backend Status & Remaining Work

For **Member 1 (Platform)**. Frontend is a separate track.

**Folders you own:** `app/api/`, `lib/` (except coordinate on `lib/prompts.ts`), `supabase/`, `scripts/`

---

## Already implemented

### Database (`supabase/migrations/`)

| Migration | Contents |
|-----------|----------|
| 001 | Core schema (19 tables) |
| 002 | RLS policies |
| 003 | pgvector extension |
| 004 | Query indexes |
| 005 | audit_logs + column fixes |
| 006 | Library repair + `match_document_chunks` RPC |
| 007 | public_figure_library fixes |
| 008 | Storage buckets `documents`, `reports` |

### API routes (`app/api/`)

All routes from [API_SPEC_FULL.md](./API_SPEC_FULL.md):

- Auth: `/api/auth/callback`, `/callback`
- Me: `/api/me`
- Onboarding: `/api/onboarding`
- Targets: CRUD + sources + reconstruct + preview
- Documents: list, create (JSON), **upload (multipart)**, delete, embed
- Company documents: list, create, delete (owner)
- Scenarios: CRUD
- Sessions: list, create (+ BP call), get, end, sync-messages, evaluate
- Reports: get, pdf, rate-accuracy
- Library: browse, get, clone
- Admin: sessions, team-report
- Assignments, coach-comments
- Webhooks: beyond-presence
- Health: `/api/health`

### Lib pipelines (`lib/`)

| Module | Purpose |
|--------|---------|
| `openai.ts` | gpt-4o + embeddings + safety scan |
| `beyondPresence.ts` | createCall, messages, updateAgent |
| `scraper/*` | native, jina, youtube, orchestrator |
| `fileParser.ts` | pdf, docx, txt |
| `reconstruction.ts` | target personality build |
| `embeddings.ts` | chunk + embed documents |
| `contextRetriever.ts` | pgvector RPC top-K |
| `avatarBriefBuilder.ts` | session system prompt |
| `evaluator.ts` + `reportBuilder.ts` | post-session AI |
| `pdfExporter.tsx` | PDF → Storage `reports` bucket |
| `sessionTurns.ts` | BP transcript sync |
| `auth.ts` + `lib/api/*` | requireAuth, org checks, http helpers |
| `rateLimit.ts` | AI endpoint limits |

### Scripts

| Command | Purpose |
|---------|---------|
| `npm run setup:check` | Env validation |
| `npm run verify:supabase` | Tables + RPC check |
| `npm run seed:library` | 15 library profiles |
| `npm run seed:demo` | Demo org + sample data |
| `npm run test:bp` | Beyond Presence spike |
| `npm run smoke:health` | GET /api/health |
| `npm run storage:setup` | Ensure buckets (script) |

---

## Remaining (backend)

### P0 — You must do (env + Supabase)

| # | Task | How |
|---|------|-----|
| 1 | Add `OPENAI_API_KEY` | `.env.local` — blocks reconstruction, embed, evaluate |
| 2 | Run pending SQL | Supabase SQL Editor → `supabase/RUN_PENDING.sql` or migrations 006–008 |
| 3 | Verify DB | `npm run verify:supabase` |
| 4 | Seed library | `npm run seed:library` |

### P1 — Verify pipelines (manual / scripts)

| # | Task | Command |
|---|------|---------|
| 5 | BP call works | `npm run test:bp` |
| 6 | Upload + embed doc | `POST /api/documents/upload` with multipart |
| 7 | Reconstruct target | `POST /api/targets/:id/reconstruct` |
| 8 | Full session loop | create session → end → evaluate → GET report |
| 9 | PDF export | `POST /api/reports/:id/pdf` |

### P2 — Hardening (optional MVP+)

| # | Task | Notes |
|---|------|-------|
| 10 | RLS two-user test | Two Supabase users, confirm no cross-org reads |
| 11 | `BEY_WEBHOOK_SECRET` | Production webhook signature |
| 12 | Team invites | Currently audit_log only; needs Resend + invite API |
| 13 | Settings export/delete API | Not in MVP API spec; add if product needs it |
| 14 | Async job queue | Reconstruct/evaluate use `void fn()` — OK for MVP; consider Inngest later |

### Not backend (other tracks)

| Item | Owner |
|------|--------|
| Sign-in UI | Frontend |
| All `app/(app)/` pages | Frontend |
| `components/` | Frontend |
| `lib/prompts.ts` content tuning | AI/content (coordinate merges) |

---

## Quick test: document upload

```bash
# With dev server running and a valid session cookie:
curl -X POST http://localhost:3000/api/documents/upload \
  -H "Cookie: <your-supabase-session-cookie>" \
  -F "file=@./resume.pdf" \
  -F "doc_type=my_background"
```

---

## Definition of done (backend)

- [ ] `npm run setup:check` — all required env green
- [ ] `npm run verify:supabase` — all checks pass
- [ ] `npm run seed:library` — 15 rows in `public_figure_library`
- [ ] `npm run test:bp` — returns join URL
- [ ] One full flow: upload doc → create target → reconstruct → session → report
- [ ] `npm run build` passes

Update this file when you complete a P0/P1 item.

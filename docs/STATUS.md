# Rehearsal — Project Status

**Last updated:** 2026-05-16  
**Branch:** `main`  
**Build:** `npm run build` passing (40 routes)  
**LLM:** Gemini (`LLM_PROVIDER=gemini`, `npm run test:llm` OK)

---

## What's Complete

### Infrastructure
- [x] Database migrations 001–008 (schema, RLS, pgvector, indexes, audit logs, library, storage buckets)
- [x] TypeScript types (`types/index.ts`) + Zod schemas (`lib/schemas.ts`)
- [x] All API routes — 35+ handlers (targets, documents, scenarios, sessions, reports, library, admin, assignments, webhooks)
- [x] AI pipelines — reconstruction, embeddings, evaluator, report builder (`lib/reconstruction.ts`, `lib/evaluator.ts`, `lib/reportBuilder.ts`)
- [x] Beyond Presence integration (`lib/beyondPresence.ts`) — test with `npm run test:bp`
- [x] LLM layer — Gemini or OpenAI (`lib/llm.ts`, `npm run test:llm`)
- [x] Supabase clients consolidated (`lib/db.ts`, `lib/supabase-browser.ts`, `lib/supabase-env.ts`)
- [x] Auth helpers consolidated (`lib/auth.ts`, `lib/auth-utils.ts`, `AuthSession` in `types/index.ts`)

### Frontend
- [x] App shell + role-aware sidebar (solo vs team mode)
- [x] Sign-in UI — Google OAuth + magic link (`components/auth/SignInForm.tsx`)
- [x] Auth callbacks — `/callback` and `/api/auth/callback`
- [x] 5-step onboarding flow
- [x] All 18 product pages (dashboard, targets, documents, scenarios, sessions, reports, progress, library, assignments, admin, settings)
- [x] All 42+ components across targets, documents, scenarios, sessions, reports, progress, library, admin, shared
- [x] 15 library JSON profiles in `public/library/`

### Content
- [x] All 10 avatar system prompt templates (`lib/prompts.ts`)
- [x] Reconstruction, evaluator, report builder prompts

---

## Needs Verification / Active Config Required

### Auth Configuration
- [x] Google OAuth configured and working (Supabase + Google Cloud)
- [x] Magic link (email provider) — works with default Supabase email

### Database
- [ ] Run `supabase/RUN_PENDING.sql` on hosted Supabase instance
- [ ] Run `npm run seed:library` after migrations (inserts 15 library profiles)
- [ ] Run `npm run verify:supabase` to confirm all tables + RPC are ready

### AI Pipelines
- [x] LLM smoke test — `npm run test:llm` (Gemini embeddings + reconstruction JSON)
- [ ] E2E reconstruction: `POST /api/targets/:id/reconstruct` via UI
- [ ] E2E document embed: Storage upload + `POST /api/documents` (JSON) → `embedding_status = complete`
- [ ] Full session loop: create → end → evaluate → GET /reports/:id

### Live Avatar Sessions
- [ ] Add `BEY_API_KEY` + `BEY_AGENT_ID` → test with `npm run test:bp`
- [ ] Verify session creates join_url and iframe loads

### Production Deploy
- [ ] Vercel: add all env vars from `.env.local.example`
- [ ] Set `NEXT_PUBLIC_APP_URL` to production domain

---

## Code Fixes (Wave 6) — Done

| Fix | Status |
|-----|--------|
| T1 — PersonalityJSON schema (partial record keys) | ✅ |
| T2 — Embedding chunk size 2048/200 chars | ✅ |
| N1 — Supabase clients → `lib/db.ts` + `lib/supabase-browser.ts` | ✅ |
| N2 — Auth → `lib/auth.ts` + `lib/auth-utils.ts` | ✅ |
| N3 — Document upload: Storage + `POST /api/documents` (JSON) — intentional | ✅ |

Remaining low-priority: S1 (`organizations.plan`), S6 (duplicate callback routes). See [fix.md](../fix.md).

---

## Not Started

### Phase L — Polish
- Mobile responsiveness audit (375px viewport)
- Loading skeletons on all data-fetch pages
- Error states with retry buttons  
- Empty states with CTAs
- Verify rate limiting wired on AI routes (`lib/rateLimit.ts`)
- Audit all API routes for Zod request validation

### Phase M — Safety + Final QA
- Safety audit: evaluator output must not contain forbidden phrases
- Safety audit: avatar prompts must not ask forbidden questions
- RLS two-user test (two separate orgs, confirm no cross-read)
- Confirm no API keys in browser bundle (`npm run build` → check `.next/static/`)
- Full E2E test: sign up → target → doc upload → scenario → live session → report
- `npm run seed:demo` (demo workspace)
- Vercel production deploy

---

## Key Commands

```bash
npm run setup:check       # validate env vars
npm run verify:supabase   # confirm DB tables + RPC
npm run seed:library      # insert 15 library profiles
npm run test:llm          # smoke test Gemini or OpenAI
npm run test:openai       # alias when LLM_PROVIDER=openai
npm run test:bp           # smoke test Beyond Presence
npm run backend:ready     # setup + verify + seed (no OpenAI needed)
npm run dev               # local dev server
npm run build             # production build check
```

---

## Env Blockers

| Variable | Blocks |
|----------|--------|
| `GEMINI_API_KEY` or `OPENAI_API_KEY` | Reconstruction, embeddings, evaluation, reports |
| `BEY_API_KEY` + `BEY_AGENT_ID` | Live avatar sessions |
| `NEXT_PUBLIC_SUPABASE_URL` + keys | Everything |
| Google OAuth in Supabase dashboard | Google sign-in |

---

See [fix.md](../fix.md) for the full audit. See [REMAINING_WORK.md](./REMAINING_WORK.md) for task breakdown.

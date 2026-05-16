# Rehearsal — Project Status

**Last updated:** 2026-05-16  
**Branch:** `main` — clean  
**Build:** `npm run build` passing (40 routes)

---

## What's Complete

### Infrastructure
- [x] Database migrations 001–008 (schema, RLS, pgvector, indexes, audit logs, library, storage buckets)
- [x] TypeScript types (`types/index.ts`) + Zod schemas (`lib/schemas.ts`)
- [x] All API routes — 35+ handlers (targets, documents, scenarios, sessions, reports, library, admin, assignments, webhooks)
- [x] AI pipelines — reconstruction, embeddings, evaluator, report builder (`lib/reconstruction.ts`, `lib/evaluator.ts`, `lib/reportBuilder.ts`)
- [x] Beyond Presence integration (`lib/beyondPresence.ts`) — test with `npm run test:bp`
- [x] OpenAI wrapper with safety scan (`lib/openai.ts`) — gated until key set

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

### Auth Configuration (not code — Supabase dashboard)
- [ ] Enable Google provider in Supabase → Auth → Providers → Google (paste Client ID + Secret)
- [ ] Set redirect URLs in Supabase → Auth → URL Configuration: `/callback`
- [ ] Magic link works once Email provider is enabled (default on) — test by signing in with email

### Database
- [ ] Run `supabase/RUN_PENDING.sql` on hosted Supabase instance
- [ ] Run `npm run seed:library` after migrations (inserts 15 library profiles)
- [ ] Run `npm run verify:supabase` to confirm all tables + RPC are ready

### AI Pipelines
- [ ] Add `OPENAI_API_KEY` → test with `npm run test:openai`
- [ ] Test reconstruction: `POST /api/targets/:id/reconstruct`
- [ ] Test document embed: `POST /api/documents/upload` → verify embedding_status becomes `complete`
- [ ] Test full session loop: create → end → evaluate → GET /reports/:id

### Live Avatar Sessions
- [ ] Add `BEY_API_KEY` + `BEY_AGENT_ID` → test with `npm run test:bp`
- [ ] Verify session creates join_url and iframe loads

### Production Deploy
- [ ] Vercel: add all env vars from `.env.local.example`
- [ ] Set `NEXT_PUBLIC_APP_URL` to production domain

---

## Open Code Issues (fix before production)

| Priority | Issue | File(s) |
|----------|-------|---------|
| HIGH | T1 — PersonalityJSON Zod schema too strict (breaks reconstruction) | `lib/schemas.ts`, `types/index.ts` |
| HIGH | N1 — 3 duplicate Supabase client files | `lib/db.ts`, `lib/supabase/browser.ts`, `lib/supabaseAdmin.ts` |
| MEDIUM | T2 — Chunk size ~4x too small (~128 tokens vs 512) | `lib/embeddings.ts` |
| MEDIUM | N3 — Document upload at `/api/documents/upload` not `/api/documents` | `app/api/documents/` |
| MEDIUM | N2 — Auth logic split across 3 files | `lib/auth.ts`, `lib/auth-helpers.ts`, `lib/auth-types.ts` |
| LOW | S1 — `organizations.plan` column implies billing (excluded from MVP) | `supabase/migrations/005_*` |
| LOW | S6 — Duplicate auth callback route | `app/(auth)/callback/` + `app/api/auth/callback/` |

See [fix.md](../fix.md) for full detail on each issue.

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
npm run test:openai       # smoke test OpenAI
npm run test:bp           # smoke test Beyond Presence
npm run backend:ready     # setup + verify + seed (no OpenAI needed)
npm run dev               # local dev server
npm run build             # production build check
```

---

## Env Blockers

| Variable | Blocks |
|----------|--------|
| `OPENAI_API_KEY` | Reconstruction, embeddings, evaluation, reports |
| `BEY_API_KEY` + `BEY_AGENT_ID` | Live avatar sessions |
| `NEXT_PUBLIC_SUPABASE_URL` + keys | Everything |
| Google OAuth in Supabase dashboard | Google sign-in |

---

See [fix.md](../fix.md) for the full audit. See [REMAINING_WORK.md](./REMAINING_WORK.md) for task breakdown.

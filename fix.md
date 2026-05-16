# Rehearsal — Project Audit & Fix Tracker (v3, post-frontend-integration)

**Audited against:** Full Rehearsal spec (Parts 1–17)  
**Date:** 2026-05-16  
**Branch:** `main` — clean, all committed  
**Last commit:** "Integrate full frontend: pages, components, auth, and library profiles"

---

## Phase Status Summary

| Phase | Description | Status |
|-------|-------------|--------|
| A — Foundation | Next.js, Supabase, migrations, types, schemas, lib modules | ✅ Complete |
| B — Auth + Onboarding | Sign-in (Google + magic link), callback, onboarding, app shell | ✅ Complete |
| C — Target Builder | Builder steps, scraper, reconstruction, API routes, UI | ✅ Complete — verify E2E with real OpenAI key |
| D — Documents + Context Engine | Upload, embedding, retrieval, API routes, UI | ✅ Complete — verify embed pipeline |
| E — Scenarios + Avatar Brief | Configurator, 10 prompt templates, API routes, UI | ✅ Complete |
| F — Live Session | BP integration, session UI, end flow | ✅ Complete — verify live BP call |
| G — Evaluation + Report | Evaluator, report builder, full report UI | ✅ Complete — verify post-session eval |
| H — Progress + History | Progress dashboard, Recharts, session history | ✅ Complete — verify with real session data |
| I — Public Figure Library | 15 JSON profiles, library browser UI | ✅ Complete — run `npm run seed:library` |
| J — Team Features | Coach dashboard, admin view, assignments | ✅ Complete |
| K — Settings | Solo + team settings pages | ✅ Complete |
| L — Polish | Loading skeletons, error states, mobile, rate limiting | ❌ Not started |
| M — Safety + Final QA | Safety audit, E2E tests, demo workspace, RLS verify | ❌ Not started |

---

## RESOLVED — No Longer Issues

### ~~C1. Frontend Pages~~ ✅ RESOLVED
All 18 pages now exist with real implementations:
```
app/(auth)/signin/page.tsx          ✅
app/(auth)/onboarding/page.tsx      ✅
app/(app)/dashboard/page.tsx        ✅
app/(app)/targets/page.tsx          ✅
app/(app)/targets/new/page.tsx      ✅
app/(app)/targets/[id]/page.tsx     ✅
app/(app)/targets/[id]/edit/page.tsx ✅
app/(app)/documents/page.tsx        ✅
app/(app)/company-documents/page.tsx ✅
app/(app)/scenarios/page.tsx        ✅
app/(app)/scenarios/new/page.tsx    ✅
app/(app)/scenarios/[id]/page.tsx   ✅
app/(app)/sessions/[id]/page.tsx    ✅
app/(app)/reports/[id]/page.tsx     ✅
app/(app)/library/page.tsx          ✅
app/(app)/library/[id]/page.tsx     ✅
app/(app)/progress/page.tsx         ✅
app/(app)/assignments/page.tsx      ✅
app/(app)/admin/page.tsx            ✅
app/(app)/settings/page.tsx         ✅
```

### ~~C2. UI Components~~ ✅ RESOLVED
All 42+ components built across all feature folders:
- `components/shared/` — AppShell, Sidebar, OnboardingFlow, EmptyState, LoadingSkeleton, ErrorBoundary, ConfirmDialog ✅
- `components/auth/` — SignInForm (Google OAuth + magic link) ✅
- `components/targets/` — TargetBuilder, Steps 1–4, TargetCard, PersonalityProfileCard, SourceManager ✅
- `components/documents/` — DocumentUploader, DocumentList, DocumentTypeSelector, CompanyDocumentsClient ✅
- `components/scenarios/` — ScenarioConfigurator, ScenarioCard, ConversationTypePicker, DifficultySlider, AvatarBriefPreview ✅
- `components/sessions/` — PreSessionChecklist, LiveSessionPanel, SessionEmbed, GeneratingReportState, CoachingBreakPanel ✅
- `components/reports/` — FeedbackReport, ScoreGauge, ExecutiveSummary, KeyMomentCard, SuggestedAnswer, TranscriptViewer, CommunicationNotes, AccuracyRater, CoachCommentBox ✅
- `components/progress/` — ProgressDashboard, ImprovementChart, SkillRadar, SessionHistoryList, StreakTracker ✅
- `components/library/` — LibraryBrowser, LibraryCard, LibraryFilterTabs, LibraryDetailModal ✅
- `components/admin/` — AdminPageClient, TeamMemberTable, SkillGapChart, TeamPulseBand, AssignmentManager ✅
- `components/ui/` — 20+ shadcn/ui components ✅

### ~~C3. Library JSON Profiles~~ ✅ RESOLVED
All 15 profiles present in `public/library/`:
```
contrarian-seed-vc.json         ✅
faang-bar-raiser.json           ✅
data-driven-series-a-vc.json    ✅
skeptical-cfo.json              ✅
probing-podcast-host.json       ✅
aggressive-cross-examiner.json  ✅
demanding-board-chair.json      ✅
empathetic-hr-partner.json      ✅
impatient-prospect.json         ✅
technical-deep-dive.json        ✅
conflict-avoidant-partner.json  ✅
direct-communicator-partner.json ✅
defensive-partner.json          ✅
supportive-parent.json          ✅
traditional-parent.json         ✅
```
After running migrations 006+007, run: `npm run seed:library`

### ~~G1, G2 — Git Issues~~ ✅ RESOLVED
All files committed. Working tree clean.

---

## OPEN — Must Fix Before Production

### N1. Three Duplicate Supabase Client Definitions (HIGH)

Three files export functionally identical clients under different names:

| File | Export | Status |
|------|--------|--------|
| `lib/db.ts` | `createServerSupabaseClient()`, `createServiceSupabaseClient()` | Spec-correct |
| `lib/supabase/browser.ts` | `createBrowserSupabaseClient()` | Duplicate |
| `lib/supabaseAdmin.ts` | `createAdminClient()` | Duplicate of service client |

**Risk:** Inconsistent imports across the codebase. Developers already import from different files.

**Fix:**
1. Add `createBrowserSupabaseClient()` export to `lib/db.ts`
2. Delete `lib/supabase/browser.ts` and `lib/supabaseAdmin.ts`
3. Find-replace all import sites to use `lib/db.ts`

---

### N2. Auth Logic Fragmented Across Three Files (MEDIUM)

| File | Content |
|------|---------|
| `lib/auth.ts` | Main helpers — getSession, requireSession, provisionNewUser |
| `lib/auth-helpers.ts` | Additional helpers — canManageTeam, isTeamMode, etc. |
| `lib/auth-types.ts` | 8 lines — only the `AuthSession` interface |

Spec specifies only `lib/auth.ts`. The split creates unclear import paths.

**Fix:**
1. Move `AuthSession` from `lib/auth-types.ts` → `types/index.ts`
2. Merge `lib/auth-helpers.ts` content into `lib/auth.ts`
3. Delete `lib/auth-types.ts` and `lib/auth-helpers.ts`
4. Update all import sites

---

### N3. Document Upload Route Deviates from Spec (MEDIUM)

| Route | Spec | Reality |
|-------|------|---------|
| `POST /api/documents` | Upload file (multipart) | Lists documents (GET only) |
| `POST /api/documents/upload` | Does not exist in spec | Actual upload handler |

**Risk:** Any frontend code built to spec calling `POST /api/documents` gets a list back, not an upload. The `DocumentUploader.tsx` component must be verified to call `/api/documents/upload`.

**Fix (pick one):**
- **Option A — spec-compliant:** Merge the upload handler into `app/api/documents/route.ts` POST, delete the `/upload` sub-route
- **Option B — keep deviation:** Verify `DocumentUploader.tsx` calls `/api/documents/upload`, update `docs/API_SPEC.md` to document the deviation

---

### N4. Python Scripts in TypeScript Project (LOW)

| File | Issue |
|------|-------|
| `scripts/generate-library-json.py` | Python — not runnable via npm |
| `scripts/fix-motion.py` | Python — purpose unclear |
| `scripts/fix-motion.js` | JavaScript, not TypeScript |

**Fix:** If library JSON was generated by the Python script, it's already done — delete all three files. Otherwise convert to TypeScript.

---

### S1. `organizations.plan` Column Implies Billing (LOW)

`supabase/migrations/005_audit_logs_and_columns.sql` adds `organizations.plan DEFAULT 'free'`. Part 15 of the spec explicitly excludes billing/plans from MVP.

**Fix:** Add a comment in the migration marking it as reserved for post-MVP, and ensure no UI code reads this column.

---

### S6. Duplicate Auth Callback Routes (LOW)

| Route | Path | Status |
|-------|------|--------|
| `app/(auth)/callback/route.ts` | `/callback` | Spec-correct |
| `app/api/auth/callback/route.ts` | `/api/auth/callback` | Extra |

Only one URL can be registered in Supabase Auth → Redirect URLs. Both routes exist — only one will ever receive the redirect.

**Fix:** Check Supabase dashboard → Auth → URL Configuration. Whichever redirect URL is registered there is the active one. Delete the unused route file.

---

## TYPE/SCHEMA Issues — Fix Before OpenAI Pipelines Run

### T1. PersonalityJSON Zod Schema Too Strict (HIGH)

**Files:** `lib/schemas.ts` + `types/index.ts`

**Problem:** `z.record(ConversationTypeSchema, z.array(z.string()))` requires all 10 ConversationType keys. OpenAI returns only a relevant subset → `safeParse` fails → reconstruction silently breaks.

**Fix in `lib/schemas.ts`:**
```typescript
// Change:
inferred_concerns_by_context: z.record(ConversationTypeSchema, z.array(z.string())),
// To:
inferred_concerns_by_context: z.record(z.string(), z.array(z.string())),
```

**Fix in `types/index.ts`:**
```typescript
// Change:
inferred_concerns_by_context: Record<ConversationType, string[]>;
// To:
inferred_concerns_by_context: Partial<Record<ConversationType, string[]>>;
```

---

### T2. Embedding Chunk Size ~4x Too Small (MEDIUM)

**File:** `lib/embeddings.ts`

**Problem:** Spec says "512-token segments." Code chunks by characters (likely ~512 chars ≈ 128 tokens). Results in 4x more chunks with too little context per chunk.

**Fix:** Find the chunk size constants in `lib/embeddings.ts` and update:
```typescript
const CHUNK_SIZE = 2048;    // ~512 tokens at 4 chars/token
const CHUNK_OVERLAP = 200;  // ~50 tokens
```

---

## REMAINING — Phase L & M

### Phase L — Polish (Not Started)

All the following are missing:

| Item | Where |
|------|-------|
| Loading skeletons on all data-fetch pages | All `app/(app)/*/page.tsx` |
| Error boundaries with retry buttons | `components/shared/ErrorBoundary.tsx` (exists, needs wiring) |
| Empty states with CTAs | Pages with no data |
| Mobile responsiveness audit | All pages — test on 375px viewport |
| AI endpoint rate limiting | `lib/rateLimit.ts` exists — verify wired on reconstruct, evaluate, embed routes |
| Request body Zod validation on every API route | Audit all `app/api/` routes |
| Consent + AI disclosure banner before every session | `PreSessionChecklist.tsx` — verify consent checkbox present |

---

### Phase M — Safety + Final QA (Not Started)

| Item | How to verify |
|------|--------------|
| Evaluator forbidden-phrase audit | Search evaluator output for: "should be hired", "no hire", "is dishonest", "lacks intelligence" |
| Avatar prompt forbidden-topic audit | Review all 10 prompts in `lib/prompts.ts` |
| RLS two-user test | Create two Supabase users in separate orgs; confirm no cross-read |
| No API keys in browser bundle | `npm run build` → check `.next/static/` for key strings |
| Full E2E session loop | Sign up → build target → upload doc → configure scenario → live session → report |
| Seed demo workspace | `npm run seed:demo` |
| Library seeded | `npm run seed:library` → verify 15 rows in `public_figure_library` table |
| Vercel deploy | Set all env vars; run `npm run build` on Vercel |

---

## AUTH — Configuration Required (Not Code Issues)

Both auth methods are **fully implemented** in `components/auth/SignInForm.tsx`.  
The following **Supabase dashboard** steps are required to make them work:

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
2. Create OAuth 2.0 Client ID (Web application)
3. Set **Authorized redirect URIs:**
   - `http://localhost:3000/callback` (development)
   - `https://your-domain.com/callback` (production)
4. Copy `Client ID` and `Client Secret`
5. In Supabase Dashboard → Authentication → Providers → Google:
   - Enable Google provider
   - Paste Client ID and Client Secret
6. In Supabase Dashboard → Authentication → URL Configuration:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: add `http://localhost:3000/callback`

### Magic Link (Individual User Login — No Google)

Magic link works with **zero additional setup** once Supabase email provider is enabled:

1. Supabase Dashboard → Authentication → Providers → Email
2. Enable "Email" provider (enabled by default)
3. Optionally configure SMTP (Supabase provides a free tier SMTP)

Users can sign in by entering their email → they receive a magic link → clicking it authenticates them. No password required. This is the solo user flow.

### Env Variables Required

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-public-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-secret>
OPENAI_API_KEY=<key>               # required for AI features
BEY_API_KEY=<key>                  # required for live avatar sessions
BEY_AGENT_ID=<agent-id>            # required for live avatar sessions
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Test with: `npm run setup:check`

---

## Recommended Fix Order

```
1.  Supabase: Run RUN_PENDING.sql → npm run backend:ready
2.  Supabase: Configure Google OAuth in dashboard
3.  Add OPENAI_API_KEY → npm run test:openai
4.  Add BEY_API_KEY + BEY_AGENT_ID → npm run test:bp
5.  Code: Fix T1 (PersonalityJSON schema) in lib/schemas.ts + types/index.ts
6.  Code: Fix T2 (chunk size) in lib/embeddings.ts
7.  Code: Fix N3 (decide on /api/documents upload route)
8.  Code: Fix N1 (consolidate Supabase clients into lib/db.ts)
9.  Code: Fix N2 (merge auth helpers into lib/auth.ts)
10. npm run seed:library
11. Phase L: Mobile audit, loading states, error states, rate limiting
12. Phase M: Safety audit, RLS test, E2E session loop, Vercel deploy
```

# Rehearsal — Remaining Work

**Updated:** 2026-05-16  
**State:** Full frontend + backend integrated. Build passes. Remaining = configure, fix, polish, QA, deploy.

---

## TL;DR — What's Left

| Category | Items | Effort |
|----------|-------|--------|
| Auth config (Supabase dashboard) | Google OAuth setup | 20 min |
| Env vars | Add keys to `.env.local` + Vercel | 10 min |
| DB setup | Run migrations + seed | 15 min |
| Code fixes | N1, N2, N3, T1, T2 | 2–4 hrs |
| Phase L — Polish | Mobile, skeletons, errors, rate limiting | 4–8 hrs |
| Phase M — Safety + QA | Audit, E2E tests, deploy | 4–6 hrs |

---

## 1. Auth Configuration (Do First)

### Google OAuth — Supabase Dashboard Steps

The code is fully built in `components/auth/SignInForm.tsx`. Only the Supabase dashboard needs configuring:

1. **Google Cloud Console** → APIs & Services → Credentials → Create OAuth 2.0 Client ID
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/callback` (dev), `https://your-domain.com/callback` (prod)
   - Copy **Client ID** and **Client Secret**

2. **Supabase Dashboard** → Authentication → Providers → Google
   - Enable the Google provider
   - Paste Client ID and Client Secret → Save

3. **Supabase Dashboard** → Authentication → URL Configuration
   - Site URL: `http://localhost:3000`
   - Redirect URLs: add `http://localhost:3000/callback`

4. Test: visit `/signin` → "Continue with Google" → should complete OAuth flow

### Magic Link (Individual / Solo Login — No Google Required)

Already works once Email provider is on (it's on by default in Supabase):
- User enters email → receives magic link → clicks it → authenticated as solo user
- Organization + membership created automatically on first login (`provisionNewUser()` in `lib/auth.ts`)
- User lands on `/onboarding` to set workspace name + intent

**No additional code or config needed for magic link.**

---

## 2. Environment Variables

Fill in `.env.local` (copy from `.env.local.example`):

```bash
# Required — everything breaks without these
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# Required for AI features
OPENAI_API_KEY=sk-...

# Required for live avatar sessions
BEY_API_KEY=<beyond-presence-key>
BEY_AGENT_ID=<agent-id>

# Recommended
JINA_API_KEY=<key>             # better URL scraping
BEY_WEBHOOK_SECRET=<secret>    # webhook signature verification

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Validate: `npm run setup:check`

---

## 3. Database Setup

Run in order:

```bash
# 1. Run all pending migrations in Supabase SQL Editor
#    Paste contents of: supabase/RUN_PENDING.sql

# 2. Verify tables, RLS, and RPC are ready
npm run verify:supabase

# 3. Seed the 15 library profiles
npm run seed:library

# 4. Full readiness check (no OpenAI needed)
npm run backend:ready
```

---

## 4. Code Fixes (Before Production)

### T1 — PersonalityJSON Schema Too Strict (HIGH — breaks AI reconstruction)

**File:** `lib/schemas.ts` and `types/index.ts`

OpenAI doesn't return all 10 ConversationType keys in `inferred_concerns_by_context`. The strict `z.record(ConversationTypeSchema, ...)` fails `safeParse`, breaking reconstruction silently.

**Fix in `lib/schemas.ts`:**
```typescript
// Before:
inferred_concerns_by_context: z.record(ConversationTypeSchema, z.array(z.string())),
// After:
inferred_concerns_by_context: z.record(z.string(), z.array(z.string())),
```

**Fix in `types/index.ts`:**
```typescript
// Before:
inferred_concerns_by_context: Record<ConversationType, string[]>;
// After:
inferred_concerns_by_context: Partial<Record<ConversationType, string[]>>;
```

---

### T2 — Embedding Chunks Too Small (MEDIUM — degrades retrieval quality)

**File:** `lib/embeddings.ts`

512 characters ≈ 128 tokens. Spec requires 512 tokens ≈ 2048 characters.

**Fix:** Update chunk size constants:
```typescript
const CHUNK_SIZE = 2048;    // ~512 tokens
const CHUNK_OVERLAP = 200;  // ~50 tokens
```

---

### N1 — Duplicate Supabase Clients (HIGH — causes import inconsistency)

Three files create the same clients:
- `lib/db.ts` ← keep this one
- `lib/supabase/browser.ts` ← delete, move export to `lib/db.ts`
- `lib/supabaseAdmin.ts` ← delete, use `createServiceSupabaseClient()` from `lib/db.ts`

After deletion, find-and-replace all import sites.

---

### N2 — Auth Logic in Three Files (MEDIUM)

- `lib/auth-types.ts` — move `AuthSession` interface to `types/index.ts`, then delete file
- `lib/auth-helpers.ts` — merge content into `lib/auth.ts`, then delete file

---

### N3 — Document Upload Route (MEDIUM — verify before demo)

Spec says `POST /api/documents` uploads a file. Reality: the upload handler is at `POST /api/documents/upload`.

**Action:** Open `components/documents/DocumentUploader.tsx` and verify the fetch URL is `/api/documents/upload`. If it is, the app works correctly — just update `docs/API_SPEC.md` to document the deviation. If it calls `/api/documents`, fix the URL.

---

## 5. Phase L — Polish

Work in `app/(app)/` pages and `components/`:

| Item | How |
|------|-----|
| Loading skeletons | Add `<LoadingSkeleton />` while `isLoading` from TanStack Query |
| Error states | Add error boundary or inline `{error && <div>...retry</div>}` |
| Empty states | Each list page: if `data.length === 0`, show `<EmptyState>` with CTA |
| Mobile audit | Test every page at 375px width in browser devtools |
| Rate limiting | Verify `lib/rateLimit.ts` is called in: `/api/targets/:id/reconstruct`, `/api/sessions/:id/evaluate`, `/api/documents/embed` |
| Zod body validation | Audit every `app/api/*/route.ts` — every POST/PATCH should call `Schema.safeParse(body)` |
| Consent banner | Verify `PreSessionChecklist.tsx` has explicit consent checkbox before enabling "Start Session" |

---

## 6. Phase M — Safety + Final QA

### Safety Audit

```bash
# Forbidden phrases — evaluator must NEVER output these
grep -r "should be hired\|no hire\|is dishonest\|lacks intelligence\|based on.*accent\|culture fit" lib/prompts.ts

# Avatar prompts must not ask about protected characteristics
# Review each of the 10 avatar templates in lib/prompts.ts manually
```

Check `lib/schemas.ts` — `containsForbiddenLanguage()` and `validateAISafety()` must be called on all OpenAI outputs.

### RLS Verification

1. Create two Supabase users (different email addresses)
2. Complete onboarding for each — they'll be in separate orgs
3. Confirm user A cannot read user B's targets, sessions, or documents via the API

### E2E Test Run (with real keys)

```
1. Sign up via magic link as a new user
2. Complete onboarding → solo mode
3. Build a target: add 2 URLs + 1 manual description → reconstruct
4. Upload a PDF document → wait for embedding_status = 'complete'
5. Create a scenario: pick target, set goal, set difficulty 3
6. Start session: complete pre-session checklist → join Beyond Presence
7. Have a 3-minute conversation
8. End session → wait for status = 'report_ready'
9. View report: check scores, moments, suggested answers, transcript
10. Rate accuracy (1–5 stars)
11. Export PDF report
```

### Pre-Deploy Checklist

```bash
npm run build                  # must pass
npm run setup:check            # all vars green
npm run verify:supabase        # all tables + RPC ready
npm run seed:library           # 15 rows in public_figure_library
npm run seed:demo              # demo org with sample data
npm run test:openai            # AI smoke test
npm run test:bp                # BP smoke test
```

- [ ] No API keys appear in `.next/static/` chunks
- [ ] `NEXT_PUBLIC_APP_URL` set to production domain in Vercel
- [ ] Supabase redirect URL updated to production domain
- [ ] Google OAuth redirect URI updated in Google Cloud Console

---

## What Is NOT Needed (Excluded from MVP per spec Part 15)

- Stripe / billing / subscription plans
- Mobile app
- Landing / marketing / pricing pages
- SSO / SAML
- LMS / CRM / ATS integrations
- Automated hiring decisions
- Speech-to-Video custom pipeline
- Email digests / notification system
- API for third parties

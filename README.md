# Rehearsal

**Have the conversation before you have it.**

AI avatar platform for rehearsing high-stakes conversations with realistic digital-twin simulations of the person you're about to face.

- **Stack:** Next.js 14 · TypeScript · Supabase · pgvector · OpenAI gpt-4o · Beyond Presence
- **Auth:** Google OAuth + magic link (individual/solo users)
- **Build:** `npm run build` passing — 40 routes

---

## Current State (2026-05-16)

| Phase | Status |
|-------|--------|
| Foundation (DB, types, schemas, lib) | ✅ Complete |
| Auth + Onboarding | ✅ Complete — needs Google OAuth config in Supabase |
| All product pages (18) + components (42+) | ✅ Complete |
| AI pipelines (reconstruction, evaluation, reports) | ✅ Complete — needs `OPENAI_API_KEY` |
| Live avatar sessions (Beyond Presence) | ✅ Complete — needs `BEY_API_KEY` |
| Library (15 profiles) | ✅ Complete — run `npm run seed:library` |
| Polish (mobile, skeletons, errors) | ❌ Not started |
| Safety audit + E2E QA + deploy | ❌ Not started |

See [`docs/STATUS.md`](./docs/STATUS.md) for the live checklist.  
See [`fix.md`](./fix.md) for open code issues (T1, T2, N1, N2, N3).

---

## Quick Start

```bash
git clone https://github.com/Rehersal-labs/rehersal-app.git
cd rehersal-app
npm install
cp .env.local.example .env.local
# Fill in all env vars — see docs/SETUP.md
npm run setup:check
npm run dev
```

### Auth Setup (required before login works)

**Magic link (individual user login):** Works automatically once Supabase Email provider is enabled (on by default). User enters email → receives magic link → signs in.

**Google OAuth:**
1. Create OAuth Client ID in [Google Cloud Console](https://console.cloud.google.com)
2. Supabase Dashboard → Auth → Providers → Google → enable + paste credentials
3. Supabase Dashboard → Auth → URL Config → add `http://localhost:3000/callback`

### Database Setup

```bash
# 1. Paste supabase/RUN_PENDING.sql into Supabase SQL Editor
npm run verify:supabase   # confirm tables + RPC
npm run seed:library      # insert 15 library profiles
npm run backend:ready     # full readiness check
```

---

## Env Variables

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
OPENAI_API_KEY=sk-...           # AI features
BEY_API_KEY=<key>               # live avatar sessions
BEY_AGENT_ID=<agent-id>         # live avatar sessions
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Recommended
JINA_API_KEY=<key>              # better URL scraping
BEY_WEBHOOK_SECRET=<secret>     # webhook signature
```

See `.env.local.example` and [`docs/SETUP.md`](./docs/SETUP.md) for full details.

---

## Documentation

| Doc | Purpose |
|-----|---------|
| [`docs/STATUS.md`](./docs/STATUS.md) | Live project checklist |
| [`fix.md`](./fix.md) | Open issues + code fixes needed |
| [`docs/REMAINING_WORK.md`](./docs/REMAINING_WORK.md) | What to do next (ordered) |
| [`docs/SETUP.md`](./docs/SETUP.md) | Local dev + env configuration |
| [`docs/API_SPEC_FULL.md`](./docs/API_SPEC_FULL.md) | All API endpoints |
| [`docs/FRONTEND_SPEC.md`](./docs/FRONTEND_SPEC.md) | UI/UX spec |
| [`docs/PROMPTS.md`](./docs/PROMPTS.md) | AI prompt engineering |
| [`docs/SAFETY.md`](./docs/SAFETY.md) | Safety rules for AI output |

---

## Code Contracts

- `types/index.ts` — all TypeScript types
- `lib/schemas.ts` — Zod schemas + AI safety validators
- `supabase/migrations/` — database schema (source of truth)
- `.cursor/rules/project-rules.md` — Cursor task rules

---

## Key Commands

```bash
npm run dev               # local dev server (port 3000)
npm run build             # production build
npm run setup:check       # validate env vars
npm run verify:supabase   # confirm DB ready
npm run seed:library      # seed 15 library profiles
npm run seed:demo         # seed demo workspace
npm run test:openai       # smoke test OpenAI
npm run test:bp           # smoke test Beyond Presence
npm run backend:ready     # full backend readiness (no OpenAI needed)
```

# Rehearsal — Development Plan

**Updated:** 2026-05-16  
**Repo:** [github.com/Rehersal-labs/rehersal-app](https://github.com/Rehersal-labs/rehersal-app)  
**Current state:** Waves 1–5 complete. Wave 6 (QA + deploy) in progress.

---

## Build Wave Status

### Wave 1 — Foundation ✅ Complete
- [x] Migrations 001–008 (schema, RLS, pgvector, indexes, audit, library, storage)
- [x] TypeScript types (`types/index.ts`) + Zod schemas (`lib/schemas.ts`)
- [x] DB clients (`lib/db.ts`) + auth helpers (`lib/auth.ts`)
- [x] Design system (`globals.css`, `tailwind.config.ts`, shadcn theme, custom tokens)
- [x] `.env.local.example` with all variables

### Wave 2 — Auth & Shell ✅ Complete
- [x] Sign-in UI: Google OAuth + magic link (`components/auth/SignInForm.tsx`)
- [x] Auth callbacks: `/callback` + `/api/auth/callback`
- [x] 5-step onboarding flow (`OnboardingFlow.tsx` + `/api/onboarding`)
- [x] App shell + role-aware sidebar (`AppShell.tsx`, `Sidebar.tsx`)
- [x] Root redirect: `/` → `/dashboard` (auth) or `/signin` (no auth)

### Wave 3 — Core Product ✅ Complete
- [x] Target builder: 4-step UI + reconstruction API + scraper pipeline
- [x] Documents: upload (PDF/DOCX/TXT), extract, embed, retrieve
- [x] Scenarios: configurator, 10 conversation types, difficulty 1–5, avatar brief
- [x] Library: 15 JSON profiles, browser UI, clone to workspace
- [x] All 10 avatar system prompt templates in `lib/prompts.ts`

### Wave 4 — Session Loop ✅ Complete
- [x] Beyond Presence integration (`lib/beyondPresence.ts`, `npm run test:bp`)
- [x] Live session page: pre-check → embed → timer → coaching break → end
- [x] Session end: sync transcript, trigger evaluation, poll for report
- [x] Evaluation pipeline: `lib/evaluator.ts` → `lib/reportBuilder.ts`
- [x] Feedback report: scores, moments, transcript, PDF export

### Wave 5 — Team & Polish ✅ Complete (UI)
- [x] Team assignments: coach assigns → learner completes
- [x] Admin view: team pulse, member table, skill gap chart
- [x] Company documents: admin uploads, team reads
- [x] Progress dashboard: improvement chart, skill radar, streak tracker
- [x] Settings: solo (general/account/data) + team (members/invites/data)

### Wave 6 — QA & Deploy ⚠️ In Progress

| Step | Status | Notes |
|------|--------|-------|
| Code fixes (T1, T2, N1, N2, N3) | ❌ Pending | See fix.md |
| Google OAuth config in Supabase | ❌ Pending | Dashboard-only step |
| Run migrations on hosted Supabase | ❌ Pending | `supabase/RUN_PENDING.sql` |
| Seed library | ❌ Pending | `npm run seed:library` |
| OpenAI E2E test | ❌ Pending | `npm run test:openai` |
| BP live session test | ❌ Pending | `npm run test:bp` |
| Phase L — Polish | ❌ Pending | Mobile, skeletons, errors |
| Phase M — Safety audit + RLS test | ❌ Pending | See REMAINING_WORK.md |
| Seed demo workspace | ❌ Pending | `npm run seed:demo` |
| Vercel production deploy | ❌ Pending | Set all env vars |

---

## Integration Checkpoints

| # | Checkpoint | Status | How to verify |
|---|------------|--------|--------------|
| CP1 | Migrations + types compile | ✅ Done | `npm run verify:supabase` |
| CP2 | User can sign in and reach dashboard | ⚠️ Needs Google config | Visit `/signin` → Google OAuth |
| CP3 | Target reconstruction returns valid PersonalityJSON | ❌ Needs OpenAI key | `POST /api/targets/:id/reconstruct` |
| CP4 | Document upload embeds chunks in pgvector | ❌ Needs OpenAI key | `POST /api/documents/upload` |
| CP5 | BP `createCall` returns join URL | ❌ Needs BP keys | `npm run test:bp` |
| CP6 | Full loop: session → report in < 60s | ❌ Needs all keys | Manual E2E test |
| CP7 | Solo hides team UI; team shows pulse + assignments | ✅ Done | Verify with two different org modes |
| CP8 | Success criteria checklist green | ❌ Pending | See docs/SUCCESS_CRITERIA.md |

---

## File Ownership (For Reference)

| Track | Owns |
|-------|------|
| Backend | `app/api/`, `lib/` (except prompts/schemas), `supabase/`, `scripts/` |
| Frontend | `app/(auth)/`, `app/(app)/*/page.tsx`, `components/` |
| AI/Content | `lib/prompts.ts`, `types/index.ts`, `lib/schemas.ts`, `public/library/*.json` |

---

## Cursor Task Template

For any remaining tasks, use this format:

```markdown
**Goal:** [one sentence]
**Files:** [exact paths only]
**Requirements:** [specific behaviors]
**Acceptance:** [how to verify]
**Do NOT:** [scope guard]
```

---

## Related Docs

- [REMAINING_WORK.md](./REMAINING_WORK.md) — what to do next, in order
- [STATUS.md](./STATUS.md) — live checklist
- [fix.md](../fix.md) — full audit with code-level fixes
- [SUCCESS_CRITERIA.md](./SUCCESS_CRITERIA.md) — definition of done
- [SETUP.md](./SETUP.md) — local dev + env configuration

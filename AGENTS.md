# Rehearsal — Agent Onboarding

New Cursor agent or developer? Read this first, then code.

**Current state (2026-05-16):** Full frontend + backend integrated. Build passing. Entering Wave 6 (QA + deploy).

---

## 1. Where Things Stand

| Area | State |
|------|-------|
| Database (8 migrations) | ✅ Code complete — needs to run on hosted Supabase |
| API routes (35+) | ✅ Complete |
| AI pipelines | ✅ Complete — needs `OPENAI_API_KEY` to activate |
| Beyond Presence | ✅ Complete — needs `BEY_API_KEY` + `BEY_AGENT_ID` |
| All 18 pages + 42+ components | ✅ Complete |
| Auth: Google OAuth + magic link | ✅ Code complete — needs Supabase dashboard config |
| 15 library profiles | ✅ Code complete — needs `npm run seed:library` |
| Phase L (polish) | ❌ Not started |
| Phase M (safety + QA + deploy) | ❌ Not started |

---

## 2. Start Here

```bash
npm install
cp .env.local.example .env.local
# Fill all env vars — see docs/SETUP.md
npm run setup:check
npm run verify:supabase
npm run dev
```

---

## 3. What To Work On Next

**Priority order:**

1. **Auth config** — Google OAuth in Supabase dashboard (see [REMAINING_WORK.md](./docs/REMAINING_WORK.md))
2. **DB setup** — run `supabase/RUN_PENDING.sql` → `npm run seed:library`
3. **Code fix T1** — loosen PersonalityJSON Zod schema (`lib/schemas.ts` + `types/index.ts`)
4. **Code fix T2** — fix chunk size in `lib/embeddings.ts` (2048 chars, not 512)
5. **Code fix N1** — consolidate 3 Supabase client files into `lib/db.ts`
6. **Code fix N3** — verify `DocumentUploader.tsx` calls `/api/documents/upload`
7. **Phase L** — mobile audit, loading skeletons, error states
8. **Phase M** — safety audit, E2E test, Vercel deploy

Full detail in [fix.md](./fix.md) and [REMAINING_WORK.md](./docs/REMAINING_WORK.md).

---

## 4. Code Contracts (Source of Truth)

- `types/index.ts` — all TypeScript types
- `lib/schemas.ts` — Zod validation + AI safety validators
- `docs/API_SPEC_FULL.md` — API request/response shapes
- `supabase/migrations/` — database schema

If docs and code disagree, fix both in the same commit.

---

## 5. Rules

- Follow [.cursor/rules/project-rules.md](./.cursor/rules/project-rules.md)
- **Never expose to browser:** `SUPABASE_SERVICE_ROLE_KEY`, `BEY_API_KEY`, `OPENAI_API_KEY`, `JINA_API_KEY`
- Validate every API request body with Zod; check auth on every route
- Read [docs/SAFETY.md](./docs/SAFETY.md) before touching `lib/evaluator.ts` or `lib/prompts.ts`
- Use `createServiceSupabaseClient()` from `lib/db.ts` in API routes (not `lib/supabaseAdmin.ts`)
- One route / one component / one function per Cursor task

---

## 6. Open Issues Summary

| ID | Issue | Priority | File |
|----|-------|----------|------|
| T1 | PersonalityJSON Zod too strict — breaks reconstruction | HIGH | `lib/schemas.ts`, `types/index.ts` |
| T2 | Chunk size 512 chars instead of 2048 | MEDIUM | `lib/embeddings.ts` |
| N1 | 3 duplicate Supabase client files | HIGH | `lib/db.ts`, `lib/supabase/browser.ts`, `lib/supabaseAdmin.ts` |
| N2 | Auth split across 3 files | MEDIUM | `lib/auth.ts`, `lib/auth-helpers.ts`, `lib/auth-types.ts` |
| N3 | Upload at `/api/documents/upload` not `/api/documents` | MEDIUM | `app/api/documents/` |
| S6 | Duplicate auth callback (verify which is active) | LOW | `app/(auth)/callback/` vs `app/api/auth/callback/` |

---

## 7. Typical Tasks

| Task | Doc to read |
|------|------------|
| New API route | `docs/API_SPEC_FULL.md` |
| New page / component | `docs/FRONTEND_SPEC.md` |
| Prompt tuning | `docs/PROMPTS.md` |
| Library JSON | `docs/LIBRARY_JSON_SPEC.md` |
| Auth flow | `lib/auth.ts`, `components/auth/SignInForm.tsx` |
| Safety work | `docs/SAFETY.md`, `lib/schemas.ts` (`validateAISafety`) |

Do not invent endpoints or features outside the spec.

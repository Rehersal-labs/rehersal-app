# Rehearsal — Task Assignments

**Updated:** 2026-05-16  
**State:** All three tracks complete. Remaining work is Wave 6 (QA + deploy).

---

## Track Status Summary

| Track | Owner | Status |
|-------|-------|--------|
| 0 — Foundation | Backend lead | ✅ Complete |
| A — Frontend | Frontend dev | ✅ Complete |
| B — Backend | Platform dev | ✅ Complete |
| C — AI & Content | AI/content dev | ✅ Complete |
| Wave 6 — QA + Deploy | All | ⚠️ In Progress |

---

## Developer 0 — Foundation Lead ✅ Complete

| # | Task | Files | Status |
|---|------|-------|--------|
| 0.1 | Migration 001 — schema | `supabase/migrations/001_initial_schema.sql` | ✅ |
| 0.2 | Migration 002 — RLS | `002_rls_policies.sql` | ✅ |
| 0.3 | Migration 003 — pgvector | `003_pgvector_setup.sql` | ✅ |
| 0.4 | Migration 004 — indexes | `004_seed_indexes.sql` | ✅ |
| 0.5 | Additional migrations | `005`, `006`, `007`, `008` | ✅ |
| 0.6 | Types | `types/index.ts` | ✅ |
| 0.7 | Schemas | `lib/schemas.ts` | ✅ |
| 0.8 | DB clients | `lib/db.ts`, `lib/auth.ts` | ✅ |

---

## Developer A — Frontend ✅ Complete

| # | Task | Files | Status |
|---|------|-------|--------|
| A1 | Design system | `app/layout.tsx`, `globals.css`, `tailwind.config.ts`, `components/ui/*` | ✅ |
| A2 | Sign-in + onboarding | `(auth)/signin`, `components/auth/SignInForm.tsx`, `OnboardingFlow.tsx` | ✅ |
| A3 | App shell + sidebar | `AppShell.tsx`, `Sidebar.tsx`, `(app)/layout.tsx` | ✅ |
| A4 | Dashboard | `dashboard/page.tsx`, `DashboardContent.tsx`, `TeamPulseBand.tsx` | ✅ |
| A5 | Target builder UI | `targets/*`, `TargetBuilder*.tsx`, `PersonalityProfileCard.tsx`, `SourceManager.tsx` | ✅ |
| A6 | Documents UI | `documents/page.tsx`, `DocumentUploader.tsx`, `DocumentList.tsx` | ✅ |
| A7 | Scenarios UI | `scenarios/*`, `ScenarioConfigurator.tsx`, `ConversationTypePicker.tsx` | ✅ |
| A8 | Live session UI | `sessions/[id]`, `PreSessionChecklist.tsx`, `LiveSessionPanel.tsx`, `SessionEmbed.tsx` | ✅ |
| A9 | Feedback report UI | `reports/[id]`, `FeedbackReport.tsx`, `ScoreGauge.tsx`, `KeyMomentCard.tsx` | ✅ |
| A10 | Progress UI | `progress/page.tsx`, `ProgressDashboard.tsx`, `ImprovementChart.tsx`, `SkillRadar.tsx` | ✅ |
| A11 | Library UI | `library/*`, `LibraryBrowser.tsx`, `LibraryCard.tsx` | ✅ |
| A12 | Team UI | `admin/page.tsx`, `assignments/page.tsx`, `TeamMemberTable.tsx`, `AssignmentManager.tsx` | ✅ |
| A13 | Settings | `settings/page.tsx`, `SettingsClient.tsx` | ✅ |
| A14 | Company docs UI | `company-documents/page.tsx`, `CompanyDocumentsClient.tsx` | ✅ |

---

## Developer B — Backend ✅ Complete

| # | Task | Files | Status |
|---|------|-------|--------|
| B1 | OpenAI wrapper | `lib/openai.ts` | ✅ |
| B2 | Beyond Presence wrapper + spike | `lib/beyondPresence.ts`, `scripts/test-bp-call.ts` | ✅ |
| B3 | Scraper layer | `lib/scraper/*`, `lib/fileParser.ts` | ✅ |
| B4 | Reconstruction pipeline | `lib/reconstruction.ts` | ✅ |
| B5 | Embeddings + retriever | `lib/embeddings.ts`, `lib/contextRetriever.ts` | ✅ |
| B6 | Avatar brief builder | `lib/avatarBriefBuilder.ts` | ✅ |
| B7 | Evaluator + report builder | `lib/evaluator.ts`, `lib/reportBuilder.ts` | ✅ |
| B8 | PDF exporter | `lib/pdfExporter.tsx` | ✅ |
| B9 | Targets API | `app/api/targets/**` | ✅ |
| B10 | Documents API | `app/api/documents/**`, `company-documents/**` | ✅ |
| B11 | Scenarios API | `app/api/scenarios/**` | ✅ |
| B12 | Sessions API | `app/api/sessions/**` | ✅ |
| B13 | Reports API | `app/api/reports/**` | ✅ |
| B14 | Library + admin + assignments API | `app/api/library/**`, `admin/**`, `assignments`, `coach-comments` | ✅ |
| B15 | Webhook + rate limit | `webhooks/beyond-presence`, `lib/rateLimit.ts` | ✅ |
| B16 | Demo seed | `scripts/seed-demo.ts` | ✅ |
| B17 | Extra APIs (not in original spec) | `/api/me`, `/api/onboarding`, `/api/team/members`, `/api/settings/export` | ✅ |

---

## Developer C — AI & Content ✅ Complete

| # | Task | Files | Status |
|---|------|-------|--------|
| C1 | All 10 avatar prompt templates | `lib/prompts.ts` | ✅ |
| C2 | Reconstruction prompt | `lib/prompts.ts` | ✅ |
| C3 | Evaluator + report builder prompts | `lib/prompts.ts` | ✅ |
| C4 | 10 professional library JSON | `public/library/*.json` | ✅ |
| C5 | 5 personal library JSON | `public/library/*.json` | ✅ |
| C6 | Seed library script | `scripts/seed-library.ts` | ✅ |
| C7 | Safety validator | `lib/schemas.ts` — `containsForbiddenLanguage()`, `validateAISafety()` | ✅ |

---

## Wave 6 — QA + Deploy (All Owners) ⚠️ In Progress

### Code Fixes (any developer)

| # | Fix | Priority | File(s) |
|---|-----|----------|---------|
| T1 | PersonalityJSON Zod schema too strict | HIGH | `lib/schemas.ts`, `types/index.ts` |
| T2 | Embedding chunk size ~4x too small | MEDIUM | `lib/embeddings.ts` |
| N1 | 3 duplicate Supabase client files | HIGH | `lib/db.ts`, `lib/supabase/browser.ts`, `lib/supabaseAdmin.ts` |
| N2 | Auth logic split across 3 files | MEDIUM | `lib/auth.ts`, `lib/auth-helpers.ts`, `lib/auth-types.ts` |
| N3 | Document upload route mismatch | MEDIUM | `app/api/documents/` |

### Configuration (Backend lead)

| # | Task | How |
|---|------|-----|
| 1 | Run migrations | Supabase SQL Editor → `supabase/RUN_PENDING.sql` |
| 2 | Seed library | `npm run seed:library` |
| 3 | Configure Google OAuth | Supabase Dashboard → Auth → Providers |
| 4 | Add OpenAI key | `.env.local` + Vercel |
| 5 | Add BP keys | `.env.local` + Vercel |

### Polish (Frontend dev)

| # | Task | Where |
|---|------|-------|
| 1 | Loading skeletons on all data-fetch pages | All `app/(app)/*/page.tsx` |
| 2 | Error states with retry | Pages with API calls |
| 3 | Empty states with CTAs | Lists with no data |
| 4 | Mobile audit (375px) | All pages |

### Safety + QA (AI/content dev)

| # | Task | How |
|---|------|-----|
| 1 | Evaluator forbidden-phrase audit | Search prompt output for banned phrases |
| 2 | Avatar prompt audit | Review all 10 in `lib/prompts.ts` |
| 3 | RLS two-user test | Two Supabase accounts in separate orgs |
| 4 | Full E2E session loop | Sign up → target → doc → scenario → session → report |
| 5 | Seed demo workspace | `npm run seed:demo` |
| 6 | Vercel deploy | All env vars set + production URL configured |

---

## Daily Standup Questions (Wave 6)

1. Which code fix or config step did you complete?
2. Any blockers on env vars or Supabase access?
3. Any issues found during E2E testing?

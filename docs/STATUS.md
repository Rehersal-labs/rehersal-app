# Rehearsal — Project status

Last updated: 2026-05-16 (auto-maintained by dev agents)

## Build

- `npm run build` — passing
- `npm run setup:check` — requires `OPENAI_API_KEY` for full AI features

## Completed

- [x] Database migrations (001–006)
- [x] Types + Zod schemas
- [x] All API routes (targets, documents, scenarios, sessions, reports, library, admin, assignments)
- [x] AI pipelines (reconstruction, embeddings, evaluator, report builder)
- [x] Beyond Presence integration + test script (`npm run test:bp`)
- [x] 15 library JSON profiles + seed script
- [x] App shell, dashboard, targets, scenarios, sessions, reports UI
- [x] Team features (admin, assignments, company docs)
- [x] Progress dashboard + charts
- [x] **Sign-in** (Google OAuth + magic link) — `components/auth/SignInForm.tsx`
- [x] Route protection middleware
- [x] Full team documentation in `/docs`

## In progress / needs verification

- [ ] End-to-end live session with real BP + OpenAI keys
- [ ] PDF export to Supabase Storage (verify bucket + permissions)
- [ ] Team invite emails (currently audit log only)
- [ ] Production deploy on Vercel

## Env blockers

| Variable | Required for |
|----------|----------------|
| `OPENAI_API_KEY` | Reconstruction, embeddings, evaluation |
| `BEY_API_KEY` + `BEY_AGENT_ID` | Live avatar sessions |
| Supabase keys | Everything |

Run: `npm run setup:check`

## Next recommended tasks

1. Add `OPENAI_API_KEY` and run full session → report E2E test
2. Run `npm run seed:library` and `npm run seed:demo` on Supabase
3. Verify RLS with two test users
4. Deploy to Vercel with env vars

## Team assignments

See [TEAM_WORKFLOW.md](./TEAM_WORKFLOW.md). Update this file when you merge a major feature.

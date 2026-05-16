# Rehearsal

**Have the conversation before you have it.**

AI avatar platform for rehearsing high-stakes conversations with realistic target-person simulations.

- **Stack:** Next.js 14 · Supabase · OpenAI · Beyond Presence  
- **Repo:** https://github.com/Rehersal-labs/rehersal-app  

---

## For Developers

**All planning documentation is in [`/docs`](./docs/README.md).**

| Start here | Description |
|------------|-------------|
| [docs/README.md](./docs/README.md) | Documentation index |
| [docs/DEVELOPMENT_PLAN.md](./docs/DEVELOPMENT_PLAN.md) | Build order & critical path |
| [docs/TASK_ASSIGNMENTS.md](./docs/TASK_ASSIGNMENTS.md) | Who builds what (parallel tracks) |
| [docs/SETUP.md](./docs/SETUP.md) | Local setup & env vars |

### Critical path (merge first)

1. Database migrations (`supabase/migrations/001–004`)  
2. `types/index.ts` + `lib/schemas.ts`  
3. `lib/db.ts` + `lib/auth.ts`  

Then parallel: **Track A** (UI) · **Track B** (API) · **Track C** (prompts + library content)

### Cursor rules

See [`.cursor/rules/project-rules.md`](./.cursor/rules/project-rules.md).

---

## Tagline

Practice job interviews, pitches, negotiations, and difficult conversations with AI avatars modeled on the people you'll actually face.

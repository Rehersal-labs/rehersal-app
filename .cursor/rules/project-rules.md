# Rehearsal — Cursor Project Rules

Every Cursor task must include:

- **Goal:** one sentence on what this achieves
- **Files to touch:** exact paths only (no globs)
- **Acceptance criteria:** how to verify it works
- **Do NOT:** scope guard

## Never

- Give Cursor broad prompts like "build the app"
- Invent API endpoints not in `docs/API_SPEC.md`
- Invent Beyond Presence endpoints not in official BP docs
- Mix unrelated changes in one prompt
- Skip TypeScript types
- Commit non-working code
- Expose `SUPABASE_SERVICE_ROLE_KEY`, `BEY_API_KEY`, or `OPENAI_API_KEY` to the browser

## Always

- One route, one component, or one function per Cursor prompt
- Use exact file paths from `docs/REPO_STRUCTURE.md`
- Import types from `types/index.ts`
- Import schemas from `lib/schemas.ts`
- Validate API request bodies with Zod
- Check user session before any DB operation
- Use server components by default; client only when needed
- Use `createServiceClient()` only in API routes
- Commit after every working vertical slice
- Read `docs/SAFETY.md` for any AI/evaluator/avatar work

## Planning docs

All product/architecture specs live in `/docs`. Do not duplicate specs in code comments.

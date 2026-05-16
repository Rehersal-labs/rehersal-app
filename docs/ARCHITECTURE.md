# Rehearsal — System Architecture

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5.x strict |
| Styling | Tailwind CSS 3.x + shadcn/ui |
| Database | Supabase (Postgres) |
| Vector | pgvector via Supabase |
| AI | OpenAI (gpt-4o, text-embedding-3-small) |
| Avatar | Beyond Presence Managed Agents |
| Scraping | Native fetch + Cheerio + Jina Reader + manual paste |
| File parsing | pdf-parse + mammoth |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Data fetching | TanStack Query v5 |
| Auth | Supabase Auth (Google + magic link) |
| Deploy | Vercel |

**Do NOT use:** Stripe, Anthropic, Pinecone, Firecrawl, separate Node backend, MongoDB, Express.

---

## High-Level Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js App Router                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │ (auth) pages │  │ (app) pages  │  │ API Routes       │ │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘ │
│         │                 │                    │           │
│         └─────────────────┼────────────────────┘           │
│                           │ TanStack Query                  │
└───────────────────────────┼─────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
   Supabase Auth      Supabase Postgres    Supabase Storage
   (sessions)         + pgvector RLS       (documents, PDFs)
        │                   │
        │                   ├── OpenAI (reconstruct, embed, evaluate)
        │                   └── Beyond Presence (live calls, transcript)
```

---

## Core Data Flows

### Target Reconstruction
```
Sources (URL/doc/manual) → scraper/fileParser → raw_text
  → OpenAI + PersonalityJSONSchema → personality_json
  → avatar_brief_template → target_profiles.status = complete
```

### Session Creation
```
scenario + target + documents
  → contextRetriever (embed query, top 5 chunks)
  → avatarBriefBuilder (persona + context + type + difficulty)
  → sessions row + beyondPresence.createCall()
  → join_url to client iframe
```

### Post-Session
```
end session → sync BP messages → session_turns
  → evaluator (EvaluationSchema) → evaluations
  → reportBuilder (FeedbackReportSchema) → feedback_reports
  → session.status = report_ready
```

---

## Supabase Clients

| Client | Key | Usage |
|--------|-----|--------|
| `createBrowserClient()` | anon | Client components |
| `createServerClient()` | anon + cookies | Server components |
| `createServiceClient()` | service role | API routes only — **never in browser** |

---

## Repository Layout

See [REPO_STRUCTURE.md](./REPO_STRUCTURE.md).

---

## Security Model

- **RLS** on all tables; org access via `memberships`  
- **Service role** only in API routes for elevated operations  
- **Secrets** server-side: `SUPABASE_SERVICE_ROLE_KEY`, `BEY_API_KEY`, `OPENAI_API_KEY`  
- **Public**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_APP_URL`

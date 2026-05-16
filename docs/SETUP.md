# Rehearsal — Developer Setup

## Prerequisites

- Node.js 18+  
- npm  
- Supabase account  
- OpenAI API key  
- Beyond Presence account (Managed Agent)  
- Google Cloud project (for OAuth)  

---

## 1. Clone & Install

```bash
git clone https://github.com/Rehersal-labs/rehersal-app.git
cd rehersal-app
npm install
```

---

## 2. Environment Variables

Copy `.env.local.example` to `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Beyond Presence
BEY_API_KEY=
BEY_AGENT_ID=

# OpenAI
OPENAI_API_KEY=

# Optional
RESEND_API_KEY=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
NEXT_PUBLIC_SENTRY_DSN=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Never expose to browser:** `SUPABASE_SERVICE_ROLE_KEY`, `BEY_API_KEY`, `OPENAI_API_KEY`, `RESEND_API_KEY`.

---

## 3. Supabase Setup

1. Create project at [supabase.com](https://supabase.com)  
2. Run migrations from `supabase/migrations/` (001 → 004) via SQL editor or CLI  
3. Enable Auth providers: **Google** + **Email (magic link)**  
4. Create Storage buckets: `documents`, `reports`  
5. Add redirect URLs: `http://localhost:3000/api/auth/callback`, production Vercel URL  

---

## 4. Google OAuth

1. Google Cloud Console → OAuth 2.0 Client  
2. Add authorized redirect URI from Supabase Auth settings  
3. Paste Client ID/Secret into Supabase Auth → Google  

---

## 5. Beyond Presence

1. Create Managed Agent at [bey.dev](https://bey.dev)  
2. Copy `BEY_API_KEY` and `BEY_AGENT_ID`  
3. Run spike test (after `lib/beyondPresence.ts` exists):

```bash
npx tsx scripts/test-bp-call.ts
```

---

## 6. Run Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 7. Seed Data (after migrations)

```bash
npx tsx scripts/seed-library.ts
npx tsx scripts/seed-demo.ts
```

---

## 8. Deploy (Vercel)

1. Import repo from GitHub  
2. Add all env vars from `.env.local.example`  
3. Set `NEXT_PUBLIC_APP_URL` to production URL  
4. Redeploy after env changes  

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| RLS denies insert | Use service client in API routes; check `org_id` on row |
| pgvector error | Run migration 003 before inserting embeddings |
| BP call fails | Verify API key header `x-api-key`, agent ID |
| PDF parse fails | Ensure `pdf-parse` used server-side only |

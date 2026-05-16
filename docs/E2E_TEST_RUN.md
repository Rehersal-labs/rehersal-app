# E2E Test Run — Rehearsal

Use this checklist for a full **end-to-end** test in the browser.

## 0. One-time setup

```bash
# If verify:supabase fails on library columns, run (needs DATABASE_URL in .env.local):
npm run db:pending

npm run wire:check
npm run seed:library    # after DB schema is green
npm run dev
```

Open http://localhost:3000

---

## 1. Auth & onboarding (~2 min)

| Step | Action | Pass? |
|------|--------|-------|
| 1.1 | Sign in (Google or magic link) | ☐ |
| 1.2 | Complete onboarding (solo or team) | ☐ |
| 1.3 | Land on `/dashboard` | ☐ |

---

## 2. Target builder (~5 min)

| Step | Action | Pass? |
|------|--------|-------|
| 2.1 | `/targets/new` → Basics (name, domain) | ☐ |
| 2.2 | Add 1–2 URLs and/or manual description | ☐ |
| 2.3 | Step 3: reconstruction runs (polls every 3s) | ☐ |
| 2.4 | Status becomes **complete**; review personality JSON | ☐ |

---

## 3. Documents (~3 min)

| Step | Action | Pass? |
|------|--------|-------|
| 3.1 | `/documents` → upload a PDF or TXT | ☐ |
| 3.2 | Wait until `embedding_status` = **complete** | ☐ |

---

## 4. Scenario (~2 min)

| Step | Action | Pass? |
|------|--------|-------|
| 4.1 | `/scenarios/new` → pick **complete** target | ☐ |
| 4.2 | Set goal, difficulty, attach embedded docs | ☐ |
| 4.3 | Save scenario | ☐ |

---

## 5. Live session (~5 min)

| Step | Action | Pass? |
|------|--------|-------|
| 5.1 | Scenario detail → **Start rehearsal** → `/scenarios/[id]/start` | ☐ |
| 5.2 | Mic + camera + **consent** checkbox | ☐ |
| 5.3 | **Start session** → BP iframe loads | ☐ |
| 5.4 | Talk ~1–3 min → **End session** | ☐ |
| 5.5 | “Reviewing your session…” → redirect to report | ☐ |

---

## 6. Report (~2 min)

| Step | Action | Pass? |
|------|--------|-------|
| 6.1 | Scores, summary, moments visible | ☐ |
| 6.2 | Rate accuracy (1–5 stars) | ☐ |
| 6.3 | Export PDF | ☐ |

---

## 7. Library (optional)

| Step | Action | Pass? |
|------|--------|-------|
| 7.1 | `/library` shows 15 profiles | ☐ |
| 7.2 | Clone profile → new target | ☐ |

---

## 8. Team mode (optional, second user)

| Step | Action | Pass? |
|------|--------|-------|
| 8.1 | Second account → separate org | ☐ |
| 8.2 | User A cannot see User B data | ☐ |

---

## Wired API flow (reference)

```
POST /api/targets/:id/reconstruct     → personality JSON
POST /api/documents                   → embedDocument (async)
POST /api/scenarios                   → scenario row
POST /api/sessions                    → draft session (created)
POST /api/sessions/:id/start          → BP call + join_url (after consent)
POST /api/sessions/:id/end            → sync + evaluateSession
GET  /api/sessions/:id                → poll until report_ready
GET  /api/reports/:id                 → full report
```

---

## If something fails

| Symptom | Fix |
|---------|-----|
| Reconstruction stuck | Check `GEMINI_API_KEY`, `npm run test:llm` |
| Embed stuck | Storage bucket `documents`; check server logs |
| No join URL | `npm run test:bp`, `BEY_API_KEY`, `BEY_AGENT_ID` |
| No report | Session needs transcript turns; check `/api/sessions/:id/evaluate` logs |
| Library empty | `npm run db:pending` then `npm run seed:library` |

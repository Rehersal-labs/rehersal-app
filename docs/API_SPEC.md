# Rehearsal — API Specification

All routes: validate body with Zod (`lib/schemas.ts`), check auth + org membership, use `createServiceClient()` for DB when bypassing RLS is needed.

**Never return:** `BEY_API_KEY`, `OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

---

## Auth

| Method | Path | Description |
|--------|------|-------------|
| GET/POST | `/api/auth/callback` | Supabase OAuth/magic link callback |

Also: `app/(auth)/callback/route.ts` for App Router auth flow.

---

## Targets

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/targets` | List org targets |
| POST | `/api/targets` | Create target |
| GET | `/api/targets/[id]` | Get target |
| PATCH | `/api/targets/[id]` | Update target |
| DELETE | `/api/targets/[id]` | Delete target |
| POST | `/api/targets/[id]/sources` | Add URL/doc/manual source |
| POST | `/api/targets/[id]/reconstruct` | Trigger async reconstruction |
| GET | `/api/targets/[id]/preview` | Avatar brief preview |

---

## Documents

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/documents` | List user documents |
| POST | `/api/documents` | Upload → extract → embed |
| DELETE | `/api/documents/[id]` | Delete document |
| POST | `/api/documents/embed` | Re-embed all pending |

---

## Company Documents (Team)

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/company-documents` | Org member |
| POST | `/api/company-documents` | Admin/owner only |
| DELETE | `/api/company-documents/[id]` | Admin/owner only |

---

## Scenarios

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/scenarios` | List |
| POST | `/api/scenarios` | Create |
| GET | `/api/scenarios/[id]` | Get |
| PATCH | `/api/scenarios/[id]` | Update |
| DELETE | `/api/scenarios/[id]` | Delete |

---

## Sessions

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/sessions` | List with filters |
| POST | `/api/sessions` | Create session + BP call |
| GET | `/api/sessions/[id]` | Get session |
| POST | `/api/sessions/[id]/end` | End session, sync transcript |
| POST | `/api/sessions/[id]/sync-messages` | Pull transcript from BP |
| POST | `/api/sessions/[id]/evaluate` | Run evaluation (async, 202) |

### POST `/api/sessions` flow

1. Validate user + org  
2. Fetch scenario, target, documents  
3. `contextRetriever` → top 5 chunks  
4. `avatarBriefBuilder` → system prompt  
5. Insert session (`status: created`)  
6. `beyondPresence.createCall()`  
7. Store `bey_call_id`, `join_url`, update `status: ready`  
8. Return `{ sessionId, joinUrl }`  

### POST `/api/sessions/[id]/end` flow

1. Set `ended_at`  
2. `getCallMessages(bey_call_id)` → `session_turns`  
3. `status: evaluating`  
4. Trigger evaluate async → client polls until `report_ready`  

---

## Reports

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/reports/[id]` | Full report JSON |
| POST | `/api/reports/[id]/pdf` | Generate PDF → Storage |
| POST | `/api/reports/[id]/rate-accuracy` | Submit 1–5 rating |

---

## Library

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/library` | Browse with filters |
| GET | `/api/library/[id]` | Detail |
| POST | `/api/library/[id]/clone` | Clone to workspace |

---

## Team / Admin

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/admin/sessions` | Coach/owner |
| GET | `/api/admin/team-report` | Coach/owner |
| GET | `/api/assignments` | Org member |
| POST | `/api/assignments` | Coach |
| POST | `/api/coach-comments` | Coach |

---

## Webhooks

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/webhooks/beyond-presence` | BP event handler |

---

## Rate Limiting

Apply `lib/rateLimit.ts` on: reconstruct, embed, sessions create, evaluate, PDF generate.

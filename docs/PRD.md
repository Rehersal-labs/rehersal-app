# Rehearsal — Product Requirements Document

**Tagline:** Have the conversation before you have it.  
**Powered by:** [Beyond Presence](https://bey.dev) (real-time avatar API)

---

## 1. Product Overview

Rehearsal is a web application where users practice high-stakes conversations with AI avatars. The avatar is a digital twin of the actual person the user is about to face — reconstructed from public sources (LinkedIn, podcasts, articles) plus user-uploaded context (resume, deck, notes). After the session, the user receives a feedback report specific to that target.

### Core Loop

```
Build target profile → Upload context → Configure scenario → Run live avatar session → Receive feedback report → Track progress
```

---

## 2. User Modes

| Mode | Description |
|------|-------------|
| **Solo** | Individual users practicing their own conversations. Private workspace. |
| **Team** | Organizations with shared company context, coaches who assign scenarios, learners who complete them. |

**Rule:** Both modes are equal. Team mode **adds** features (assignments, coach view, shared docs). It never restricts what individuals can do.

---

## 3. Conversation Types (10)

1. Job Interview  
2. Fundraising Pitch  
3. Sales Discovery  
4. Difficult Conversation  
5. Negotiation  
6. Deposition / Legal Prep  
7. Media / Podcast Interview  
8. Board Meeting  
9. Personal Conversation  
10. Custom  

---

## 4. Features (MVP)

### F1 — Target Profile Builder
- Inputs: URLs, PDF/DOCX uploads, manual text
- Pipeline: scrape → concatenate → OpenAI reconstruction → `personality_json` + `avatar_brief_template`
- UI: 4-step builder (Basics → Sources → Reconstruction → Review)

### F2 — User Context Engine
- Upload PDF/DOCX → extract → chunk (512 tokens, 50 overlap) → embed → pgvector
- Retrieval: top 5 chunks injected into avatar system prompt at session start

### F3 — Shared Company Context (Team only)
- Admin uploads org-wide documents; coaches/learners read only

### F4 — Scenario Configurator
- 10 conversation types, target picker, duration 5–30 min, difficulty 1–5, goal, document multi-select, avatar brief preview
- Team coach: assign to learners + due date

### F5 — Live Avatar Session
- Pre-session checklist (mic, camera, consent)
- Beyond Presence iframe session
- End → transcript sync → evaluation → report

### F6 — Feedback Report
- Scores, executive summary, best/weak moments, missed signals, delivery metrics, transcript, accuracy rating, PDF export

### F7 — Progress Dashboard
- Metrics, improvement chart, skill radar, session history, per-target scores
- Team coach: My Progress / Team Progress toggle

### F8 — Public Figure Library
- 15 cloneable archetypes (10 professional + 5 personal)
- Browse, filter, clone to workspace

### F9 — Solo Dashboard
- Greeting, stats, action cards, continue sessions, targets grid, recommendations, weekly heatmap

### F10 — Team Coach Dashboard
- Solo dashboard + team pulse band

### F11 — Assignments
- Coach: create/manage assignments  
- Learner: inbox with Start button

### F12 — Admin Team View
- Member table, skill gaps, team reports

### F13 — Settings
- Solo: General, Account, Data  
- Team: General, Team, Data, Account (invites, roles)

### F14 — Authentication & Onboarding
- Google OAuth + magic link
- 5-step onboarding (intent, workspace, use case, starter target, team invites)

---

## 5. Out of Scope (MVP)

- Stripe / payments / billing  
- Landing / marketing / pricing pages  
- Subscription plans, usage quotas, waitlist  
- Mobile app, SSO/SAML, LMS/CRM integrations  
- Speech-to-video custom pipeline, facial emotion analysis  
- Automated hiring decisions, public API  
- In-app notification system (toast only)

---

## 6. Success Criteria

See [SUCCESS_CRITERIA.md](./SUCCESS_CRITERIA.md) for the full checklist.

---

## 7. Safety (Non-Negotiable)

See [SAFETY.md](./SAFETY.md).

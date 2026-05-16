# Rehearsal — AI Prompts Reference

All prompt templates live in `lib/prompts.ts`. Version changes should update `evaluations.prompt_version`.

---

## 1. Reconstruction Prompt

**Input:** Concatenated `raw_text` from sources with labels.  
**Model:** gpt-4o (JSON mode)  
**Output:** `PersonalityJSONSchema`

**Rules:**
- Cite `source_citations` per field  
- Mark `confidence` per field (`high` | `medium` | `low`)  
- Never invent high-confidence facts from weak sources  
- Output **only** valid JSON — no markdown, no preamble  

**Fields:** See `docs/DATABASE_SCHEMA.md` → Personality JSON.

---

## 2. Avatar System Prompts (10 types)

**Export:** `AVATAR_PROMPTS[conversation_type]`

Each template composes:
- Persona block (from `personality_json` + `avatar_brief_template`)  
- Behavior rules (one question at a time, in character, no rubric reveal, no coaching)  
- Type-specific instructions  
- `DIFFICULTY_MODIFIERS[level]` (1–5)  
- Forbidden topics  
- Duration instructions  

| Type | Behavior focus |
|------|----------------|
| `job_interview` | Behavioral STAR questions |
| `fundraising_pitch` | Unit economics, market wedge |
| `sales_discovery` | Pain, budget, timeline |
| `difficult_conversation` | Direct but controlled |
| `negotiation` | Trade-offs, anchoring |
| `deposition` | Precise, adversarial follow-ups |
| `media_interview` | Sound bites, bridging |
| `board_meeting` | Strategic, governance-aware |
| `personal_conversation` | Emotional nuance, careful boundaries |
| `custom` | User goal-driven |

---

## 3. Difficulty Modifiers (1–5)

| Level | Label | Behavior |
|-------|-------|----------|
| 1 | Patient | Supportive, lets user finish |
| 2 | Conversational | Light follow-ups |
| 3 | Standard | Professional pacing |
| 4 | Demanding | Probes weakness, interrupts vagueness |
| 5 | Intense | Uncomfortable silences, skeptical |

---

## 4. Evaluator Prompt

**Input:** Transcript (timestamped), target personality, scenario, user context chunks.  
**Output:** `EvaluationSchema`

**Safety rules (in prompt):**
- NEVER hire/no-hire  
- NEVER infer protected traits, honesty, intelligence, mental health  
- NEVER reference age, gender, race, religion, disability, family status  
- Score only **observable** behavior with transcript evidence  

**Post-process:** Run forbidden-phrase scan before DB save.

---

## 5. Report Builder Prompt

**Input:** Evaluation JSON + user document vocabulary.  
**Output:** `FeedbackReportSchema`

Expands into: executive summary, formatted moments, suggested answers (using user's actual doc words), communication notes.

---

## 6. Avatar Brief Generator

**Input:** `personality_json`  
**Output:** 3–4 sentence `avatar_brief_template` for system prompt composition.

---

## Testing

Test each prompt in OpenAI Playground with realistic inputs before merging. Log `prompt_version` on each evaluation row.

See [SAFETY.md](./SAFETY.md).

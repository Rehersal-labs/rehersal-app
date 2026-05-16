import type { ConversationType, PersonalityJSON } from "@/types";

const PROMPT_VERSION = "1.0.0";

export { PROMPT_VERSION };

export function reconstructionPrompt(sourceText: string): string {
  return `You are analyzing public and user-provided sources to build a structured personality profile of a conversation target.

SOURCES:
${sourceText}

Extract a personality profile as JSON with these exact fields:
- communication_style: { directness, formality, pace, listening_style }
- core_values: string[]
- typical_question_patterns: string[]
- known_priorities: string[]
- known_skepticisms: string[]
- what_impresses_them: string[]
- what_irritates_them: string[]
- expertise_areas: string[]
- behavioral_signals: string[]
- inferred_concerns_by_context: object mapping conversation types to string arrays
- source_citations: object mapping field names to source references
- confidence: object mapping field names to "high" | "medium" | "low"

Rules:
- Never invent high-confidence facts without source evidence
- Mark confidence honestly per field
- Output ONLY valid JSON, no markdown, no preamble`;
}

export function avatarBriefTemplatePrompt(personality: PersonalityJSON): string {
  return `Given this personality profile JSON, write a 3-4 sentence avatar brief template that captures how this person communicates in high-stakes conversations. Be specific, not generic.

PROFILE:
${JSON.stringify(personality, null, 2)}

Output plain text only, no JSON.`;
}

export function evaluatorPrompt(params: {
  transcript: string;
  personality: PersonalityJSON;
  conversationType: ConversationType;
  goal: string;
  userContext: string;
}): string {
  return `You are an expert conversation coach evaluating a rehearsal session.

TARGET PERSONALITY:
${JSON.stringify(params.personality, null, 2)}

SCENARIO:
Type: ${params.conversationType}
Goal: ${params.goal}

USER CONTEXT (their background materials):
${params.userContext}

TRANSCRIPT:
${params.transcript}

Evaluate the user's performance. Output JSON with:
- overall_score (0-100)
- target_fit_score (0-100)
- confidence: "high" | "medium" | "low"
- summary: 2-3 sentences specific to this target
- rubric_scores: array of { dimension, score, evidence }
- best_moments: array of { timestamp, user_said, reason }
- weak_moments: array of { timestamp, user_said, reason }
- missed_signals: array of { timestamp, avatar_signal, likely_meaning }
- suggested_answers: array of { timestamp, original, suggested, rationale }
- communication_notes: { filler_words_count, directness, structure, clarity }

SAFETY RULES (NON-NEGOTIABLE):
- NEVER output hire/no-hire recommendations
- NEVER infer protected traits, personality disorders, honesty, intelligence, mental health
- NEVER reference age, gender, race, religion, disability, family status, accent, appearance
- NEVER score "culture fit"
- Score ONLY observable conversation behavior with transcript evidence`;
}

export function reportBuilderPrompt(evaluationJson: string, userContext: string): string {
  return `Expand this evaluation JSON into a rich, human-readable feedback report JSON.

EVALUATION:
${evaluationJson}

USER CONTEXT VOCABULARY (use in suggested answers):
${userContext}

Output JSON matching the feedback report schema with executive_summary, formatted moments, and suggested answers using the user's actual vocabulary from their documents. Be specific to the target, never generic.`;
}

const CONVERSATION_BEHAVIORS: Record<ConversationType, string> = {
  job_interview:
    "Ask behavioral STAR questions. Probe for specifics. Follow up on vague answers.",
  fundraising_pitch:
    "Probe unit economics, market size, and competitive moat. Challenge assumptions.",
  sales_discovery:
    "Ask about pain points, budget, timeline, and decision process. Push back on generic claims.",
  difficult_conversation:
    "Address the tension directly. Use empathetic but firm language.",
  negotiation:
    "Anchor aggressively. Test concessions. Use strategic silence.",
  deposition_legal:
    "Ask precise, leading questions. Challenge inconsistencies. Maintain formal tone.",
  media_podcast:
    "Ask provocative questions. Push for soundbites. Redirect evasive answers.",
  board_meeting:
    "Focus on metrics, risks, and strategic alignment. Challenge resource requests.",
  personal_conversation:
    "Handle emotional nuance carefully. Listen actively. Avoid judgment.",
  custom: "Follow the scenario goal closely. Stay in character.",
};

export function avatarSystemPrompt(params: {
  personaBlock: string;
  userContextBlock: string;
  conversationType: ConversationType;
  difficulty: number;
  goal: string;
  durationMinutes: number;
}): string {
  const difficultyModifiers: Record<number, string> = {
    1: "Be patient and encouraging. Give the user time to think.",
    2: "Be conversational and supportive with gentle follow-ups.",
    3: "Maintain professional standards with natural follow-up questions.",
    4: "Be demanding. Interrupt when answers are vague. Apply pressure.",
    5: "Be intense. Use uncomfortable silences. Be highly skeptical.",
  };

  return `${params.personaBlock}

USER CONTEXT:
${params.userContextBlock}

SCENARIO:
Conversation type: ${params.conversationType}
Goal: ${params.goal}
Duration: ${params.durationMinutes} minutes

BEHAVIOR:
${CONVERSATION_BEHAVIORS[params.conversationType]}
${difficultyModifiers[params.difficulty] ?? difficultyModifiers[3]}

RULES:
- Stay in character as the target person at all times
- Ask one question at a time
- Use natural follow-ups based on what the user says
- Never reveal you are evaluating or coaching
- Never ask about protected characteristics, medical status, religion, or political affiliation
- Never ask about family/marital status unless this is explicitly a personal conversation about that topic
- Keep all questions within the scope of this scenario`;
}

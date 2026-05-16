import type { BeyCall, BeyMessage } from "@/types";

const BP_BASE_URL = "https://api.bey.dev/v1";

function getApiKey(): string {
  const key = process.env.BEY_API_KEY;
  if (!key) throw new Error("Missing BEY_API_KEY");
  return key;
}

function getAgentId(): string {
  const id = process.env.BEY_AGENT_ID;
  if (!id) throw new Error("Missing BEY_AGENT_ID");
  return id;
}

async function bpFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BP_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": getApiKey(),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Beyond Presence API error ${res.status}: ${body}`);
  }

  return res.json() as Promise<T>;
}

export interface CreateCallParams {
  agentId?: string;
  userName: string;
  systemPromptOverride: string;
  tags?: string[];
}

export async function createCall(params: CreateCallParams): Promise<BeyCall> {
  const agentId = params.agentId ?? getAgentId();
  const data = await bpFetch<{
    id: string;
    join_url: string;
    livekit_url?: string;
    livekit_token?: string;
    agent_id: string;
  }>("/calls", {
    method: "POST",
    body: JSON.stringify({
      agent_id: agentId,
      user_name: params.userName,
      system_prompt_override: params.systemPromptOverride,
      tags: params.tags ?? [],
    }),
  });

  return {
    id: data.id,
    join_url: data.join_url,
    livekit_url: data.livekit_url,
    livekit_token: data.livekit_token,
    agent_id: data.agent_id,
  };
}

export async function getCallMessages(callId: string): Promise<BeyMessage[]> {
  const data = await bpFetch<{ messages: BeyMessage[] }>(
    `/calls/${callId}/messages`
  );
  return data.messages ?? [];
}

export async function endCall(callId: string): Promise<void> {
  await bpFetch(`/calls/${callId}/end`, { method: "POST" });
}

export async function updateAgent(
  agentId: string,
  systemPrompt: string
): Promise<void> {
  await bpFetch(`/agents/${agentId}`, {
    method: "PATCH",
    body: JSON.stringify({ system_prompt: systemPrompt }),
  });
}

import { jsonError, jsonOk } from "@/lib/api/http";
import { createServiceSupabaseClient } from "@/lib/db";

export async function POST(request: Request) {
  // BEY_WEBHOOK_SECRET is required in production to prevent spoofed events.
  const secret = process.env.BEY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[webhook/beyond-presence] BEY_WEBHOOK_SECRET is not configured — rejecting all webhook events");
    return jsonError("Webhook not configured", 503);
  }

  const signature = request.headers.get("x-bey-signature");
  if (!signature || signature !== secret) {
    return jsonError("Invalid webhook signature", 401);
  }

  let payload: {
    event?: string;
    call_id?: string;
    data?: { call_id?: string };
  };

  try {
    payload = await request.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const callId = payload.call_id ?? payload.data?.call_id;
  if (!callId) {
    return jsonOk({ received: true });
  }

  const supabase = createServiceSupabaseClient();
  const { data: session } = await supabase
    .from("sessions")
    .select("id, status")
    .eq("bey_call_id", callId)
    .maybeSingle();

  if (!session) {
    // Unknown call ID — acknowledge without error (may be from a different env)
    return jsonOk({ received: true });
  }

  if (payload.event === "call.ended" || payload.event === "call_ended") {
    if (session.status === "live" || session.status === "ready") {
      await supabase
        .from("sessions")
        .update({
          status: "ended",
          ended_at: new Date().toISOString(),
        })
        .eq("id", session.id);
    }
  }

  if (payload.event === "call.started" || payload.event === "call_started") {
    await supabase
      .from("sessions")
      .update({ status: "live" })
      .eq("id", session.id);
  }

  return jsonOk({ received: true });
}

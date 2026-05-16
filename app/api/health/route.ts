import { jsonOk } from "@/lib/api/http";

export async function GET() {
  return jsonOk({ status: "ok", service: "rehearsal-api" });
}

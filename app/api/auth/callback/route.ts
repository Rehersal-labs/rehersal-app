import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/db";
import { provisionNewUser } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (!code) {
    return NextResponse.redirect(`${origin}/signin?error=auth`);
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/signin?error=auth`);
  }

  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!existingUser) {
    await provisionNewUser({
      userId: data.user.id,
      email: data.user.email ?? "",
      name: data.user.user_metadata?.full_name,
      avatarUrl: data.user.user_metadata?.avatar_url,
    });
  }

  return NextResponse.redirect(`${origin}${next}`);
}

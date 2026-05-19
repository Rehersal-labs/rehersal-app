import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { provisionNewUser } from "@/lib/auth";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase-env";

/**
 * OAuth / magic-link callback — uses getAll/setAll so session cookies persist on redirect.
 */
export async function handleAuthCallback(request: NextRequest): Promise<NextResponse> {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const oauthError =
    requestUrl.searchParams.get("error_description") ??
    requestUrl.searchParams.get("error");
  const nextParam = requestUrl.searchParams.get("next");

  const appUrl = (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    requestUrl.origin
  );

  const fail = (reason: string) =>
    NextResponse.redirect(
      `${appUrl}/signin?error=auth&reason=${encodeURIComponent(reason)}`
    );

  if (oauthError) return fail(oauthError);
  if (!code) return fail("no_code");

  // Guard: env vars missing → show clear error instead of 500
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return fail("missing_supabase_env_vars");
  }

  const cookieStore = cookies();
  const supabase = createServerClient(
    supabaseUrl.replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, ""),
    supabaseAnonKey,
    {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback] exchangeCodeForSession:", error.message);
    return fail(error.message);
  }

  if (!data.user) return fail("no_user");

  let isNewUser = false;
  try {
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("id", data.user.id)
      .maybeSingle();

    if (!existingUser) {
      isNewUser = true;
      await provisionNewUser({
        userId: data.user.id,
        email: data.user.email ?? "",
        name: data.user.user_metadata?.full_name as string | undefined,
        avatarUrl: data.user.user_metadata?.avatar_url as string | undefined,
      });
    }
  } catch (e) {
    const msg =
      e instanceof Error
        ? e.message
        : (e as { message?: string })?.message ?? "provision_failed";
    console.error("[auth/callback] provision error:", msg, e);
    return fail(msg);
  }

  const next =
    nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : isNewUser
        ? "/onboarding"
        : "/dashboard";

  return NextResponse.redirect(`${appUrl}${next}`);
}

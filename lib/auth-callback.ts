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

  const fail = (reason: string) =>
    NextResponse.redirect(
      `${requestUrl.origin}/signin?error=auth&reason=${encodeURIComponent(reason)}`
    );

  if (oauthError) return fail(oauthError);
  if (!code) return fail("no_code");

  const cookieStore = cookies();
  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
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
    console.error("[auth/callback] provision:", e);
    return fail(e instanceof Error ? e.message : "provision_failed");
  }

  const next =
    nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : isNewUser
        ? "/onboarding"
        : "/dashboard";

  return NextResponse.redirect(`${requestUrl.origin}${next}`);
}

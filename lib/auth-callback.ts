import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { provisionNewUser } from "@/lib/auth";

export async function handleAuthCallback(request: NextRequest): Promise<NextResponse> {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    `https://${request.headers.get("host") ?? "localhost:3000"}`;

  const fail = (reason: string) => {
    console.error("[callback] fail:", reason);
    return NextResponse.redirect(
      `${appUrl}/signin?error=auth&reason=${encodeURIComponent(reason)}`
    );
  };

  try {
    const code = request.nextUrl.searchParams.get("code");
    const oauthError =
      request.nextUrl.searchParams.get("error_description") ??
      request.nextUrl.searchParams.get("error");
    const nextParam = request.nextUrl.searchParams.get("next");

    if (oauthError) return fail(oauthError);
    if (!code) return fail("no_code");

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl) return fail("missing_NEXT_PUBLIC_SUPABASE_URL");
    if (!supabaseAnonKey) return fail("missing_NEXT_PUBLIC_SUPABASE_ANON_KEY");

    const cleanUrl = supabaseUrl.replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "");

    // Collect cookies Supabase wants to set, apply them to the final response
    const pendingCookies: Array<{ name: string; value: string; options: CookieOptions }> = [];

    const supabase = createServerClient(cleanUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach((c) => pendingCookies.push(c));
        },
      },
    });

    const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

    if (sessionError) {
      console.error("[callback] exchangeCodeForSession:", sessionError.message);
      return fail(`session_error__${sessionError.message.replace(/\s+/g, "_").slice(0, 60)}`);
    }

    if (!data?.user) return fail("no_user");

    // Check if user already has a profile
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("id", data.user.id)
      .maybeSingle();

    let isNewUser = false;
    if (!existingUser) {
      isNewUser = true;
      if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return fail("missing_SUPABASE_SERVICE_ROLE_KEY");
      }
      await provisionNewUser({
        userId: data.user.id,
        email: data.user.email ?? "",
        name: data.user.user_metadata?.full_name as string | undefined,
        avatarUrl: data.user.user_metadata?.avatar_url as string | undefined,
      });
    }

    const dest =
      nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
        ? nextParam
        : isNewUser
          ? "/onboarding"
          : "/dashboard";

    // Build redirect and stamp all session cookies onto it
    const response = NextResponse.redirect(`${appUrl}${dest}`);
    pendingCookies.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options);
    });
    return response;

  } catch (e) {
    const msg =
      e instanceof Error
        ? e.message
        : typeof e === "object" && e !== null && "message" in e
          ? String((e as { message: unknown }).message)
          : "unknown_error";
    console.error("[callback] unhandled:", msg, e);
    return fail(`error__${msg.replace(/\s+/g, "_").slice(0, 80)}`);
  }
}

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
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
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const oauthError =
      requestUrl.searchParams.get("error_description") ??
      requestUrl.searchParams.get("error");
    const nextParam = requestUrl.searchParams.get("next");

    if (oauthError) return fail(oauthError);
    if (!code) return fail("no_code");

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl) return fail("missing_NEXT_PUBLIC_SUPABASE_URL");
    if (!supabaseAnonKey) return fail("missing_NEXT_PUBLIC_SUPABASE_ANON_KEY");

    const cleanUrl = supabaseUrl.replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "");

    const cookieStore = cookies();
    const supabase = createServerClient(cleanUrl, supabaseAnonKey, {
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

    const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

    if (sessionError) {
      console.error("[callback] exchangeCodeForSession:", sessionError.message);
      return fail(`session_${sessionError.message.replace(/\s+/g, "_").slice(0, 60)}`);
    }

    if (!data?.user) return fail("no_user");

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("id", data.user.id)
      .maybeSingle();

    let isNewUser = false;
    if (!existingUser) {
      isNewUser = true;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!serviceKey) return fail("missing_SUPABASE_SERVICE_ROLE_KEY");

      await provisionNewUser({
        userId: data.user.id,
        email: data.user.email ?? "",
        name: data.user.user_metadata?.full_name as string | undefined,
        avatarUrl: data.user.user_metadata?.avatar_url as string | undefined,
      });
    }

    const next =
      nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
        ? nextParam
        : isNewUser
          ? "/onboarding"
          : "/dashboard";

    return NextResponse.redirect(`${appUrl}${next}`);

  } catch (e) {
    const msg =
      e instanceof Error
        ? e.message
        : typeof e === "object" && e !== null && "message" in e
          ? String((e as { message: unknown }).message)
          : "unknown_error";
    console.error("[callback] unhandled:", msg, e);
    return fail(`error_${msg.replace(/\s+/g, "_").slice(0, 80)}`);
  }
}

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Routes the middleware never touches — no auth check, no redirect possible
const PUBLIC_PATHS = ["/", "/signin", "/callback", "/api/auth/callback"];

function isAuthDisabled(): boolean {
  return process.env.DISABLE_AUTH === "true";
}

function getSupabaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return raw.replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "");
}

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Never touch public auth paths — prevents any possible redirect loop
  if (isPublicPath(pathname)) {
    return NextResponse.next({ request: { headers: request.headers } });
  }

  // Dev auth bypass — skip Supabase entirely
  if (isAuthDisabled()) {
    return NextResponse.next({ request: { headers: request.headers } });
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    getSupabaseUrl(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Use nextUrl.clone() so Railway's proxy host is preserved correctly
    const signInUrl = request.nextUrl.clone();
    signInUrl.pathname = "/signin";
    signInUrl.search = "";
    if (pathname !== "/") {
      signInUrl.searchParams.set("next", pathname);
    }
    return NextResponse.redirect(signInUrl);
  }

  return response;
}

export const config = {
  matcher: [
    // Skip: static files, images, fonts, favicon, AND auth pages
    "/((?!_next/static|_next/image|favicon.ico|signin|callback|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)$).*)",
  ],
};

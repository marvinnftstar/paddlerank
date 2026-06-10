import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { checkWaitlistAccess } from "@/lib/waitlistAccess";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const protectedPaths = ["/dashboard", "/profile"];

function isProtectedPath(pathname: string) {
  return protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export async function updateSupabaseSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({
          request,
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user && isProtectedPath(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = pathname.startsWith("/profile")
      ? "/login"
      : "/early-access";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isProtectedPath(pathname)) {
    const access = await checkWaitlistAccess(supabase, user, "middleware");

    if (!access.isApproved) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/early-access";
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (user && pathname === "/login") {
    const access = await checkWaitlistAccess(supabase, user, "middleware");
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = access.isApproved ? "/dashboard" : "/early-access";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

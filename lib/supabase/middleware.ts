import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function updateSupabaseSession(request: NextRequest) {
  const startedAt = Date.now();
  const { pathname } = request.nextUrl;

  function finish(response: NextResponse, result: string) {
    console.log("[PaddleRank auth timing]", {
      source: "middleware",
      pathname,
      result,
      duration_ms: Date.now() - startedAt,
    });
    return response;
  }

  let response = NextResponse.next({
    request,
  });

  if (!supabaseUrl || !supabaseAnonKey) {
    return finish(response, "supabase-not-configured");
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

  if (!user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = pathname.startsWith("/profile")
      ? "/login"
      : "/early-access";
    redirectUrl.search = "";
    return finish(NextResponse.redirect(redirectUrl), "signed-out");
  }

  return finish(response, "signed-in");
}

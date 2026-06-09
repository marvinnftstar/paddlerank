import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { checkWaitlistAccess } from "@/lib/waitlistAccess";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextParam = requestUrl.searchParams.get("next") || "/dashboard";
  const next =
    nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/dashboard";

  function redirectToLogin(errorMessage: string) {
    const loginUrl = new URL("/login", requestUrl.origin);
    loginUrl.searchParams.set("error", errorMessage);
    return NextResponse.redirect(loginUrl);
  }

  if (!code) {
    return redirectToLogin("Google login did not return an auth code.");
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return redirectToLogin("Supabase is not connected yet.");
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return redirectToLogin("Google login failed. Please try again.");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirectToLogin("Google login failed. Please try again.");
  }

  const access = await checkWaitlistAccess(supabase, user, "auth-callback");

  if (!access.isApproved) {
    return NextResponse.redirect(new URL("/early-access", requestUrl.origin));
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}

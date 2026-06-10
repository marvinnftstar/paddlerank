import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { checkWaitlistAccess } from "@/lib/waitlistAccess";

export async function GET(request: NextRequest) {
  const startedAt = Date.now();
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextParam = requestUrl.searchParams.get("next") || "/dashboard";
  const next =
    nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/dashboard";

  function finish(response: NextResponse, result: string) {
    console.log("[PaddleRank auth timing]", {
      source: "auth-callback",
      result,
      duration_ms: Date.now() - startedAt,
    });
    return response;
  }

  function redirectToLogin(errorMessage: string) {
    const loginUrl = new URL("/login", requestUrl.origin);
    loginUrl.searchParams.set("error", errorMessage);
    return NextResponse.redirect(loginUrl);
  }

  if (!code) {
    return finish(
      redirectToLogin("Google login did not return an auth code."),
      "missing-code",
    );
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return finish(
      redirectToLogin("Supabase is not connected yet."),
      "supabase-not-configured",
    );
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return finish(
      redirectToLogin("Google login failed. Please try again."),
      "session-exchange-failed",
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return finish(
      redirectToLogin("Google login failed. Please try again."),
      "user-validation-failed",
    );
  }

  const access = await checkWaitlistAccess(supabase, user, "auth-callback");

  if (!access.isApproved) {
    return finish(
      NextResponse.redirect(new URL("/early-access", requestUrl.origin)),
      "access-denied",
    );
  }

  return finish(
    NextResponse.redirect(new URL(next, requestUrl.origin)),
    "access-approved",
  );
}

"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type LoginFormProps = {
  initialErrorMessage?: string;
};

export function LoginForm({ initialErrorMessage = "" }: LoginFormProps) {
  const [errorMessage, setErrorMessage] = useState(initialErrorMessage);
  const [isLoading, setIsLoading] = useState(false);

  async function handleGoogleLogin() {
    setErrorMessage("");
    setIsLoading(true);

    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      setErrorMessage(
        "Supabase is not connected yet. Add your public Supabase keys, then restart the app.",
      );
      setIsLoading(false);
      return;
    }

    const redirectTo = `${window.location.origin}/auth/callback?next=/dashboard`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full rounded-3xl border border-court-teal/20 bg-white p-5 shadow-glow sm:p-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-court-ocean">
          Player login
        </p>
        <h1 className="mt-3 text-3xl font-black text-court-navy sm:whitespace-nowrap">
          Continue to PaddleRank.
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Sign in with Google to access your protected dashboard.
        </p>
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-court-mint px-6 py-3 text-sm font-black text-white transition hover:bg-court-ocean disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Opening Google..." : "Continue with Google"}
      </button>

      {errorMessage ? (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {errorMessage}
        </p>
      ) : null}

      <p className="mt-4 text-center text-xs leading-5 text-slate-500">
        Sign in securely with Google to continue.
      </p>
    </div>
  );
}

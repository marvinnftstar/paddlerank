"use client";

import { FormEvent, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

type FormStatus = {
  type: "success" | "error";
  message: string;
} | null;

const skillLevels = ["Beginner", "Intermediate", "Advanced", "Competitive"];
const playTypes = ["Singles", "Doubles", "Both singles and doubles"];

function getFriendlySupabaseError(error: { code?: string; message?: string }) {
  const message = error.message?.toLowerCase() || "";

  if (error.code === "23505") {
    return "This email is already on the PaddleRank waitlist.";
  }

  if (message.includes("row-level security") || error.code === "42501") {
    return "Supabase is blocking signups. Please run the row level security policy from supabase/schema.sql.";
  }

  if (message.includes("relation") && message.includes("does not exist")) {
    return "The waitlist_signups table does not exist yet. Please run the SQL in supabase/schema.sql.";
  }

  if (message.includes("invalid api key") || message.includes("jwt")) {
    return "The Supabase key looks incorrect. Please check NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.";
  }

  return `Supabase error: ${error.message || "Please check your Supabase table and policies."}`;
}

export function WaitlistForm() {
  const [status, setStatus] = useState<FormStatus>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    setIsSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") || "").trim().toLowerCase();

    const signup = {
      full_name: String(formData.get("full_name") || "").trim(),
      email,
      city_province: String(formData.get("city_province") || "").trim(),
      skill_level: String(formData.get("skill_level") || ""),
      preferred_play_type: String(formData.get("preferred_play_type") || ""),
      message: String(formData.get("message") || "").trim(),
    };

    if (!signup.full_name || !signup.email) {
      setStatus({
        type: "error",
        message: "Please add your full name and email address.",
      });
      setIsSubmitting(false);
      return;
    }

    const supabase = getSupabaseClient();

    if (!supabase) {
      setStatus({
        type: "error",
        message:
          "Supabase is not connected yet. Add your keys to .env.local, then restart the app.",
      });
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase.from("waitlist_signups").insert(signup);

    if (error) {
      // This logs the technical detail in the browser console without showing private keys.
      console.error("PaddleRank waitlist signup error:", error);

      setStatus({
        type: "error",
        message: getFriendlySupabaseError(error),
      });
      setIsSubmitting(false);
      return;
    }

    form.reset();
    setStatus({
      type: "success",
      message:
        "You're on the PaddleRank waitlist! We'll notify you when early access opens.",
    });
    setIsSubmitting(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-court-teal/20 bg-white p-5 shadow-glow sm:p-6"
    >
      <div>
        <h2 className="text-2xl font-black text-court-navy">
          Join the waitlist
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Tell us where you play and how you compete. Fields marked with * are
          required.
        </p>
        <p className="mt-4 rounded-2xl border border-court-green/50 bg-court-green/15 px-4 py-3 text-sm font-black text-court-navy">
          <span className="text-court-mint">Limited early access:</span> First
          100 registered players only.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className="text-sm font-semibold text-court-navy">
            Full Name *
          </span>
          <input
            name="full_name"
            type="text"
            required
            placeholder="Juan Dela Cruz"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-court-mist px-4 py-3 text-court-navy outline-none transition placeholder:text-slate-400 focus:border-court-mint focus:bg-white"
          />
        </label>

        <label className="sm:col-span-2">
          <span className="text-sm font-semibold text-court-navy">
            Email Address *
          </span>
          <input
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-court-mist px-4 py-3 text-court-navy outline-none transition placeholder:text-slate-400 focus:border-court-mint focus:bg-white"
          />
        </label>

        <label>
          <span className="text-sm font-semibold text-court-navy">
            City / Province
          </span>
          <input
            name="city_province"
            type="text"
            placeholder="Metro Manila"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-court-mist px-4 py-3 text-court-navy outline-none transition placeholder:text-slate-400 focus:border-court-mint focus:bg-white"
          />
        </label>

        <label>
          <span className="text-sm font-semibold text-court-navy">
            Skill Level
          </span>
          <select
            name="skill_level"
            defaultValue=""
            className="mt-2 w-full rounded-xl border border-slate-200 bg-court-mist px-4 py-3 text-court-navy outline-none transition focus:border-court-mint focus:bg-white"
          >
            <option value="" disabled>
              Select level
            </option>
            {skillLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </label>

        <label className="sm:col-span-2">
          <span className="text-sm font-semibold text-court-navy">
            Preferred Play Type
          </span>
          <select
            name="preferred_play_type"
            defaultValue=""
            className="mt-2 w-full rounded-xl border border-slate-200 bg-court-mist px-4 py-3 text-court-navy outline-none transition focus:border-court-mint focus:bg-white"
          >
            <option value="" disabled>
              Select play type
            </option>
            {playTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label className="sm:col-span-2">
          <span className="text-sm font-semibold text-court-navy">
            Optional Message
          </span>
          <textarea
            name="message"
            rows={4}
            placeholder="What should PaddleRank help you track first?"
            className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-court-mist px-4 py-3 text-court-navy outline-none transition placeholder:text-slate-400 focus:border-court-mint focus:bg-white"
          />
        </label>
      </div>

      {status ? (
        <p
          className={`mt-5 rounded-lg px-4 py-3 text-sm font-semibold ${
            status.type === "success"
              ? "bg-court-green text-court-navy"
              : "bg-red-50 text-red-700"
          }`}
        >
          {status.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-court-mint px-6 py-3 text-sm font-black text-white transition hover:bg-court-ocean disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Joining..." : "Join the Waitlist"}
      </button>

      <p className="mt-3 text-center text-xs leading-5 text-slate-500">
        No spam. We'll only email you about PaddleRank early access and launch
        updates.
      </p>
    </form>
  );
}

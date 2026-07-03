"use client";

import { FormEvent, useState } from "react";

const clubInterestEmail = "hello@paddlerank.xyz";
const clubInterestSubject = "PaddleRank Club Interest";

export function ClubInterestForm() {
  const [isOpeningGmail, setIsOpeningGmail] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsOpeningGmail(true);

    const formData = new FormData(event.currentTarget);
    const body = [
      `Club Name: ${String(formData.get("club_name") || "").trim()}`,
      `Club Location: ${String(formData.get("club_location") || "").trim()}`,
      `Contact Person: ${String(formData.get("contact_person") || "").trim()}`,
      `Email: ${String(formData.get("email") || "").trim()}`,
      `Phone Number: ${String(formData.get("phone_number") || "").trim()}`,
      `Estimated Number of Members: ${String(
        formData.get("estimated_members") || "",
      ).trim()}`,
      `Optional Club Logo or Photo Link: ${
        String(formData.get("club_image_url") || "").trim() || "Not provided"
      }`,
    ].join("\r\n");

    const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      clubInterestEmail,
    )}&su=${encodeURIComponent(
      clubInterestSubject,
    )}&body=${encodeURIComponent(body)}`;

    setShowFallback(true);
    window.open(gmailComposeUrl, "_blank", "noopener,noreferrer");
    window.setTimeout(() => setIsOpeningGmail(false), 1500);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[2rem] border border-[#e1e6dd] bg-[#f7f8f3] p-5 shadow-[0_24px_60px_rgba(16,44,39,0.10)] sm:p-7"
    >
      <h3 className="text-2xl font-black tracking-tight text-[#102c27]">
        Register your club interest
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Share a few club details. We&apos;ll open a prepared Gmail message for
        you to review and send.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className="text-sm font-semibold text-court-navy">
            Club Name *
          </span>
          <input
            name="club_name"
            type="text"
            required
            placeholder="Your pickleball club"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-court-mist px-4 py-3 text-court-navy outline-none transition placeholder:text-slate-400 focus:border-court-mint focus:bg-white"
          />
        </label>

        <label>
          <span className="text-sm font-semibold text-court-navy">
            Club Location *
          </span>
          <input
            name="club_location"
            type="text"
            required
            placeholder="City / Province"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-court-mist px-4 py-3 text-court-navy outline-none transition placeholder:text-slate-400 focus:border-court-mint focus:bg-white"
          />
        </label>

        <label>
          <span className="text-sm font-semibold text-court-navy">
            Contact Person *
          </span>
          <input
            name="contact_person"
            type="text"
            required
            placeholder="Full name"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-court-mist px-4 py-3 text-court-navy outline-none transition placeholder:text-slate-400 focus:border-court-mint focus:bg-white"
          />
        </label>

        <label>
          <span className="text-sm font-semibold text-court-navy">
            Email *
          </span>
          <input
            name="email"
            type="email"
            required
            placeholder="email@example.com"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-court-mist px-4 py-3 text-court-navy outline-none transition placeholder:text-slate-400 focus:border-court-mint focus:bg-white"
          />
        </label>

        <label>
          <span className="text-sm font-semibold text-court-navy">
            Phone Number *
          </span>
          <input
            name="phone_number"
            type="tel"
            required
            placeholder="09..."
            className="mt-2 w-full rounded-xl border border-slate-200 bg-court-mist px-4 py-3 text-court-navy outline-none transition placeholder:text-slate-400 focus:border-court-mint focus:bg-white"
          />
        </label>

        <label>
          <span className="text-sm font-semibold text-court-navy">
            Estimated Number of Members *
          </span>
          <input
            name="estimated_members"
            type="number"
            required
            min="1"
            inputMode="numeric"
            placeholder="Example: 12"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-court-mist px-4 py-3 text-court-navy outline-none transition placeholder:text-slate-400 focus:border-court-mint focus:bg-white"
          />
        </label>

        <label className="sm:col-span-2">
          <span className="text-sm font-semibold text-court-navy">
            Optional Club Logo or Photo Link
          </span>
          <input
            name="club_image_url"
            type="url"
            placeholder="https://..."
            className="mt-2 w-full rounded-xl border border-slate-200 bg-court-mist px-4 py-3 text-court-navy outline-none transition placeholder:text-slate-400 focus:border-court-mint focus:bg-white"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={isOpeningGmail}
        className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#102c27] px-6 py-3 text-sm font-black text-white transition hover:bg-[#1c4940] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isOpeningGmail ? "Opening Gmail..." : "Register Your Club"}
      </button>

      {showFallback ? (
        <p
          role="status"
          className="mt-4 rounded-xl border border-court-teal/20 bg-court-mist px-4 py-3 text-center text-sm leading-6 text-slate-600"
        >
          If Gmail did not open, please email{" "}
          <a
            href={`mailto:${clubInterestEmail}`}
            className="font-bold text-court-ocean underline decoration-court-ocean/40 underline-offset-2 hover:text-court-navy"
          >
            {clubInterestEmail}
          </a>{" "}
          with your club details.
        </p>
      ) : null}
    </form>
  );
}

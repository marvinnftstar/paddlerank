"use client";

import { FormEvent, useState } from "react";

const clubInterestEmail = "hello@paddlerank.xyz";

export function ClubInterestForm() {
  const [isOpeningEmail, setIsOpeningEmail] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsOpeningEmail(true);

    const formData = new FormData(event.currentTarget);
    const subject = `PaddleRank club interest: ${String(
      formData.get("club_name") || "",
    ).trim()}`;
    const body = [
      `Club name: ${String(formData.get("club_name") || "").trim()}`,
      `Club location: ${String(formData.get("club_location") || "").trim()}`,
      `Contact person: ${String(formData.get("contact_person") || "").trim()}`,
      `Email or phone: ${String(formData.get("contact_details") || "").trim()}`,
      `Estimated members: ${String(
        formData.get("estimated_members") || "",
      ).trim()}`,
      `Logo or photo link: ${
        String(formData.get("club_image_url") || "").trim() || "Not provided"
      }`,
    ].join("\n");

    window.location.href = `mailto:${clubInterestEmail}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;

    window.setTimeout(() => setIsOpeningEmail(false), 1000);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-court-teal/20 bg-white p-5 shadow-glow sm:p-6"
    >
      <h3 className="text-2xl font-black text-court-navy">
        Register your club interest
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Share a few club details. Submitting opens a prefilled email draft, so
        no club data is stored in PaddleRank yet.
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
            Email or Phone *
          </span>
          <input
            name="contact_details"
            type="text"
            required
            placeholder="email@example.com or 09..."
            className="mt-2 w-full rounded-xl border border-slate-200 bg-court-mist px-4 py-3 text-court-navy outline-none transition placeholder:text-slate-400 focus:border-court-mint focus:bg-white"
          />
        </label>

        <label>
          <span className="text-sm font-semibold text-court-navy">
            Estimated Members *
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
        disabled={isOpeningEmail}
        className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-court-mint px-6 py-3 text-sm font-black text-white transition hover:bg-court-ocean disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isOpeningEmail ? "Opening Email..." : "Register Your Club"}
      </button>
    </form>
  );
}

"use client";

import { useState } from "react";

type MatchFormProps = {
  action: (formData: FormData) => Promise<void>;
};

export function MatchForm({ action }: MatchFormProps) {
  const [matchType, setMatchType] = useState("singles");

  return (
    <form action={action} className="mt-6 grid gap-4 sm:grid-cols-2">
      <label>
        <span className="text-sm font-semibold text-court-navy">
          Match Type *
        </span>
        <select
          name="match_type"
          required
          value={matchType}
          onChange={(event) => setMatchType(event.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-court-mist px-4 py-3 text-court-navy outline-none transition focus:border-court-mint focus:bg-white"
        >
          <option value="singles">Singles</option>
          <option value="doubles">Doubles</option>
        </select>
      </label>

      <label>
        <span className="text-sm font-semibold text-court-navy">Result *</span>
        <select
          name="result"
          required
          defaultValue="win"
          className="mt-2 w-full rounded-xl border border-slate-200 bg-court-mist px-4 py-3 text-court-navy outline-none transition focus:border-court-mint focus:bg-white"
        >
          <option value="win">Win</option>
          <option value="loss">Loss</option>
        </select>
      </label>

      <label className="sm:col-span-2">
        <span className="text-sm font-semibold text-court-navy">
          Opponent Name *
        </span>
        <input
          name="opponent_name"
          type="text"
          required
          placeholder="Opponent or opposing team"
          className="mt-2 w-full rounded-xl border border-slate-200 bg-court-mist px-4 py-3 text-court-navy outline-none transition placeholder:text-slate-400 focus:border-court-mint focus:bg-white"
        />
      </label>

      {matchType === "doubles" ? (
        <label className="sm:col-span-2">
          <span className="text-sm font-semibold text-court-navy">
            Partner Name *
          </span>
          <input
            name="partner_name"
            type="text"
            required
            placeholder="Your doubles partner"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-court-mist px-4 py-3 text-court-navy outline-none transition placeholder:text-slate-400 focus:border-court-mint focus:bg-white"
          />
        </label>
      ) : null}

      <label>
        <span className="text-sm font-semibold text-court-navy">Score *</span>
        <input
          name="score"
          type="text"
          required
          placeholder="Example: 11-7, 11-9"
          className="mt-2 w-full rounded-xl border border-slate-200 bg-court-mist px-4 py-3 text-court-navy outline-none transition placeholder:text-slate-400 focus:border-court-mint focus:bg-white"
        />
      </label>

      <label>
        <span className="text-sm font-semibold text-court-navy">
          Match Date *
        </span>
        <input
          name="match_date"
          type="date"
          required
          className="mt-2 w-full rounded-xl border border-slate-200 bg-court-mist px-4 py-3 text-court-navy outline-none transition focus:border-court-mint focus:bg-white"
        />
      </label>

      <label className="sm:col-span-2">
        <span className="text-sm font-semibold text-court-navy">
          Notes
        </span>
        <textarea
          name="notes"
          rows={4}
          placeholder="Optional match notes"
          className="mt-2 w-full rounded-xl border border-slate-200 bg-court-mist px-4 py-3 text-court-navy outline-none transition placeholder:text-slate-400 focus:border-court-mint focus:bg-white"
        />
      </label>

      <div className="sm:col-span-2">
        <button
          type="submit"
          className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-court-mint px-6 py-3 text-sm font-black text-white transition hover:bg-court-ocean sm:w-auto"
        >
          Save Match
        </button>
      </div>
    </form>
  );
}

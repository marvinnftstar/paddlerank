"use client";

import { useState, type FormEvent } from "react";
import { useFormStatus } from "react-dom";

type MatchFormProps = {
  action: (formData: FormData) => Promise<void>;
};

const MAX_OPPONENT_LENGTH = 100;
const MAX_PARTNER_LENGTH = 100;
const MAX_SCORE_LENGTH = 100;
const MAX_NOTES_LENGTH = 1000;

type FieldErrors = Partial<
  Record<
    "match_type" | "result" | "opponent_name" | "partner_name" | "score" | "match_date" | "notes",
    string
  >
>;

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-court-mint px-6 py-3 text-sm font-black text-white transition hover:bg-court-ocean disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
    >
      {pending ? "Saving..." : "Log match"}
    </button>
  );
}

export function MatchForm({ action }: MatchFormProps) {
  const [matchType, setMatchType] = useState("singles");
  const [errors, setErrors] = useState<FieldErrors>({});

  function validateForm(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const opponentName = String(formData.get("opponent_name") || "").trim();
    const partnerName = String(formData.get("partner_name") || "").trim();
    const score = String(formData.get("score") || "").trim();
    const matchDate = String(formData.get("match_date") || "").trim();
    const result = String(formData.get("result") || "");
    const notes = String(formData.get("notes") || "").trim();
    const nextErrors: FieldErrors = {};

    if (matchType !== "singles" && matchType !== "doubles") {
      nextErrors.match_type = "Choose singles or doubles.";
    }
    if (result !== "win" && result !== "loss") {
      nextErrors.result = "Choose a win or loss.";
    }
    if (!opponentName) {
      nextErrors.opponent_name = "Enter an opponent or opposing team.";
    }
    if (matchType === "doubles" && !partnerName) {
      nextErrors.partner_name = "Enter your doubles partner.";
    }
    if (!score) {
      nextErrors.score = "Enter the completed match score.";
    }
    if (!matchDate) {
      nextErrors.match_date = "Choose the match date.";
    }
    if (opponentName.length > MAX_OPPONENT_LENGTH) {
      nextErrors.opponent_name = `Keep the opponent name under ${MAX_OPPONENT_LENGTH} characters.`;
    }
    if (partnerName.length > MAX_PARTNER_LENGTH) {
      nextErrors.partner_name = `Keep the partner name under ${MAX_PARTNER_LENGTH} characters.`;
    }
    if (score.length > MAX_SCORE_LENGTH) {
      nextErrors.score = `Keep the score under ${MAX_SCORE_LENGTH} characters.`;
    }
    if (notes.length > MAX_NOTES_LENGTH) {
      nextErrors.notes = `Keep notes under ${MAX_NOTES_LENGTH} characters.`;
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      event.preventDefault();
    }
  }

  return (
    <form
      action={action}
      onSubmit={validateForm}
      className="mt-6 grid gap-4 sm:grid-cols-2"
    >
      <label>
        <span className="text-sm font-semibold text-court-navy">
          Match Type *
        </span>
        <select
          name="match_type"
          required
          value={matchType}
          onChange={(event) => {
            setMatchType(event.target.value);
            setErrors((current) => ({
              ...current,
              match_type: undefined,
              partner_name: undefined,
            }));
          }}
          aria-invalid={Boolean(errors.match_type)}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-court-mist px-4 py-3 text-court-navy outline-none transition focus:border-court-mint focus:bg-white"
        >
          <option value="singles">Singles</option>
          <option value="doubles">Doubles</option>
        </select>
        {errors.match_type ? (
          <span className="mt-2 block text-sm font-semibold text-red-700">
            {errors.match_type}
          </span>
        ) : null}
      </label>

      <label>
        <span className="text-sm font-semibold text-court-navy">Result *</span>
        <select
          name="result"
          required
          defaultValue="win"
          aria-invalid={Boolean(errors.result)}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-court-mist px-4 py-3 text-court-navy outline-none transition focus:border-court-mint focus:bg-white"
        >
          <option value="win">Win</option>
          <option value="loss">Loss</option>
        </select>
        {errors.result ? (
          <span className="mt-2 block text-sm font-semibold text-red-700">
            {errors.result}
          </span>
        ) : null}
      </label>

      <label className="sm:col-span-2">
        <span className="text-sm font-semibold text-court-navy">
          Opponent Name *
        </span>
        <input
          name="opponent_name"
          type="text"
          required
          maxLength={MAX_OPPONENT_LENGTH}
          placeholder="Opponent or opposing team"
          aria-invalid={Boolean(errors.opponent_name)}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-court-mist px-4 py-3 text-court-navy outline-none transition placeholder:text-slate-400 focus:border-court-mint focus:bg-white"
        />
        {errors.opponent_name ? (
          <span className="mt-2 block text-sm font-semibold text-red-700">
            {errors.opponent_name}
          </span>
        ) : null}
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
            maxLength={MAX_PARTNER_LENGTH}
            placeholder="Your doubles partner"
            aria-invalid={Boolean(errors.partner_name)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-court-mist px-4 py-3 text-court-navy outline-none transition placeholder:text-slate-400 focus:border-court-mint focus:bg-white"
          />
          {errors.partner_name ? (
            <span className="mt-2 block text-sm font-semibold text-red-700">
              {errors.partner_name}
            </span>
          ) : null}
        </label>
      ) : null}

      <label>
        <span className="text-sm font-semibold text-court-navy">Score *</span>
        <input
          name="score"
          type="text"
          required
          maxLength={MAX_SCORE_LENGTH}
          placeholder="Example: 11-7, 11-9"
          aria-invalid={Boolean(errors.score)}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-court-mist px-4 py-3 text-court-navy outline-none transition placeholder:text-slate-400 focus:border-court-mint focus:bg-white"
        />
        {errors.score ? (
          <span className="mt-2 block text-sm font-semibold text-red-700">
            {errors.score}
          </span>
        ) : null}
      </label>

      <label>
        <span className="text-sm font-semibold text-court-navy">
          Match Date *
        </span>
        <input
          name="match_date"
          type="date"
          required
          aria-invalid={Boolean(errors.match_date)}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-court-mist px-4 py-3 text-court-navy outline-none transition focus:border-court-mint focus:bg-white"
        />
        {errors.match_date ? (
          <span className="mt-2 block text-sm font-semibold text-red-700">
            {errors.match_date}
          </span>
        ) : null}
      </label>

      <label className="sm:col-span-2">
        <span className="text-sm font-semibold text-court-navy">
          Notes
        </span>
        <textarea
          name="notes"
          rows={4}
          maxLength={MAX_NOTES_LENGTH}
          placeholder="Optional match notes"
          aria-invalid={Boolean(errors.notes)}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-court-mist px-4 py-3 text-court-navy outline-none transition placeholder:text-slate-400 focus:border-court-mint focus:bg-white"
        />
        {errors.notes ? (
          <span className="mt-2 block text-sm font-semibold text-red-700">
            {errors.notes}
          </span>
        ) : null}
      </label>

      <div className="sm:col-span-2">
        <SubmitButton />
      </div>
    </form>
  );
}

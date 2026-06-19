"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useFormStatus } from "react-dom";
import {
  getMatchVerificationStatus,
  type MatchVerificationStatus,
} from "@/lib/matches";

type MatchRecord = {
  id: string;
  match_type: "singles" | "doubles";
  opponent_name: string;
  partner_name: string | null;
  score: string;
  result: "win" | "loss";
  verification_status?: MatchVerificationStatus | null;
  confirmation_token?: string | null;
  match_date: string;
  notes: string | null;
};

type MatchHistoryItemProps = {
  match: MatchRecord;
  formattedDate: string;
  updateAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
};

type FieldErrors = Partial<
  Record<
    | "match_type"
    | "result"
    | "opponent_name"
    | "partner_name"
    | "score"
    | "match_date"
    | "notes",
    string
  >
>;

const MAX_OPPONENT_LENGTH = 100;
const MAX_PARTNER_LENGTH = 100;
const MAX_SCORE_LENGTH = 100;
const MAX_NOTES_LENGTH = 1000;

const statusBadgeStyles: Record<MatchVerificationStatus, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-800",
  confirmed: "border-court-green/40 bg-court-green/15 text-court-navy",
  disputed: "border-red-200 bg-red-50 text-red-700",
  admin_verified: "border-court-mint/40 bg-court-mint/15 text-court-navy",
  rejected: "border-slate-300 bg-slate-100 text-slate-700",
};

const statusLabels: Record<MatchVerificationStatus, string> = {
  pending: "Pending confirmation",
  confirmed: "Confirmed",
  disputed: "Disputed",
  admin_verified: "Admin verified",
  rejected: "Rejected",
};

function SaveEditButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-court-mint px-5 py-2 text-sm font-black text-white transition hover:bg-court-ocean disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-11 sm:w-auto"
    >
      {pending ? "Saving..." : "Save changes"}
    </button>
  );
}

function DeleteButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-black text-red-700 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-10 sm:w-auto"
    >
      {pending ? "Deleting..." : "Delete match"}
    </button>
  );
}

export function MatchHistoryItem({
  match,
  formattedDate,
  updateAction,
  deleteAction,
}: MatchHistoryItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [matchType, setMatchType] = useState(match.match_type);
  const [errors, setErrors] = useState<FieldErrors>({});
  const verificationStatus = getMatchVerificationStatus(
    match.verification_status,
  );

  function validateEdit(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const result = String(formData.get("result") || "");
    const opponentName = String(formData.get("opponent_name") || "").trim();
    const partnerName = String(formData.get("partner_name") || "").trim();
    const score = String(formData.get("score") || "").trim();
    const matchDate = String(formData.get("match_date") || "").trim();
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

  function confirmDelete(event: FormEvent<HTMLFormElement>) {
    if (
      !window.confirm(
        `Delete the match against ${match.opponent_name}? This cannot be undone.`,
      )
    ) {
      event.preventDefault();
    }
  }

  function cancelEdit() {
    setMatchType(match.match_type);
    setErrors({});
    setIsEditing(false);
  }

  return (
    <article className="rounded-2xl border border-court-teal/15 bg-court-mist p-3.5 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${
                match.result === "win"
                  ? "bg-court-green/25 text-court-navy"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {match.result}
            </span>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-wide text-court-ocean">
              {match.match_type}
            </span>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wide ${statusBadgeStyles[verificationStatus]}`}
            >
              {statusLabels[verificationStatus]}
            </span>
          </div>
          <h3 className="mt-3 break-words text-lg font-black text-court-navy">
            vs. {match.opponent_name}
          </h3>
          {match.match_type === "doubles" && match.partner_name ? (
            <p className="mt-1 break-words text-sm font-semibold text-slate-600">
              Partner: {match.partner_name}
            </p>
          ) : null}
        </div>

        <div className="min-w-0 sm:max-w-[45%] sm:text-right">
          <p className="break-words text-2xl font-black text-court-navy">
            {match.score}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            {formattedDate}
          </p>
        </div>
      </div>

      {match.notes ? (
        <p className="mt-4 whitespace-pre-wrap break-words border-t border-court-teal/15 pt-4 text-sm leading-6 text-slate-600">
          {match.notes}
        </p>
      ) : null}

      {verificationStatus === "pending" && match.confirmation_token ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm font-semibold leading-6 text-amber-900">
            Share the confirmation page with your opponent so they can confirm
            or dispute this result.
          </p>
          <Link
            href={`/confirm-match/${match.id}?token=${match.confirmation_token}`}
            onClick={() => {
              window.sessionStorage.setItem(
                "paddlerank-match-history-return",
                match.id,
              );
            }}
            className="mt-2 inline-flex min-h-10 items-center justify-center rounded-lg bg-amber-900 px-4 py-2 text-sm font-black text-white transition hover:bg-court-navy"
          >
            Open confirmation page
          </Link>
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-court-teal/15 pt-4 sm:flex sm:flex-row">
        <button
          type="button"
          onClick={() => setIsEditing((current) => !current)}
          className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-court-teal/25 bg-white px-4 py-2 text-sm font-black text-court-navy transition hover:border-court-mint hover:text-court-ocean sm:min-h-10 sm:w-auto"
        >
          {isEditing ? "Close editor" : "Edit match"}
        </button>

        <form
          action={deleteAction}
          onSubmit={confirmDelete}
          className="flex min-w-0 sm:flex-none"
        >
          <input type="hidden" name="match_id" value={match.id} />
          <DeleteButton />
        </form>
      </div>

      {isEditing ? (
        <form
          action={updateAction}
          onSubmit={validateEdit}
          className="mt-4 grid gap-5 rounded-2xl border border-court-teal/15 bg-white p-3 sm:grid-cols-2 sm:gap-4 sm:p-4"
        >
          <input type="hidden" name="match_id" value={match.id} />

          <label>
            <span className="text-sm font-semibold text-court-navy">
              Match Type *
            </span>
            <select
              name="match_type"
              required
              value={matchType}
              onChange={(event) => {
                const value = event.target.value as "singles" | "doubles";
                setMatchType(value);
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
            <span className="text-sm font-semibold text-court-navy">
              Result *
            </span>
            <select
              name="result"
              required
              defaultValue={match.result}
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
              defaultValue={match.opponent_name}
              aria-invalid={Boolean(errors.opponent_name)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-court-mist px-4 py-3 text-court-navy outline-none transition focus:border-court-mint focus:bg-white"
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
                defaultValue={match.partner_name || ""}
                aria-invalid={Boolean(errors.partner_name)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-court-mist px-4 py-3 text-court-navy outline-none transition focus:border-court-mint focus:bg-white"
              />
              {errors.partner_name ? (
                <span className="mt-2 block text-sm font-semibold text-red-700">
                  {errors.partner_name}
                </span>
              ) : null}
            </label>
          ) : null}

          <label>
            <span className="text-sm font-semibold text-court-navy">
              Score *
            </span>
            <input
              name="score"
              type="text"
              required
              maxLength={MAX_SCORE_LENGTH}
              defaultValue={match.score}
              aria-invalid={Boolean(errors.score)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-court-mist px-4 py-3 text-court-navy outline-none transition focus:border-court-mint focus:bg-white"
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
              defaultValue={match.match_date}
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
            <span className="text-sm font-semibold text-court-navy">Notes</span>
            <textarea
              name="notes"
              rows={4}
              maxLength={MAX_NOTES_LENGTH}
              defaultValue={match.notes || ""}
              aria-invalid={Boolean(errors.notes)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-court-mist px-4 py-3 text-court-navy outline-none transition focus:border-court-mint focus:bg-white"
            />
            {errors.notes ? (
              <span className="mt-2 block text-sm font-semibold text-red-700">
                {errors.notes}
              </span>
            ) : null}
          </label>

          <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row">
            <SaveEditButton />
            <button
              type="button"
              onClick={cancelEdit}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-court-teal/25 bg-white px-5 py-2 text-sm font-black text-court-navy transition hover:border-court-mint hover:text-court-ocean sm:min-h-11 sm:w-auto"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}
    </article>
  );
}

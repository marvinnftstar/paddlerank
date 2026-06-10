import type { SupabaseClient, User } from "@supabase/supabase-js";

type WaitlistAccessResult = {
  isApproved: boolean;
  accessStatus: string | null;
};

type WaitlistSignupRow = {
  email: string | null;
  access_status: string | null;
};

function maskEmail(email: string) {
  const [localPart, domain] = email.split("@");

  if (!domain) {
    return "invalid-email";
  }

  return `${localPart.slice(0, 1)}***@${domain}`;
}

function logWaitlistAccess(
  email: string,
  accessStatus: string | null,
  isApproved: boolean,
  source: string,
  durationMs: number,
  errorMessage?: string,
) {
  console.log("[PaddleRank early access gate]", {
    source,
    email: maskEmail(email),
    access_status: accessStatus,
    result: isApproved ? "allow" : "deny",
    duration_ms: durationMs,
    error: errorMessage || null,
  });
}

export async function checkWaitlistAccess(
  supabase: SupabaseClient,
  user: User,
  source = "server",
): Promise<WaitlistAccessResult> {
  const startedAt = Date.now();
  const email = user.email?.trim().toLowerCase();

  if (!email) {
    console.log("[PaddleRank early access gate]", {
      source,
      email: null,
      access_status: null,
      result: "deny",
      duration_ms: Date.now() - startedAt,
      error: "Authenticated user has no email.",
    });
    return { isApproved: false, accessStatus: null };
  }

  const { data, error } = await supabase
    .from("waitlist_signups")
    .select("email, access_status")
    .ilike("email", email)
    .returns<WaitlistSignupRow[]>();

  if (error) {
    logWaitlistAccess(
      email,
      null,
      false,
      source,
      Date.now() - startedAt,
      error.message,
    );
    return { isApproved: false, accessStatus: null };
  }

  const matchingRows = (data || []).filter(
    (row) => row.email?.trim().toLowerCase() === email,
  );
  const statuses = matchingRows.map((row) => row.access_status);
  const accessStatus = statuses.length > 0 ? statuses.join(",") : null;

  // Fail closed: the user is allowed only when every matching row is approved.
  const isApproved =
    matchingRows.length > 0 &&
    statuses.every((status) => status === "approved");

  logWaitlistAccess(
    email,
    accessStatus,
    isApproved,
    source,
    Date.now() - startedAt,
  );

  return { isApproved, accessStatus };
}

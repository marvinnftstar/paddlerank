import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { checkWaitlistAccess } from "@/lib/waitlistAccess";

export const dynamic = "force-dynamic";

type ClubsPageProps = {
  searchParams: Promise<{
    submitted?: string;
    error?: string;
  }>;
};

type ClubRow = {
  id: string;
  club_name: string;
  city: string;
  description: string;
  home_court: string | null;
  playing_schedule: string | null;
  logo_url: string | null;
};

type CurrentUserClubRow = {
  id: string;
  club_name: string;
  status: "pending" | "approved";
};

const CLUB_FIELD_LIMITS = {
  clubName: 120,
  city: 120,
  contactPerson: 120,
  contactEmail: 180,
  contactNumber: 60,
  description: 1000,
  homeCourt: 180,
  playingSchedule: 180,
  logoUrl: 500,
};

const APPROVED_CLUBS_SELECT =
  "id, club_name, city, description, home_court, playing_schedule, logo_url";

const CURRENT_USER_CLUB_SELECT = "id, club_name, status";

function getFormValue(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getSafeLogoUrl(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

function parseClubForm(formData: FormData) {
  const clubName = getFormValue(formData, "club_name");
  const city = getFormValue(formData, "city");
  const contactPerson = getFormValue(formData, "contact_person");
  const contactEmail = getFormValue(formData, "contact_email");
  const contactNumber = getFormValue(formData, "contact_number");
  const description = getFormValue(formData, "description");
  const homeCourt = getFormValue(formData, "home_court");
  const playingSchedule = getFormValue(formData, "playing_schedule");
  const logoUrl = getFormValue(formData, "logo_url");

  const hasValidLengths =
    clubName.length <= CLUB_FIELD_LIMITS.clubName &&
    city.length <= CLUB_FIELD_LIMITS.city &&
    contactPerson.length <= CLUB_FIELD_LIMITS.contactPerson &&
    contactEmail.length <= CLUB_FIELD_LIMITS.contactEmail &&
    contactNumber.length <= CLUB_FIELD_LIMITS.contactNumber &&
    description.length <= CLUB_FIELD_LIMITS.description &&
    homeCourt.length <= CLUB_FIELD_LIMITS.homeCourt &&
    playingSchedule.length <= CLUB_FIELD_LIMITS.playingSchedule &&
    logoUrl.length <= CLUB_FIELD_LIMITS.logoUrl;

  if (
    !clubName ||
    !city ||
    !contactPerson ||
    !contactEmail ||
    !description ||
    !isValidEmail(contactEmail) ||
    !hasValidLengths
  ) {
    return null;
  }

  return {
    club_name: clubName,
    city,
    contact_person: contactPerson,
    contact_email: contactEmail,
    contact_number: contactNumber || null,
    description,
    home_court: homeCourt || null,
    playing_schedule: playingSchedule || null,
    logo_url: getSafeLogoUrl(logoUrl),
    status: "pending",
  };
}

export default async function ClubsPage({ searchParams }: ClubsPageProps) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/login");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const access = await checkWaitlistAccess(supabase, user, "clubs");

  if (!access.isApproved) {
    redirect("/early-access");
  }

  const clubsResult = await supabase
    .from("clubs")
    .select(APPROVED_CLUBS_SELECT)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .returns<ClubRow[]>();

  const approvedClubs = clubsResult.data || [];

  const currentUserClubResult = await supabase
    .from("clubs")
    .select(CURRENT_USER_CLUB_SELECT)
    .eq("submitted_by", user.id)
    .in("status", ["pending", "approved"])
    .order("created_at", { ascending: false })
    .limit(1)
    .returns<CurrentUserClubRow[]>();

  const currentUserClub = currentUserClubResult.data?.[0] || null;
  const currentUserClubError = currentUserClubResult.error;
  const canSubmitClub = !currentUserClub && !currentUserClubError;
  const clubStatusMessage =
    currentUserClub?.status === "approved"
      ? "Your club has been approved and is now visible in the PaddleRank Club Directory."
      : currentUserClub?.status === "pending"
        ? "Your club profile has been submitted for review."
        : null;

  async function submitClub(formData: FormData) {
    "use server";

    const supabase = await createSupabaseServerClient();

    if (!supabase) {
      redirect("/login");
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    const access = await checkWaitlistAccess(supabase, user, "club-submit");

    if (!access.isApproved) {
      redirect("/early-access");
    }

    const { data: existingClubSubmissions, error: existingClubError } =
      await supabase
        .from("clubs")
        .select("id, status")
        .eq("submitted_by", user.id)
        .in("status", ["pending", "approved"])
        .limit(1);

    if (existingClubError) {
      console.error(
        "PaddleRank club submission status check error:",
        existingClubError,
      );
      redirect("/clubs?error=status-check-failed#submit-club");
    }

    if ((existingClubSubmissions || []).length > 0) {
      redirect("/clubs#submit-club");
    }

    const clubValues = parseClubForm(formData);

    if (!clubValues) {
      redirect("/clubs?error=invalid-fields#submit-club");
    }

    const { error } = await supabase.from("clubs").insert({
      ...clubValues,
      submitted_by: user.id,
    });

    if (error) {
      console.error("PaddleRank club submission error:", error);
      redirect("/clubs?error=save-failed#submit-club");
    }

    redirect(`/clubs?submitted=${Date.now()}#submit-club`);
  }

  async function logout() {
    "use server";

    const supabase = await createSupabaseServerClient();
    await supabase?.auth.signOut();
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-court-mist text-slate-950">
      <header className="sticky top-0 z-10 border-b border-court-teal/15 bg-white/95 px-4 py-3 shadow-sm backdrop-blur sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
          <div className="flex items-center justify-between gap-4">
            <Link href="/dashboard" className="flex items-center gap-3">
              <Image
                src="/PaddleRank.png"
                alt="PaddleRank logo"
                width={48}
                height={48}
                priority
                className="h-11 w-11 rounded-xl object-contain"
              />
              <div>
                <p className="text-lg font-black leading-none text-court-navy">
                  PaddleRank
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  Track. Compete. Rank Up.
                </p>
              </div>
            </Link>

            <form action={logout} className="lg:hidden">
              <button
                type="submit"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-court-teal/25 bg-white px-4 py-2 text-sm font-black text-court-navy transition hover:border-court-mint hover:text-court-ocean"
              >
                Logout
              </button>
            </form>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:flex-1 lg:justify-end">
            <nav
              aria-label="Player sections"
              className="flex w-full gap-1 overflow-x-auto rounded-2xl border border-court-teal/15 bg-court-mist p-1 lg:w-auto"
            >
              <Link
                href="/dashboard"
                className="flex-1 whitespace-nowrap rounded-xl px-3 py-2 text-center text-sm font-black text-slate-500 transition hover:text-court-navy lg:flex-none"
              >
                Dashboard
              </Link>
              <Link
                href="/profile"
                className="flex-1 whitespace-nowrap rounded-xl px-3 py-2 text-center text-sm font-black text-slate-500 transition hover:text-court-navy lg:flex-none"
              >
                Profile
              </Link>
              <Link
                href="/matches"
                className="flex-1 whitespace-nowrap rounded-xl px-3 py-2 text-center text-sm font-black text-slate-500 transition hover:text-court-navy lg:flex-none"
              >
                Matches
              </Link>
              <span className="flex-1 whitespace-nowrap rounded-xl bg-white px-3 py-2 text-center text-sm font-black text-court-navy shadow-sm lg:flex-none">
                Clubs
              </span>
            </nav>

            <form action={logout} className="hidden lg:block">
              <button
                type="submit"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-court-teal/25 bg-white px-5 py-2 text-sm font-black text-court-navy transition hover:border-court-mint hover:text-court-ocean"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <section className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl border border-court-teal/15 bg-white p-4 shadow-glow sm:p-7 lg:p-8">
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-court-ocean">
                  Club directory
                </p>
                <h1 className="mt-3 text-2xl font-black leading-tight text-court-navy sm:text-4xl">
                  Help players discover trusted pickleball clubs.
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
                  Submit your club profile for review. Approved clubs will
                  appear in the PaddleRank club directory for players to find.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                  {canSubmitClub ? (
                    <a
                      href="#submit-club"
                      className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-court-mint px-6 py-3 text-sm font-black text-white shadow-sm transition hover:bg-court-ocean sm:w-auto"
                    >
                      Submit Club Profile
                    </a>
                  ) : null}
                  <p className="rounded-2xl border border-court-teal/20 bg-court-mist px-4 py-3 text-sm font-semibold text-court-navy">
                    {clubStatusMessage ||
                      "Club submissions are reviewed before appearing in the directory."}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-[linear-gradient(135deg,#155A8A_0%,#0D82A7_55%,#10BFA0_100%)] p-5 text-white">
                <p className="text-sm font-bold text-white/75">
                  Club visibility
                </p>
                <p className="mt-2 text-2xl font-black">
                  Get discovered by more players.
                </p>
                <p className="mt-3 text-sm leading-6 text-white/80">
                  Help local players find your club, learn where you play, and
                  see your regular schedule.
                </p>
              </div>
            </div>
          </div>

          <section className="mt-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-court-ocean">
                  Approved clubs
                </p>
                <h2 className="mt-2 text-2xl font-black text-court-navy">
                  PaddleRank club directory
                </h2>
              </div>
              {canSubmitClub ? (
                <a
                  href="#submit-club"
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-court-teal/25 bg-white px-5 py-2 text-sm font-black text-court-navy shadow-sm transition hover:border-court-mint hover:text-court-ocean sm:w-auto"
                >
                  Submit Club Profile
                </a>
              ) : null}
            </div>

            {clubsResult.error ? (
              <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-5 text-sm font-semibold leading-6 text-red-700">
                We could not load the Club Directory. Please try again.
              </div>
            ) : approvedClubs.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-court-teal/30 bg-white px-4 py-8 text-center shadow-sm sm:px-6">
                <h3 className="text-xl font-black text-court-navy">
                  No approved clubs yet.
                </h3>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
                  Be one of the first clubs to join PaddleRank. Approved clubs
                  will appear here after review.
                </p>
                {canSubmitClub ? (
                  <a
                    href="#submit-club"
                    className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-court-mint px-6 py-3 text-sm font-black text-white shadow-sm transition hover:bg-court-ocean sm:w-auto"
                  >
                    Submit Club Profile
                  </a>
                ) : null}
              </div>
            ) : (
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {approvedClubs.map((club) => {
                  const safeLogoUrl = getSafeLogoUrl(club.logo_url);

                  return (
                    <article
                      key={club.id}
                      className="rounded-2xl border border-court-teal/15 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-court-mint/50 hover:shadow-glow sm:p-5"
                    >
                      <div className="flex items-start gap-4">
                        {safeLogoUrl ? (
                          <img
                            src={safeLogoUrl}
                            alt={`${club.club_name} logo`}
                            className="h-14 w-14 rounded-xl border border-court-teal/15 object-cover"
                          />
                        ) : (
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-court-mist text-lg font-black text-court-navy">
                            {club.club_name.slice(0, 1).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h3 className="break-words text-lg font-black text-court-navy">
                            {club.club_name}
                          </h3>
                          <p className="mt-1 text-sm font-semibold text-court-ocean">
                            {club.city}
                          </p>
                        </div>
                      </div>

                      <p className="mt-4 line-clamp-4 text-sm leading-6 text-slate-600">
                        {club.description}
                      </p>

                      {club.home_court ? (
                        <p className="mt-4 rounded-xl bg-court-mist px-3 py-2 text-sm font-semibold leading-6 text-court-navy">
                          Home court: {club.home_court}
                        </p>
                      ) : null}

                      {club.playing_schedule ? (
                        <p className="mt-3 rounded-xl border border-court-teal/15 px-3 py-2 text-sm font-semibold leading-6 text-slate-600">
                          Schedule: {club.playing_schedule}
                        </p>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <section
            id="submit-club"
            className="mt-6 rounded-3xl border border-court-teal/15 bg-white p-4 shadow-glow sm:p-6 lg:p-7"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-court-ocean">
                  Club submission
                </p>
                <h2 className="mt-2 text-2xl font-black text-court-navy">
                  Submit your club profile.
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Help players discover your club. Approved clubs will appear
                  in the PaddleRank club directory after review.
                </p>
              </div>

              {params.submitted ? (
                <p
                  role="status"
                  className="rounded-xl bg-court-green/25 px-4 py-3 text-sm font-black text-court-navy"
                >
                  Club submitted for review.
                </p>
              ) : null}
            </div>

            {clubStatusMessage ? (
              <div className="mt-6 rounded-2xl border border-court-teal/15 bg-court-mist px-4 py-5 shadow-sm sm:px-5">
                <p className="text-lg font-black text-court-navy">
                  {clubStatusMessage}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {currentUserClub?.status === "approved"
                    ? `${currentUserClub.club_name} is listed in the PaddleRank Club Directory.`
                    : `${currentUserClub?.club_name} will appear in the directory after review and approval.`}
                </p>
              </div>
            ) : null}

            {currentUserClubError ? (
              <p
                role="alert"
                className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
              >
                We could not check your club submission status. Please try
                again.
              </p>
            ) : null}

            {params.error ? (
              <p
                role="alert"
                className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
              >
                {params.error === "invalid-fields"
                  ? "Please review the required fields and logo URL, then try again."
                  : params.error === "status-check-failed"
                    ? "We could not check your club submission status. Please try again."
                    : "We could not save this club profile. Please try again."}
              </p>
            ) : null}

            {canSubmitClub ? (
              <form action={submitClub} className="mt-6 grid gap-5 sm:grid-cols-2">
                <label className="sm:col-span-2">
                  <span className="text-sm font-semibold text-court-navy">
                    Club Name *
                  </span>
                  <input
                    name="club_name"
                    type="text"
                    required
                    maxLength={CLUB_FIELD_LIMITS.clubName}
                    placeholder="Your pickleball club"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-court-mist px-4 py-3 text-court-navy outline-none transition placeholder:text-slate-400 focus:border-court-mint focus:bg-white"
                  />
                </label>

                <label>
                  <span className="text-sm font-semibold text-court-navy">
                    City / Location *
                  </span>
                  <input
                    name="city"
                    type="text"
                    required
                    maxLength={CLUB_FIELD_LIMITS.city}
                    placeholder="Quezon City"
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
                    maxLength={CLUB_FIELD_LIMITS.contactPerson}
                    placeholder="Full name"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-court-mist px-4 py-3 text-court-navy outline-none transition placeholder:text-slate-400 focus:border-court-mint focus:bg-white"
                  />
                </label>

                <label>
                  <span className="text-sm font-semibold text-court-navy">
                    Contact Email *
                  </span>
                  <input
                    name="contact_email"
                    type="email"
                    required
                    maxLength={CLUB_FIELD_LIMITS.contactEmail}
                    placeholder="club@example.com"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-court-mist px-4 py-3 text-court-navy outline-none transition placeholder:text-slate-400 focus:border-court-mint focus:bg-white"
                  />
                </label>

                <label>
                  <span className="text-sm font-semibold text-court-navy">
                    Contact Number
                  </span>
                  <input
                    name="contact_number"
                    type="tel"
                    maxLength={CLUB_FIELD_LIMITS.contactNumber}
                    placeholder="09..."
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-court-mist px-4 py-3 text-court-navy outline-none transition placeholder:text-slate-400 focus:border-court-mint focus:bg-white"
                  />
                </label>

                <label className="sm:col-span-2">
                  <span className="text-sm font-semibold text-court-navy">
                    Club Description *
                  </span>
                  <textarea
                    name="description"
                    required
                    maxLength={CLUB_FIELD_LIMITS.description}
                    rows={4}
                    placeholder="Tell players what makes your club welcoming and competitive."
                    className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-court-mist px-4 py-3 text-court-navy outline-none transition placeholder:text-slate-400 focus:border-court-mint focus:bg-white"
                  />
                </label>

                <label>
                  <span className="text-sm font-semibold text-court-navy">
                    Home Court / Location
                  </span>
                  <input
                    name="home_court"
                    type="text"
                    maxLength={CLUB_FIELD_LIMITS.homeCourt}
                    placeholder="Main court or venue"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-court-mist px-4 py-3 text-court-navy outline-none transition placeholder:text-slate-400 focus:border-court-mint focus:bg-white"
                  />
                </label>

                <label>
                  <span className="text-sm font-semibold text-court-navy">
                    Playing Schedule
                  </span>
                  <input
                    name="playing_schedule"
                    type="text"
                    maxLength={CLUB_FIELD_LIMITS.playingSchedule}
                    placeholder="Saturdays, 7 AM"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-court-mist px-4 py-3 text-court-navy outline-none transition placeholder:text-slate-400 focus:border-court-mint focus:bg-white"
                  />
                </label>

                <label className="sm:col-span-2">
                  <span className="text-sm font-semibold text-court-navy">
                    Club Logo URL
                  </span>
                  <input
                    name="logo_url"
                    type="url"
                    maxLength={CLUB_FIELD_LIMITS.logoUrl}
                    placeholder="https://..."
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-court-mist px-4 py-3 text-court-navy outline-none transition placeholder:text-slate-400 focus:border-court-mint focus:bg-white"
                  />
                </label>

                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-court-mint px-6 py-3 text-sm font-black text-white transition hover:bg-court-ocean sm:w-auto"
                  >
                    Submit Club Profile
                  </button>
                </div>
              </form>
            ) : null}
          </section>
        </div>
      </section>
    </main>
  );
}

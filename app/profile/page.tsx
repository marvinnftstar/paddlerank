import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { checkWaitlistAccess } from "@/lib/waitlistAccess";

export const dynamic = "force-dynamic";

type ProfilePageProps = {
  searchParams: Promise<{
    saved?: string;
    error?: string;
  }>;
};

type ProfileRow = {
  full_name: string | null;
  display_name: string | null;
  city: string | null;
  province: string | null;
  region: string | null;
  pickleball_club: string | null;
  skill_level: string | null;
  preferred_play_type: string | null;
  profile_completed: boolean | null;
};

const skillLevels = ["Beginner", "Intermediate", "Advanced", "Competitive"];
const playTypes = ["Singles", "Doubles", "Both"];

function getFormValue(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/early-access");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const access = await checkWaitlistAccess(supabase, user, "profile");

  if (!access.isApproved) {
    redirect("/early-access");
  }

  const fallbackName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email ||
    "Player";

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "full_name, display_name, city, province, region, pickleball_club, skill_level, preferred_play_type, profile_completed",
    )
    .eq("user_id", user.id)
    .maybeSingle<ProfileRow>();

  async function saveProfile(formData: FormData) {
    "use server";

    const supabase = await createSupabaseServerClient();

    if (!supabase) {
      redirect("/early-access");
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    const access = await checkWaitlistAccess(supabase, user, "profile-save");

    if (!access.isApproved) {
      redirect("/early-access");
    }

    const fullName = getFormValue(formData, "full_name");
    const displayName = getFormValue(formData, "display_name");
    const city = getFormValue(formData, "city");
    const province = getFormValue(formData, "province");
    const skillLevel = getFormValue(formData, "skill_level");
    const preferredPlayType = getFormValue(formData, "preferred_play_type");

    if (!fullName || !displayName) {
      redirect("/profile?error=missing-name");
    }

    const profileCompleted = Boolean(
      fullName &&
        displayName &&
        city &&
        province &&
        skillLevel &&
        preferredPlayType,
    );

    const { error } = await supabase.from("profiles").upsert({
      user_id: user.id,
      email: user.email || "",
      full_name: fullName,
      display_name: displayName,
      city,
      province,
      region: getFormValue(formData, "region"),
      pickleball_club: getFormValue(formData, "pickleball_club"),
      skill_level: skillLevel,
      preferred_play_type: preferredPlayType,
      profile_completed: profileCompleted,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: "user_id",
    });

    if (error) {
      console.error("PaddleRank profile save error:", error);
      redirect("/profile?error=save-failed");
    }

    redirect("/profile?saved=1");
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
        <div className="mx-auto flex max-w-6xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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
                className="inline-flex min-h-10 items-center justify-center rounded-xl border border-court-teal/25 bg-white px-4 py-2 text-sm font-black text-court-navy transition hover:border-court-mint hover:text-court-ocean"
              >
                Logout
              </button>
            </form>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:flex-1 lg:justify-end">
            <nav
              aria-label="Player sections"
              className="flex gap-1 overflow-x-auto rounded-2xl border border-court-teal/15 bg-court-mist p-1"
            >
              <Link
                href="/dashboard"
                className="whitespace-nowrap rounded-xl px-3 py-2 text-sm font-black text-slate-500 transition hover:text-court-navy"
              >
                Dashboard
              </Link>
              <span className="whitespace-nowrap rounded-xl bg-white px-3 py-2 text-sm font-black text-court-navy shadow-sm">
                Profile
              </span>
              <span className="whitespace-nowrap rounded-xl px-3 py-2 text-sm font-black text-slate-500">
                Matches
              </span>
              <span className="whitespace-nowrap rounded-xl px-3 py-2 text-sm font-black text-slate-500">
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

      <section className="px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.7fr_1.3fr]">
          <aside className="rounded-3xl border border-court-teal/15 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-court-ocean">
              Player profile
            </p>
            <h1 className="mt-3 text-3xl font-black leading-tight text-court-navy">
              Set up your PaddleRank identity.
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              This is the basic player information that will support future
              match history, rankings, clubs, and tournaments.
            </p>
            {user.email ? (
              <p className="mt-5 rounded-2xl border border-court-teal/20 bg-court-mist px-4 py-3 text-sm font-semibold text-court-navy">
                Signed in as {user.email}
              </p>
            ) : null}
          </aside>

          <section className="rounded-3xl border border-court-teal/15 bg-white p-5 shadow-glow sm:p-6 lg:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-court-ocean">
                  Profile details
                </p>
                <h2 className="mt-2 text-2xl font-black text-court-navy">
                  Keep it simple for now.
                </h2>
              </div>
              {params.saved === "1" ? (
                <p className="rounded-xl bg-court-green/25 px-4 py-3 text-sm font-black text-court-navy">
                  Profile saved.
                </p>
              ) : null}
            </div>

            {params.error ? (
              <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {params.error === "missing-name"
                  ? "Please add your full name and display name."
                  : "Profile could not be saved. Please check the profiles table setup."}
              </p>
            ) : null}

            <form action={saveProfile} className="mt-6 grid gap-4 sm:grid-cols-2">
              <label>
                <span className="text-sm font-semibold text-court-navy">
                  Full Name *
                </span>
                <input
                  name="full_name"
                  type="text"
                  required
                  defaultValue={profile?.full_name || fallbackName}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-court-mist px-4 py-3 text-court-navy outline-none transition placeholder:text-slate-400 focus:border-court-mint focus:bg-white"
                />
              </label>

              <label>
                <span className="text-sm font-semibold text-court-navy">
                  Display Name *
                </span>
                <input
                  name="display_name"
                  type="text"
                  required
                  defaultValue={profile?.display_name || fallbackName}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-court-mist px-4 py-3 text-court-navy outline-none transition placeholder:text-slate-400 focus:border-court-mint focus:bg-white"
                />
              </label>

              <label className="sm:col-span-2">
                <span className="text-sm font-semibold text-court-navy">
                  City *
                </span>
                <input
                  name="city"
                  type="text"
                  required
                  placeholder="Quezon City"
                  defaultValue={profile?.city || ""}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-court-mist px-4 py-3 text-court-navy outline-none transition placeholder:text-slate-400 focus:border-court-mint focus:bg-white"
                />
              </label>

              <label>
                <span className="text-sm font-semibold text-court-navy">
                  Province *
                </span>
                <input
                  name="province"
                  type="text"
                  required
                  placeholder="Metro Manila"
                  defaultValue={profile?.province || ""}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-court-mist px-4 py-3 text-court-navy outline-none transition placeholder:text-slate-400 focus:border-court-mint focus:bg-white"
                />
              </label>

              <label>
                <span className="text-sm font-semibold text-court-navy">
                  Region
                </span>
                <input
                  name="region"
                  type="text"
                  placeholder="NCR"
                  defaultValue={profile?.region || ""}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-court-mist px-4 py-3 text-court-navy outline-none transition placeholder:text-slate-400 focus:border-court-mint focus:bg-white"
                />
              </label>

              <label className="sm:col-span-2">
                <span className="text-sm font-semibold text-court-navy">
                  Pickleball Club
                </span>
                <input
                  name="pickleball_club"
                  type="text"
                  placeholder="Your main club or court"
                  defaultValue={profile?.pickleball_club || ""}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-court-mist px-4 py-3 text-court-navy outline-none transition placeholder:text-slate-400 focus:border-court-mint focus:bg-white"
                />
              </label>

              <label>
                <span className="text-sm font-semibold text-court-navy">
                  Skill Level *
                </span>
                <select
                  name="skill_level"
                  required
                  defaultValue={profile?.skill_level || ""}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-court-mist px-4 py-3 text-court-navy outline-none transition focus:border-court-mint focus:bg-white"
                >
                  <option value="">Select level</option>
                  {skillLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span className="text-sm font-semibold text-court-navy">
                  Preferred Play Type *
                </span>
                <select
                  name="preferred_play_type"
                  required
                  defaultValue={profile?.preferred_play_type || ""}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-court-mist px-4 py-3 text-court-navy outline-none transition focus:border-court-mint focus:bg-white"
                >
                  <option value="">Select play type</option>
                  {playTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-court-mint px-6 py-3 text-sm font-black text-white transition hover:bg-court-ocean sm:w-auto"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </section>
        </div>
      </section>
    </main>
  );
}

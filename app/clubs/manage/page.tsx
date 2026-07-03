import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ClubManagementForm } from "@/components/ClubManagementForm";
import { parseClubForm } from "@/lib/clubs";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type ManageClubPageProps = {
  searchParams: Promise<{ saved?: string; error?: string }>;
};

type OwnedClub = {
  id: string;
  club_name: string;
  city: string;
  contact_person: string;
  contact_email: string;
  contact_number: string | null;
  description: string;
  home_court: string | null;
  playing_schedule: string | null;
  logo_url: string | null;
  discord_invite_url: string | null;
  facebook_url: string | null;
};

const OWNED_CLUB_SELECT =
  "id, club_name, city, contact_person, contact_email, contact_number, description, home_court, playing_schedule, logo_url, discord_invite_url, facebook_url";

export default async function ManageClubPage({ searchParams }: ManageClubPageProps) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const result = await supabase
    .from("clubs")
    .select(OWNED_CLUB_SELECT)
    .eq("submitted_by", user.id)
    .eq("status", "approved")
    .limit(1)
    .returns<OwnedClub[]>();
  const club = result.data?.[0];

  if (!club) redirect("/clubs");
  const clubId = club.id;

  async function updateClub(formData: FormData) {
    "use server";

    const supabase = await createSupabaseServerClient();
    if (!supabase) redirect("/login");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const values = parseClubForm(formData);
    if (!values) redirect("/clubs/manage?error=invalid-fields");

    const { data, error } = await supabase
      .from("clubs")
      .update(values)
      .eq("id", clubId)
      .eq("submitted_by", user.id)
      .eq("status", "approved")
      .select("id")
      .maybeSingle();

    if (error || !data) {
      console.error("PaddleRank club update error:", error);
      redirect("/clubs/manage?error=save-failed");
    }

    redirect(`/clubs/manage?saved=${Date.now()}`);
  }

  return (
    <main className="min-h-screen bg-court-mist px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/clubs"
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-court-teal/30 bg-white px-5 py-3 text-sm font-black text-court-navy shadow-sm transition hover:border-court-mint hover:text-court-ocean sm:w-auto"
        >
          <span aria-hidden="true" className="text-lg leading-none">←</span>
          <Image src="/PaddleRank.png" alt="" width={32} height={32} className="h-8 w-8 rounded-lg object-contain" />
          <span>Back to Clubs</span>
        </Link>
        <section className="mt-6 rounded-3xl border border-court-teal/15 bg-white p-4 shadow-glow sm:p-7">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-court-ocean">Club leader dashboard</p>
          <h1 className="mt-2 text-2xl font-black text-court-navy sm:text-3xl">Manage {club.club_name}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">Update your approved club profile. Approval status and ownership cannot be changed here.</p>
          {params.saved ? <p role="status" className="mt-5 rounded-xl bg-court-green/25 px-4 py-3 text-sm font-black text-court-navy">Club profile saved.</p> : null}
          {params.error ? <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{params.error === "invalid-fields" ? "Check the required fields and use only valid HTTPS logo and Discord invite URLs." : "We could not save this club profile. Please try again."}</p> : null}
          <ClubManagementForm club={club} action={updateClub} />
        </section>
      </div>
    </main>
  );
}

"use client";

import { useState } from "react";
import { ClubLogo } from "@/components/ClubLogo";
import { CLUB_FIELD_LIMITS, getSafeLogoUrl } from "@/lib/clubs";

type EditableClub = {
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

export function ClubManagementForm({
  club,
  action,
}: {
  club: EditableClub;
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [clubName, setClubName] = useState(club.club_name);
  const [logoUrl, setLogoUrl] = useState(club.logo_url || "");
  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-200 bg-court-mist px-4 py-3 text-court-navy outline-none transition placeholder:text-slate-400 focus:border-court-mint focus:bg-white";

  return (
    <form action={action} className="mt-6 grid gap-5 sm:grid-cols-2">
      <label className="sm:col-span-2">
        <span className="text-sm font-semibold text-court-navy">Club Name *</span>
        <input name="club_name" required maxLength={CLUB_FIELD_LIMITS.clubName} value={clubName} onChange={(event) => setClubName(event.target.value)} className={inputClass} />
      </label>
      <label>
        <span className="text-sm font-semibold text-court-navy">City / Location *</span>
        <input name="city" required maxLength={CLUB_FIELD_LIMITS.city} defaultValue={club.city} className={inputClass} />
      </label>
      <label>
        <span className="text-sm font-semibold text-court-navy">Contact Person *</span>
        <input name="contact_person" required maxLength={CLUB_FIELD_LIMITS.contactPerson} defaultValue={club.contact_person} className={inputClass} />
      </label>
      <label>
        <span className="text-sm font-semibold text-court-navy">Contact Email *</span>
        <input name="contact_email" type="email" required maxLength={CLUB_FIELD_LIMITS.contactEmail} defaultValue={club.contact_email} className={inputClass} />
      </label>
      <label>
        <span className="text-sm font-semibold text-court-navy">Contact Number</span>
        <input name="contact_number" type="tel" maxLength={CLUB_FIELD_LIMITS.contactNumber} defaultValue={club.contact_number || ""} className={inputClass} />
      </label>
      <label className="sm:col-span-2">
        <span className="text-sm font-semibold text-court-navy">Club Description *</span>
        <textarea name="description" required maxLength={CLUB_FIELD_LIMITS.description} rows={5} defaultValue={club.description} className={`${inputClass} resize-y`} />
      </label>
      <label>
        <span className="text-sm font-semibold text-court-navy">Home Court / Location</span>
        <input name="home_court" maxLength={CLUB_FIELD_LIMITS.homeCourt} defaultValue={club.home_court || ""} className={inputClass} />
      </label>
      <label>
        <span className="text-sm font-semibold text-court-navy">Playing Schedule</span>
        <input name="playing_schedule" maxLength={CLUB_FIELD_LIMITS.playingSchedule} defaultValue={club.playing_schedule || ""} className={inputClass} />
      </label>
      <label className="sm:col-span-2">
        <span className="text-sm font-semibold text-court-navy">Club Logo URL</span>
        <input
          name="logo_url"
          type="url"
          maxLength={CLUB_FIELD_LIMITS.logoUrl}
          placeholder="https://..."
          value={logoUrl}
          onChange={(event) => setLogoUrl(event.target.value)}
          className={inputClass}
        />
        <span className="mt-2 block text-xs leading-5 text-slate-500">HTTPS image URLs only. Clear this field to remove the logo.</span>
      </label>
      <div className="sm:col-span-2 rounded-2xl border border-court-teal/15 bg-court-mist p-4">
        <p className="text-sm font-black text-court-navy">Logo preview</p>
        <div className="mt-3 flex items-center gap-4">
          <ClubLogo clubName={clubName || "Club"} logoUrl={getSafeLogoUrl(logoUrl)} className="h-20 w-20" />
          <p className="text-sm leading-6 text-slate-600">The fallback initial appears if the URL is empty or the image cannot load.</p>
        </div>
      </div>
      <label className="sm:col-span-2">
        <span className="text-sm font-semibold text-court-navy">Discord Invite URL</span>
        <input name="discord_invite_url" type="url" maxLength={CLUB_FIELD_LIMITS.discordInviteUrl} placeholder="https://discord.gg/..." defaultValue={club.discord_invite_url || ""} className={inputClass} />
        <span className="mt-2 block text-xs leading-5 text-slate-500">Use https://discord.gg/... or https://discord.com/invite/.... Clear this field to remove the public button.</span>
      </label>
      <label className="sm:col-span-2">
        <span className="text-sm font-semibold text-court-navy">Facebook Page / Group URL</span>
        <input name="facebook_url" type="url" maxLength={CLUB_FIELD_LIMITS.facebookUrl} placeholder="https://www.facebook.com/..." defaultValue={club.facebook_url || ""} className={inputClass} />
        <span className="mt-2 block text-xs leading-5 text-slate-500">Use an HTTPS facebook.com or fb.com Page or Group link. Clear this field to remove the public button.</span>
      </label>
      <div className="sm:col-span-2 flex flex-col gap-3 sm:flex-row">
        <button type="submit" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-court-mint px-6 py-3 text-sm font-black text-white transition hover:bg-court-ocean">Save Club Profile</button>
        <a href="/clubs" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-court-teal/25 bg-white px-6 py-3 text-sm font-black text-court-navy transition hover:border-court-mint">Cancel</a>
      </div>
    </form>
  );
}

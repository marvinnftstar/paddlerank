export const CLUB_FIELD_LIMITS = {
  clubName: 120,
  city: 120,
  contactPerson: 120,
  contactEmail: 180,
  contactNumber: 60,
  description: 1000,
  homeCourt: 180,
  playingSchedule: 180,
  logoUrl: 500,
  discordInviteUrl: 500,
  facebookUrl: 500,
};

export type ClubFormValues = {
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

function getFormValue(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function getSafeLogoUrl(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function getSafeDiscordInviteUrl(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    const isAllowedHost =
      url.hostname === "discord.gg" || url.hostname === "discord.com";
    const hasInvitePath =
      url.hostname === "discord.gg"
        ? /^\/[A-Za-z0-9-]+\/?$/.test(url.pathname)
        : /^\/invite\/[A-Za-z0-9-]+\/?$/.test(url.pathname);

    if (
      url.protocol !== "https:" ||
      !isAllowedHost ||
      !hasInvitePath ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    ) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

export function getSafeFacebookUrl(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    const allowedHosts = new Set([
      "facebook.com",
      "www.facebook.com",
      "fb.com",
    ]);
    const hasPageOrGroupPath = url.pathname !== "/";
    const isOutboundRedirect = url.pathname.toLowerCase() === "/l.php";

    if (
      url.protocol !== "https:" ||
      !allowedHosts.has(url.hostname) ||
      !hasPageOrGroupPath ||
      isOutboundRedirect ||
      url.username ||
      url.password ||
      url.port
    ) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

export function parseClubForm(formData: FormData): ClubFormValues | null {
  const clubName = getFormValue(formData, "club_name");
  const city = getFormValue(formData, "city");
  const contactPerson = getFormValue(formData, "contact_person");
  const contactEmail = getFormValue(formData, "contact_email");
  const contactNumber = getFormValue(formData, "contact_number");
  const description = getFormValue(formData, "description");
  const homeCourt = getFormValue(formData, "home_court");
  const playingSchedule = getFormValue(formData, "playing_schedule");
  const logoUrl = getFormValue(formData, "logo_url");
  const discordInviteUrl = getFormValue(formData, "discord_invite_url");
  const facebookUrl = getFormValue(formData, "facebook_url");

  const hasValidLengths =
    clubName.length <= CLUB_FIELD_LIMITS.clubName &&
    city.length <= CLUB_FIELD_LIMITS.city &&
    contactPerson.length <= CLUB_FIELD_LIMITS.contactPerson &&
    contactEmail.length <= CLUB_FIELD_LIMITS.contactEmail &&
    contactNumber.length <= CLUB_FIELD_LIMITS.contactNumber &&
    description.length <= CLUB_FIELD_LIMITS.description &&
    homeCourt.length <= CLUB_FIELD_LIMITS.homeCourt &&
    playingSchedule.length <= CLUB_FIELD_LIMITS.playingSchedule &&
    logoUrl.length <= CLUB_FIELD_LIMITS.logoUrl &&
    discordInviteUrl.length <= CLUB_FIELD_LIMITS.discordInviteUrl &&
    facebookUrl.length <= CLUB_FIELD_LIMITS.facebookUrl;

  if (
    !clubName ||
    !city ||
    !contactPerson ||
    !contactEmail ||
    !description ||
    !isValidEmail(contactEmail) ||
    !hasValidLengths ||
    (logoUrl && !getSafeLogoUrl(logoUrl)) ||
    (discordInviteUrl && !getSafeDiscordInviteUrl(discordInviteUrl)) ||
    (facebookUrl && !getSafeFacebookUrl(facebookUrl))
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
    discord_invite_url: getSafeDiscordInviteUrl(discordInviteUrl),
    facebook_url: getSafeFacebookUrl(facebookUrl),
  };
}
